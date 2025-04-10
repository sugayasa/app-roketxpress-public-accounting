var $confirmDialog = $('#modal-confirm-action');
if (profitLossFunc == null) {
    var profitLossFunc = function () {
        $(document).ready(function () {
            getDataProfitLoss();
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
    getDataProfitLoss();
});

$('#dateStart, #dateEnd').off('change');
$('#dateStart, #dateEnd').on('change', function (e) {
    getDataProfitLoss();
});

function getDataProfitLoss() {
    var $tableBody = $('#table-dataProfitLoss > tbody'),
        columnNumber = 4,
        dateRangeType = $('input[name="radioDateRangeType"]:checked').val(),
        dateStart = $('#dateStart').val(),
        dateEnd = $('#dateEnd').val(),
        dataSend = {
            dateRangeType: dateRangeType,
            dateStart: dateStart,
            dateEnd: dateEnd
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "profitLoss/getDataTable",
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
            $('#excelDataProfitLoss').off("click").attr("href", "").addClass('d-none');
            $tableBody.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var result = responseJSON.result,
                        dataAccountOperatingRevenue = result.dataAccountOperatingRevenue,
                        dataAccountOtherRevenue = result.dataAccountOtherRevenue,
                        dataAccountOperatingExpense = result.dataAccountOperatingExpense,
                        dataAccountAdminCost = result.dataAccountAdminCost,
                        dataAccountDepreciationExpense = result.dataAccountDepreciationExpense,
                        dataAccountOtherExpense = result.dataAccountOtherExpense,
                        totalSaldoOperatingRevenue = totalSaldoOtherRevenue = totalSaldoOperatingExpense = totalSaldoAdminCost = totalSaldoDepreciationExpense = totalSaldoOtherExpense = 0;

                    if (responseJSON.urlExcelData != "") $('#excelDataProfitLoss').removeClass('d-none').on("click").attr("href", responseJSON.urlExcelData);
                    if (dataAccountOperatingRevenue.length > 0) {
                        $.each(dataAccountOperatingRevenue, function (index, array) {
                            rows += generateRowTable(array);
                            if (index == (dataAccountOperatingRevenue.length - 1)) totalSaldoOperatingRevenue = parseInt(array.saldo);
                        });
                    }
                    if (rows != "") rows += generateEmptyRowTable(columnNumber);

                    if (dataAccountOperatingExpense.length > 0) {
                        $.each(dataAccountOperatingExpense, function (index, array) {
                            rows += generateRowTable(array);
                            if (index == (dataAccountOperatingExpense.length - 1)) totalSaldoOperatingExpense = parseInt(array.saldo);
                        });
                    }
                    rows += generateTotalRowTable("Gross Profit/Loss", totalSaldoOperatingRevenue - totalSaldoOperatingExpense);
                    if (rows != "") rows += generateEmptyRowTable(columnNumber);

                    if (dataAccountAdminCost.length > 0) {
                        $.each(dataAccountAdminCost, function (index, array) {
                            rows += generateRowTable(array);
                            if (index == (dataAccountAdminCost.length - 1)) totalSaldoAdminCost = parseInt(array.saldo);
                        });
                    }
                    if (rows != "") rows += generateEmptyRowTable(columnNumber);

                    if (dataAccountDepreciationExpense.length > 0) {
                        $.each(dataAccountDepreciationExpense, function (index, array) {
                            rows += generateRowTable(array);
                            if (index == (dataAccountDepreciationExpense.length - 1)) totalSaldoDepreciationExpense = parseInt(array.saldo);
                        });
                    }
                    if (rows != "") rows += generateEmptyRowTable(columnNumber);

                    if (dataAccountOtherExpense.length > 0) {
                        $.each(dataAccountOtherExpense, function (index, array) {
                            rows += generateRowTable(array);
                            if (index == (dataAccountOtherExpense.length - 1)) totalSaldoOtherExpense = parseInt(array.saldo);
                        });
                    }
                    rows += generateTotalRowTable("Operational Profit/Loss", totalSaldoOperatingRevenue - totalSaldoOperatingExpense - totalSaldoAdminCost - totalSaldoDepreciationExpense - totalSaldoOtherExpense);
                    if (rows != "") rows += generateEmptyRowTable(columnNumber);

                    if (dataAccountOtherRevenue.length > 0) {
                        $.each(dataAccountOtherRevenue, function (index, array) {
                            rows += generateRowTable(array);
                            if (index == (dataAccountOtherRevenue.length - 1)) totalSaldoOtherRevenue = parseInt(array.saldo);
                        });
                    }

                    rows += generateTotalRowTable("Net Profit/Loss", totalSaldoOperatingRevenue + totalSaldoOtherRevenue - totalSaldoOperatingExpense - totalSaldoAdminCost - totalSaldoDepreciationExpense - totalSaldoOtherExpense);
                    break;
                case 404:
                default:
                    rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    break;
            }

            if (rows == "") rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBody.html(rows);

            $("td.tdProfitLossSaldo").hover(
                function () {
                    $(this).find(".iconTdProfitLossSaldo").removeClass('d-none');
                },
                function () {
                    $(this).find(".iconTdProfitLossSaldo").addClass('d-none');
                }
            );
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateRowTable(arrayData) {
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

    return "<tr>" +
        additionalTd +
        "<td colspan='" + colspan + "'>" + (level == 1 || level == 2 ? "<b class='" + textBoldClass + "'>" + (level == 2 ? accountCode + " &nbsp; " : "") + accountName + "</b>" : accountCode + " &nbsp; " + accountName) + "</td>" +
        "<td class='text-right cursor-pointer tdProfitLossSaldo' " +
        (accountCode != "" && parseInt(saldo) > 0 && saldo != "" ? "onclick='showGeneralLedger(\"" + idAccount + "\", \"" + dateStart + "\", \"" + dateEnd + "\")'" : "") +
        ">" +
        (accountCode != "" && parseInt(saldo) > 0 && saldo != "" ? "<i class='iconTdProfitLossSaldo text-info fa fa-external-link-square text16px mr-2 d-none'></i>" : "") +
        (level == 1 || level == 2 ? "<b class='" + textBoldClass + "'>" + saldo + "</b>" : saldo) +
        "</td>" +
        "</tr>";
}

function generateEmptyRowTable(columnNumber) {
    return "<tr><td colspan='" + (columnNumber + 2) + "'>&nbsp;</td></tr>";
}

function generateTotalRowTable(textTotal, saldoTotal) {
    return "<tr><td colspan='3'><b>" + textTotal + "</b></td><td class='text-right'><b>" + numberFormat(saldoTotal) + "</b></td></tr>";
}

profitLossFunc();