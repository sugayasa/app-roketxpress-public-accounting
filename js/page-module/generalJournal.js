var $confirmDialog = $('#modal-confirm-action');
if (generalJournalFunc == null) {
    var generalJournalFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionAccountGeneral', 'dataAccountGeneral');
            setOptionHelper('optionAccountMain', 'dataAccountMain');
            setOptionHelper('optionAccountSub', 'dataAccountSub');

            $('#optionAccountGeneral').off('change');
            $('#optionAccountGeneral').on('change', function (e) {
                var selectedValueAccountGeneral = this.value;
                setOptionHelper('optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
                    setOptionHelper('optionAccountSub', 'dataAccountSub', false, function () {
                        getDataGeneralJournal();
                        $("#optionAccountSub").select2();
                    }, false, selectedValueAccountGeneral);
                    $("#optionAccountMain").select2();
                }, selectedValueAccountGeneral);
            });

            $('#optionAccountMain').off('change');
            $('#optionAccountMain').on('change', function (e) {
                var selectedValueAccountMain = this.value;
                setOptionHelper('optionAccountSub', 'dataAccountSub', false, function () {
                    getDataGeneralJournal();
                    $("#optionAccountSub").select2();
                }, selectedValueAccountMain);
            });
            $("#optionAccountGeneral, #optionAccountMain, #optionAccountSub").select2();
            getDataGeneralJournal();

            if (dataAllAccountJournal.length > 0) {
                generateTableListAccountCheckbox(dataAllAccountJournal, 'fixUndetectedAccount-tableListAccountChoose');
            }
        })
    }
}

$('#optionAccountSub, #datePeriodStart, #datePeriodEnd').off('change');
$('#optionAccountSub, #datePeriodStart, #datePeriodEnd').on('change', function (e) {
    getDataGeneralJournal();
});

$('#searchReffNumber, #searchDescription').off('keypress');
$("#searchReffNumber, #searchDescription").on('keypress', function (e) {
    if (e.which == 13) {
        getDataGeneralJournal();
    }
});

function generateDataTable(page) {
    getDataGeneralJournal(page)
}

