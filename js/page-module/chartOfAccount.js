var $confirmDialog = $('#modal-confirm-action');
if (chartOfAccountFunc == null) {
    var chartOfAccountFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionAccountGeneral', 'dataAccountGeneral');
            setOptionHelper('optionAccountMain', 'dataAccountMain', false, false, $('#optionAccountGeneral').val());

            $('#optionAccountGeneral').off('change');
            $('#optionAccountGeneral').on('change', function (e) {
                if (this.value != "") {
                    setOptionHelper('optionAccountMain', 'dataAccountMain', false, function () {
                        $("#optionAccountMain").select2();
                        getDataChartOfAccount()
                    }, this.value);
                } else {
                    setOptionHelper('optionAccountMain', 'dataAccountMain', false, function () {
                        $("#optionAccountMain").select2();
                        getDataChartOfAccount()
                    });
                }
            });
            $("#optionAccountGeneral, #optionAccountMain").select2();
            getDataChartOfAccount();
        })
    }
}

$('#optionAccountMain').off('change');
$('#optionAccountMain').on('change', function (e) {
    getDataChartOfAccount();
});

$('#searchKeyword').off('keypress');
$("#searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataChartOfAccount();
    }
});

function getDataChartOfAccount() {
    var $tableBodyChartOfAccount = $('#table-dataChartOfAccount > tbody'),
        $tableBodyOpeningAccountBalance = $('#table-dataOpeningAccountBalance > tbody'),
        columnNumber = $('#table-dataChartOfAccount > thead > tr > th').length + 2,
        idAccountGeneral = $('#optionAccountGeneral').val(),
        idAccountMain = $('#optionAccountMain').val(),
        searchKeyword = $('#searchKeyword').val(),
        dataSend = { idAccountGeneral: idAccountGeneral, idAccountMain: idAccountMain, searchKeyword: searchKeyword };
    $.ajax({
        type: 'POST',
        url: baseURL + "chartOfAccount/getDataAccount",
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
            $tableBodyChartOfAccount.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
            $tableBodyOpeningAccountBalance.html("<tr><td colspan='7'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var dataAccount = responseJSON.result,
                        dataAccountOpeningBalance = responseJSON.dataAccountOpeningBalance,
                        codeNumberGeneral = codeNumberMain = codeNumberSub = textClass = additionalText = '';
                    $.each(dataAccount, function (index, array) {
                        switch (array.LEVEL) {
                            case '1':
                            case 1:
                                codeNumberGeneral = array.ACCOUNTCODE;
                                codeNumberMain = '';
                                codeNumberSub = '';
                                textClass = '';
                                additionalText = '';
                                break;
                            case '2':
                            case 2:
                                codeNumberMain = array.ACCOUNTCODE;
                                codeNumberSub = '';
                                textClass = 'ml-10';
                                additionalText = '<span class="h4">↳ </span>';
                                break;
                            case '3':
                            case 3:
                                codeNumberSub = array.ACCOUNTCODE;
                                textClass = 'ml-20';
                                additionalText = '<span class="h4">↳ </span>';
                                break;
                        }

                        var accountParentLength = dataAccount.filter(i => i.IDACCOUNTPARENT === array.IDACCOUNTPARENT).length,
                            btnSort = accountParentLength > 1 ? '<span class="dropdown-item" data-accountLevel="' + array.LEVEL + '" data-idAccount="' + array.IDACCOUNT + '" data-toggle="modal" data-target="#modal-sortAccount"><i class="fa fa-sort-amount-asc"></i> Sort Order</span>' : '',
                            btnEdit = '<span class="dropdown-item" data-idAccount="' + array.IDACCOUNT + '" data-toggle="modal" data-target="#modal-editorEditAccount"><i class="fa fa-pencil"></i> Edit</span>',
                            btnDelete = '<span class="dropdown-item" onclick="confirmDeleteAccount(\'' + array.IDACCOUNT + '\', ' + array.LEVEL + ', \'' + codeNumberGeneral + '\', \'' + codeNumberMain + '\', \'' + codeNumberSub + '\', \'' + array.ACCOUNTNAME + '\')"><i class="fa fa-trash"></i> Delete</span>',
                            optionActions = '<div class="dropdown dropleft d-inline-flex">' +
                                '<button class="btn btn-primary dropdown-toggle btn-sm" type="button" data-toggle="dropdown"" aria-haspopup="true" aria-expanded="false"><span class="caret"></span></button>' +
                                '<div class="dropdown-menu" style="font-size: .8rem;">' + btnSort + btnEdit + btnDelete + '</div>' +
                                '</div>';

                        rows += "<tr>" +
                            "<td class='searchTd pr-1' width='20'>" + codeNumberGeneral + "</td>" +
                            "<td class='searchTd px-1' width='20'>" + codeNumberMain + "</td>" +
                            "<td class='searchTd pl-1' width='40'>" + codeNumberSub + "</td>" +
                            "<td ><span class='searchTd " + textClass + "'>" + additionalText + array.ACCOUNTNAME + "</span></td>" +
                            "<td >" + array.DEFAULTDRCR + "</td>" +
                            "<td class='text-center'>" + optionActions + "</td>" +
                            "</tr>";
                    });
                    generateTableAccountOpeningBalance(dataAccount, dataAccountOpeningBalance);
                    break;
                case 404:
                default:
                    rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>" + getMessageResponse(jqXHR) + "</center></td></tr>";
                    $tableBodyOpeningAccountBalance.html("<tr><td colspan='7' align='center'><center>" + getMessageResponse(jqXHR) + "</center></td></tr>");
                    break;
            }

            $tableBodyChartOfAccount.html(rows);

            if (searchKeyword != '') {
                $(":contains(" + searchKeyword + ")").each(function () {
                    if ($(this).hasClass('searchTd')) {
                        var regex = new RegExp(searchKeyword, 'i');
                        $(this).html($(this).text().replace(regex, '<mark>$&</mark>'));
                    }
                });
            }
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateTableAccountOpeningBalance(dataAccount, dataAccountOpeningBalance) {
    var detailJournalRecap = dataAccountOpeningBalance.detailJournalRecap,
        dataOpeningBalance = dataAccountOpeningBalance.dataOpeningBalance,
        rows = "",
        totalDebit = totalCredit = 0,
        codeNumberGeneral = codeNumberMain = codeNumberSub = textClass = additionalText = '';

    $("#accountOpeningBalance-reffNumber").val(detailJournalRecap.REFFNUMBER);
    $("#accountOpeningBalance-date").val(detailJournalRecap.DATETRANSACTION);
    $("#accountOpeningBalance-description").val(detailJournalRecap.DESCRIPTION);

    $.each(dataAccount, function (index, array) {
        switch (array.LEVEL) {
            case '1':
            case 1:
                codeNumberGeneral = array.ACCOUNTCODE;
                codeNumberMain = '';
                codeNumberSub = '';
                textClass = '';
                additionalText = '';
                break;
            case '2':
            case 2:
                codeNumberMain = array.ACCOUNTCODE;
                codeNumberSub = '';
                textClass = 'ml-10';
                additionalText = '<span class="h4">↳ </span>';
                break;
            case '3':
            case 3:
                codeNumberSub = array.ACCOUNTCODE;
                textClass = 'ml-20';
                additionalText = '<span class="h4">↳ </span>';
                break;
        }

        var objAccount = dataOpeningBalance.filter(function (item) {
            if (item.IDACCOUNT === array.IDACCOUNT) return item;
        });

        var valueAccountDebit = objAccount.length > 0 ? objAccount[0].DEBIT : 0,
            valueAccountCredit = objAccount.length > 0 ? objAccount[0].CREDIT : 0,
            accountParentLength = dataAccount.filter(i => i.IDACCOUNTPARENT === array.IDACCOUNT).length,
            elemInputDebit = accountParentLength <= 0 ? '<input type="text" class="form-control form-control-sm accountOpeningBalanceDebit text-right" id="accountOpeningBalanceDebit-' + array.IDACCOUNT + '" data-idAccount="' + array.IDACCOUNT + '" onkeypress="maskNumberInput(0, 99999999999, \'accountOpeningBalanceDebit-' + array.IDACCOUNT + '\')" onkeyup="calculateTotalNominal(\'D\')" value="' + numberFormat(valueAccountDebit) + '">' : "",
            elemInputCredit = accountParentLength <= 0 ? '<input type="text" class="form-control form-control-sm accountOpeningBalanceCredit text-right" id="accountOpeningBalanceCredit-' + array.IDACCOUNT + '" data-idAccount="' + array.IDACCOUNT + '" onkeypress="maskNumberInput(0, 99999999999, \'accountOpeningBalanceCredit-' + array.IDACCOUNT + '\')" onkeyup="calculateTotalNominal(\'C\')" value="' + numberFormat(valueAccountCredit) + '">' : "";

        rows += "<tr class='trAccountOpeningBalance' data-idAccount='" + array.IDACCOUNT + "'>" +
            "<td class='searchTd pr-1' width='20'>" + codeNumberGeneral + "</td>" +
            "<td class='searchTd px-1' width='20'>" + codeNumberMain + "</td>" +
            "<td class='searchTd pl-1' width='40'>" + codeNumberSub + "</td>" +
            "<td ><span class='searchTd " + textClass + "'>" + additionalText + array.ACCOUNTNAME + "</span></td>" +
            "<td >" + array.DEFAULTDRCR + "</td>" +
            "<td class='text-right'>" + elemInputDebit + "</td>" +
            "<td class='text-right'>" + elemInputCredit + "</td>" +
            "</tr>";

        totalDebit += parseInt(valueAccountDebit);
        totalCredit += parseInt(valueAccountCredit);
    });

    rows += "<tr>" +
        "<td colspan='5'><b>TOTAL</b></td>" +
        "<td class='text-right'><b id='accountOpeningBalance-totalDebit' class='mr-3'>" + numberFormat(totalDebit) + "</b></td>" +
        "<td class='text-right'><b id='accountOpeningBalance-totalCredit' class='mr-3'>" + numberFormat(totalCredit) + "</b></td>" +
        "</tr>";
    $("#table-dataOpeningAccountBalance > tbody").html(rows);
}

function calculateTotalNominal(DRCR) {
    var classInputElem = DRCR == 'D' ? 'accountOpeningBalanceDebit' : 'accountOpeningBalanceCredit',
        idContainerTotalElem = DRCR == 'D' ? 'accountOpeningBalance-totalDebit' : 'accountOpeningBalance-totalCredit',
        totalNominal = 0;

    $('.' + classInputElem).each(function () {
        var elemValue = $(this).val(),
            elemValueNominal = elemValue == "" ? 0 : elemValue.replace(/\D/g, '');
        totalNominal += parseInt(elemValueNominal) * 1;
    });

    $("#" + idContainerTotalElem).html(numberFormat(totalNominal));
}

$('#modal-editorAddAccount').off('shown.bs.modal');
$('#modal-editorAddAccount').on('shown.bs.modal', function (e) {
    $("#addAccount-optionAccountGeneral, #addAccount-optionAccountMain, #addAccount-optionDefaultDRCR, #addAccount-accountCode, #addAccount-optionOrderPosition, #addAccount-accountNameEng, #addAccount-accountNameIdn").prop('disabled', true);
    $('#form-editorAddAccount').trigger("reset");
    $("input[name='addAccount-radioAccountLevel']").off('change');
    $("input[name='addAccount-radioAccountLevel']").on('change', function (e) {
        var currentValue = $("input[name='addAccount-radioAccountLevel']:checked").val();
        switch (currentValue) {
            case 3:
            case '3':
                $('#addAccount-optionAccountGeneral').prop('disabled', false);
                $('#addAccount-optionAccountMain').prop('disabled', false);
                break;
            case 2:
            case '2':
                $('#addAccount-optionAccountGeneral').prop('disabled', false);
                $('#addAccount-optionAccountMain').prop('disabled', true);
                break;
            case 1:
            case '1':
            default:
                $('#addAccount-optionAccountGeneral').prop('disabled', true);
                $('#addAccount-optionAccountMain').prop('disabled', true);
                break;
        }
    });

    setOptionHelper('addAccount-optionAccountGeneral', 'dataAccountGeneral');
    setOptionHelper('addAccount-optionAccountMain', 'dataAccountMain', false, false, $('#addAccount-optionAccountGeneral').val());

    $('#addAccount-optionAccountGeneral').off('change');
    $('#addAccount-optionAccountGeneral').on('change', function (e) {
        if (this.value != "") {
            setOptionHelper('addAccount-optionAccountMain', 'dataAccountMain', false, function () {
                $("#addAccount-optionAccountMain").select2();
            }, this.value);
        } else {
            setOptionHelper('addAccount-optionAccountMain', 'dataAccountMain', false, function () {
                $("#addAccount-optionAccountMain").select2();
            });
        }
    });

    $("#addAccount-optionAccountGeneral, #addAccount-optionAccountMain").select2({
        dropdownParent: $("#modal-editorAddAccount")
    });

    $('.smart-wizard').smartWizard({
        showStepURLhash: false,
        selected: 0,
        keyNavigation: false
    });

    $('.smart-wizard').smartWizard("reset");
    $("#wizardAddAccount").off("showStep");
    $("#wizardAddAccount").on("showStep", function (e, anchorObject, stepNumber, stepDirection) {
        if ($('button.sw-btn-next').hasClass('disabled')) {
            $('button.sw-btn-next').addClass('d-none');
        } else {
            $('button.sw-btn-next').removeClass('d-none');
            $('#finishSaveNewAccountButton').remove();
            $("#addAccount-optionDefaultDRCR, #addAccount-accountCode, #addAccount-optionOrderPosition, #addAccount-accountNameEng, #addAccount-accountNameIdn").prop('disabled', true);
        }

    });

    $("#wizardAddAccount").off("leaveStep");
    $("#wizardAddAccount").on("leaveStep", function (e, anchorObject, stepNumber, stepDirection) {
        if (stepNumber == 0) {
            var accountLevel = $("input[name='addAccount-radioAccountLevel']:checked").val(),
                idAccountGeneral = $('#addAccount-optionAccountGeneral').val(),
                idAccountMain = $('#addAccount-optionAccountMain').val(),
                dataSend = { accountLevel: accountLevel, idAccountGeneral: idAccountGeneral, idAccountMain: idAccountMain };
            $.ajax({
                type: 'POST',
                url: baseURL + "chartOfAccount/getNextStepCreateAccount",
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
                    $("#window-loader").modal("show");
                },
                complete: function (jqXHR, textStatus) {
                    var responseJSON = jqXHR.responseJSON;

                    switch (jqXHR.status) {
                        case 200:
                            var detailNextStep = responseJSON.detailNextStep,
                                defaultDRCR = detailNextStep.defaultDRCR,
                                listOrderPosition = detailNextStep.listOrderPosition,
                                lastNumber = detailNextStep.lastNumber;
                            $("#addAccount-optionDefaultDRCR").val(defaultDRCR);
                            $("#addAccount-lastNumber").val(lastNumber);
                            $("#addAccount-optionOrderPosition").empty();
                            $.each(listOrderPosition, function (index, array) {
                                var selected = lastNumber == array[1] ? 'selected' : '';
                                $("#addAccount-optionOrderPosition").append($("<option " + selected + "></option>").val(array[1]).html(array[0]));
                            });
                            $("#addAccount-optionDefaultDRCR, #addAccount-accountCode, #addAccount-optionOrderPosition, #addAccount-accountNameEng, #addAccount-accountNameIdn").prop('disabled', false);
                            $('button.sw-btn-next').after('<button class="btn btn-secondary" type="submit" id="finishSaveNewAccountButton">Finish & Save</button>');
                            break;
                        default:
                            generateWarningMessageResponse(jqXHR);
                            $('.smart-wizard').smartWizard("reset");
                            break;
                    }
                }
            }).always(function (jqXHR, textStatus) {
                $("#window-loader").modal("hide");
                NProgress.done();
                setUserToken(jqXHR);
            });
        }
    });
});

$("#form-editorAddAccount").off('submit');
$("#form-editorAddAccount").on("submit", function (e) {
    e.preventDefault();
    var accountLevel = $("input[name='addAccount-radioAccountLevel']:checked").val(),
        idAccountGeneral = $('#addAccount-optionAccountGeneral').val(),
        idAccountMain = $('#addAccount-optionAccountMain').val(),
        defaultDRCR = $("#addAccount-optionDefaultDRCR").val(),
        accountCode = $("#addAccount-accountCode").val(),
        orderPosition = $("#addAccount-optionOrderPosition").val(),
        accountNameEng = $("#addAccount-accountNameEng").val(),
        accountNameIdn = $("#addAccount-accountNameIdn").val(),
        lastNumberPosition = $("#addAccount-lastNumber").val();
    dataSend = {
        accountLevel: accountLevel,
        idAccountGeneral: idAccountGeneral,
        idAccountMain: idAccountMain,
        defaultDRCR: defaultDRCR,
        accountCode: accountCode,
        orderPosition: orderPosition,
        accountNameEng: accountNameEng,
        accountNameIdn: accountNameIdn,
        lastNumberPosition: lastNumberPosition
    };

    $.ajax({
        type: 'POST',
        url: baseURL + "chartOfAccount/insertData",
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
            $("#form-editorAddAccount :input").attr("disabled", true);
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    $('#modal-editorAddAccount').modal('hide');
                    getDataChartOfAccount();
                    break;
                default: break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        $("#form-editorAddAccount :input").attr("disabled", false);
        NProgress.done();
        generateWarningMessageResponse(jqXHR);
        setUserToken(jqXHR);
    });
});

$('#modal-editorEditAccount').off('shown.bs.modal');
$('#modal-editorEditAccount').on('shown.bs.modal', function (e) {
    var idAccount = $(e.relatedTarget).attr('data-idAccount'),
        dataSend = { idAccount: idAccount };
    $.ajax({
        type: 'POST',
        url: baseURL + "chartOfAccount/getDetailAccount",
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
            $("#editAccount-optionAccountGeneral, #editAccount-optionAccountMain, #editAccount-optionDefaultDRCR, #editAccount-accountCode, #editAccount-optionOrderPosition, #editAccount-accountNameEng, #editAccount-accountNameIdn").prop('disabled', true);
            $("#editAccount-elemContainerGeneralAccount, #editAccount-elemContainerMainAccount").removeClass('d-none');
            $('#form-editorEditAccount').trigger("reset");
            NProgress.set(0.4);
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var detailAccount = responseJSON.detailAccount,
                        arrOrderPosition = responseJSON.arrOrderPosition,
                        levelAccount = detailAccount.LEVEL * 1,
                        idAccountGeneralParent = levelAccount == 2 ? detailAccount.IDACCOUNTPARENT : '',
                        idAccountMainParent = levelAccount == 3 ? detailAccount.IDACCOUNTPARENT : '';

                    setOptionHelper('editAccount-optionAccountGeneral', 'dataAccountGeneral', idAccountGeneralParent);
                    setOptionHelper('editAccount-optionAccountMain', 'dataAccountMain', idAccountMainParent, false, idAccountGeneralParent);
                    if (levelAccount >= 2) $("#editAccount-optionAccountGeneral").prop('disabled', false);
                    if (levelAccount == 3) $("#editAccount-optionAccountMain").prop('disabled', false);
                    if (levelAccount <= 2) $("#editAccount-elemContainerMainAccount").addClass('d-none');
                    if (levelAccount == 1) $("#editAccount-elemContainerGeneralAccount").addClass('d-none');

                    $('#editAccount-optionAccountGeneral').off('change');
                    $('#editAccount-optionAccountGeneral').on('change', function (e) {
                        setOptionHelper('editAccount-optionAccountMain', 'dataAccountMain', idAccountMainParent, function () {
                            $("#editAccount-optionAccountMain").select2();
                        }, this.value);
                    });

                    $("#editAccount-optionAccountGeneral, #editAccount-optionAccountMain").select2({
                        dropdownParent: $("#modal-editorEditAccount")
                    });

                    $("#editAccount-optionDefaultDRCR").val(detailAccount.DEFAULTDRCR);
                    $("#editAccount-accountCode").val(detailAccount.ACCOUNTCODE);
                    $("#editAccount-accountNameEng").val(detailAccount.ACCOUNTNAMEENG);
                    $("#editAccount-accountNameIdn").val(detailAccount.ACCOUNTNAMEID);

                    $("#editAccount-optionOrderPosition").empty();
                    $.each(arrOrderPosition, function (index, array) {
                        var selected = array[2] ? 'selected' : '';
                        $("#editAccount-optionOrderPosition").append($("<option " + selected + "></option>").val(array[0]).html(array[1]));
                    });

                    $("#editAccount-idAccount").val(idAccount);
                    $("#editAccount-accountLevel").val(detailAccount.LEVEL);
                    $("#editAccount-optionDefaultDRCR, #editAccount-accountCode, #editAccount-optionOrderPosition, #editAccount-accountNameEng, #editAccount-accountNameIdn").prop('disabled', false);
                    break;
                default:
                    $("#modal-editorEditAccount").modal("hide");
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done();
        setUserToken(jqXHR);
    });
});

$("#form-editorEditAccount").off('submit');
$("#form-editorEditAccount").on("submit", function (e) {
    e.preventDefault();
    var idAccount = $('#editAccount-idAccount').val(),
        idAccountGeneral = $('#editAccount-optionAccountGeneral').val(),
        idAccountMain = $('#editAccount-optionAccountMain').val(),
        accountLevel = $('#editAccount-accountLevel').val(),
        defaultDRCR = $("#editAccount-optionDefaultDRCR").val(),
        accountCode = $("#editAccount-accountCode").val(),
        orderPosition = $("#editAccount-optionOrderPosition").val(),
        accountNameEng = $("#editAccount-accountNameEng").val(),
        accountNameIdn = $("#editAccount-accountNameIdn").val();
    dataSend = {
        idAccount: idAccount,
        idAccountGeneral: idAccountGeneral,
        idAccountMain: idAccountMain,
        accountLevel: accountLevel,
        defaultDRCR: defaultDRCR,
        accountCode: accountCode,
        orderPosition: orderPosition,
        accountNameEng: accountNameEng,
        accountNameIdn: accountNameIdn
    };

    $.ajax({
        type: 'POST',
        url: baseURL + "chartOfAccount/updateData",
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
            $("#form-editorEditAccount :input").attr("disabled", true);
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    $('#modal-editorEditAccount').modal('hide');
                    getDataChartOfAccount();
                    break;
                default: break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        $("#form-editorEditAccount :input").attr("disabled", false);
        NProgress.done();
        generateWarningMessageResponse(jqXHR);
        setUserToken(jqXHR);
    });
});

$('#modal-sortAccount').off('shown.bs.modal');
$('#modal-sortAccount').on('shown.bs.modal', function (e) {
    var idAccount = $(e.relatedTarget).attr('data-idAccount'),
        accountLevel = $(e.relatedTarget).attr('data-accountLevel'),
        dataSend = { idAccount: idAccount, accountLevel: accountLevel };
    $.ajax({
        type: 'POST',
        url: baseURL + "chartOfAccount/getSortOrderAccount",
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
            $('#sortAccount-elemAccountParentDetail').remove();
            $('#sortAccount-accountLevelName, #sortAccount-accountOrderList, #sortAccount-accountOrderList').html("");
            NProgress.set(0.4);
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var accountLevelName = responseJSON.accountLevelName,
                        accountNameGeneral = responseJSON.accountNameGeneral,
                        accountNameMain = responseJSON.accountNameMain,
                        arrDataSortAccount = responseJSON.arrDataSortAccount,
                        elemAccountNameGeneral = accountNameGeneral != '' ? '<li> <span>General Account</span> <span>' + accountNameGeneral + '</span> </li>' : '',
                        elemAccountNameMain = accountNameMain != '' ? '<li> <span>Main Account</span> <span>' + accountNameMain + '</span> </li>' : '',
                        listSortAccount = '';
                    $('#sortAccount-accountLevelName').html(accountLevelName);
                    if (elemAccountNameGeneral != '' || elemAccountNameMain != '') {
                        $('#sortAccount-containerAccountLevelName').after('<div class="order-details-customer-info" id="sortAccount-elemAccountParentDetail"><ul class= "ml-5">' + elemAccountNameGeneral + elemAccountNameMain + '</ul></div>');
                    }

                    if (arrDataSortAccount.length > 0) {
                        $.each(arrDataSortAccount, function (index, array) {
                            listSortAccount += '<div class="list-group-item" data-id="' + array.IDACCOUNT + '">' +
                                '<i class="fa fa-arrows mr-2" aria-hidden="true"></i> ' + array.ACCOUNTNAME +
                                '</div>';
                        });
                    }
                    $('#sortAccount-accountOrderList').html(listSortAccount);
                    var accountOrderList = document.getElementById('sortAccount-accountOrderList'),
                        sortableAccount = Sortable.create(accountOrderList, {
                            animation: 150
                        });

                    $("#form-sortAccount").off("submit");
                    $("#form-sortAccount").on("submit", function (e) {

                        e.preventDefault();
                        var arrSortAccount = sortableAccount.toArray(),
                            dataSend = { arrSortAccount: arrSortAccount };

                        $.ajax({
                            type: 'POST',
                            url: baseURL + "chartOfAccount/saveSortOrderAccount",
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
                                $("#window-loader").modal("show");
                            },
                            complete: function (jqXHR, textStatus) {
                                switch (jqXHR.status) {
                                    case 200:
                                        $('#modal-sortAccount').modal('hide');
                                        getDataChartOfAccount();
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
                    break;
                default:
                    $("#modal-sortAccount").modal("hide");
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done();
        setUserToken(jqXHR);
    });
});

$('#accountOpeningBalance-btnSaveAccountOpeningBalance').off('click');
$('#accountOpeningBalance-btnSaveAccountOpeningBalance').on('click', function (e) {
    calculateTotalNominal('D');
    calculateTotalNominal('C');
    var totalDebitValue = $("#accountOpeningBalance-totalDebit").html().replace(/\D/g, ''),
        totalDebitValue = totalDebitValue == "" ? 0 : parseInt(totalDebitValue),
        totalCreditValue = $("#accountOpeningBalance-totalCredit").html().replace(/\D/g, ''),
        totalCreditValue = totalCreditValue == "" ? 0 : parseInt(totalCreditValue);

    if (totalDebitValue != totalCreditValue) {
        showWarning('The nominal data you have entered is unbalanced. Please review the input data again!');
    } else {
        var confirmText = 'This account opening balance data will be save. Please ensure that the data you have entered is accurate and balanced. <br/>Are you sure to continue?';

        $confirmDialog.find('#modal-confirm-body').html(confirmText);
        $confirmDialog.find('#confirmBtn').attr('data-function', "saveAccountOpeningBalance");
        $confirmDialog.modal('show');
    }
});

function confirmDeleteAccount(idAccount, level, codeNumberGeneral, codeNumberMain, codeNumberSub, accountName) {
    var codeNumberMain = codeNumberMain != '' ? '-' + codeNumberMain : codeNumberMain,
        codeNumberSub = codeNumberSub != '' ? '-' + codeNumberSub : codeNumberSub,
        confirmText = 'This account will be deleted from the system. Details ;<br/><br/>Code : <b>' + codeNumberGeneral + codeNumberMain + codeNumberSub + '</b><br/>Account Name : <b>' + accountName + '</b>.<br/><br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-idAccount', idAccount).attr('data-accountLevel', level).attr('data-function', "deleteAccount");
    $confirmDialog.modal('show');
}

$('#confirmBtn').off('click');
$('#confirmBtn').on('click', function (e) {
    var funcName = $confirmDialog.find('#confirmBtn').attr('data-function'),
        idAccount = funcName == "saveAccountOpeningBalance" ? "" : $confirmDialog.find('#confirmBtn').attr('data-idAccount'),
        accountLevel = funcName == "saveAccountOpeningBalance" ? "" : $confirmDialog.find('#confirmBtn').attr('data-accountLevel'),
        reffNumberJournalOpeningBalance = funcName == "saveAccountOpeningBalance" ? $("#accountOpeningBalance-reffNumber").val() : "",
        dateJournalOpeningBalance = funcName == "saveAccountOpeningBalance" ? $("#accountOpeningBalance-date").val() : "",
        descriptionJournalOpeningBalance = funcName == "saveAccountOpeningBalance" ? $("#accountOpeningBalance-description").val() : "",
        dataAccountOpeningBalance = getAccountOpeningBalance(),
        dataSend = funcName == "saveAccountOpeningBalance" ?
            { reffNumberJournalOpeningBalance: reffNumberJournalOpeningBalance, dateJournalOpeningBalance: dateJournalOpeningBalance, descriptionJournalOpeningBalance: descriptionJournalOpeningBalance, dataAccountOpeningBalance: dataAccountOpeningBalance } :
            { idAccount: idAccount, accountLevel: accountLevel };

    $.ajax({
        type: 'POST',
        url: baseURL + "chartOfAccount/" + funcName,
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
                    getDataChartOfAccount();
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

function getAccountOpeningBalance() {
    var dataAccountOpeningBalance = [];
    $('.trAccountOpeningBalance').each(function () {
        var idAccount = $(this).attr('data-idAccount'),
            debitElem = $("#accountOpeningBalanceDebit-" + idAccount),
            creditElem = $("#accountOpeningBalanceCredit-" + idAccount);

        if (debitElem.length > 0 && creditElem.length > 0) {
            var debitValue = debitElem.val(),
                debitValue = debitValue == "" ? 0 : debitValue.replace(/\D/g, ''),
                creditValue = creditElem.val(),
                creditValue = creditValue == "" ? 0 : creditValue.replace(/\D/g, ''),
                drCrPosition = debitValue >= creditValue ? 'DR' : 'CR';
            dataAccountOpeningBalance.push([idAccount, drCrPosition, parseInt(debitValue), parseInt(creditValue)]);
        }
    });
    return dataAccountOpeningBalance;
}

$('#btnOpenOpeningAccountBalance').off('click');
$('#btnOpenOpeningAccountBalance').on('click', function (e) {
    toggleSlideContainer('slideContainerLeft', 'slideContainerRight');
    $("#btnOpenOpeningAccountBalance, #btnAddAccount").addClass("d-none");
    $("#btnCloseOpeningAccountBalance").removeClass("d-none");
});

$('#btnCloseOpeningAccountBalance').off('click');
$('#btnCloseOpeningAccountBalance').on('click', function (e) {
    closeOpeningAccountBalanceEditor();
});

function closeOpeningAccountBalanceEditor() {
    toggleSlideContainer('slideContainerLeft', 'slideContainerRight');
    $("#btnOpenOpeningAccountBalance, #btnAddAccount").removeClass("d-none");
    $("#btnCloseOpeningAccountBalance").addClass("d-none");
}

chartOfAccountFunc();