if (balanceSheetFunc == null) {
    var balanceSheetFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionMonth', 'optionMonth', thisMonth);
            setOptionHelper('optionYear', 'optionYear', thisYear);
            getDataBalanceSheet();
        })
    }
}

$('#optionMonth, #optionYear, input[name="reportFormat"]').off('change');
$('#optionMonth, #optionYear, input[name="reportFormat"]').on('change', function (e) {
    getDataBalanceSheet();
});

function getDataBalanceSheet() {
    var $tableBodyAssets = $('#table-dataBalanceSheetAssets > tbody'),
        $tableBodyLiabilitiesEquity = $('#table-dataBalanceSheetLiabilitiesEquity > tbody'),
        columnNumber = 4,
        reportFormat = $("input[name='reportFormat']:checked").val(),
        month = $('#optionMonth').val(),
        year = $('#optionYear').val(),
        dataSend = {
            reportFormat: reportFormat,
            month: month,
            year: year
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "balanceSheet/getDataTable",
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
            $('#excelDataBalanceSheet').off("click").attr("href", "").addClass('d-none');
            $tableBodyAssets.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
            $tableBodyLiabilitiesEquity.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rowsAssets = rowsLiabilitiesEquity = "";

            switch (jqXHR.status) {
                case 200:
                    var result = responseJSON.result,
                        dataAccountAssets = result.dataAccountAssets,
                        dataAccountLiabilities = result.dataAccountLiabilities,
                        dataAccountEquity = result.dataAccountEquity,
                        totalSaldoAssets = totalSaldoLiabilities = totalSaldoEquity = 0;

                    if (responseJSON.urlExcelData != "") $('#excelDataBalanceSheet').removeClass('d-none').on("click").attr("href", responseJSON.urlExcelData);
                    if (dataAccountAssets.length > 0) {
                        $.each(dataAccountAssets, function (index, array) {
                            if (index == (dataAccountAssets.length - 1)) {
                                rowsAssets += generateRowTable(array, 'lastRowAssets');
                                totalSaldoAssets = array.saldo;
                            } else {
                                rowsAssets += generateRowTable(array);
                            }
                        });
                    }
                    $("#th-footerBalanceSheetAssets").html(numberFormat(totalSaldoAssets));

                    if (dataAccountLiabilities.length > 0) {
                        $.each(dataAccountLiabilities, function (index, array) {
                            rowsLiabilitiesEquity += generateRowTable(array);
                            if (index == (dataAccountLiabilities.length - 1)) totalSaldoLiabilities = array.saldo;
                        });
                    }
                    if (rowsLiabilitiesEquity != "") rowsLiabilitiesEquity += generateEmptyRowTable(columnNumber);

                    if (dataAccountEquity.length > 0) {
                        $.each(dataAccountEquity, function (index, array) {
                            if (index == (dataAccountEquity.length - 1)) {
                                totalSaldoEquity = array.saldo;
                                rowsLiabilitiesEquity += generateRowTable(array, 'lastRowLiabilitiesEquity');
                            } else {
                                rowsLiabilitiesEquity += generateRowTable(array);
                            }
                        });
                    }
                    $("#th-footerBalanceSheetLiabilitiesEquity").html(numberFormat(parseInt(totalSaldoLiabilities) + parseInt(totalSaldoEquity)));

                    break;
                case 404:
                default:
                    rowsAssets = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    rowsLiabilitiesEquity = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
                    break;
            }

            if (rowsAssets == "") rowsAssets = "<tr><td colspan='" + columnNumber + "' align='center'><center>No data found</center></td></tr>";
            $tableBodyAssets.html(rowsAssets);
            $tableBodyLiabilitiesEquity.html(rowsLiabilitiesEquity);

            $("td.tdProfitLossSaldo").hover(
                function () {
                    $(this).find(".iconTdProfitLossSaldo").removeClass('d-none');
                },
                function () {
                    $(this).find(".iconTdProfitLossSaldo").addClass('d-none');
                }
            );

            if (reportFormat == 1) {
                var tableAssetsHeight = $('#table-dataBalanceSheetAssets > tbody').height(),
                    tableLiabilitiesEquityHeight = $('#table-dataBalanceSheetLiabilitiesEquity > tbody').height(),
                    heightLastRowAssets = $('#lastRowAssets').height(),
                    heightLastRowLiabilitiesEquity = $('#lastRowLiabilitiesEquity').height(),
                    additionalHeightAssets = tableAssetsHeight < tableLiabilitiesEquityHeight ? tableLiabilitiesEquityHeight - tableAssetsHeight + heightLastRowLiabilitiesEquity : false,
                    additionalHeightEquityHeight = tableLiabilitiesEquityHeight < tableAssetsHeight ? tableAssetsHeight - tableLiabilitiesEquityHeight + heightLastRowAssets : false;

                if (additionalHeightAssets && additionalHeightAssets > 0) $('#lastRowAssets').css("height", additionalHeightAssets + "px");
                if (additionalHeightEquityHeight && additionalHeightEquityHeight > 0) $('#lastRowLiabilitiesEquity').css("height", additionalHeightEquityHeight + "px");
                $("#containerTable-dataBalanceSheetAssets, #containerTable-dataBalanceSheetLiabilitiesEquity").removeClass('col-12').addClass('col-lg-6 col-md-12');
            } else {
                $("#lastRowAssets, #lastRowLiabilitiesEquity").css("height", "");
                $("#containerTable-dataBalanceSheetAssets, #containerTable-dataBalanceSheetLiabilitiesEquity").removeClass('col-lg-6 col-md-12').addClass('col-12');
            }
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateRowTable(arrayData, rowElemId = '') {
    var rowElemId = rowElemId == '' ? '' : 'id="' + rowElemId + '"',
        idAccount = arrayData.idAccount,
        level = arrayData.accountLevel,
        accountCode = arrayData.accountCode,
        accountName = arrayData.accountName,
        textBoldClass = arrayData.textBoldClass,
        saldo = arrayData.saldo === "" ? "" : numberFormat(arrayData.saldo),
        selectedMonth = $('#optionMonth').val(),
        selectedYear = $('#optionYear').val(),
        dateStart = "01-" + selectedMonth + "-" + selectedYear,
        dateEnd = moment(dateStart, "DD-MM-YYYY"),
        dateEnd = dateEnd.endOf('month').format("DD-MM-YYYY"),
        colspan = 3,
        additionalTd = accountCodeNameStr = saldoStr = "",
        onClickTdEvent = onHoverTdElement = classTdSaldo = "";

    switch (level) {
        case 1:
        case "1":
            colspan = 3;
            additionalTd = "";
            accountCodeNameStr = "<b class='" + textBoldClass + "'>" + accountName + "</b>";
            saldoStr = "<b class='" + textBoldClass + "'>" + saldo + "</b>";
            break;
        case 2:
        case "2":
            colspan = 2;
            additionalTd = "<td width='30'></td>";
            accountCodeNameStr = "<b class='" + textBoldClass + "'>" + accountCode + " &nbsp; " + accountName + "</b>";
            saldoStr = "<b class='" + textBoldClass + "'>" + saldo + "</b>";
            break;
        case 3:
        case "3":
            colspan = 1;
            additionalTd = "<td width='30'></td><td width='30'></td>";
            accountCodeNameStr = accountCode + " &nbsp; " + accountName;
            saldoStr = saldo;
            break;
        default: break;
    }

    if (accountCode != "" && saldo != "") {
        onClickTdEvent = "onclick='showGeneralLedger(\"" + idAccount + "\", \"" + dateStart + "\", \"" + dateEnd + "\")'";
        onHoverTdElement = "<i class='iconTdProfitLossSaldo text-info fa fa-external-link-square text16px mr-2 d-none'></i>";
        classTdSaldo = "cursor-pointer tdProfitLossSaldo";
    }

    return "<tr " + rowElemId + ">" +
        additionalTd +
        "<td colspan='" + colspan + "' > " + accountCodeNameStr + "</td > " +
        "<td width='160' class='text-right " + classTdSaldo + "' " + onClickTdEvent + ">" + onHoverTdElement + saldoStr + "</td>" +
        "</tr>";
}

function generateEmptyRowTable(columnNumber, rowElemId = '') {
    var rowElemId = rowElemId == '' ? '' : 'id="' + rowElemId + '"';
    return "<tr " + rowElemId + "><td colspan='" + columnNumber + "'>&nbsp;</td></tr>";
}

function generateTotalRowTable(textTotal, saldoTotal, columnNumber) {
    var colspan = columnNumber - 1;
    return "<tr><td colspan='" + colspan + "'><b>" + textTotal + "</b></td><td class='text-right'><b>" + numberFormat(saldoTotal) + "</b></td></tr>";
}

balanceSheetFunc();