var $confirmDialog = $('#modal-confirm-action');
if (generalLedgerFunc == null) {
    var generalLedgerFunc = function () {
        $(document).ready(function () {
            setOptionHelper('chooseAccount-optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
                setOptionHelper('chooseAccount-optionAccountSub', 'dataAccountSub', false, function () {
                    afterSelectAccountEvent();
                }, firstValueAccountMain);
            });

            $('#chooseAccount-optionAccountMain').off('change');
            $('#chooseAccount-optionAccountMain').on('change', function (e) {
                var selectedValueAccountMain = this.value;
                setOptionHelper('chooseAccount-optionAccountSub', 'dataAccountSub', false, function () {
                    afterSelectAccountEvent();
                    $("#chooseAccount-optionAccountSub").select2({
                        dropdownParent: $("#modal-chooseAccount")
                    });
                }, selectedValueAccountMain);
            });

            $('#chooseAccount-optionAccountMain').select2({
                dropdownParent: $("#modal-chooseAccount")
            });

            $('#accountList').off('focus');
            $('#accountList').on('focus', function (e) {
                $("#modal-chooseAccount").modal("show");
            });
            $('[name=accountList]').tagify()
                .on('removeTag', function (e, tagData) {
                    var indexTag = tagData.index,
                        arrIdAccount = JSON.parse($('#arrIdAccount').val()),
                        idAccount = arrIdAccount[indexTag];

                    arrIdAccount.splice(indexTag, 1);
                    $('#arrIdAccount').val(JSON.stringify(arrIdAccount));
                    $("#checkBoxAllAccount").prop("checked", false);
                    $('.checkboxAccount[data-idAccount="' + idAccount + '"]').prop('checked', false);
                    getDataGeneralLedger();
                });

            if (dataAllAccountJournal.length > 0) {
                generateTableListAccountCheckbox(dataAllAccountJournal, 'chooseAccount-listAccountJournal');
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
        });
    }
}

$("#btnResetAccountList").off('click');
$("#btnResetAccountList").on("click", function (e) {
    e.preventDefault();
    var accountListTagify = $('[name=accountList]').data('tagify');
    accountListTagify.removeAllTags();
    $('#arrIdAccount').val(JSON.stringify([]));
    getDataGeneralLedger(false, true);
});

$('#datePeriodStart, #datePeriodEnd').off('change');
$('#datePeriodStart, #datePeriodEnd').on('change', function (e) {
    if ($("#arrIdAccount").val() != "[]") getDataGeneralLedger();
});

function afterSelectAccountEvent() {
    if ($('#chooseAccount-optionAccountSub > option').length <= 0 && $('#chooseAccount-optionAccountSub > optgroup').length <= 0) {
        $("#chooseAccount-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        $("#chooseAccount-optionAccountSub").prop('disabled', false);
    }
    return true;
}

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
    var accountListTagify = $('[name=accountList]').data('tagify'),
        activeTab = $('#chooseAccount-tabGroup li a.active').attr('href'),
        arrIdAccount = JSON.parse($('#arrIdAccount').val()),
        arrNameAccount = [];

    if (activeTab == "#chooseAccount") {
        var selectedText = selectedValue = '';

        if ($('#chooseAccount-optionAccountSub option:selected').val() == "0") {
            selectedText = $("#chooseAccount-optionAccountMain option:selected").text();
            selectedValue = $("#chooseAccount-optionAccountMain").val();
        } else {
            selectedText = $("#chooseAccount-optionAccountSub option:selected").text();
            selectedValue = $("#chooseAccount-optionAccountSub").val();
        }

        if (!arrIdAccount.includes(selectedValue)) {
            arrIdAccount.push(selectedValue);
            arrNameAccount.push(selectedText);
        }
    } else {
        if ($('.checkboxAccount').filter(':checked').length <= 0) {
            accountListTagify.removeAllTags();
            getDataGeneralLedger(false, true);
            arrIdAccount = [];
        } else {
            $('.checkboxAccount').filter(':checked').each(function () {
                var idAccount = $(this).attr('data-idAccount'),
                    accountName = $(this).attr('data-accountName');
                if (!arrIdAccount.includes(idAccount)) {
                    arrIdAccount.push(idAccount);
                    arrNameAccount.push(accountName);
                }
            });
        }
    }

    $('#arrIdAccount').val(JSON.stringify(arrIdAccount));
    accountListTagify.addTags(arrNameAccount);
    getDataGeneralLedger(arrNameAccount);
    $("#modal-chooseAccount").modal("hide");
});

$("#formFilter").off('submit');
$("#formFilter").on("submit", function (e) {
    e.preventDefault();
});

