var $confirmDialog = $('#modal-confirm-action');
if (cashFlowFunc == null) {
    var cashFlowFunc = function () {
        $(document).ready(function () {
            $('#accountCashFlowList').off('focus');
            $('#accountCashFlowList').on('focus', function (e) {
                $("#modal-chooseAccount").modal("show");
            });
            $('[name=accountCashFlowList]').tagify()
                .on('removeTag', function (e, tagData) {
                    var indexTag = tagData.index,
                        arrIdAccountCashFlow = JSON.parse($('#arrIdAccountCashFlow').val()),
                        idAccountCashFlow = arrIdAccountCashFlow[indexTag];

                    arrIdAccountCashFlow.splice(indexTag, 1);
                    $('#arrIdAccountCashFlow').val(JSON.stringify(arrIdAccountCashFlow));
                    $("#checkBoxAllAccount").prop("checked", false);
                    $('.checkboxAccount[data-idAccount="' + idAccountCashFlow + '"]').prop('checked', false);
                    getDataCashFlow();
                });

            if (arrAccountsCashFlowDefault.length > 0) {
                var accountListTagify = $('[name=accountCashFlowList]').data('tagify'),
                    arrIdAccountCashFlow = [],
                    arrNameAccount = [];
                $.each(arrAccountsCashFlowDefault, function (index, array) {
                    arrIdAccountCashFlow.push(array[0]);
                    arrNameAccount.push(array[1]);
                });
                $('#arrIdAccountCashFlow').val(JSON.stringify(arrIdAccountCashFlow));
                accountListTagify.addTags(arrNameAccount);
            }

            if (arrAccountsCashFlow.length > 0) {
                var codeNumberGeneral = codeNumberMain = codeNumberSub = textClass = additionalText = rowsAccount = '';
                $.each(arrAccountsCashFlow, function (index, array) {
                    var isParentAccount = arrAccountsCashFlow.filter(obj => obj.IDACCOUNTPARENT.includes(array.IDACCOUNT)).length > 0 ? true : false,
                        checkboxAccount = !isParentAccount ? '<label class="adomx-checkbox"><input type="checkbox" data-idAccount="' + array.IDACCOUNT + '" data-accountName="' + array.ACCOUNTCODEFULL + ' ' + array.ACCOUNTNAME + '" class="checkboxAccount" checked/> <i class="icon"></i></label>' : "";
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

                    rowsAccount += "<tr>" +
                        "<td class='pr-1' width='40'>" + codeNumberGeneral + "</td>" +
                        "<td class='px-1' width='40'>" + codeNumberMain + "</td>" +
                        "<td class='pl-1' width='40'>" + codeNumberSub + "</td>" +
                        "<td ><span class='" + textClass + "'>" + additionalText + array.ACCOUNTNAME + "</span></td>" +
                        "<td class='text-center' width='40'>" + checkboxAccount + "</td>" +
                        "</tr>";
                    $("#chooseAccount-listAccountJournal > tbody").html(rowsAccount);
                });

                $(".checkboxAccount").off('click');
                $(".checkboxAccount").on("click", function (e) {
                    var checked = this.checked,
                        totalUnchecked = $('.checkboxAccount').filter(':not(:checked)').length;
                    if (!checked) {
                        $("#checkBoxAllAccount").prop("checked", false);
                    } else {
                        if (totalUnchecked == 0) {
                            $("#checkBoxAllAccount").prop("checked", true);
                        } else {
                            $("#checkBoxAllAccount").prop("checked", false);
                        }
                    }
                });
            }
            getDataCashFlow();
        })
    }
}

$('.radioDateRangeType').off('click');
$('.radioDateRangeType').on('click', function (e) {
    var dateRangeType = parseInt($(this).val());

    switch (dateRangeType) {
        case 1:
            $('#dateStart').val(firstDateOfMonth);
            $('#dateEnd').val(lastDateOfMonth);
            break;
        case 2:
            $('#dateStart').val(firstDateOfLastMonth);
            $('#dateEnd').val(lastDateOfLastMonth);
            break;
        case 3:
            $('#dateStart').val(firstDateOfYear);
            $('#dateEnd').val(currentDate);
            break;
        case 4:
            $('#dateStart').val(firstDateOfYear);
            $('#dateEnd').val(lastDateOfLastMonth);
            break;
        case 5:
            $('#dateStart').val(firstDateOfLastYear);
            $('#dateEnd').val(lastDateOfLastYear);
            break;
    }

    if (dateRangeType == 6) {
        $('#dateStart, #dateEnd').prop('disabled', false);
    } else {
        $('#dateStart, #dateEnd').prop('disabled', true);
    }
    getDataCashFlow();
});

