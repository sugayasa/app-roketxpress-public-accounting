var $confirmDialog = $('#modal-confirm-action');
if (listAssetOwnedFunc == null) {
    var listAssetOwnedFunc = function () {
        $(document).ready(function () {
            setOptionHelper('assetsList-optionAssetType', 'dataAssetType');
            setOptionHelper('depreciationPosting-optionAssetType', 'dataAssetType');
            setOptionHelper('editorAssetData-optionAssetType', 'dataAssetType');
            setOptionHelper('assetsList-optionDepreciationGroup', 'dataDepreciationGroup');
            setOptionHelper('depreciationPosting-optionDepreciationGroup', 'dataDepreciationGroup');
            setOptionHelper('editorAssetData-optionDepreciationGroup', 'dataDepreciationGroup');
            getDataOptionByKey('templateJournalData', 'dataTemplateJournalDepreciation', 'Penyusutan Aset', function () {
                setOptionHelper('editorAssetData-optionTemplateJournal', 'dataTemplateJournalDepreciation');
            });
            getDataAsset();
            getDataDepreciationPosting();
        })
    }
}

$('#assetsList-optionAssetType, #assetsList-optionDepreciationGroup').off('change');
$('#assetsList-optionAssetType, #assetsList-optionDepreciationGroup').on('change', function (e) {
    getDataAsset();
});

$('#assetsList-searchKeyword').off('keypress');
$("#assetsList-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataAsset();
    }
});

function generateDataTable(page) {
    getDataAsset(page)
}