function getDataGeneralLedger(nameAccountAdd = false, removeAllTags = false) {
    var arrNameAccount = $("#accountList").val(),
        arrNameAccount = arrNameAccount == "" || removeAllTags ? [] : JSON.parse(arrNameAccount);
    if (arrNameAccount.length > 0) {
        var arrEach = [];
        $.each(arrNameAccount, function (index, dataNameAccount) {
            arrEach.push(dataNameAccount.value);
        });
        arrNameAccount = arrEach;
        if (nameAccountAdd && Array.isArray(nameAccountAdd)) {
            for (iAccount = 0; iAccount < nameAccountAdd.length; iAccount++) {
                arrNameAccount.push(nameAccountAdd[iAccount]);
            }
        }
    } else {
        arrNameAccount = nameAccountAdd;
    }

    var datePeriodStart = $('#datePeriodStart').val(),
        datePeriodEnd = $('#datePeriodEnd').val(),
        arrIdAccount = removeAllTags ? [] : JSON.parse($('#arrIdAccount').val()),
        dataSend = {
            datePeriodStart: datePeriodStart,
            datePeriodEnd: datePeriodEnd,
            arrIdAccount: arrIdAccount,
            arrNameAccount: arrNameAccount
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "generalLedger/getDataTable",
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
            $('#accountList').off('focus');
            $("#formFilter :input").attr("disabled", true);
            $('#excelDataGeneralLedger').addClass('d-none');
            $("#generalLedgerTableContainer").html('<div class="col-sm-12 text-center box mt-10"><div class="box-body"><h6 class="text-info"><i class="fa fa-spinner fa-pulse"></i><br/>Loading data...</h6></div></div>');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                tableLedger = "";

            switch (jqXHR.status) {
                case 200:
                    var data = responseJSON.result;
                    if (data.length !== 0) {
                        if (responseJSON.urlExcelData != "") $('#excelDataGeneralLedger').removeClass('d-none').on("click").attr("href", responseJSON.urlExcelData);
                        $.each(data, function (index, array) {
                            var beginningBalanceData = array.BEGINNINGBALANCEDATA,
                                transactionData = array.TRANSACTIONDATA,
                                defaultDRCR = beginningBalanceData.DEFAULTDRCR,
                                beginningBalance = parseInt(beginningBalanceData.BEGINNINGBALANCE),
                                beginningBalanceDR = 0,
                                beginningBalanceCR = 0,
                                totalDebit = totalCredit = 0,
                                rowTransaction = '';

                            if (defaultDRCR == 'DR') {
                                if (beginningBalance > 0) beginningBalanceDR = numberFormat(beginningBalance);
                                if (beginningBalance < 0) beginningBalanceCR = numberFormat(beginningBalance);
                            } else {
                                if (beginningBalance > 0) beginningBalanceCR = numberFormat(beginningBalance);
                                if (beginningBalance < 0) beginningBalanceDR = numberFormat(beginningBalance);
                            }

                            $.each(transactionData, function (indexTransaction, arrayTransaction) {
                                totalDebit += parseInt(arrayTransaction.DEBIT);
                                totalCredit += parseInt(arrayTransaction.CREDIT);
                                rowTransaction += '<tr>' +
                                    '<td align="center">' + arrayTransaction.DATETRANSACTION + '</td>' +
                                    '<td>' + arrayTransaction.REFFNUMBER + '</td>' +
                                    '<td>' + arrayTransaction.DESCRIPTIONRECAP + '<br/><small class="text11px font-italic">' + arrayTransaction.DESCRIPTIONDETAIL + '</small></td>' +
                                    '<td align="right">' + numberFormat(arrayTransaction.DEBIT) + '</td>' +
                                    '<td align="right">' + numberFormat(arrayTransaction.CREDIT) + '</td>' +
                                    '</tr>';
                            });

                            var totalMutation = defaultDRCR == 'DR' ? totalDebit - totalCredit : totalCredit - totalDebit;

                            tableLedger += '<div class="col-sm-12 box mt-10 pl-0 pr-0">' +
                                '<div class="box-body"><h6>' + array.ACCOUNTNAME + '</h6>' +
                                '<table class="table">' +
                                '<thead class="thead-light">' +
                                '<tr>' +
                                '<th width="120" class="text-center">Date</th>' +
                                '<th width="140">Reff. Number</th>' +
                                '<th> Description</th>' +
                                '<th width="130" class="text-right">Debit</th>' +
                                '<th width="130" class="text-right">Credit</th>' +
                                '</tr> ' +
                                '</thead>' +
                                '<tbody>' +
                                '<tr>' +
                                '<td colspan="3"><b>Beginning Balance<b/></td>' +
                                '<td align="right"><b>' + beginningBalanceDR + '</b></td>' +
                                '<td align="right"><b>' + beginningBalanceCR + '</b></td>' +
                                '</tr>' +
                                '<tr>' +
                                rowTransaction +
                                '<td colspan="3"><b>Total<b/></td>' +
                                '<td align="right"><b>' + numberFormat(totalDebit) + '</b></td>' +
                                '<td align="right"><b>' + numberFormat(totalCredit) + '</b></td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table > ' +
                                '<table class="table">' +
                                '<thead class="thead-light">' +
                                '<tr>' +
                                '<th width="33%" class="border-right">Beginning Balance <span class="pull-right">' + (beginningBalance == 0 ? 0 : numberFormat(beginningBalance)) + '</span ></th > ' +
                                '<th width="33%" class="border-right">Total Mutation <span class="pull-right">' + numberFormat(totalMutation) + '</span></th>' +
                                '<th width="33%">Ending Balance <span class="pull-right">' + numberFormat((beginningBalance == 0 ? 0 : beginningBalance) + totalMutation) + ' </span></th>' +
                                '</tr> ' +
                                '</thead>' +
                                '</table > ' +
                                '</div>' +
                                '</div>';
                        });
                    } else {
                        $('#excelDataGeneralLedger').off("click").attr("href", "");
                    }
                    break;
                case 404:
                default:
                    break;
            }

            if (tableLedger == "") tableLedger = '<div class="col-sm-12 text-center box mt-10"><div class="box-body"><h6 class="text-danger">No data is displayed</h6></div></div>';
            $("#generalLedgerTableContainer").html(tableLedger);
        }
    }).always(function (jqXHR, textStatus) {
        $('#accountList').on('focus', function (e) {
            $("#modal-chooseAccount").modal("show");
        });
        $("#formFilter :input").attr("disabled", false);
        NProgress.done()
        setUserToken(jqXHR)
    });
}

generalLedgerFunc();