$('#dateStart, #dateEnd').off('change');
$('#dateStart, #dateEnd').on('change', function (e) {
    getDataCashFlow();
});

$("#checkBoxAllAccount").off('click');
$("#checkBoxAllAccount").on("click", function (e) {
    var checked = this.checked;
    if (checked) {
        $(".checkboxAccount").prop("checked", true);
    } else {
        $(".checkboxAccount").prop("checked", false);
    }
});

$("#form-chooseAccount").off('submit');
$("#form-chooseAccount").on("submit", function (e) {
    e.preventDefault();
    var accountListTagify = $('[name=accountCashFlowList]').data('tagify'),
        arrIdAccountCashFlow = [],
        arrNameAccount = [];

    accountListTagify.removeAllTags();
    $('#arrIdAccountCashFlow').val(JSON.stringify([]));

    if ($('.checkboxAccount').filter(':checked').length > 0) {
        $('.checkboxAccount').filter(':checked').each(function () {
            var idAccount = $(this).attr('data-idAccount'),
                accountName = $(this).attr('data-accountName');

            arrIdAccountCashFlow.push(idAccount);
            arrNameAccount.push(accountName);
        });

        $('#arrIdAccountCashFlow').val(JSON.stringify(arrIdAccountCashFlow));
        accountListTagify.addTags(arrNameAccount);
    }

    getDataCashFlow();
    $("#modal-chooseAccount").modal("hide");
});