function getDataAsset(page = 1) {
    var $tableBody = $('#table-dataAsset > tbody'),
        columnNumber = $('#table-dataAsset > thead > tr > th').length,
        idAssetType = $('#assetsList-optionAssetType').val(),
        idDepreciationGroup = $('#assetsList-optionDepreciationGroup').val(),
        searchKeyword = $('#assetsList-searchKeyword').val(),
        dataSend = {
            page: page,
            idAssetType: idAssetType,
            idDepreciationGroup: idDepreciationGroup,
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "listAssetOwned/getDataTable",
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
                    newReffNumber = responseJSON.newReffNumber;
                    if (data.length === 0) {
                        rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    } else {
                        $.each(data, function (index, array) {
                            var btnInfo = '<i class="text-info fa fa-info text16px infoAsset mr-2" data-idAsset="' + array.IDASSET + '"></i>',
                                btnEdit = '<i class="text-info fa fa-pencil text16px mr-2" data-idAsset="' + array.IDASSET + '" data-toggle="modal" data-target="#modal-editorAssetData"></i>',
                                btnDelete = '<i class="text-info fa fa-trash text16px" onclick="confirmDeleteAssetData(\'' + array.IDASSET + '\', \'' + array.ASSETTYPE + '\', \'' + array.ASSETNAME + '\', \'' + array.DESCRIPTION + '\')"></i>';
                            rows += "<tr>" +
                                "<td>" + array.ASSETTYPE + "</td>" +
                                "<td>" + array.ASSETNAME + "</td>" +
                                "<td>" + array.DESCRIPTION + "</td>" +
                                "<td>" + array.ASSETDEPRECIATIONGROUPNAME + "</td>" +
                                "<td class='text-center'>" + array.PURCHASEDATESTR + "</td>" +
                                "<td class='text-right'>" + numberFormat(array.PURCHASEPRICE) + "</td>" +
                                "<td class='text-right'>" + numberFormat(array.RESIDUALVALUE) + "</td>" +
                                "<td class='text-right'>" + numberFormat(array.DEPRECIATIONVALUE) + "</td>" +
                                "<td class='text-center'>" + btnInfo + btnEdit + btnDelete + "</td>" +
                                "</tr>";
                        });
                    }
                    generatePagination("tablePagination-dataAsset", page, responseJSON.result.pageTotal);
                    generateDataInfo("tableDataCount-dataAsset", responseJSON.result.dataStart, responseJSON.result.dataEnd, responseJSON.result.dataTotal);
                    break;
                case 404:
                default:
                    generatePagination("tablePagination-dataAsset", 1, 1);
                    generateDataInfo("tableDataCount-dataAsset", 0, 0, 0);
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBody.html(rows);


            $('.infoAsset').off('click');
            $('.infoAsset').on('click', function (e) {
                var $tableBodyDetailDepreciation = $('#detailAsset-tableListDetailDepreciation > tbody'),
                    columnNumber = $('#detailAsset-tableListDetailDepreciation > thead > tr > th').length,
                    idAsset = $(this).attr('data-idAsset'),
                    dataSend = { idAsset: idAsset };

                $.ajax({
                    type: 'POST',
                    url: baseURL + "listAssetOwned/getDetailsAssetJournal",
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
                        $("#btnAddAssetData").addClass("d-none");
                        $("#btnCloseSetDetailAsset").removeClass("d-none");
                        $("#detailAsset-assetType, #detailAsset-assetName, #detailAsset-description, #detailAsset-depreciationGroup, #detailAsset-benefitTime, #detailAsset-purchaseDate, #detailAsset-templateJournalName").html("-");
                        $("#detailAsset-purchasePrice, #detailAsset-residualValue, #detailAsset-depreciationValue, #detailAsset-depreciationPerMonth").html("-");
                        $("#detailAsset-purchaseJournalDate, #detailAsset-purchaseJournalReffNumber, #detailAsset-purchaseJournalDescription, #detailAsset-purchaseJournalNominalTotal").html("-");
                        $("#detailAsset-accountJournal").html("");
                        $("#detailAsset-purchaseJournalNominalTotal").html(0);
                        $("#detailAsset-tablePurchaseJournalAccountDetails > tbody").html('<tr id="detailAsset-noDataTableAccountDetails"><td colspan="4" class="text-center">No data</td></tr>');
                        $tableBodyDetailDepreciation.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
                        NProgress.set(0.4);
                        $confirmDialog.modal('hide');
                        $("#window-loader").modal("show");
                    },
                    complete: function (jqXHR, textStatus) {
                        switch (jqXHR.status) {
                            case 200:
                                var responseJSONDetail = jqXHR.responseJSON,
                                    detailAsset = responseJSONDetail.detailAsset,
                                    dataAssetDepreciation = responseJSONDetail.dataAssetDepreciation,
                                    depreciationAccountJournal = JSON.parse(detailAsset.DEPRECIATIONACCOUNTJOURNAL),
                                    detailPurchaseJournal = responseJSONDetail.detailPurchaseJournal,
                                    detailJournalRecap = detailPurchaseJournal.detailRecap,
                                    listDetailJournal = detailPurchaseJournal.listDetailJournal,
                                    elemAccountJournal = rowsDepreciation = '';

                                $("#detailAsset-assetType").html(detailAsset.ASSETTYPE);
                                $("#detailAsset-assetName").html(detailAsset.ASSETNAME);
                                $("#detailAsset-description").html(detailAsset.DESCRIPTION);
                                $("#detailAsset-depreciationGroup").html(detailAsset.ASSETDEPRECIATIONGROUPNAME);
                                $("#detailAsset-benefitTime").html(detailAsset.YEARSBENEFIT + " Years");
                                $("#detailAsset-purchaseDate").html(detailAsset.PURCHASEDATE);
                                $("#detailAsset-templateJournalName").html(detailAsset.TEMPLATEJOURNALNAME);
                                $("#detailAsset-purchasePrice").html(numberFormat(detailAsset.PURCHASEPRICE));
                                $("#detailAsset-residualValue").html(numberFormat(detailAsset.RESIDUALVALUE));
                                $("#detailAsset-depreciationValue").html(numberFormat(detailAsset.DEPRECIATIONVALUE));
                                $("#detailAsset-depreciationPerMonth").html(numberFormat(detailAsset.DEPRECIATIONPERMONTH));

                                if (typeof (depreciationAccountJournal) !== "undefined" && depreciationAccountJournal !== null && depreciationAccountJournal !== '' && depreciationAccountJournal !== false) {
                                    if (depreciationAccountJournal.length > 0) {
                                        $.each(depreciationAccountJournal, function (index, arrayAccountJournal) {
                                            var debitCredit = arrayAccountJournal.POSITIONDRCR == 'DR' ? 'Debit' : 'Credit';
                                            elemAccountJournal += '<li> <span>' + debitCredit + '</span> <span>' + arrayAccountJournal.ACCOUNTCODE + ' - ' + arrayAccountJournal.ACCOUNTNAME + '</span> </li>';
                                        });
                                    }
                                }
                                $("#detailAsset-accountJournal").html(elemAccountJournal);

                                if (detailJournalRecap != "") {
                                    $("#detailAsset-purchaseJournalDate").html(detailJournalRecap.DATETRANSACTION);
                                    $("#detailAsset-purchaseJournalReffNumber").html(detailJournalRecap.REFFNUMBER);
                                    $("#detailAsset-purchaseJournalDescription").html(detailJournalRecap.DESCRIPTION);
                                    $("#detailAsset-purchaseJournalNominalTotal").html(numberFormat(detailJournalRecap.TOTALNOMINAL));
                                }

                                if (listDetailJournal != "") {
                                    var rowAccount = '';
                                    $("#detailAsset-noDataTableAccountDetails").remove();
                                    $.each(listDetailJournal, function (index, array) {
                                        rowAccount += generateRowAccount(array.IDACCOUNT, 0, array.ACCOUNTCODE, array.ACCOUNTNAME, array.DESCRIPTION, array.DEBIT, array.CREDIT);
                                    });
                                    $("#detailAsset-tablePurchaseJournalAccountDetails > tbody").html(rowAccount);
                                }

                                if (depreciationAccountJournal.length > 0) {
                                    $.each(dataAssetDepreciation, function (index, arrayDepreciation) {
                                        rowsDepreciation += "<tr>" +
                                            "<td class='text-right'>" + numberFormat(arrayDepreciation.DEPRECIATIONNUMBER) + "</td>" +
                                            "<td>" + arrayDepreciation.DEPRECIATIONDATE + "</td>" +
                                            "<td>" + arrayDepreciation.DATETIMEJOURNAL + "</td>" +
                                            "<td class='text-right'>" + numberFormat(arrayDepreciation.DEPRECIATIONVALUE) + "</td>" +
                                            "<td class='text-right'>" + numberFormat(arrayDepreciation.JOURNALVALUE) + "</td>" +
                                            "<td>" + arrayDepreciation.REFFNUMBER + "</td>" +
                                            "<td>" + arrayDepreciation.DESCRIPTION + "</td>" +
                                            "<td>" + arrayDepreciation.USERPOST + "</td>" +
                                            "</tr>";
                                    });
                                }
                                $tableBodyDetailDepreciation.html(rowsDepreciation);
                                toggleSlideContainer('slideContainerLeft', 'slideContainerRight');
                                break;
                            default:
                                $("#btnAddAssetData").removeClass("d-none");
                                $("#btnCloseSetDetailAsset").addClass("d-none");
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
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

$('#btnCloseSetDetailAsset').off('click');
$('#btnCloseSetDetailAsset').on('click', function (e) {
    toggleSlideContainer('slideContainerLeft', 'slideContainerRight');
    $("#btnAddAssetData").removeClass("d-none");
    $("#btnCloseSetDetailAsset").addClass("d-none");
});

$('#modal-editorAssetData').off('shown.bs.modal');
$('#modal-editorAssetData').on('shown.bs.modal', function (e) {
    var idAsset = $(e.relatedTarget).attr('data-idAsset');
    $("#editorAssetData-assetName, #editorAssetData-assetDescription, #editorAssetData-descriptionTransaction").val('').attr('disabled', false);
    $("#editorAssetData-idAsset, #editorAssetData-purchasePrice, #editorAssetData-residualValue, #editorAssetData-idPurchaseJournalRecap").val(0);
    $("#editorAssetData-warningDataJournal").addClass('d-none');
    $("#editorAssetData-btnAddAccountJournal").removeClass('d-none');
    $("#editorAssetData-reffNumber").val(newReffNumber);
    $(".trAccountJournal").remove();
    resetEditorAccountTransaction();
    calculateDebitCreditJournal();
    $('.nav-link[href="#editorAssetData-inputDataAsset"]').click();

    if (typeof (idAsset) !== "undefined" && idAsset !== null && idAsset !== '' && idAsset !== false) {
        var dataSend = { idAsset: idAsset };
        $.ajax({
            type: 'POST',
            url: baseURL + "listAssetOwned/getDetailAsset",
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
                $("#form-editorAssetData :input").attr("disabled", true);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;

                switch (jqXHR.status) {
                    case 200:
                        var detailAsset = responseJSON.detailAsset,
                            detailPurchaseJournal = responseJSON.detailPurchaseJournal,
                            detailJournalRecap = detailPurchaseJournal.detailRecap,
                            listDetailJournal = detailPurchaseJournal.listDetailJournal;

                        $("#editorAssetData-optionAssetType").val(detailAsset.IDASSETTYPE);
                        $("#editorAssetData-optionDepreciationGroup").val(detailAsset.IDASSETDEPRECIATIONGROUP);
                        $("#editorAssetData-optionTemplateJournal").val(detailAsset.IDJOURNALTEMPLATERECAP);
                        $("#editorAssetData-assetName").val(detailAsset.ASSETNAME);
                        $("#editorAssetData-assetDescription").val(detailAsset.DESCRIPTION);
                        $("#editorAssetData-purchaseDate").val(detailAsset.PURCHASEDATE);
                        $("#editorAssetData-purchasePrice").val(numberFormat(detailAsset.PURCHASEPRICE));
                        $("#editorAssetData-residualValue").val(numberFormat(detailAsset.RESIDUALVALUE));
                        $("#editorAssetData-idAsset").val(idAsset);

                        if (detailJournalRecap != "") {
                            $("#editorAssetData-reffNumber").val(detailJournalRecap.REFFNUMBER);
                            $("#editorAssetData-descriptionTransaction").val(detailJournalRecap.DESCRIPTION).attr("disabled", true);
                        }

                        if (listDetailJournal != "") {
                            var rowAccount = '';
                            $.each(listDetailJournal, function (index, array) {
                                rowAccount += generateRowAccount(array.IDACCOUNT, 0, array.ACCOUNTCODE, array.ACCOUNTNAME, array.DESCRIPTION, array.DEBIT, array.CREDIT);
                            });
                            $("#editorAssetData-tableAccountDetails > tbody").html(rowAccount);
                            calculateDebitCreditJournal();
                        }

                        $("#editorAssetData-warningDataJournal").removeClass('d-none');
                        $("#editorAssetData-warningDataJournalStr").html("The purchase asset journal can be modified through the general journal menu");
                        break;
                    default:
                        $("#modal-editorAssetData").modal("hide");
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            $("#form-editorAssetData :input").attr("disabled", false);
            $("#editorAssetData-btnAddAccountJournal").addClass('d-none');
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

function resetEditorAccountTransaction() {
    setOptionHelper('addAccountJournal-optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
        setOptionHelper('addAccountJournal-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAccountEvent();
        }, firstValueAccountMain);
    });

    $('#addAccountJournal-optionAccountMain').off('change');
    $('#addAccountJournal-optionAccountMain').on('change', function (e) {
        var selectedValueAccountMain = this.value;
        setOptionHelper('addAccountJournal-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAccountEvent();
            $("#addAccountJournal-optionAccountSub").select2();
        }, selectedValueAccountMain);
    });

    $('#addAccountJournal-optionAccountSub').off('change');
    $('#addAccountJournal-optionAccountSub').on('change', function (e) {
        afterSelectAccountEvent();
    });
    $("#addAccountJournal-description").val('');
    $("#addAccountJournal-nominalTransaction").val(0);

    return true;
}

function afterSelectAccountEvent() {
    var accountType = 'main',
        selectedValue = '';
    if ($('#addAccountJournal-optionAccountSub > option').length <= 0 && $('#addAccountJournal-optionAccountSub > optgroup').length <= 0) {
        selectedValue = $("#addAccountJournal-optionAccountMain").val();
        $("#addAccountJournal-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        accountType = 'sub';
        selectedValue = $("#addAccountJournal-optionAccountSub").val();
        $("#addAccountJournal-optionAccountSub").prop('disabled', false);
    }

    var dataOptionHelper = JSON.parse(localStorage.getItem('optionHelper')),
        dataAccount = accountType == 'main' ? dataOptionHelper.dataAccountMain : dataOptionHelper.dataAccountSub,
        accountIndex = dataAccount.findIndex(elem => elem['ID'] == selectedValue),
        defaultDRCR = dataAccount[accountIndex].DEFAULTDRCR,
        defaultPlus = defaultDRCR == 'DR' ? 'Debit' : 'Credit',
        defaultMinus = defaultDRCR == 'DR' ? 'Credit' : 'Debit';
    $("#addAccountJournal-textDefaultPositionPlus").html(defaultPlus);
    $("#addAccountJournal-textDefaultPositionMinus").html(defaultMinus);
    $("input[name='addAccountJournal-debitCredit'][value='" + defaultDRCR + "']").prop('checked', true);

    return true;
}

$('#modal-addAccountJournal').off('shown.bs.modal');
$('#modal-addAccountJournal').on('shown.bs.modal', function (e) {
    resetEditorAccountTransaction();
});

$("#form-addAccountJournal").off('submit');
$("#form-addAccountJournal").on("submit", function (e) {
    e.preventDefault();
    var idAccountMain = $('#addAccountJournal-optionAccountMain').val(),
        idAccountSub = $('#addAccountJournal-optionAccountSub').val(),
        idAccount = idAccountSub == '0' ? idAccountMain : idAccountSub,
        textAccountMain = $('#addAccountJournal-optionAccountMain option:selected').text(),
        arrTextAccountMain = textAccountMain.split(' '),
        codeAccountMain = arrTextAccountMain[0],
        nameAccountMain = arrTextAccountMain.splice(0, 1),
        nameAccountMain = arrTextAccountMain.join(' '),
        textAccountSub = $('#addAccountJournal-optionAccountSub option:selected').text(),
        arrTextAccountSub = textAccountSub.split(' '),
        codeAccountSub = arrTextAccountSub[0],
        nameAccountSub = arrTextAccountSub.splice(0, 1),
        nameAccountSub = arrTextAccountSub.join(' '),
        codeAccount = idAccountSub == '0' ? codeAccountMain : codeAccountSub,
        nameAccount = idAccountSub == '0' ? nameAccountMain : nameAccountSub,
        debitCredit = $("input[name='addAccountJournal-debitCredit']:checked").val(),
        description = $('#addAccountJournal-description').val(),
        nominalTransaction = $('#addAccountJournal-nominalTransaction').val(),
        nominalTransactionInt = nominalTransaction.replace(/[^0-9\.]+/g, '') * 1,
        debitNominal = debitCredit == 'DR' ? nominalTransaction : 0,
        creditNominal = debitCredit == 'CR' ? nominalTransaction : 0;

    if (nominalTransactionInt <= 0) {
        showWarning('Please input valid nominal');
    } else {
        var elemExist = $(".trAccountJournal[data-idAccount='" + idAccount + "']"),
            rowAccount = generateRowAccount(idAccount, '', codeAccount, nameAccount, description, debitNominal, creditNominal);

        if (elemExist.length <= 0) $("#editorAssetData-tableAccountDetails > tbody").append(rowAccount);
        if (elemExist.length > 0) elemExist.replaceWith(rowAccount);
        calculateDebitCreditJournal();
        $("#modal-addAccountJournal").modal("hide");
    }
});

function deleteAccountJournal(idAccount) {
    var elem = $(".trAccountJournal[data-idAccount='" + idAccount + "']");
    if (elem.length > 0) {
        elem.remove();
        calculateDebitCreditJournal();
    }
    if ($(".trAccountJournal").length <= 0) $("#editorAssetData-tableAccountDetails > tbody").html('<tr id="editorAssetData-noDataTableAccountDetails"><td colspan="4" class="text-center">No data</td></tr>');
}

function generateRowAccount(idAccount, idJournalDetail, accountCode, accountName, description, nominalDR, nominalCR) {
    var removeBtn = idJournalDetail == 0 ? '' : '<i class="fa fa-trash text-danger" onclick="deleteAccountJournal(\'' + idAccount + '\')"></i>';
    return '<tr class="trAccountJournal" data-idAccount="' + idAccount + '" data-idJournalDetail="' + idJournalDetail + '">' +
        '<td>' + accountCode + ' - ' + accountName + '<br/><small>' + description + '</small></td>' +
        '<td align="right">' + numberFormat(nominalDR) + '</td>' +
        '<td align="right">' + numberFormat(nominalCR) + '</td>' +
        '<td class="text-center">' + removeBtn + '</td>' +
        '</tr>';
}

function calculateDebitCreditJournal(returnBalance = false) {
    var totalDebit = totalCredit = nominalTransaction = 0,
        isBalance = false,
        iconBalanceDebitCredit = '';
    $('.trAccountJournal').each(function () {
        $(this).find('td').each(function (i) {
            totalDebit += i == 1 && $(this).find('div').length <= 0 ? $(this).html().replace(/[^0-9\.]+/g, '') * 1 : 0;
            totalCredit += i == 2 && $(this).find('div').length <= 0 ? $(this).html().replace(/[^0-9\.]+/g, '') * 1 : 0;
        });
    });
    nominalTransaction = totalDebit > totalCredit ? totalDebit : totalCredit;
    isBalance = totalDebit == totalCredit;
    iconBalanceDebitCredit = totalDebit != totalCredit && nominalTransaction > 0 ? '<i class="fa fa-hourglass-2 text-primary"></i>' : '<i class="fa fa-check text-success"></i>';
    if ($("#editorAssetData-noDataTableAccountDetails").length > 0) $("#editorAssetData-noDataTableAccountDetails").remove();
    $("#editorAssetData-totalNominalDebit").html(numberFormat(totalDebit));
    $("#editorAssetData-totalNominalCredit").html(numberFormat(totalCredit));
    $("#editorAssetData-statusBalanceDebitCredit").html(numberFormat(iconBalanceDebitCredit));

    if ($('.trAccountJournal').length > 0) {
        if ($('#editorAssetData-noDataTableAccountDetails').length > 0) $('#editorAssetData-noDataTableAccountDetails').remove();
    } else {
        $("#editorAssetData-tableAccountDetails > tbody").append('<tr id="editorAssetData-noDataTableAccountDetails"><td colspan="4" class="text-center">No data</td></tr>');
    }

    if (returnBalance) return isBalance;
}

$("#form-editorAssetData").off('submit');
$("#form-editorAssetData").on("submit", function (e) {
    e.preventDefault();
    var idAsset = $('#editorAssetData-idAsset').val(),
        idDepreciationGroup = $('#editorAssetData-optionDepreciationGroup').val(),
        idTemplateJournal = $('#editorAssetData-optionTemplateJournal').val(),
        idAssetType = $('#editorAssetData-optionAssetType').val(),
        assetName = $('#editorAssetData-assetName').val(),
        assetDescription = $('#editorAssetData-assetDescription').val(),
        purchaseDate = $('#editorAssetData-purchaseDate').val(),
        purchasePrice = $('#editorAssetData-purchasePrice').val().replace(/[^0-9\.]+/g, '') * 1,
        residualValue = $('#editorAssetData-residualValue').val().replace(/[^0-9\.]+/g, '') * 1,
        urlFunction = idAsset != '' && idAsset != 0 ? 'updateData' : 'insertData';

    var dataSend = {
        idAsset: idAsset,
        idAssetType: idAssetType,
        idDepreciationGroup: idDepreciationGroup,
        idTemplateJournal: idTemplateJournal,
        assetName: assetName,
        assetDescription: assetDescription,
        purchaseDate: purchaseDate,
        purchasePrice: purchasePrice,
        residualValue: residualValue
    };

    var purchaseDateMJs = moment(purchaseDate, 'DD-MM-YYYY'),
        initialRecordingDateMJs = moment(initialRecordingDate, 'YYYY-MM-DD'),
        msgWarningJournal = '',
        arrDataJournal = {},
        arrAccountDetail = [],
        totalAccountJournal = totalNominalJournal = 0,
        isBalance = calculateDebitCreditJournal(true);

    if (initialRecordingDateMJs.isBefore(purchaseDateMJs) && idAsset == 0) {
        var journalDescription = $('#editorAssetData-descriptionTransaction').val(),
            journalDescriptionCheck = journalDescription.replace(/\s+/g, '').length;

        $('.trAccountJournal').each(function () {
            var idAccount = $(this).attr('data-idAccount'),
                arrDataAccount = [idAccount];
            $(this).find('td').each(function (i) {
                var descriptionAccount = $(this).find('small');
                if (descriptionAccount.length > 0) arrDataAccount.push(descriptionAccount.html());
                if (i == 1) arrDataAccount.push($(this).html().replace(/[^0-9\.]+/g, '') * 1);
                if (i == 2) {
                    var nominalCR = $(this).html().replace(/[^0-9\.]+/g, '') * 1;
                    arrDataAccount.push(nominalCR);
                    totalNominalJournal += nominalCR;
                }
            });
            arrAccountDetail.push(arrDataAccount);
            totalAccountJournal++;
        });

        if (!isBalance) msgWarningJournal = 'The amount of account debits and credits is not balanced. Please check the account details again';
        if (!Array.isArray(arrAccountDetail) || arrAccountDetail.length <= 0) msgWarningJournal = 'Please enter the transaction account details first';
        if (journalDescription == '' || journalDescriptionCheck < 8) msgWarningJournal = 'Please enter a valid purchase journal description';
    }

    if (msgWarningJournal != '') {
        $("#editorAssetData-warningDataJournalStr").html("A purchase journal entry is required for asset acquisitions made after " + initialRecordingDateMJs.format('D MMM YYYY'));
        $("#editorAssetData-warningDataJournal").removeClass('d-none');
        $('.nav-link[href="#editorAssetData-inputPurchaseJournal"]').click();
        showWarning(msgWarningJournal);
    } else {
        if (initialRecordingDateMJs.isBefore(purchaseDateMJs) && idAsset == 0) {
            arrDataJournal = {
                journalDescription: journalDescription,
                arrAccountDetail: arrAccountDetail,
                totalAccountJournal: totalAccountJournal,
                totalNominalJournal: totalNominalJournal
            };
            dataSend['arrDataJournal'] = arrDataJournal;
        }
        $.ajax({
            type: 'POST',
            url: baseURL + "listAssetOwned/" + urlFunction,
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
                $("#form-editorAssetData :input").attr("disabled", true);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        $("#modal-editorAssetData").modal("hide");
                        getDataAsset();
                        break;
                    default: break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            $("#form-editorAssetData :input").attr("disabled", false);
            NProgress.done();
            generateWarningMessageResponse(jqXHR);
            setUserToken(jqXHR);
        });
    }
});

function confirmDeleteAssetData(idAsset, assetType, assetName, description) {

    var confirmText = 'This asset will be deleted from the system. Details ;<br/><br/>' +
        '<div class="order-details-customer-info">' +
        '<ul>' +
        '<li> <span>Asset Type</span> <span><b>' + assetType + '</b></span> </li>' +
        '<li> <span>Asset Name</span> <span><b>' + assetName + '</b></span> </li>' +
        '<li> <span>Description</span> <span><b>' + description + '</b></span> </li>' +
        '</ul>' +
        '</div>' +
        '<br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-idAsset', idAsset).attr('data-function', "deleteDataAsset");
    $confirmDialog.modal('show');

}

$('#confirmBtn').off('click');
$('#confirmBtn').on('click', function (e) {

    var idAsset = $confirmDialog.find('#confirmBtn').attr('data-idAsset'),
        funcName = $confirmDialog.find('#confirmBtn').attr('data-function'),
        dataSend = { idAsset: idAsset };

    $.ajax({
        type: 'POST',
        url: baseURL + "listAssetOwned/" + funcName,
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
                    getDataAsset();
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

$('#depreciationPosting-optionAssetType, #depreciationPosting-optionDepreciationGroup').off('change');
$('#depreciationPosting-optionAssetType, #depreciationPosting-optionDepreciationGroup').on('change', function (e) {
    getDataAsset();
});

$('#depreciationPosting-searchKeyword').off('keypress');
$("#depreciationPosting-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataAsset();
    }
});

function getDataDepreciationPosting() {
    var $tableBody = $('#table-dataDepreciationPosting > tbody'),
        columnNumber = $('#table-dataAsset > thead > tr > th').length,
        dataSend = {};
    $.ajax({
        type: 'POST',
        url: baseURL + "listAssetOwned/getDataDepreciationPosting",
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
                    var data = responseJSON.result;
                    if (data.length === 0) {
                        rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    } else {
                        var arrDepreciationPeriod = [],
                            arrDepreciationPeriodCheck = [];
                        $.each(data, function (index, array) {
                            var depreciationPeriod = array.DEPRECIATIONPERIOD,
                                depreciationPeriodStr = array.DEPRECIATIONPERIODSTR,
                                dataTemplateJournal = array.DETAILTEMPLATEJOURNAL,
                                journalDescription = journalAccounts = '',
                                btnShowPostingForm = '<i class="text-info fa fa-pencil-square-o text18px" data-idAssetDepreciation="' + array.IDASSETDEPRECIATION + '" data-toggle="modal" data-target="#modal-editorAssetDepreciation")"></i>';

                            if ($.inArray(depreciationPeriod, arrDepreciationPeriodCheck) == -1) {
                                arrDepreciationPeriod.push([depreciationPeriod, depreciationPeriodStr]);
                                arrDepreciationPeriodCheck.push(depreciationPeriod);
                            }

                            $.each(dataTemplateJournal, function (indexTemplateJournal, arrayTemplateJournal) {
                                if (indexTemplateJournal != 0 && indexTemplateJournal < dataTemplateJournal.length) journalAccounts += "<br/>";
                                journalAccounts += arrayTemplateJournal.ACCOUNTCODENAME;
                                journalDescription = arrayTemplateJournal.DESCRIPTION;
                            });

                            rows += "<tr " +
                                "data-depreciationPeriod='" + depreciationPeriod + "' " +
                                "data-assetType='" + array.IDASSETTYPE + "' " +
                                "data-depreciationGroup='" + array.IDASSETDEPRECIATIONGROUP + "' " +
                                "data-assetName='" + array.ASSETNAME + "' " +
                                "class='trDataDepreciationPosting'>" +
                                "<td>" + array.ASSETTYPE + "<br/>" + array.ASSETNAME + "<br/>" + array.ASSETDEPRECIATIONGROUPNAME + "</td>" +
                                "<td>" +
                                "<div class='order-details-customer-info mb-20'>" +
                                "<ul>" +
                                "<li> <span>Purchase Date</span> <span>" + array.PURCHASEDATESTR + "</span> </li>" +
                                "<li> <span>Purchase Price</span> <span class='text-right'>" + numberFormat(array.PURCHASEPRICE) + "</span> </li>" +
                                "<li> <span>Residual Value</span> <span class='text-right'>" + numberFormat(array.RESIDUALVALUE) + "</span> </li>" +
                                "<li> <span>Depreciation Value</span> <span class='text-right'>" + numberFormat(array.DEPRECIATIONVALUE) + "</span> </li>" +
                                "</ul >" +
                                "</div >" +
                                "</td>" +
                                "<td class='text-right'>" + array.DEPRECIATIONNUMBER + "</td>" +
                                "<td>" + array.DEPRECIATIONDATESTR + "</td>" +
                                "<td>" + journalDescription + "</td>" +
                                "<td>" + journalAccounts + "</td>" +
                                "<td class='text-right'>" + numberFormat(array.DEPRECIATIONVALUEJOURNAL) + "</td>" +
                                "<td class='text-center'>" + btnShowPostingForm + "</td>" +
                                "</tr>";
                        });

                        rows += "<tr id='trNoDataDepreciationPosting' class='d-none'><td colspan='8' class='text-center'>No data found</td></tr>";
                        generateOptionDropdownDepreciationPeriod(arrDepreciationPeriod);
                    }
                    break;
                case 404:
                default:
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBody.html(rows);
            filterDataDepreciationPosting();
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateOptionDropdownDepreciationPeriod(arrDepreciationPeriod) {
    $("#depreciationPosting-optionDepreciationPeriod").empty();
    $.each(arrDepreciationPeriod, function (index, array) {
        var optElem = $("<option></option>").val(array[0]).html(array[1]);
        $("#depreciationPosting-optionDepreciationPeriod").append(optElem);
    });
}

$('#depreciationPosting-optionDepreciationPeriod, #depreciationPosting-optionAssetType, #depreciationPosting-optionDepreciationGroup').off('change');
$('#depreciationPosting-optionDepreciationPeriod, #depreciationPosting-optionAssetType, #depreciationPosting-optionDepreciationGroup').on('change', function (e) {
    filterDataDepreciationPosting();
});

$('#depreciationPosting-searchKeyword').off('keypress');
$("#depreciationPosting-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        filterDataDepreciationPosting();
    }
});

function filterDataDepreciationPosting() {
    var filterDepreciationPeriod = $("#depreciationPosting-optionDepreciationPeriod").val(),
        filterAssetType = $("#depreciationPosting-optionAssetType").val(),
        filterDepreciationGroup = $("#depreciationPosting-optionDepreciationGroup").val(),
        filterSearchKeyword = $("#depreciationPosting-searchKeyword").val(),
        totalRowShown = 0;

    $('.trDataDepreciationPosting').each(function (index, elemObject) {
        var trDepreciationPeriod = $(this).attr('data-depreciationPeriod'),
            trAssetType = $(this).attr('data-assetType'),
            trDepreciationGroup = $(this).attr('data-depreciationGroup'),
            trAssetName = $(this).attr('data-assetName'),
            matchDepreciationPeriod = filterDepreciationPeriod == trDepreciationPeriod ? true : false,
            matchAssetType = filterAssetType != "" && filterAssetType == trAssetType ? true : filterAssetType == "" ? true : false,
            matchDepreciationGroup = filterDepreciationGroup != "" && filterDepreciationGroup == trDepreciationGroup ? true : filterDepreciationGroup == "" ? true : false,
            matchSearchKeyword = filterSearchKeyword != "" && trAssetName.includes(filterSearchKeyword) ? true : filterSearchKeyword == "" ? true : false;

        if (matchDepreciationPeriod && matchAssetType && matchDepreciationGroup && matchSearchKeyword) {
            $(this).removeClass('d-none');
            totalRowShown++;
        } else {
            $(this).addClass('d-none');
        }
    });

    if (totalRowShown > 0) {
        $("#trNoDataDepreciationPosting").addClass('d-none');
    } else {
        $("#trNoDataDepreciationPosting").removeClass('d-none');
    }
}

$('#modal-editorAssetDepreciation').off('shown.bs.modal');
$('#modal-editorAssetDepreciation').on('shown.bs.modal', function (e) {
    var idAssetDepreciation = $(e.relatedTarget).attr('data-idAssetDepreciation');
    $("#editorAssetDepreciation-reffNumber, #editorAssetDepreciation-journalDate, #editorAssetDepreciation-journalDescription").val('');
    $("#editorAssetDepreciation-idAssetDepreciation").val(0);

    if (typeof (idAssetDepreciation) !== "undefined" && idAssetDepreciation !== null && idAssetDepreciation !== '' && idAssetDepreciation !== false) {
        var dataSend = { idAssetDepreciation: idAssetDepreciation };
        $.ajax({
            type: 'POST',
            url: baseURL + "listAssetOwned/getDetailDepreciationPosting",
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
                $("#form-editorAssetDepreciation :input").attr("disabled", true);
                $(".rowDepreciationPostingAccount, .rowDepreciationPostingAccountNominal, .rowDepreciationPostingAccountDescription").remove();
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;

                switch (jqXHR.status) {
                    case 200:
                        var newReffNumber = responseJSON.newReffNumber,
                            detailDepreciation = responseJSON.detailDepreciation,
                            detailTemplateJournal = responseJSON.detailTemplateJournal,
                            depreciationValue = numberFormat(detailDepreciation.DEPRECIATIONVALUE),
                            rowAccountDR = rowAccountCR = '';

                        $("#editorAssetDepreciation-reffNumber").val(newReffNumber);
                        $("#editorAssetDepreciation-journalDate").val(detailDepreciation.DEPRECIATIONDATE);
                        $("#editorAssetDepreciation-journalDescription").val(detailDepreciation.JOURNALDESCRIPTION);
                        $("#editorAssetDepreciation-idAssetDepreciation").val(idAssetDepreciation);

                        $.each(detailTemplateJournal, function (index, array) {
                            var idAccount = array.IDACCOUNT,
                                defaultDRCR = array.DEFAULTDRCR,
                                rowAccountBorderBottom = '';

                            if (defaultDRCR == 'DR') {
                                rowAccountBorderBottom = rowAccountDR == '' ? '' : 'border-top';
                            } else {
                                rowAccountBorderBottom = rowAccountCR == '' ? '' : 'border-top';
                            }

                            var rowElem = '<div class="col-lg-8 col-sm-6 mb-10 pl-30 order-details-customer-info rowDepreciationPostingAccount" data-idAccount="' + idAccount + '" data-positionDRCR="' + defaultDRCR + '" data-accountName="' + array.ACCOUNTNAME + '">' +
                                '<ul class="ml-5"><li> <span>' + array.ACCOUNTCODE + '</span> <span>' + array.ACCOUNTNAME + '</span> </li></ul>' +
                                '</div>' +
                                '<div class="col-lg-4 col-sm-6 mb-10 rowDepreciationPostingAccountNominal">' +
                                '<input type="text" class="form-control form-control-sm mb-0 text-right" id="rowDepreciationPostingAccount-journalNominal' + idAccount + '" value="' + depreciationValue + '" onkeypress="maskNumberInput(0, 999999999, \'rowDepreciationPostingAccount-journalNominal' + idAccount + '\')">' +
                                '</div>' +
                                '<div class="col-sm-12 mb-10 pl-30 rowDepreciationPostingAccountDescription ' + rowAccountBorderBottom + '">' +
                                '<input type="text" class="form-control form-control-sm" id="rowDepreciationPostingAccount-journalDescription' + idAccount + '" placeholder="Description of ' + array.ACCOUNTNAME + '">' +
                                '</div>';
                            if (defaultDRCR == 'DR') rowAccountDR += rowElem;
                            if (defaultDRCR == 'CR') rowAccountCR += rowElem;
                        });

                        if (rowAccountDR) {
                            $("#editorAssetDepreciation-rowDebitAccount").prepend(rowAccountDR);
                            $("#editorAssetDepreciation-colNoDataDebitAccount").addClass('d-none');
                        } else {
                            $("#editorAssetDepreciation-colNoDataDebitAccount").removeClass('d-none');
                        }

                        if (rowAccountDR) {
                            $("#editorAssetDepreciation-rowCreditAccount").prepend(rowAccountCR);
                            $("#editorAssetDepreciation-colNoDataCreditAccount").addClass('d-none');
                        } else {
                            $("#editorAssetDepreciation-colNoDataCreditAccount").removeClass('d-none');
                        }

                        $("#form-editorAssetDepreciation").off('submit');
                        $("#form-editorAssetDepreciation").on("submit", function (e) {
                            e.preventDefault();
                            var idAssetDepreciation = $('#editorAssetDepreciation-idAssetDepreciation').val(),
                                reffNumber = $('#editorAssetDepreciation-reffNumber').val(),
                                journalDate = $('#editorAssetDepreciation-journalDate').val(),
                                journalDescription = $('#editorAssetDepreciation-journalDescription').val(),
                                arrJournalAccountDR = [],
                                arrJournalAccountCR = [],
                                totalNominalDR = totalNominalCR = 0,
                                msgWarningNominalAccount = '';

                            $('.rowDepreciationPostingAccount').each(function () {
                                var idAccount = $(this).attr('data-idAccount'),
                                    positionDRCR = $(this).attr('data-positionDRCR'),
                                    accountName = $(this).attr('data-accountName'),
                                    nominalDRCR = $("#rowDepreciationPostingAccount-journalNominal" + idAccount).val(),
                                    nominalDRCR = nominalDRCR.replace(/[^0-9\.]+/g, '') * 1,
                                    descriptionDRCR = $("#rowDepreciationPostingAccount-journalDescription" + idAccount).val(),
                                    arrAccountJournal = [idAccount, positionDRCR, nominalDRCR, descriptionDRCR];

                                if (positionDRCR == 'DR') {
                                    arrJournalAccountDR.push(arrAccountJournal);
                                    totalNominalDR = totalNominalDR + nominalDRCR;
                                }

                                if (positionDRCR == 'CR') {
                                    arrJournalAccountCR.push(arrAccountJournal);
                                    totalNominalCR = totalNominalCR + nominalDRCR;
                                }

                                if (nominalDRCR <= 0) msgWarningNominalAccount = 'Invalid nominal for account <b>' + accountName + '</b> at <b>' + positionDRCR + '</b> position';
                            });

                            if (msgWarningNominalAccount != '') {
                                showWarning(msgWarningNominalAccount);
                            } else if (!Array.isArray(arrJournalAccountDR) || arrJournalAccountDR.length <= 0) {
                                showWarning('Please select an account that is in debit position');
                            } else if (!Array.isArray(arrJournalAccountCR) || arrJournalAccountCR.length <= 0) {
                                showWarning('Please select an account that is in credit position');
                            } else if (totalNominalDR != totalNominalCR) {
                                showWarning('The nominal amount of the Debit and Credit accounts is not balanced.<br/>Please make corrections');
                            } else {
                                var dataSend = {
                                    idAssetDepreciation: idAssetDepreciation,
                                    reffNumber: reffNumber,
                                    journalDate: journalDate,
                                    journalNominal: totalNominalDR,
                                    journalDescription: journalDescription,
                                    arrJournalAccountDR: arrJournalAccountDR,
                                    arrJournalAccountCR: arrJournalAccountCR
                                };

                                $.ajax({
                                    type: 'POST',
                                    url: baseURL + "listAssetOwned/postAssetDepreciationJournal",
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
                                        $("#form-editorAssetDepreciation :input").attr("disabled", true);
                                        $("#window-loader").modal("show");
                                    },
                                    complete: function (jqXHR, textStatus) {
                                        var responseJSON = jqXHR.responseJSON;
                                        switch (jqXHR.status) {
                                            case 200:
                                                $("#editorAssetDepreciation-reffNumber").val(responseJSON.newReffNumber);
                                                break;
                                            default:
                                                $("#form-editorAssetDepreciation :input").not("#editorAssetDepreciation-reffNumber").attr("disabled", false);
                                                break;
                                        }
                                    }
                                }).always(function (jqXHR, textStatus) {
                                    $("#window-loader").modal("hide");
                                    NProgress.done();
                                    generateWarningMessageResponse(jqXHR);
                                    setUserToken(jqXHR);
                                });
                            }
                        });
                        break;
                    default:
                        $("#modal-editorAssetDepreciation").modal("hide");
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            $("#form-editorAssetDepreciation :input").not("#editorAssetDepreciation-reffNumber").attr("disabled", false);
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

listAssetOwnedFunc();