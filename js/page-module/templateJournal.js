var $confirmDialog = $('#modal-confirm-action');
if (templateJournalFunc == null) {
    var templateJournalFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionAccountMain', 'dataAccountMain');
            setOptionHelper('optionAccountSub', 'dataAccountSub');

            $('#optionAccountMain').off('change');
            $('#optionAccountMain').on('change', function (e) {
                var selectedValueAccountMain = this.value;
                setOptionHelper('optionAccountSub', 'dataAccountSub', false, function () {
                    getDataTemplateJournal();
                    $("#optionAccountSub").select2();
                }, selectedValueAccountMain);
            });
            $("#optionAccountMain, #optionAccountSub").select2();
            getDataTemplateJournal();
        })
    }
}

$('#optionAccountSub').off('change');
$('#optionAccountSub').on('change', function (e) {
    getDataTemplateJournal();
});

$('#searchKeyword').off('keypress');
$("#searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataTemplateJournal();
    }
});

function generateDataTable(page) {
    getDataTemplateJournal(page)
}

function getDataTemplateJournal(page = 1) {
    var $tableBody = $('#table-dataTemplateJournal > tbody'),
        columnNumber = $('#table-dataTemplateJournal > thead > tr > th').length,
        idAccountMain = $('#optionAccountMain').val(),
        idAccountSub = $('#optionAccountSub').val(),
        searchKeyword = $('#searchKeyword').val(),
        dataSend = {
            page: page,
            idAccountMain: idAccountMain,
            idAccountSub: idAccountSub,
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "templateJournal/getDataTable",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {
            withCredentials: true
        },
        headers: {
            Authorization: 'Bearer ' + getUserToken()
        },
        beforeSend: function () {
            NProgress.set(0.4);
            $tableBody.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var data = responseJSON.result.data;
                    if (data.length === 0) {
                        rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    } else {
                        $.each(data, function (index, array) {
                            var templateJournalDetail = JSON.parse(array.OBJTEMPLATEJOURNALDETAILS),
                                btnEdit = '<i class="text-info fa fa-pencil text16px" data-idJournalTemplateRecap="' + array.IDJOURNALTEMPLATERECAP + '" data-toggle="modal" data-target="#modal-editorTemplateJournal"></i>',
                                btnDelete = '<i class="text-info fa fa-trash text16px" onclick="confirmDeleteTemplateJournal(\'' + array.IDJOURNALTEMPLATERECAP + '\', \'' + array.TEMPLATENAME + '\', \'' + array.DESCRIPTION + '\')"></i>',
                                accountCR = accountDR = '';

                            $.each(templateJournalDetail, function (indexDetails, arrayDetails) {
                                if (arrayDetails.drCrPosition == 'DR') accountDR += '<li class="list-group-item">' + arrayDetails.accountName + '</li>';
                                if (arrayDetails.drCrPosition == 'CR') accountCR += '<li class="list-group-item">' + arrayDetails.accountName + '</li>';
                            });

                            rows += "<tr>" +
                                "<td>" + array.TEMPLATENAME + "</td>" +
                                "<td>" + array.DESCRIPTION + "</td>" +
                                "<td><ul class='list-group'>" + accountDR + "</ul></td>" +
                                "<td><ul class='list-group'>" + accountCR + "</ul></td>" +
                                "<td class='text-center'>" + btnEdit + '<br/>' + btnDelete + "</td>" +
                                "</tr>";
                        });
                    }
                    generatePagination("tablePagination-dataTemplateJournal", page, responseJSON.result.pageTotal);
                    generateDataInfo("tableDataCount-dataTemplateJournal", responseJSON.result.dataStart, responseJSON.result.dataEnd, responseJSON.result.dataTotal);
                    break;
                case 404:
                default:
                    generatePagination("tablePagination-dataTemplateJournal", 1, 1);
                    generateDataInfo("tableDataCount-dataTemplateJournal", 0, 0, 0);
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBody.html(rows);
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

$('#modal-editorTemplateJournal').off('shown.bs.modal');
$('#modal-editorTemplateJournal').on('shown.bs.modal', function (e) {
    var idJournalTemplateRecap = $(e.relatedTarget).attr('data-idJournalTemplateRecap');
    $("#editorTemplateJournal-templateName, #editorTemplateJournal-templateDescription").val('');
    $("#editorTemplateJournal-tableDataAccount > tbody").html('<tr id="editorTemplateJournal-trEmptyAccountTemplateJournal"><td colspan="2" class="text-center">No data</td></tr>');
    $("#editorTemplateJournal-idJournalTemplateRecap").val(0);

    if (typeof (idJournalTemplateRecap) !== "undefined" && idJournalTemplateRecap !== null && idJournalTemplateRecap !== '' && idJournalTemplateRecap !== false) {
        var dataSend = { idJournalTemplateRecap: idJournalTemplateRecap };
        $.ajax({
            type: 'POST',
            url: baseURL + "templateJournal/getDetailTemplateJournal",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: {
                withCredentials: true
            },
            headers: {
                Authorization: 'Bearer ' + getUserToken()
            },
            beforeSend: function () {
                NProgress.set(0.4);
                $("#form-editorTemplateJournal :input").attr("disabled", true);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;

                switch (jqXHR.status) {
                    case 200:
                        var detailRecap = responseJSON.detailRecap,
                            listDetailTemplate = responseJSON.listDetailTemplate,
                            liAccountDR = liAccountCR = '';

                        $("#editorTemplateJournal-templateName").val(detailRecap.TEMPLATENAME);
                        $("#editorTemplateJournal-templateDescription").val(detailRecap.DESCRIPTION);
                        $("#editorTemplateJournal-idJournalTemplateRecap").val(idJournalTemplateRecap);

                        $.each(listDetailTemplate, function (index, array) {
                            var removeBtn = '<i class="fa fa-trash text-danger mr-5" onclick="deleteAccountTemplateJournal(\'' + array.IDACCOUNT + '\')"></i>',
                                liElem = '<li class="list-group-item liAccountTemplateJournal" data-idAccount="' + array.IDACCOUNT + '">' + removeBtn + ' ' + array.ACCOUNTCODENAME + '</li>';
                            if (array.DEFAULTDRCR == 'DR') liAccountDR += liElem;
                            if (array.DEFAULTDRCR == 'CR') liAccountCR += liElem;
                        });
                        $("#editorTemplateJournal-tableDataAccount > tbody").html('<tr><td><ul class="list-group" id="editorTemplateJournal-tdAccountTemplateJournalDR">' + liAccountDR + '</ul></td><td><ul class="list-group" id="editorTemplateJournal-tdAccountTemplateJournalCR">' + liAccountCR + '</ul></td></tr>');
                        break;
                    default:
                        $("#modal-editorTemplateJournal").modal("hide");
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            $("#form-editorTemplateJournal :input").attr("disabled", false);
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

$('#modal-addAccountTemplateJournal').off('shown.bs.modal');
$('#modal-addAccountTemplateJournal').on('shown.bs.modal', function (e) {
    setOptionHelper('addAccountTemplateJournal-optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
        setOptionHelper('addAccountTemplateJournal-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAccountEvent();
        }, firstValueAccountMain);
    });

    $('#addAccountTemplateJournal-optionAccountMain').off('change');
    $('#addAccountTemplateJournal-optionAccountMain').on('change', function (e) {
        var selectedValueAccountMain = this.value;
        setOptionHelper('addAccountTemplateJournal-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAccountEvent();
            $("#addAccountTemplateJournal-optionAccountSub").select2();
        }, selectedValueAccountMain);
    });

    $('#addAccountTemplateJournal-optionAccountSub').off('change');
    $('#addAccountTemplateJournal-optionAccountSub').on('change', function (e) {
        afterSelectAccountEvent();
    });

    return true;
});

function afterSelectAccountEvent() {
    var accountType = 'main',
        selectedValue = '';
    if ($('#addAccountTemplateJournal-optionAccountSub > option').length <= 0 && $('#addAccountTemplateJournal-optionAccountSub > optgroup').length <= 0) {
        selectedValue = $("#addAccountTemplateJournal-optionAccountMain").val();
        $("#addAccountTemplateJournal-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        accountType = 'sub';
        selectedValue = $("#addAccountTemplateJournal-optionAccountSub").val();
        $("#addAccountTemplateJournal-optionAccountSub").prop('disabled', false);
    }

    var dataOptionHelper = JSON.parse(localStorage.getItem('optionHelper')),
        dataAccount = accountType == 'main' ? dataOptionHelper.dataAccountMain : dataOptionHelper.dataAccountSub,
        accountIndex = dataAccount.findIndex(elem => elem['ID'] == selectedValue),
        defaultDRCR = dataAccount[accountIndex].DEFAULTDRCR,
        defaultPlus = defaultDRCR == 'DR' ? 'Debit' : 'Credit',
        defaultMinus = defaultDRCR == 'DR' ? 'Credit' : 'Debit';
    $("#addAccountTemplateJournal-textDefaultPositionPlus").html(defaultPlus);
    $("#addAccountTemplateJournal-textDefaultPositionMinus").html(defaultMinus);
    $("input[name='addAccountTemplateJournal-debitCredit'][value='" + defaultDRCR + "']").prop('checked', true);

    return true;
}

$("#form-addAccountTemplateJournal").off('submit');
$("#form-addAccountTemplateJournal").on("submit", function (e) {
    e.preventDefault();
    var idAccountMain = $('#addAccountTemplateJournal-optionAccountMain').val(),
        idAccountSub = $('#addAccountTemplateJournal-optionAccountSub').val(),
        idAccount = idAccountSub == '0' ? idAccountMain : idAccountSub,
        textAccountMain = $('#addAccountTemplateJournal-optionAccountMain option:selected').text(),
        textAccountSub = $('#addAccountTemplateJournal-optionAccountSub option:selected').text(),
        codeNameAccount = idAccountSub == '0' ? textAccountMain : textAccountSub,
        debitCredit = $("input[name='addAccountTemplateJournal-debitCredit']:checked").val();

    if ($('#editorTemplateJournal-trEmptyAccountTemplateJournal').length > 0) {
        $('#editorTemplateJournal-trEmptyAccountTemplateJournal').remove();
        $("#editorTemplateJournal-tableDataAccount > tbody").html('<tr><td><ul class="list-group" id="editorTemplateJournal-tdAccountTemplateJournalDR"></ul></td><td><ul class="list-group" id="editorTemplateJournal-tdAccountTemplateJournalCR"></ul></td></tr>');
    }

    var ulListTarget = debitCredit == 'DR' ? 'editorTemplateJournal-tdAccountTemplateJournalDR' : 'editorTemplateJournal-tdAccountTemplateJournalCR',
        elemExist = $(".liAccountTemplateJournal[data-idAccount='" + idAccount + "']"),
        removeBtn = '<i class="fa fa-trash text-danger mr-5" onclick="deleteAccountTemplateJournal(\'' + idAccount + '\')"></i>',
        liAccount = '<li class="list-group-item liAccountTemplateJournal" data-idAccount="' + idAccount + '">' + removeBtn + ' ' + codeNameAccount + '</li>';

    if (elemExist.length > 0) elemExist.remove();
    $("#" + ulListTarget).append(liAccount);

    $("#modal-addAccountTemplateJournal").modal("hide");
});

function deleteAccountTemplateJournal(idAccount) {
    var elem = $(".liAccountTemplateJournal[data-idAccount='" + idAccount + "']");
    if (elem.length > 0) {
        elem.remove();
    }
    if ($(".liAccountTemplateJournal").length <= 0) $("#editorTemplateJournal-tableDataAccount > tbody").html('<tr id="editorTemplateJournal-trEmptyAccountTemplateJournal"><td colspan="2" class="text-center">No data</td></tr>');
}

$("#form-editorTemplateJournal").off('submit');
$("#form-editorTemplateJournal").on("submit", function (e) {
    e.preventDefault();
    var idJournalTemplateRecap = $('#editorTemplateJournal-idJournalTemplateRecap').val(),
        templateName = $('#editorTemplateJournal-templateName').val(),
        templateDescription = $('#editorTemplateJournal-templateDescription').val(),
        arrAccountTemplateDetailDR = [],
        arrAccountTemplateDetailCR = [],
        urlFunction = idJournalTemplateRecap != '' && idJournalTemplateRecap != 0 ? 'updateData' : 'insertData';

    $('#editorTemplateJournal-tdAccountTemplateJournalDR > li').each(function () {
        var idAccount = $(this).attr('data-idAccount');
        arrAccountTemplateDetailDR.push(idAccount);
    });

    $('#editorTemplateJournal-tdAccountTemplateJournalCR > li').each(function () {
        var idAccount = $(this).attr('data-idAccount');
        arrAccountTemplateDetailCR.push(idAccount);
    });

    if (!Array.isArray(arrAccountTemplateDetailDR) || arrAccountTemplateDetailDR.length <= 0) {
        showWarning('Please select an account that is in debit position');
    } else if (!Array.isArray(arrAccountTemplateDetailCR) || arrAccountTemplateDetailCR.length <= 0) {
        showWarning('Please select an account that is in credit position');
    } else {
        var dataSend = {
            idJournalTemplateRecap: idJournalTemplateRecap,
            templateName: templateName,
            templateDescription: templateDescription,
            arrAccountTemplateDetailDR: arrAccountTemplateDetailDR,
            arrAccountTemplateDetailCR: arrAccountTemplateDetailCR
        };

        $.ajax({
            type: 'POST',
            url: baseURL + "templateJournal/" + urlFunction,
            contentType: 'application/json',
            dataType: 'json',
            data: mergeDataSend(dataSend),
            xhrFields: {
                withCredentials: true
            },
            headers: {
                Authorization: 'Bearer ' + getUserToken()
            },
            beforeSend: function () {
                NProgress.set(0.4);
                $("#form-editorTemplateJournal :input").attr("disabled", true);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        $("#modal-editorTemplateJournal").modal("hide");
                        getDataTemplateJournal();
                        break;
                    default: break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            $("#form-editorTemplateJournal :input").attr("disabled", false);
            NProgress.done();
            generateWarningMessageResponse(jqXHR);
            setUserToken(jqXHR);
        });
    }
});

function confirmDeleteTemplateJournal(idJournalTemplateRecap, templateName, description) {

    var confirmText = 'This template journal will be deleted from the system. Details ;<br/><br/>' +
        '<div class="order-details-customer-info">' +
        '<ul>' +
        '<li> <span>Template Name</span> <span><b>' + templateName + '</b></span> </li>' +
        '<li> <span>Description</span> <span><b>' + description + '</b></span> </li>' +
        '</ul>' +
        '</div>' +
        '<br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-idJournalTemplateRecap', idJournalTemplateRecap).attr('data-function', "deleteTemplateJournal");
    $confirmDialog.modal('show');

}

$('#confirmBtn').off('click');
$('#confirmBtn').on('click', function (e) {

    var idJournalTemplateRecap = $confirmDialog.find('#confirmBtn').attr('data-idJournalTemplateRecap'),
        funcName = $confirmDialog.find('#confirmBtn').attr('data-function'),
        dataSend = { idJournalTemplateRecap: idJournalTemplateRecap };

    $.ajax({
        type: 'POST',
        url: baseURL + "templateJournal/" + funcName,
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {
            withCredentials: true
        },
        headers: {
            Authorization: 'Bearer ' + getUserToken()
        },
        beforeSend: function () {
            NProgress.set(0.4);
            $confirmDialog.modal('hide');
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    getDataTemplateJournal();
                    break;
                default: break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done();
        generateWarningMessageResponse(jqXHR);
        setUserToken(jqXHR);
    });
});

templateJournalFunc();