function getDataCashFlow() {
    var $tableBody = $('#table-dataCashFlow > tbody'),
        columnNumber = 4,
        dateRangeType = $('input[name="radioDateRangeType"]:checked').val(),
        dateStart = $('#dateStart').val(),
        dateEnd = $('#dateEnd').val(),
        accountListTagify = $('[name=accountCashFlowList]').data('tagify'),
        accountListTagifyData = accountListTagify.value,
        arrAccountCashFlowName = accountListTagifyData.map(function (tag) {
            return tag.value;
        }),
        arrIdAccountCashFlow = $('#arrIdAccountCashFlow').val(),
        dataSend = {
            dateRangeType: dateRangeType,
            dateStart: dateStart,
            dateEnd: dateEnd,
            arrAccountCashFlowName: arrAccountCashFlowName,
            arrIdAccountCashFlow: JSON.parse(arrIdAccountCashFlow)
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "cashFlow/getDataTable",
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
            $('#excelDataCashFlow').off("click").attr("href", "").addClass('d-none');
            $tableBody.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var result = responseJSON.result;

                    if (responseJSON.urlExcelData != "") $('#excelDataCashFlow').removeClass('d-none').on("click").attr("href", responseJSON.urlExcelData);
                    if (result.length > 0) {
                        $.each(result, function (index, array) {
                            accountLevel = array.accountLevel;
                            rows += accountLevel == 0 ? generateEmptyRowTable(columnNumber) : generateRowTable(array, arrIdAccountCashFlow);
                        });
                    }
                    break;
                case 404:
                default:
                    rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBody.html(rows);

            $("td.tdCashFlowSaldo").hover(
                function () {
                    $(this).find(".iconTdCashFlowSaldo").removeClass('d-none');
                },
                function () {
                    $(this).find(".iconTdCashFlowSaldo").addClass('d-none');
                }
            );
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateRowTable(arrayData, arrIdAccountCashFlow) {
    var idAccount = arrayData.idAccount,
        level = arrayData.accountLevel,
        accountCode = arrayData.accountCode,
        accountName = arrayData.accountName,
        textBoldClass = arrayData.textBoldClass,
        saldo = arrayData.saldo === "" ? "" : numberFormat(arrayData.saldo),
        dateStart = $('#dateStart').val(),
        dateEnd = $('#dateEnd').val(),
        colspan = 3,
        additionalTd = "";

    switch (level) {
        case 2:
        case "2":
            colspan = 2;
            additionalTd = "<td width='30'></td>";
            break;
        case 3:
        case "3":
            colspan = 1;
            additionalTd = "<td width='30'></td><td width='30'></td>";
            break;
        default: break;
    }

    if (idAccount == "") {
        return "<tr>" +
            additionalTd +
            "<td colspan='" + colspan + "'><b class='" + textBoldClass + "'>" + accountName + "</b></td>" +
            "<td class='text-right'><b class='" + textBoldClass + "'>" + saldo + "</b></td>" +
            "</tr>";
    } else {
        return "<tr>" +
            additionalTd +
            "<td colspan='" + colspan + "'>" + (level == 1 || level == 2 ? "<b class='" + textBoldClass + "'>" + (level == 2 ? accountCode + " &nbsp; " : "") + accountName + "</b>" : accountCode + " &nbsp; " + accountName) + "</td>" +
            "<td class='text-right cursor-pointer tdCashFlowSaldo' " +
            (accountCode != "" && parseInt(saldo) != 0 && saldo != "" ? "onclick='showCashFlowDetail(\"" + idAccount + "\", \"" + dateStart + "\", \"" + dateEnd + "\")'" : "") +
            ">" +
            (accountCode != "" && parseInt(saldo) != 0 && saldo != "" ? "<i class='iconTdCashFlowSaldo text-info fa fa-external-link-square text16px mr-2 d-none'></i>" : "") +
            (level == 1 || level == 2 ? "<b class='" + textBoldClass + "'>" + saldo + "</b>" : saldo) +
            "</td>" +
            "</tr>";
    }
}

function generateEmptyRowTable(columnNumber) {
    return "<tr><td colspan='" + (columnNumber + 2) + "'>&nbsp;</td></tr>";
}

function showCashFlowDetail(idAccount, dateStart, dateEnd) {
    var arrIdAccountCashFlow = $('#arrIdAccountCashFlow').val(),
        $tableBody = $('#modal-cashFLowDetails-table > tbody'),
        columnNumber = $('#modal-cashFLowDetails-table > thead > tr > th').length,
        dataSend = {
            idAccount: idAccount,
            arrIdAccountCashFlow: JSON.parse(arrIdAccountCashFlow),
            dateStart: dateStart,
            dateEnd: dateEnd
        };

    $.ajax({
        type: 'POST',
        url: baseURL + "cashFlow/getDetailCashFlow",
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
            $tableBody.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
            $("#modal-cashFLowDetails-totalDebit, #modal-cashFLowDetails-totalCredit").html(0);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var detailAccount = responseJSON.detailAccount,
                        dataDetailsCashFlow = responseJSON.dataDetailsCashFlow,
                        dateStartStr = moment(dateStart, "DD-MM-YYYY").format("DD MMM YYYY"),
                        dateEndStr = moment(dateEnd, "DD-MM-YYYY").format("DD MMM YYYY"),
                        totalMutationDebit = 0,
                        totalMutationCredit = 0,
                        rowCashFlowDetails = '';

                    $.each(dataDetailsCashFlow, function (index, arrayDetailsCashFlow) {
                        totalMutationDebit += parseInt(arrayDetailsCashFlow.DEBIT);
                        totalMutationCredit += parseInt(arrayDetailsCashFlow.CREDIT);
                        rowCashFlowDetails += '<tr class="modal-cashFLowDetails-trTransaction">' +
                            '<td>' + arrayDetailsCashFlow.DATETRANSACTION + '</td>' +
                            '<td>' + arrayDetailsCashFlow.REFFNUMBER + '</td>' +
                            '<td>' + arrayDetailsCashFlow.ACCOUNTCASHCODE + ' - ' + arrayDetailsCashFlow.ACCOUNTCASHNAME + '</td>' +
                            '<td>' + arrayDetailsCashFlow.DESCRIPTIONRECAP + '<br/><small>' + arrayDetailsCashFlow.DESCRIPTIONDETAIL + '</small></td>' +
                            '<td align="right">' + numberFormat(arrayDetailsCashFlow.DEBIT) + '</td>' +
                            '<td align="right">' + numberFormat(arrayDetailsCashFlow.CREDIT) + '</td>' +
                            '</tr>';
                    });

                    $("#modal-cashFLowDetails-detailAccountDatePeriod").html(detailAccount.ACCOUNTCODE + " " + detailAccount.ACCOUNTNAME + "<span class='pull-right'>" + dateStartStr + " to " + dateEndStr + "</span>");
                    $tableBody.html(rowCashFlowDetails);
                    $("#modal-cashFLowDetails-totalDebit").html(numberFormat(totalMutationDebit));
                    $("#modal-cashFLowDetails-totalCredit").html(numberFormat(totalMutationCredit));
                    $("#modal-cashFLowDetails").modal("show");
                    break;
                case 404:
                default:
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done()
        setUserToken(jqXHR)
    });
}

cashFlowFunc();