function getDataGeneralJournal(page = 1) {
    var $tableBody = $('#table-dataGeneralJournal > tbody'),
        columnNumber = $('#table-dataGeneralJournal > thead > tr > th').length,
        idAccountGeneral = $('#optionAccountGeneral').val(),
        idAccountMain = $('#optionAccountMain').val(),
        idAccountSub = $('#optionAccountSub').val(),
        datePeriodStart = $('#datePeriodStart').val(),
        datePeriodEnd = $('#datePeriodEnd').val(),
        searchReffNumber = $('#searchReffNumber').val(),
        searchDescription = $('#searchDescription').val(),
        dataSend = {
            page: page,
            idAccountGeneral: idAccountGeneral,
            idAccountMain: idAccountMain,
            idAccountSub: idAccountSub,
            datePeriodStart: datePeriodStart,
            datePeriodEnd: datePeriodEnd,
            searchReffNumber: searchReffNumber,
            searchDescription: searchDescription
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "generalJournal/getDataTable",
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
            $('#excelDataGeneralJournal').addClass('d-none');
            $tableBody.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                newReffNumber = responseJSON.newReffNumber,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var data = responseJSON.result.data;
                    if (data.length === 0) {
                        rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                        $('#excelDataGeneralJournal').off("click").attr("href", "");
                    } else {
                        if (responseJSON.urlExcelData != "") $('#excelDataGeneralJournal').removeClass('d-none').on("click").attr("href", responseJSON.urlExcelData);
                        $.each(data, function (index, array) {
                            var btnEdit = '<i class="text-info fa fa-pencil text16px" onclick="openGeneralJournalEditor(\'' + array.IDJOURNALRECAP + '\')"></i>',
                                btnDelete = '<i class="text-info fa fa-trash text16px" onclick="confirmDeleteGeneralJournal(\'' + array.IDJOURNALRECAP + '\', \'' + array.DATETRANSACTION + '\', \'' + array.DESCRIPTION + '\', \'' + array.TOTALNOMINAL + '\')"></i>',
                                objAccountDetails = JSON.parse(array.OBJACCOUNTDETAILS),
                                rowSpan = objAccountDetails.length,
                                tdFirstRow = trNextRow = '';

                            $.each(objAccountDetails, function (indexDetails, arrayDetails) {
                                var tdElem = '<td>' + arrayDetails.accountCode + '</td>' +
                                    '<td>' + arrayDetails.accountName + '<br/><small>' + arrayDetails.description + '</small></td>' +
                                    '<td class="text-right">' + numberFormat(arrayDetails.debit) + '</td>' +
                                    '<td class="text-right">' + numberFormat(arrayDetails.credit) + '</td>';
                                if (indexDetails == 0) tdFirstRow = tdElem;
                                if (indexDetails != 0) trNextRow += '<tr>' + tdElem + '</tr>';
                            });

                            rows += "<tr>" +
                                "<td rowspan='" + rowSpan + "'>" + array.REFFNUMBER + "</td>" +
                                "<td class='text-center' rowspan='" + rowSpan + "'>" + array.DATETRANSACTION + "</td>" +
                                "<td rowspan='" + rowSpan + "'>" + array.DESCRIPTION + "</td>" +
                                tdFirstRow +
                                "<td class='text-center' rowspan='" + rowSpan + "'>" + btnEdit + '<br/>' + btnDelete + "</td>" +
                                "</tr>" +
                                trNextRow;
                        });
                    }
                    generatePagination("tablePagination-dataGeneralJournal", page, responseJSON.result.pageTotal);
                    generateDataInfo("tableDataCount-dataGeneralJournal", responseJSON.result.dataStart, responseJSON.result.dataEnd, responseJSON.result.dataTotal);
                    break;
                case 404:
                default:
                    generatePagination("tablePagination-dataGeneralJournal", 1, 1);
                    generateDataInfo("tableDataCount-dataGeneralJournal", 0, 0, 0);
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $("#generalJournalEditor-newReffNumber").val(newReffNumber);
            $tableBody.html(rows);
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function openGeneralJournalEditor(idJournalRecap = false) {
    $("#generalJournalEditor-reffNumber").val($("#generalJournalEditor-newReffNumber").val());
    $("#generalJournalEditor-dateTransaction").val(dateToday);
    $("#generalJournalEditor-nominalTransaction, #generalJournalEditor-idJournalRecap, #addAccountJournal-nominalTransaction").val(0);
    $("#generalJournalEditor-descriptionTransaction, #generalJournalEditor-arrIdJournalDetails, #generalJournalEditor-defaultDescription").val('');
    $("#generalJournalEditor-tableAccountDetails > tbody").html('<tr id="generalJournalEditor-noDataTableAccountDetails"><td colspan="5" class="text-center">No data</td></tr>');
    $("#generalJournalEditor-descriptionVariableFormContainer, #alertTemplateJournal").addClass('d-none');
    $(".generalJournalEditor-descriptionVariableItemContainer").remove();
    resetEditorAccountTransaction();

    toggleSlideContainer('slideContainerLeft', 'slideContainerRight');
    $("#btnOpenGeneralJournalEditor, #btnImportExcelJournal").addClass("d-none");
    $("#btnCloseGeneralJournalEditor").removeClass("d-none");

    if (idJournalRecap !== false) {
        var dataSend = { idJournalRecap: idJournalRecap };
        $.ajax({
            type: 'POST',
            url: baseURL + "generalJournal/getDetailGeneralJournal",
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
                        var detailRecap = responseJSON.detailRecap,
                            listDetailJournal = responseJSON.listDetailJournal,
                            arrIdJournalDetails = [],
                            rowAccount = '';

                        $("#generalJournalEditor-reffNumber").val(detailRecap.REFFNUMBER);
                        $("#generalJournalEditor-dateTransaction").val(detailRecap.DATETRANSACTION);
                        $("#generalJournalEditor-nominalTransaction").val(numberFormat(detailRecap.TOTALNOMINAL));
                        $("#generalJournalEditor-descriptionTransaction").val(detailRecap.DESCRIPTION);
                        $("#generalJournalEditor-idJournalRecap").val(idJournalRecap);
                        console.log(listDetailJournal);

                        $.each(listDetailJournal, function (index, array) {
                            rowAccount += generateRowAccount(array.IDACCOUNT, array.IDJOURNALDETAILS, array.ACCOUNTCODE, array.ACCOUNTNAME, array.DESCRIPTION, array.DEBIT, array.CREDIT);
                            arrIdJournalDetails.push(array.IDJOURNALDETAILS);
                        });
                        $('#generalJournalEditor-arrIdJournalDetails').val(JSON.stringify(arrIdJournalDetails));
                        $("#generalJournalEditor-tableAccountDetails > tbody").html(rowAccount);
                        calculateDebitCreditJournal();
                        break;
                    default:
                        closeGeneralJournalEditor();
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
}

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

$('#btnCloseGeneralJournalEditor').off('click');
$('#btnCloseGeneralJournalEditor').on('click', function (e) {
    closeGeneralJournalEditor();
});

function closeGeneralJournalEditor() {
    toggleSlideContainer('slideContainerLeft', 'slideContainerRight');
    $("#btnOpenGeneralJournalEditor, #btnImportExcelJournal").removeClass("d-none");
    $("#btnCloseGeneralJournalEditor").addClass("d-none");
}

function openFormImportExcelJournal() {
    toggleSlideContainer('slideContainerLeft', 'slideContainerRightImportJournal');
    $("#btnImportExcelJournal, #btnOpenGeneralJournalEditor").addClass("d-none");
    $("#btnCloseFormImportExcelJournal").removeClass("d-none");

    $('.ajax-file-upload-container').remove();
    $("#uploaderImportExcelJournal").uploadFile({
        url: baseURL + "generalJournal/uploadImportExcelJournal",
        multiple: false,
        dragDrop: false,
        allowedTypes: "xls, xlsx",
        headers: { Authorization: 'Bearer ' + getUserToken() },
        onSubmit: function (files) {
            $('#window-loader').modal('show');
            $(".ajax-file-upload-container").addClass("text-center");
        },
        onSuccess: function (files, data, xhr, pd) {
            $('#window-loader').modal('hide');
            $(".ajax-file-upload-statusbar").remove();
            if (data.status != 200) {
                $('#modalWarning').on('show.bs.modal', function () {
                    $('#modalWarningBody').html(data.msg);
                });
                $('#modalWarning').modal('show');
            } else {
                scanImportExcelJournal(data.excelJournalFileName, data.extension);
            }
        }
    });

    $("#importExcelJournalScanningResult-btnSaveScanningResult").addClass('d-none');
    var $tableBody = $('#table-importExcelJournalScanningResult > tbody'),
        columnNumber = $('#table-importExcelJournalScanningResult > thead > tr > th').length;

    $tableBody.html("<tr><td colspan='" + columnNumber + "'><center>No data shown</center></td></tr>");
    $("#importExcelJournalScanningResult-totalNominalDebit").html(0);
    $("#importExcelJournalScanningResult-totalNominalCredit").html(0);
}

function scanImportExcelJournal(fileName, extension) {
    var $tableBody = $('#table-importExcelJournalScanningResult > tbody'),
        columnNumber = $('#table-importExcelJournalScanningResult > thead > tr > th').length,
        dataSend = {
            fileName: fileName,
            extension: extension
        };

    $.ajax({
        type: 'POST',
        url: baseURL + "generalJournal/scanImportExcelJournal",
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
            $('#window-loader').modal('show');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var arrAccountUndetected = responseJSON.arrAccountUndetected,
                        resScan = responseJSON.resScan,
                        totalNominalDebit = 0,
                        totalNominalCredit = 0,
                        rows = "";
                    $("#importExcelJournalScanningResult-btnSaveScanningResult").removeClass('d-none');
                    $.each(resScan, function (index, array) {
                        var reffNumberImport = array.reffNumberImport !== null && array.reffNumberImport !== undefined ? array.reffNumberImport : "",
                            reffNumber = array.reffNumber !== null && array.reffNumber !== undefined && reffNumberImport != "" ? array.reffNumber : "",
                            dateTransactionDB = array.dateTransactionDB !== null && array.dateTransactionDB !== undefined ? array.dateTransactionDB : "",
                            dateTransactionStr = array.dateTransactionStr !== null && array.dateTransactionStr !== undefined ? array.dateTransactionStr : "",
                            descriptionRecap = array.descriptionRecap !== null && array.descriptionRecap !== undefined ? array.descriptionRecap : "";
                        rows += "<tr class='importExcelJournalScanningResult-trData'>" +
                            "<td class='importExcelJournalScanningResult-tdReffNumber' data-reffNumberImport='" + reffNumberImport + "' data-reffNumber='" + reffNumber + "'>" +
                            reffNumberImport + "<br/><span class='font-italic'>" + reffNumber + "</span>" +
                            "</td>" +
                            "<td class='importExcelJournalScanningResult-tdDateTransaction' data-dateTransactionDB='" + dateTransactionDB + "'>" + dateTransactionStr + "</td>" +
                            "<td class='importExcelJournalScanningResult-tdDescription'>" + descriptionRecap + "</td>" +
                            "<td data-idAccountDB='" + array.idAccountDB + "'>" +
                            "<span class='importExcelJournalScanningResult-accountCodeDB'>" + array.accountCodeDB + "</span><br/>" +
                            "<span class='importExcelJournalScanningResult-accountCodeOrigin font-italic'>" + array.accountCodeOrigin + "</span>" +
                            "</td>" +
                            "<td>" +
                            "<span class='importExcelJournalScanningResult-accountNameDB'>" + array.accountNameDB + "</span><br/>" +
                            "<span class='importExcelJournalScanningResult-accountNameOrigin font-italic'>" + array.accountNameOrigin + "</span>" +
                            "</td>" +
                            "<td class='importExcelJournalScanningResult-tdDescriptionAccount'>" + array.descriptionDetail + "</td>" +
                            "<td align='right' class='importExcelJournalScanningResult-nominalDebit'>" + numberFormat(array.nominalDebit) + "</td>" +
                            "<td align='right' class='importExcelJournalScanningResult-nominalCredit'>" + numberFormat(array.nominalCredit) + "</td>" +
                            "<td class='importExcelJournalScanningResult-balanceStatus'></td>" +
                            "</tr>";

                        totalNominalDebit += array.nominalDebit * 1;
                        totalNominalCredit += array.nominalCredit * 1;
                    });

                    var rowsAccountUndetected = '';
                    $.each(arrAccountUndetected, function (index, arrayAccount) {
                        rowsAccountUndetected += '<tr class="fixUndetectedAccount-trAccount" data-accountCodeOrigin="' + arrayAccount[0] + '" data-accountNameOrigin="' + arrayAccount[1] + '">' +
                            '<td>' + arrayAccount[0] + ' - ' + arrayAccount[1] + '</td>' +
                            '<td class="fixUndetectedAccount-tdAccountSystem"></td>' +
                            '<td></td>' +
                            '</tr>';
                    });

                    if (rowsAccountUndetected != '') {
                        $("#fixUndetectedAccount-listAccountUndetected > tbody").html(rowsAccountUndetected);
                        $("#modal-fixUndetectedAccount").modal("show");
                        enableFixUndetectedAccountEditor();
                        $(".fixUndetectedAccount-trAccount").first().click();
                    }
                    break;
                case 404:
                default:
                    generateWarningMessageResponse(jqXHR);
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBody.html(rows);
            beautifyScanningResultTable();
            $("#importExcelJournalScanningResult-totalNominalDebit").html(numberFormat(totalNominalDebit));
            $("#importExcelJournalScanningResult-totalNominalCredit").html(numberFormat(totalNominalCredit));
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
        $('#window-loader').modal('hide');
    });
}

function beautifyScanningResultTable() {
    var currentReffNumberImport = '',
        totalRowspan = 0,
        idxStartRowSpan = 0,
        numberJournalRecap = 1,
        totalNominalDebit = 0,
        totalNominalCredit = 0,
        totalRowJournalScanningResult = $('tr.importExcelJournalScanningResult-trData').length - 1;
    $('tr.importExcelJournalScanningResult-trData').each(function (idxTrData) {
        var reffNumberImport = $(this).find('td.importExcelJournalScanningResult-tdReffNumber').attr('data-reffNumberImport'),
            nominalDebit = $(this).find('td.importExcelJournalScanningResult-nominalDebit').html().replace(/\D/g, '') * 1,
            nominalCredit = $(this).find('td.importExcelJournalScanningResult-nominalCredit').html().replace(/\D/g, '') * 1;

        if ((idxTrData != 0 && reffNumberImport != '' && reffNumberImport != currentReffNumberImport) || totalRowJournalScanningResult == idxTrData) {
            if (totalRowJournalScanningResult == idxTrData) {
                totalRowspan++;
                totalNominalDebit += nominalDebit;
                totalNominalCredit += nominalCredit;
            }

            var $trScanningResultUpdate = $('tr.importExcelJournalScanningResult-trData').eq(idxStartRowSpan),
                isBalance = totalNominalDebit != totalNominalCredit ? "No" : "Yes",
                totalNominalJournalRecap = totalNominalDebit != totalNominalCredit ? 0 : totalNominalDebit,
                btnDeleteJournalRecap = '<br/><button class="button button-warning button-xs btn-block mt-10 btnDeleteJournalRecap" data-numberJournalRecap="' + numberJournalRecap + '"><span>Delete</span></button>';
            $trScanningResultUpdate.find('td.importExcelJournalScanningResult-tdReffNumber').attr('rowspan', totalRowspan);
            $trScanningResultUpdate.find('td.importExcelJournalScanningResult-tdDateTransaction').attr('rowspan', totalRowspan);
            $trScanningResultUpdate.find('td.importExcelJournalScanningResult-tdDescription').attr('rowspan', totalRowspan);
            $trScanningResultUpdate.find('td.importExcelJournalScanningResult-balanceStatus').attr('rowspan', totalRowspan).html(isBalance + btnDeleteJournalRecap);
            $trScanningResultUpdate.attr('data-numberJournalRecap', numberJournalRecap).attr('data-totalNominalJournalRecap', totalNominalJournalRecap);

            for (var idxRemove = idxStartRowSpan + 1; idxRemove < idxStartRowSpan + totalRowspan; idxRemove++) {
                var $trScanningResultRemoveTd = $('tr.importExcelJournalScanningResult-trData').eq(idxRemove);
                $trScanningResultRemoveTd.find('td.importExcelJournalScanningResult-tdReffNumber').remove();
                $trScanningResultRemoveTd.find('td.importExcelJournalScanningResult-tdDateTransaction').remove();
                $trScanningResultRemoveTd.find('td.importExcelJournalScanningResult-tdDescription').remove();
                $trScanningResultRemoveTd.find('td.importExcelJournalScanningResult-balanceStatus').remove();
                $trScanningResultRemoveTd.attr('data-numberJournalRecap', numberJournalRecap);
            }
            numberJournalRecap++;
        }

        if (reffNumberImport != '' && reffNumberImport != currentReffNumberImport) {
            currentReffNumberImport = reffNumberImport;
            idxStartRowSpan = idxTrData;
            totalRowspan = 0;
            totalNominalDebit = 0;
            totalNominalCredit = 0;
        }

        totalNominalDebit += nominalDebit;
        totalNominalCredit += nominalCredit;
        totalRowspan++;
    });

    $('.btnDeleteJournalRecap').off('click');
    $('.btnDeleteJournalRecap').on('click', function (e) {
        var numberJournalRecap = $(this).attr('data-numberJournalRecap');
        $('tr.importExcelJournalScanningResult-trData[data-numberJournalRecap="' + numberJournalRecap + '"]').remove();
        calculateTotalNominalDebitCredit();
    });
}

function calculateTotalNominalDebitCredit() {
    var totalNominalDebit = 0,
        totalNominalCredit = 0;
    $('tr.importExcelJournalScanningResult-trData').each(function (idxTrData) {
        totalNominalDebit += $(this).find('td.importExcelJournalScanningResult-nominalDebit').html().replace(/\D/g, '') * 1;
        totalNominalCredit += $(this).find('td.importExcelJournalScanningResult-nominalCredit').html().replace(/\D/g, '') * 1;
    });
    $("#importExcelJournalScanningResult-totalNominalDebit").html(numberFormat(totalNominalDebit));
    $("#importExcelJournalScanningResult-totalNominalCredit").html(numberFormat(totalNominalCredit));
}

function enableFixUndetectedAccountEditor() {
    $(".fixUndetectedAccount-trAccount").off('click');
    $(".fixUndetectedAccount-trAccount").on("click", function (e) {
        var $trfixUndetectedAccount = $(this),
            idAccountSystem = $(this).attr('data-idAccountSystem');

        $('.isSelectedIcon').remove();
        $(this).find('td:last').html('<span class="isSelectedIcon"><i class="fa fa-angle-double-right fa-2x"></i></span>');
        $('.checkboxAccount').prop('checked', false);

        if (idAccountSystem !== null && idAccountSystem !== undefined) {
            $('.checkboxAccount[data-idaccount="' + idAccountSystem + '"]').prop('checked', true);
        }

        $(".checkboxAccount").off('click');
        $(".checkboxAccount").on("click", function (e) {
            var idAccount = $(this).attr('data-idaccount'),
                accountCodeName = $(this).attr('data-accountname'),
                splitAccountCodeName = accountCodeName.split(' ', 2),
                accountCode = splitAccountCodeName[0],
                accountName = accountCodeName.substring(accountCodeName.indexOf(' ') + 1);

            $trfixUndetectedAccount.attr('data-idAccountSystem', idAccount);
            $trfixUndetectedAccount.attr('data-accountCodeSystem', accountCode);
            $trfixUndetectedAccount.attr('data-accountNameSystem', accountName);
            $trfixUndetectedAccount.find('.fixUndetectedAccount-tdAccountSystem').html(accountCodeName);
            $('input.checkboxAccount').prop('checked', false);
            $(this).prop('checked', true);
        });
    });
}

$("#form-fixUndetectedAccount").off('submit');
$("#form-fixUndetectedAccount").on("submit", function (e) {
    e.preventDefault();
    totalUnfixedAccount = 0;

    $('tr.fixUndetectedAccount-trAccount').each(function (idxTrData) {
        var idAccountSystem = $(this).attr('data-idAccountSystem');
        if (idAccountSystem == null || idAccountSystem == undefined) totalUnfixedAccount++;
    });

    if (totalUnfixedAccount > 0) {
        showWarning('Please complete all the journal account matches that exist');
    } else {
        $('tr.fixUndetectedAccount-trAccount').each(function (idxTrData) {
            var accountCodeOrigin = $(this).attr('data-accountCodeOrigin'),
                accountNameOrigin = $(this).attr('data-accountNameOrigin'),
                idAccountSystem = $(this).attr('data-idaccountsystem'),
                accountCodeSystem = $(this).attr('data-accountCodeSystem'),
                accountNameSystem = $(this).attr('data-accountNameSystem');

            $('span.importExcelJournalScanningResult-accountCodeOrigin').each(function () {
                var spanAccountCodeOrigin = $(this).html(),
                    tempElementAccountCodeOrigin = $('<div></div>').html(spanAccountCodeOrigin),
                    spanAccountCodeOrigin = tempElementAccountCodeOrigin.text();
                if (spanAccountCodeOrigin == accountCodeOrigin) {
                    $(this).closest('td').attr('data-idaccountdb', idAccountSystem).find('span.importExcelJournalScanningResult-accountCodeDB').html(accountCodeSystem);
                }
            });
            $('span.importExcelJournalScanningResult-accountNameOrigin').each(function () {
                var spanAccountNameOrigin = $(this).html(),
                    tempElementAccountNameOrigin = $('<div></div>').html(spanAccountNameOrigin),
                    spanAccountNameOrigin = tempElementAccountNameOrigin.text();
                if (spanAccountNameOrigin == accountNameOrigin) {
                    $(this).closest('td').find('span.importExcelJournalScanningResult-accountNameDB').html(accountNameSystem);
                }
            });
        });
        $("#modal-fixUndetectedAccount").modal("hide");
    }
});

$('#importExcelJournalScanningResult-btnSaveScanningResult').off('click');
$('#importExcelJournalScanningResult-btnSaveScanningResult').on('click', function (e) {
    e.preventDefault();
    var arrDataJournalRecap = [],
        arrJournalRecap = [],
        currentNumberJournalRecap = 0,
        lengthTrData = $('tr.importExcelJournalScanningResult-trData').length - 1;
    $('tr.importExcelJournalScanningResult-trData').each(function (indexTrData) {
        var numberJournalRecap = $(this).attr('data-numberJournalRecap'),
            totalNominalJournalRecap = $(this).attr('data-totalNominalJournalRecap');
        if (currentNumberJournalRecap != numberJournalRecap) {
            if (arrJournalRecap.length !== 0) {
                arrDataJournalRecap.push(arrJournalRecap);
            }

            var reffNumberImport = $(this).find('td.importExcelJournalScanningResult-tdReffNumber').attr('data-reffNumberImport'),
                reffNumber = $(this).find('td.importExcelJournalScanningResult-tdReffNumber').attr('data-reffNumber'),
                dateTransaction = $(this).find('td.importExcelJournalScanningResult-tdDateTransaction').attr('data-dateTransactionDB'),
                descriptionRecap = $(this).find('td.importExcelJournalScanningResult-tdDescription').html();

            arrJournalRecap = {
                'reffNumberImport': reffNumberImport,
                'reffNumber': reffNumber,
                'dateTransaction': dateTransaction,
                'descriptionRecap': descriptionRecap,
                'totalNominalJournalRecap': totalNominalJournalRecap,
                'arrAccountDetail': []
            };
            currentNumberJournalRecap = numberJournalRecap;
        }

        if (arrJournalRecap.arrAccountDetail !== null && arrJournalRecap.arrAccountDetail !== undefined) {
            var idAccount = $(this).find('span.importExcelJournalScanningResult-accountCodeDB').closest('td').attr('data-idaccountdb'),
                descriptionAccount = $(this).find('td.importExcelJournalScanningResult-tdDescriptionAccount').html(),
                nominalDebit = $(this).find('td.importExcelJournalScanningResult-nominalDebit').html().replace(/\D/g, '') * 1,
                nominalCredit = $(this).find('td.importExcelJournalScanningResult-nominalCredit').html().replace(/\D/g, '') * 1;
            arrJournalRecap.arrAccountDetail.push([idAccount, descriptionAccount, nominalDebit, nominalCredit]);
        }

        if (indexTrData == lengthTrData) {
            arrDataJournalRecap.push(arrJournalRecap);
        }
    });

    if (arrDataJournalRecap.length !== 0) {
        var dataSend = {
            arrDataJournalRecap: arrDataJournalRecap
        };

        $.ajax({
            type: 'POST',
            url: baseURL + "generalJournal/saveImportExcelJournal",
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
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        closeFormImportExcelJournal();
                        getDataGeneralJournal();
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
    } else {
        showWarning('Failed to submit journal data, please retry the import process later.');
    }
});

$('#btnCloseFormImportExcelJournal').off('click');
$('#btnCloseFormImportExcelJournal').on('click', function (e) {
    closeFormImportExcelJournal();
});

function closeFormImportExcelJournal() {
    toggleSlideContainer('slideContainerLeft', 'slideContainerRightImportJournal');
    $("#btnImportExcelJournal, #btnOpenGeneralJournalEditor").removeClass("d-none");
    $("#btnCloseFormImportExcelJournal").addClass("d-none");
}

$('#modal-chooseTemplateJournal').off('shown.bs.modal');
$('#modal-chooseTemplateJournal').on('shown.bs.modal', function (e) {
    $.ajax({
        type: 'POST',
        url: baseURL + "generalJournal/getDataTemplateJournal",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(),
        xhrFields: {
            withCredentials: true
        },
        headers: {
            Authorization: 'Bearer ' + getUserToken()
        },
        beforeSend: function () {
            NProgress.set(0.4);
            $("#window-loader").modal("show");
            $("#chooseTemplateJournal-searchKeyword").val('');
            $("#chooseTemplateJournal-tableTemplate > tbody").html("<tr><td><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var listTemplateJournal = responseJSON.listTemplateJournal,
                        rowTemplate = '';

                    $.each(listTemplateJournal, function (indexTemplate, arrayTemplate) {
                        var accountList = JSON.parse(arrayTemplate.OBJACCOUNTDETAILS),
                            accountBadges = '';
                        $.each(accountList, function (indexAccount, arrayAccount) {
                            accountBadges += '<span class="badge badge-info mr-2">[' + arrayAccount.DEFAULTDRCR + '] ' + arrayAccount.ACCOUNTCODE + ' - ' + arrayAccount.ACCOUNTNAME + '</span>';
                        });

                        rowTemplate += '<tr data-templateName="' + arrayTemplate.TEMPLATENAME + '"  data-defaultDescription="' + arrayTemplate.DESCRIPTION + '" data-accountDetails=\'' + arrayTemplate.OBJACCOUNTDETAILS + '\'>' +
                            '<td class="tdTemplateJournal"><span class="searchTemplate">' + arrayTemplate.TEMPLATENAME + '</span><br/><small class="searchTemplate">Default Description : ' + arrayTemplate.DESCRIPTION + '</small><br/>' + accountBadges + '</td>' +
                            '</tr>';
                    });
                    $("#chooseTemplateJournal-tableTemplate > tbody").html(rowTemplate);
                    $("#chooseTemplateJournal-searchKeyword").off("keyup");
                    $("#chooseTemplateJournal-searchKeyword").on("keyup", function () {
                        var value = $(this).val().toLowerCase();
                        $("#chooseTemplateJournal-tableTemplate tr").filter(function () {
                            $(this).toggle($(this).attr('data-templateName').toLowerCase().indexOf(value) > -1 || $(this).attr('data-defaultDescription').toLowerCase().indexOf(value) > -1)
                        });

                        if (value != '') {
                            $(":contains(" + value + ")").each(function () {
                                if ($(this).hasClass('searchTemplate')) {
                                    var regex = new RegExp(value, 'i');
                                    $(this).html($(this).text().replace(regex, '<mark>$&</mark>'));
                                }
                            });
                        } else {
                            $(".searchTemplate").each(function () {
                                $(this).html($(this).text().replaceAll('<mark>', ''));
                                $(this).html($(this).text().replaceAll('</mark>', ''));
                            });
                        }
                    });

                    $(".tdTemplateJournal").off("click");
                    $(".tdTemplateJournal").on("click", function () {
                        var defaultDescription = $(this).parent().attr('data-defaultDescription'),
                            accountDetails = JSON.parse($(this).parent().attr('data-accountDetails')),
                            arrDescriptionVariable = defaultDescription.match(/!(.*?)!/g).map(match => match.slice(1, -1)),
                            elemDescriptionVariable = '';
                        $("#generalJournalEditor-descriptionTransaction, #generalJournalEditor-defaultDescription").val(defaultDescription);
                        $(".generalJournalEditor-descriptionVariableItemContainer").remove();
                        $("#generalJournalEditor-tableAccountDetails > tbody").html('');

                        if (arrDescriptionVariable.length > 0) {
                            arrDescriptionVariable.forEach(descriptionVariable => {
                                descriptionVariableOrigin = descriptionVariable,
                                    descriptionVariable = descriptionVariable.trim().toLowerCase(),
                                    descriptionVariableName = toCamelCase(descriptionVariable),
                                    descriptionVariableStr = capitalizeFirstLetter(descriptionVariable);
                                switch (descriptionVariable) {
                                    case "bulan": elemDescriptionVariable += '<div class="col-lg-2 col-sm-6 generalJournalEditor-descriptionVariableItemContainer">' +
                                        '<div class="form-group required">' +
                                        '<label for="generalJournalEditor-' + descriptionVariableName + '" class="control-label">' + descriptionVariableStr + '</label>' +
                                        '<select class="form-control mb-10 generalJournalEditor-descriptionVariableItem generalJournalEditor-optionVariable generalJournalEditor-optionMonth" id="generalJournalEditor-descriptionVariable-' + descriptionVariableName + '" data-originVariableName="' + descriptionVariableOrigin + '"></select>' +
                                        '</div>' +
                                        '</div>';
                                        break;
                                    case "tahun": elemDescriptionVariable += '<div class="col-lg-2 col-sm-6 generalJournalEditor-descriptionVariableItemContainer">' +
                                        '<div class="form-group required">' +
                                        '<label for="generalJournalEditor-' + descriptionVariableName + '" class="control-label">' + descriptionVariableStr + '</label>' +
                                        '<select class="form-control mb-10 generalJournalEditor-descriptionVariableItem generalJournalEditor-optionVariable generalJournalEditor-optionYear" id="generalJournalEditor-descriptionVariable-' + descriptionVariableName + '" data-originVariableName="' + descriptionVariableOrigin + '"></select>' +
                                        '</div>' +
                                        '</div>';
                                        break;
                                    default: elemDescriptionVariable += '<div class="col-lg-6 col-sm-12 generalJournalEditor-descriptionVariableItemContainer">' +
                                        '<div class="form-group required">' +
                                        '<label for="generalJournalEditor-' + descriptionVariableName + '" class="control-label">' + descriptionVariableStr + '</label>' +
                                        '<input type="text" class="form-control mb-10 generalJournalEditor-descriptionVariableItem generalJournalEditor-textVariable" id="generalJournalEditor-descriptionVariable-' + descriptionVariableName + '" data-originVariableName="' + descriptionVariableOrigin + '">' +
                                        '</div>' +
                                        '</div>';
                                        break;
                                }
                            });

                            if (elemDescriptionVariable != '') {
                                $("#generalJournalEditor-descriptionVariableForm").append(elemDescriptionVariable);
                                $("#generalJournalEditor-descriptionVariableFormContainer").removeClass('d-none');

                                $('.generalJournalEditor-optionMonth').each(function () {
                                    let elemIdOptionMonth = $(this).attr('id'),
                                        dateSelected = $('#generalJournalEditor-dateTransaction').val(),
                                        monthSelected = dateSelected.substring(3, 5);
                                    setOptionHelper(elemIdOptionMonth, 'optionMonth', monthSelected);
                                });

                                $('.generalJournalEditor-optionYear').each(function () {
                                    let elemIdOptionYear = $(this).attr('id'),
                                        dateSelected = $('#generalJournalEditor-dateTransaction').val(),
                                        yearSelected = dateSelected.substring(6, 10);
                                    setOptionHelper(elemIdOptionYear, 'optionYear', yearSelected);
                                });

                                generateJournalDescriptionByTemplateVariable();
                                $('.generalJournalEditor-optionVariable').off('change');
                                $('.generalJournalEditor-optionVariable').on('change', function (e) {
                                    generateJournalDescriptionByTemplateVariable();
                                });

                                $(".generalJournalEditor-textVariable").off("keyup");
                                $(".generalJournalEditor-textVariable").on("keyup", function () {
                                    generateJournalDescriptionByTemplateVariable();
                                });
                            }
                        }

                        $.each(accountDetails, function (indexAccount, arrayAccount) {
                            var defaultDRCR = arrayAccount.DEFAULTDRCR,
                                idAccount = arrayAccount.IDACCOUNT,
                                rowAccount = generateRowAccount(idAccount, '', arrayAccount.ACCOUNTCODE, arrayAccount.ACCOUNTNAME, '', 0, 0);
                            $("#generalJournalEditor-tableAccountDetails > tbody").append(rowAccount);

                            $('.trAccountJournal').each(function (idxTr) {
                                if (indexAccount == idxTr) {
                                    $(this).find('td').each(function (idxTd) {
                                        switch (idxTd) {
                                            case 1:
                                                var inputDescription = '<div class="input-group" id="trAccountJournal-inputGroupDescription' + idAccount + '">' +
                                                    '<input type="text" class="form-control form-control-sm trAccountJournal-input mt-1" id="trAccountJournal-description' + idAccount + '"' +
                                                    'placeholder="Type description" aria-describedby="saveDescription' + idAccount + '">' +
                                                    '<div class="input-group-append mt-1">' +
                                                    '<span class="input-group-text" id="saveDescription' + idAccount + '"><i class="fa fa-save"></i></span>' +
                                                    '</div>' +
                                                    '</div>';
                                                $(this).find('small').replaceWith(inputDescription);
                                                $('#saveDescription' + idAccount).off("click");
                                                $('#saveDescription' + idAccount).on("click", function () {
                                                    setDescriptionAccount(idAccount);
                                                });
                                                $('#trAccountJournal-description' + idAccount).off('keypress');
                                                $('#trAccountJournal-description' + idAccount).on('keypress', function (e) {
                                                    if (e.which == 13) {
                                                        setDescriptionAccount(idAccount);
                                                    }
                                                });
                                                break;
                                            case 2:
                                                var inputNominalDebit = '<div class="input-group" id="trAccountJournal-inputGroupNominalDebit' + idAccount + '">' +
                                                    '<input type="text" class="form-control form-control-sm trAccountJournal-input mt-25 text-right" ' +
                                                    'placeholder="Type description" aria-describedby="saveNominalDebit' + idAccount +
                                                    '" value="0" id="trAccountJournal-nominalDebit' + idAccount + '">' +
                                                    '<div class="input-group-append">' +
                                                    '<span class="input-group-text mt-25" id="saveNominalDebit' + idAccount + '"><i class="fa fa-save"></i></span>' +
                                                    '</div>' +
                                                    '</div>';
                                                if (defaultDRCR == 'DR') {
                                                    $(this).html(inputNominalDebit);
                                                    $('#saveNominalDebit' + idAccount).off("click");
                                                    $('#saveNominalDebit' + idAccount).on("click", function () {
                                                        setNominalAccount(idAccount, 'Debit');
                                                    });
                                                    $('#trAccountJournal-nominalDebit' + idAccount).off('keypress');
                                                    $('#trAccountJournal-nominalDebit' + idAccount).on('keypress', function (e) {
                                                        maskNumberInput(0, 999999999, 'trAccountJournal-nominalDebit' + idAccount);
                                                        if (e.which == 13) {
                                                            setNominalAccount(idAccount, 'Debit');
                                                        }
                                                    });
                                                }
                                                break;
                                            case 3:
                                                var inputNominalCredit = '<div class="input-group" id="trAccountJournal-inputGroupNominalCredit' + idAccount + '">' +
                                                    '<input type="text" class="form-control form-control-sm trAccountJournal-input mt-25 text-right" ' +
                                                    'placeholder="Type description" aria-describedby="saveNominalCredit' + idAccount +
                                                    '" value="0" id="trAccountJournal-nominalCredit' + idAccount + '">' +
                                                    '<div class="input-group-append">' +
                                                    '<span class="input-group-text mt-25" id="saveNominalCredit' + idAccount + '"><i class="fa fa-save"></i></span>' +
                                                    '</div>' +
                                                    '</div>';
                                                if (defaultDRCR == 'CR') {
                                                    $(this).html(inputNominalCredit);
                                                    $('#saveNominalCredit' + idAccount).off("click");
                                                    $('#saveNominalCredit' + idAccount).on("click", function () {
                                                        setNominalAccount(idAccount, 'Credit');
                                                    });
                                                    $('#trAccountJournal-nominalCredit' + idAccount).off('keypress');
                                                    $('#trAccountJournal-nominalCredit' + idAccount).on('keypress', function (e) {
                                                        maskNumberInput(0, 999999999, 'trAccountJournal-nominalCredit' + idAccount);
                                                        if (e.which == 13) {
                                                            setNominalAccount(idAccount, 'Credit');
                                                        }
                                                    });
                                                }
                                                break;
                                        }
                                    });
                                }
                            });
                        });

                        calculateDebitCreditJournal();
                        $("#generalJournalEditor-btnSubmit").prop("disabled", true);
                        $("#modal-chooseTemplateJournal").modal("hide");
                        $("#alertTemplateJournal").removeClass('d-none');
                    });
                    break;
                default:
                    $("#modal-chooseTemplateJournal").modal("hide");
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done();
        setUserToken(jqXHR);
    });
});

function generateJournalDescriptionByTemplateVariable() {
    let defaultDescription = $("#generalJournalEditor-defaultDescription").val();
    $('.generalJournalEditor-descriptionVariableItem').each(function () {
        let originVariableName = $(this).attr('data-originVariableName'),
            valueDescriptionVariable = '';

        if ($(this).hasClass('generalJournalEditor-optionVariable')) {
            valueDescriptionVariable = $(this).find('option:selected').text();
        } else {
            valueDescriptionVariable = $(this).val();
        }

        defaultDescription = defaultDescription.replace('!' + originVariableName + '!', valueDescriptionVariable);
    });
    console.log(defaultDescription);
    $("#generalJournalEditor-descriptionTransaction").val(defaultDescription);
}

function setDescriptionAccount(idAccount) {
    var descriptionValue = $('#trAccountJournal-description' + idAccount).val();
    $('#trAccountJournal-inputGroupDescription' + idAccount).replaceWith('<small>' + descriptionValue + '</small>');
    propDisableSaveTransaction();
}

function setNominalAccount(idAccount, nominalType) {
    var nominalValue = $('#trAccountJournal-nominal' + nominalType + idAccount).val();
    if (nominalValue == '0') {
        showWarning('Please insert valid nominal');
    } else {
        $('#trAccountJournal-inputGroupNominal' + nominalType + idAccount).replaceWith(nominalValue);
        calculateDebitCreditJournal();
        propDisableSaveTransaction();
    }
}

function propDisableSaveTransaction() {
    var totalInput = 0;
    $('.trAccountJournal').each(function () {
        $(this).find('td').each(function (i) {
            if ($(this).find('input').length > 0) totalInput++;
        });
    });

    if (totalInput <= 0) $("#generalJournalEditor-btnSubmit").prop("disabled", false);
}

function generateRowAccount(idAccount, idJournalDetail, accountCode, accountName, description, nominalDR, nominalCR) {
    var removeBtn = '<i class="fa fa-trash text-danger" onclick="deleteAccountJournal(\'' + idAccount + '\')"></i>';
    return '<tr class="trAccountJournal" data-idAccount="' + idAccount + '" data-idJournalDetail="' + idJournalDetail + '">' +
        '<td>' + accountCode + '</td>' +
        '<td>' + accountName + '<br/><small>' + description + '</small></td>' +
        '<td align="right">' + numberFormat(nominalDR) + '</td>' +
        '<td align="right">' + numberFormat(nominalCR) + '</td>' +
        '<td class="text-center">' + removeBtn + '</td>' +
        '</tr>';
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

        if (elemExist.length <= 0) $("#generalJournalEditor-tableAccountDetails > tbody").append(rowAccount);
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
    if ($(".trAccountJournal").length <= 0) $("#generalJournalEditor-tableAccountDetails > tbody").html('<tr id="generalJournalEditor-noDataTableAccountDetails"><td colspan="5" class="text-center">No data</td></tr>');
}

function calculateDebitCreditJournal(returnBalance = false) {
    var totalDebit = totalCredit = nominalTransaction = 0,
        isBalance = false,
        iconBalanceDebitCredit = '';
    $('.trAccountJournal').each(function () {
        $(this).find('td').each(function (i) {
            totalDebit += i == 2 && $(this).find('div').length <= 0 ? $(this).html().replace(/[^0-9\.]+/g, '') * 1 : 0;
            totalCredit += i == 3 && $(this).find('div').length <= 0 ? $(this).html().replace(/[^0-9\.]+/g, '') * 1 : 0;
        });
    });
    nominalTransaction = totalDebit > totalCredit ? totalDebit : totalCredit;
    isBalance = totalDebit == totalCredit;
    iconBalanceDebitCredit = totalDebit != totalCredit ? '<i class="fa fa-hourglass-2 text-primary"></i>' : '<i class="fa fa-check text-success"></i>';
    $("#generalJournalEditor-nominalTransaction").val(numberFormat(nominalTransaction));
    $("#generalJournalEditor-totalNominalDebit").html(numberFormat(totalDebit));
    $("#generalJournalEditor-totalNominalCredit").html(numberFormat(totalCredit));
    $("#generalJournalEditor-statusBalanceDebitCredit").html(numberFormat(iconBalanceDebitCredit));

    if ($('.trAccountJournal').length > 0) {
        if ($('#generalJournalEditor-noDataTableAccountDetails').length > 0) $('#generalJournalEditor-noDataTableAccountDetails').remove();
    } else {
        $("#generalJournalEditor-tableAccountDetails > tbody").append('<tr><td colspan="5" class="text-center" id="generalJournalEditor-noDataTableAccountDetails">No data</td></tr>');
    }

    if (returnBalance) return isBalance;
}

$("#form-generalJournalEditor").off('submit');
$("#form-generalJournalEditor").on("submit", function (e) {
    e.preventDefault();
    var idJournalRecap = $('#generalJournalEditor-idJournalRecap').val(),
        arrIdJournalDetails = $('#generalJournalEditor-arrIdJournalDetails').val(),
        arrIdJournalDetails = arrIdJournalDetails != '' ? JSON.parse(arrIdJournalDetails) : [],
        date = $('#generalJournalEditor-dateTransaction').val(),
        nominal = $('#generalJournalEditor-nominalTransaction').val().replace(/[^0-9\.]+/g, '') * 1,
        description = $('#generalJournalEditor-descriptionTransaction').val(),
        defaultDescription = $('#generalJournalEditor-defaultDescription').val(),
        isBalance = calculateDebitCreditJournal(true),
        arrAccountDetail = [],
        urlFunction = idJournalRecap != '' && idJournalRecap != 0 ? 'updateData' : 'insertData';

    if (description == defaultDescription) {
        showWarning("Please change the journal description before adding data");
        return;
    }

    $('.trAccountJournal').each(function () {
        var idAccount = $(this).attr('data-idAccount'),
            idJournalDetail = $(this).attr('data-idJournalDetail'),
            arrDataAccount = [idAccount];
        $(this).find('td').each(function (i) {
            var descriptionAccount = $(this).find('small');
            if (descriptionAccount.length > 0) arrDataAccount.push(descriptionAccount.html());
            if (i == 2) arrDataAccount.push($(this).html().replace(/[^0-9\.]+/g, '') * 1);
            if (i == 3) arrDataAccount.push($(this).html().replace(/[^0-9\.]+/g, '') * 1);
        });
        arrDataAccount.push(idJournalDetail);
        arrAccountDetail.push(arrDataAccount);
    });

    if (!Array.isArray(arrAccountDetail) || arrAccountDetail.length <= 0) {
        showWarning('Please enter the transaction account details first');
    } else if (!isBalance) {
        showWarning('The amount of account debits and credits is not balanced. Please check the account details again');
    } else {
        var dataSend = {
            idJournalRecap: idJournalRecap,
            arrIdJournalDetails: arrIdJournalDetails,
            date: date,
            nominal: nominal,
            description: description,
            arrAccountDetail: arrAccountDetail
        };

        $.ajax({
            type: 'POST',
            url: baseURL + "generalJournal/" + urlFunction,
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
                $("#form-generalJournalEditor :input").attr("disabled", true);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        closeGeneralJournalEditor();
                        getDataGeneralJournal();
                        break;
                    default: break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            $("#form-generalJournalEditor :input").attr("disabled", false);
            NProgress.done();
            generateWarningMessageResponse(jqXHR);
            setUserToken(jqXHR);
        });
    }
});

function confirmDeleteGeneralJournal(idJournalRecap, date, description, nominal) {
    var confirmText = 'This journal will be deleted from the system. Details ;<br/><br/>' +
        '<div class="order-details-customer-info">' +
        '<ul>' +
        '<li> <span>Date</span> <span><b>' + date + '</b></span> </li>' +
        '<li> <span>Nominal</span> <span><b>' + numberFormat(nominal) + '</b></span> </li>' +
        '<li> <span>Description</span> <span><b>' + description + '</b></span> </li>' +
        '</ul>' +
        '</div>' +
        '<br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-idJournalRecap', idJournalRecap).attr('data-function', "deleteGeneralJournal");
    $confirmDialog.modal('show');
}

$('#confirmBtn').off('click');
$('#confirmBtn').on('click', function (e) {

    var idJournalRecap = $confirmDialog.find('#confirmBtn').attr('data-idJournalRecap'),
        funcName = $confirmDialog.find('#confirmBtn').attr('data-function'),
        dataSend = { idJournalRecap: idJournalRecap };

    $.ajax({
        type: 'POST',
        url: baseURL + "generalJournal/" + funcName,
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
                    getDataGeneralJournal();
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

generalJournalFunc();