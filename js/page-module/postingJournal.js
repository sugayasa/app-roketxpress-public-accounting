if (postingJournalFunc == null) {
    var postingJournalFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionCompany', 'dataCompany');
            getDataPostingJournal(1);
            resetModalAddAccountJournal();
        });
    }
}

$('#dateJournal, #optionCompany, #optionStatus').off('change');
$('#dateJournal, #optionCompany, #optionStatus').on('change', function (e) {
    getDataPostingJournal($('a.postingJournalTab.active').data('typejournal'));
});

$('#searchKeyword').off('keypress');
$("#searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataPostingJournal($('a.postingJournalTab.active').data('typejournal'));
    }
});

$('a.postingJournalTab[data-toggle="tab"]').off('shown.bs.tab');
$('a.postingJournalTab[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var typeJournal = $(e.target).data('typejournal');
    getDataPostingJournal(typeJournal);
});

function getDataPostingJournal(typeJournal, arrInitiateParam = {}) {
    typeJournal             =   parseInt(typeJournal);
    var dateJournal         =   $('#dateJournal').val(),
        idCompany           =   $('#optionCompany').val(),
        statusPosting       =   $('#optionStatus').val(),
        searchKeyword       =   $('#searchKeyword').val(),
        dataSend            =   { dateJournal: dateJournal, idCompany: idCompany, statusPosting: statusPosting, searchKeyword: searchKeyword },
		arrElemDisabled     =	['postingJournalFilter', '.postingJournalTab'],
		elFilterPropertyData=	getElementPropertyDataInContainer(arrElemDisabled),
        functionUrl         =   'getDataPostingJournalRevenueOTA';
    
    switch (typeJournal) {
        case 1: functionUrl =   'getDataPostingJournalRevenueOTA'; break;
        case 2: functionUrl =   'getDataPostingJournalPaymentOTA'; break;
        case 3: functionUrl =   'getDataPostingJournalCostVendor'; break;
        case 4: functionUrl =   'getDataPostingJournalPaymentVendor'; break;
        case 5: functionUrl =   'getDataPostingJournalCostDriver'; break;
        case 6: functionUrl =   'getDataPostingJournalPaymentDriver'; break;
    }
    
    $.ajax({
        type: 'POST',
        url: baseURL + "postingJournal/" + functionUrl,
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
			setDisabledPropertyElement(arrElemDisabled);
            resetPostingJournalForm(typeJournal);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON= jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    setDataPostingJournal(typeJournal, responseJSON, arrInitiateParam);
                    break;
                case 404:
                default:
                    setPostingJournalNotAvailable(typeJournal);
                    break;
            }

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
        NProgress.done();
        setUserToken(jqXHR);
        resetDisabledPropertyElem(elFilterPropertyData);
    });
}

function resetPostingJournalForm(typeJournal) {
    let loaderElem  =   '<center class="mt-20 mb-20"><i class="fa fa-spinner fa-pulse"></i><br/>Loading data...</center>';
    $('#postingJournal-listOTAVendorDriver').html('<li class="nav-item">'+loaderElem+'</li>');
    $('#postingJournal-postStatus').html('');
    $('#postingJournal-reffNumber, #postingJournal-totalSubJournal, #postingJournal-totalNominal, #postingJournal-postUser, #postingJournal-postDateTime').html('-');
    $('#postingJournal-journalDescription').val('');
    $('#postingJournal-accountContainerDebit, #postingJournal-accountContainerCredit').html('<div class="col-12 mb-5 pt-2">' + loaderElem + '</div>');
    $('#postingJournal-accountTotalNominalDebit, #postingJournal-accountTotalNominalCredit').html('0');
    $('#postingJournal-btnAddDebitAccount, #postingJournal-btnAddCreditAccount, #postingJournal-saveJournal').addClass('d-none').prop('disabled', true);

    let $tableBody  =	null,
        columnNumber=	1,
        tabName     =   '';

    switch (typeJournal) {
        case 1:
            tabName =   'revenueOTATab';
            $('#revenueOTATab-totalRevenueAmount, #revenueOTATab-totalRevenueAmountIDR, #revenueOTATab-totalJournalPostAmount').html(0);
            break;
        case 2:
            tabName =   'paymentOTATab';
            $('#paymentOTATab-totalRevenueAmount, #paymentOTATab-totalRevenueAmountIDR, #paymentOTATab-totalJournalPostAmount').html(0);
            break;
        case 3:
            tabName =   'costVendorTab';
            $('#costVendorTab-totalCostAmount, #costVendorTab-totalJournalPostAmount').html(0);
            break;
        case 4:
            tabName =   'paymentVendorTab';
            $('#paymentVendorTab-totalPaymentAmount, #paymentVendorTab-totalJournalPostAmount').html(0);
            break;
        case 5:
            tabName =   'costDriverTab';
            $('#costDriverTab-totalCostAmount, #costDriverTab-totalJournalPostAmount').html(0);
            break;
        case 6:
            tabName =   'paymentDriverTab';
            $('#paymentDriverTab-totalPaymentAmount, #paymentDriverTab-totalJournalPostAmount').html(0);
            break;
    }

    $tableBody  =	$('#' + tabName + '-tableSubJournal > tbody'),
    columnNumber=	$('#' + tabName + '-tableSubJournal > thead > tr > th').length;
    $tableBody.html('<tr><td colspan="' + columnNumber + '">' + loaderElem + '</td></tr>');
}

function setPostingJournalNotAvailable(typeJournal) {
    $('#postingJournal-listOTAVendorDriver').html('<li class="nav-item">No data available</li>');
    $('#postingJournal-accountContainerDebit, #postingJournal-accountContainerCredit').html('<div class="col-12 mb-5 pt-2 text-center">No data available</div>');

    let $tableBody  =	null,
        columnNumber=	1,
        tabName     =   '';
        
    switch (typeJournal) {
        case 1: tabName = 'revenueOTATab'; break;
        case 2: tabName = 'paymentOTATab'; break;
        case 3: tabName = 'costVendorTab'; break;
        case 4: tabName = 'paymentVendorTab'; break;
        case 5: tabName = 'costDriverTab'; break;
        case 6: tabName = 'paymentDriverTab'; break;
    }

    $tableBody  =	$('#' + tabName + '-tableSubJournal > tbody'),
    columnNumber=	$('#' + tabName + '-tableSubJournal > thead > tr > th').length;
    $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
}

function setDataPostingJournal(typeJournal, data, arrInitiateParam = {}) {
    let dataRecapPerOTA         =   data.dataRecapPerOTA != null && data.dataRecapPerOTA != undefined ? data.dataRecapPerOTA : [],
        dataRecapPerVendor      =   data.dataRecapPerVendor != null && data.dataRecapPerVendor != undefined ? data.dataRecapPerVendor : [],
        dataRecapPerDriver      =   data.dataRecapPerDriver != null && data.dataRecapPerDriver != undefined ? data.dataRecapPerDriver : [],
        dataJournalSub          =   data.dataJournalSub != null && data.dataJournalSub != undefined ? data.dataJournalSub : [],
        elemListOTAVendorDriver =   '';

    switch (typeJournal) {
        case 1:
        case 2:
            if (dataRecapPerOTA.length > 0) {
                $.each(dataRecapPerOTA, function(index, arrayRecapPerOTA){
                    let activeClass =   index == 0 ? 'active' : '';
                    elemListOTAVendorDriver +=  '<li class="nav-item">\
                                                    <span class="nav-link pt-1 pb-1 ' + activeClass + '" data-toggle="tab" data-idSource="' + arrayRecapPerOTA.IDSOURCE + '">' + arrayRecapPerOTA.SOURCENAME + '</span>\
                                                </li>';
                    if(index == 0) {
                        generateDetailPostingJournal(index, dataRecapPerOTA);
                        if(typeJournal == 1) generateJournalSubRevenueOTA(dataJournalSub, arrayRecapPerOTA.DEFAULTCURRENCY, parseInt(arrayRecapPerOTA.ISJOURNALPOSTED));
                        if(typeJournal == 2) generateJournalSubPaymentOTA(dataJournalSub, arrayRecapPerOTA.DEFAULTCURRENCY, parseInt(arrayRecapPerOTA.ISJOURNALPOSTED));
                    }
                });
            } else {
                elemListOTAVendorDriver =   '<li class="nav-item">No data available</li>';
                setPostingJournalNotAvailable(typeJournal);
            }

            $('#postingJournal-listOTAVendorDriver').html(elemListOTAVendorDriver);
            activateOnchangeTabListOTAVendorDriver(dataRecapPerOTA);
            break;
        case 3:
        case 4:
            if (dataRecapPerVendor.length > 0) {
                $.each(dataRecapPerVendor, function(index, arrayRecapPerVendor){
                    let activeClass             =   index == 0 ? 'active' : '',
                        idWithdrawalRecapAttr   =   typeJournal == 4 ? 'data-idWithdrawalRecap="' + arrayRecapPerVendor.IDWITHDRAWALRECAP + '"' : '';
                    elemListOTAVendorDriver     +=  '<li class="nav-item">\
                                                        <span class="nav-link pt-1 pb-1 ' + activeClass + '" data-toggle="tab" data-idVendor="' + arrayRecapPerVendor.IDVENDOR + '" ' + idWithdrawalRecapAttr + '>' + arrayRecapPerVendor.VENDORNAME + '</span>\
                                                    </li>';
                    if(index == 0) {
                        generateDetailPostingJournal(index, dataRecapPerVendor);
                        if(typeJournal == 3) generateJournalSubCostVendor(dataJournalSub, parseInt(arrayRecapPerVendor.ISJOURNALPOSTED));
                        if(typeJournal == 4) generateJournalSubPaymentVendor(dataJournalSub, parseInt(arrayRecapPerVendor.ISJOURNALPOSTED));
                    }
                });
            } else {
                elemListOTAVendorDriver =   '<li class="nav-item">No data available</li>';
                setPostingJournalNotAvailable(typeJournal);
            }

            $('#postingJournal-listOTAVendorDriver').html(elemListOTAVendorDriver);
            activateOnchangeTabListOTAVendorDriver(dataRecapPerVendor);
            break;
        case 5:
        case 6:
            if (dataRecapPerDriver.length > 0) {
                $.each(dataRecapPerDriver, function(index, arrayRecapPerDriver){
                    let activeClass             =   index == 0 ? 'active' : '',
                        idWithdrawalRecapAttr   =   typeJournal == 6 ? 'data-idWithdrawalRecap="' + arrayRecapPerDriver.IDWITHDRAWALRECAP + '"' : '';
                    elemListOTAVendorDriver     +=  '<li class="nav-item">\
                                                        <span class="nav-link pt-1 pb-1 ' + activeClass + '" data-toggle="tab" data-idDriver="' + arrayRecapPerDriver.IDDRIVER + '" ' + idWithdrawalRecapAttr + '>' + arrayRecapPerDriver.DRIVERNAME + '</span>\
                                                    </li>';
                    if(index == 0) {
                        generateDetailPostingJournal(index, dataRecapPerDriver);
                        if(typeJournal == 5) generateJournalSubCostDriver(dataJournalSub, parseInt(arrayRecapPerDriver.ISJOURNALPOSTED));
                        if(typeJournal == 6) generateJournalSubPaymentDriver(dataJournalSub, parseInt(arrayRecapPerDriver.ISJOURNALPOSTED));
                    }
                });
            } else {
                elemListOTAVendorDriver =   '<li class="nav-item">No data available</li>';
                setPostingJournalNotAvailable(typeJournal);
            }

            $('#postingJournal-listOTAVendorDriver').html(elemListOTAVendorDriver);
            activateOnchangeTabListOTAVendorDriver(dataRecapPerDriver);
            break;
    }

    if(Object.keys(arrInitiateParam).length > 0){
        if(arrInitiateParam.idSource != null && arrInitiateParam.idSource != undefined) {
            $('#postingJournal-listOTAVendorDriver .nav-link').each(function(index){
                if($(this).data('idsource') == arrInitiateParam.idSource) {
                    $(this).trigger('click');
                    return false;
                }
            });
        }

        if(arrInitiateParam.idVendor != null && arrInitiateParam.idVendor != undefined) {
            $('#postingJournal-listOTAVendorDriver .nav-link').each(function(index){
                if($(this).data('idvendor') == arrInitiateParam.idVendor) {
                    $(this).trigger('click');
                    return false;
                }
            });
        }

        if(arrInitiateParam.idDriver != null && arrInitiateParam.idDriver != undefined) {
            $('#postingJournal-listOTAVendorDriver .nav-link').each(function(index){
                if($(this).data('iddriver') == arrInitiateParam.idDriver) {
                    $(this).trigger('click');
                    return false;
                }
            });
        }
    }
}

function generateDetailPostingJournal(index, dataRecapJournal) {
    let dataDetailJournal       =   dataRecapJournal[index],
        listDetailJournal       =   dataDetailJournal.LISTDETAILJOURNAL,
        isJournalPosted         =   parseInt(dataDetailJournal.ISJOURNALPOSTED),
        badgePostStatus         =   isJournalPosted == 1 ? '<span class="badge badge-success">Posted</span>' : '<span class="badge badge-warning">Pending</span>',
        defaultEmptyAccountRow  =   '<div class="col-12 mb-5 pt-2 text-center">No data available</div>';

    $('#postingJournal-postStatus').html(badgePostStatus);
    $('#postingJournal-reffNumber').html(dataDetailJournal.REFFNUMBER);
    $('#postingJournal-totalSubJournal').html(numberFormat(dataDetailJournal.TOTALJOURNALSUB));
    $('#postingJournal-totalNominal').html(numberFormat(dataDetailJournal.TOTALNOMINAL));
    $('#postingJournal-postUser').html(dataDetailJournal.POSTUSER);
    $('#postingJournal-postDateTime').html(dataDetailJournal.POSTDATETIME);
    $('#postingJournal-journalDescription').val(dataDetailJournal.DESCRIPTION);

    if(listDetailJournal.length > 0) {
        let debitAccountJournal     =   '', creditAccountJournal =   '';
        $.each(listDetailJournal, function(index, detailJournal){
            let idAccount       =   detailJournal.IDACCOUNT,
                drCrTypeStr     =   detailJournal.POSITIONDRCR == 'DR' ? 'Debit' : 'Credit',
                nominalValue    =   detailJournal.POSITIONDRCR == 'DR' ? detailJournal.DEBIT : detailJournal.CREDIT;
                accountJournal  =   generateRowAccountPostingJournal(drCrTypeStr, idAccount, detailJournal.IDJOURNALDETAILS, detailJournal.ACCOUNTNAME, detailJournal.DESCRIPTION, nominalValue);
            if(detailJournal.POSITIONDRCR == 'DR') debitAccountJournal += accountJournal;
            else creditAccountJournal += accountJournal;
        });

        $('#postingJournal-accountContainerDebit').html(debitAccountJournal == '' ? defaultEmptyAccountRow : debitAccountJournal);
        $('#postingJournal-accountContainerCredit').html(creditAccountJournal == '' ? defaultEmptyAccountRow : creditAccountJournal);
        $('#postingJournal-btnAddDebitAccount, #postingJournal-btnAddCreditAccount, #postingJournal-saveJournal').removeClass('d-none').prop('disabled', false);
        calculateTotalDebitCreditJournalPosting();
    } else {
        $('#postingJournal-accountContainerDebit, #postingJournal-accountContainerCredit').html(defaultEmptyAccountRow);
        $('#postingJournal-btnAddDebitAccount, #postingJournal-btnAddCreditAccount, #postingJournal-saveJournal').addClass('d-none').prop('disabled', true);
    }
}

function generateRowAccountPostingJournal(drCrTypeStr, idAccount, idJournalDetail, accountName, description = '', nominalValue = 0) {
    return '<div class="col-12 mb-5 pt-2">\
                <span>'+accountName+'</span>\
                <i class="text-info fa fa-trash text16px pull-right" onclick="deletePostingJournalAccount(\''+idAccount+'\', \''+drCrTypeStr+'\')"></i>\
                <input type="hidden" class="postingJournal-accountId postingJournal-accountId' + drCrTypeStr + '" value="'+idAccount+'" data-drCrTypeStr="'+drCrTypeStr+'">\
                <input type="hidden" class="postingJournal-journalDetailId' + drCrTypeStr + '" value="'+idJournalDetail+'">\
            </div>\
            <div class="col-lg-8 col-sm-12 mb-5">\
                <input type="text" class="form-control form-control-sm mb-0 postingJournal-accountDescription' + drCrTypeStr + '" placeholder="Description" data-accountId="'+idAccount+'" value="'+description+'">\
            </div>\
            <div class="col-lg-4 col-sm-12 mb-5">\
                <input type="text" class="form-control form-control-sm mb-0 decimalInput postingJournal-accountNominal' + drCrTypeStr + ' text-right" \
                data-accountId="'+idAccount+'" id="postingJournal-accountNominal' + drCrTypeStr + idAccount+'" value="'+numberFormat(nominalValue)+'" \
                onkeypress="maskNumberInput(0, 999999999, \'postingJournal-accountNominal' + drCrTypeStr + idAccount+'\')" \
                onkeyup="calculateTotalDebitCreditJournalPosting()">\
            </div>';
}

function deletePostingJournalAccount(idAccount, drCrTypeStr) {
    $(".postingJournal-accountId" + drCrTypeStr + "[value='" + idAccount + "']").closest('div').remove();
    $(".postingJournal-accountDescription" + drCrTypeStr + "[data-accountId='" + idAccount + "']").closest('div').remove();
    $(".postingJournal-accountNominal" + drCrTypeStr + "[data-accountId='" + idAccount + "']").closest('div').remove();

    if($(".postingJournal-accountNominal" + drCrTypeStr).length == 0) {
        $('#postingJournal-accountContainer' + drCrTypeStr).html('<div class="col-12 mb-5 pt-3 text-center postingJournal-emptyAccountRow' + drCrTypeStr + '">No journal account</div>');
    }
    calculateTotalDebitCreditJournalPosting();
}

function calculateTotalDebitCreditJournalPosting() {
    let totalDebit   =   0,
        totalCredit  =   0;
    $('.postingJournal-accountNominalDebit').each(function(){
        let nominalValue=   parseFloat($(this).val().replace(/,/g, ''));
        totalDebit      +=  nominalValue;
    });
    $('.postingJournal-accountNominalCredit').each(function(){
        let nominalValue=   parseFloat($(this).val().replace(/,/g, ''));
        totalCredit     +=  nominalValue;
    });

    $('#postingJournal-accountTotalNominalDebit').html(numberFormat(totalDebit));
    $('#postingJournal-accountTotalNominalCredit').html(numberFormat(totalCredit));
}

//Revenue OTA
function generateJournalSubRevenueOTA(dataJournalSub, defaultCurrency = '', isJournalPosted = 0) {
    let $tableBody  =	$('#revenueOTATab-tableSubJournal > tbody'),
        columnNumber=	$('#revenueOTATab-tableSubJournal > thead > tr > th').length;
    if(dataJournalSub.length > 0) {
        let rowTable                =   '',
            totalRevenueAmount      =   totalRevenueAmountIDR  =   totalJournalPostAmount  =   0,
            totalCheckedSubJournal  =   0;

        $.each(dataJournalSub, function(index, journalSub){
            let isSubJournalPosted  =   journalSub.ISSUBJOURNALPOSTED == 1 ? 1 : 0,
                checkedCb           =   isSubJournalPosted == 1 ? 'checked' : '',
                badgeStatusRow      =   '-',
                exchangeRate        =   journalSub.CURRENCY == 'IDR' ? 1 : getExchangeRateToIDR(journalSub.CURRENCY),
                reservationAmount   =   journalSub.REVENUEAMOUNT ? parseFloat(journalSub.REVENUEAMOUNT) : 0,
                reservationAmountIDR=   reservationAmount * exchangeRate,
                journalPostAmount   =   journalSub.JOURNALPOSTAMOUNT ? parseFloat(journalSub.JOURNALPOSTAMOUNT) : 0;

            if(defaultCurrency != journalSub.CURRENCY) {
                badgeStatusRow =   '<span class="badge badge-danger">Different Currency</span>';
            } else if(reservationAmountIDR != journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-danger">Not Match, Posted</span>' : '<span class="badge badge-info">Not Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Pending</span>';
                }
            } else if(reservationAmountIDR == journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-success">Match, Posted</span>' : '<span class="badge badge-info">Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Match, Pending</span>';
                }
            }

            rowTable    +=  '<tr>\
                                <td><label class="adomx-checkbox"><input type="checkbox" name="revenueOTATab-cbSubJournal[]" class="revenueOTATab-cbSubJournal" value="'+journalSub.IDRESERVATIONPAYMENT+'" '+checkedCb+'> <i class="icon"></i></label></td>\
                                <td>'+journalSub.REFFNUMBER+'</td>\
                                <td>'+journalSub.BOOKINGCODE+'</td>\
                                <td>'+journalSub.RESERVATIONTITLE+'</td>\
                                <td>'+journalSub.CUSTOMERNAME+'</td>\
                                <td>'+journalSub.CURRENCY+'</td>\
                                <td class="text-right">'+numberFormat(exchangeRate)+'</td>\
                                <td class="text-right">'+numberFormat(reservationAmount, 2)+'</td>\
                                <td class="text-right">'+numberFormat(reservationAmountIDR)+'</td>\
                                <td class="text-right">'+numberFormat(journalPostAmount)+'</td>\
                                <td>'+badgeStatusRow+'</td>\
                            </tr>';
            totalRevenueAmount      += reservationAmountIDR;
            totalRevenueAmountIDR   += reservationAmountIDR;
            totalJournalPostAmount  += journalPostAmount;

            if(isSubJournalPosted == 1) totalCheckedSubJournal++;
        });

        $tableBody.html(rowTable);
        calculateTotalSelectedRevenueSubOTA();
        $('#revenueOTATab-totalJournalPostAmount').html(numberFormat(totalJournalPostAmount));
        $("#revenueOTATab-cbCheckAllSub").prop("checked", totalCheckedSubJournal > 0 && totalCheckedSubJournal === dataJournalSub.length);
        activateOnClickCheckBoxAllReservationRevenueOTA();
        calculateTotalDebitCreditJournalPosting();
    } else {
        $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
    }
}

function activateOnClickCheckBoxAllReservationRevenueOTA() {
	$("#revenueOTATab-cbCheckAllSub").off('click');
    $("#revenueOTATab-cbCheckAllSub").on('click', function () {
        let thisChecked = this.checked;
        $(".revenueOTATab-cbSubJournal").prop("checked", thisChecked);
        calculateTotalSelectedRevenueSubOTA();
    });

    $(".revenueOTATab-cbSubJournal").off('click');
    $(".revenueOTATab-cbSubJournal").on('click', function () {
        let totalReservationRevenueOTA = $(".revenueOTATab-cbSubJournal").length,
            totalReservationRevenueOTAChecked = $(".revenueOTATab-cbSubJournal:checked").length;
        if (totalReservationRevenueOTA == totalReservationRevenueOTAChecked) $("#revenueOTATab-cbCheckAllSub").prop("checked", true);
        if (totalReservationRevenueOTA != totalReservationRevenueOTAChecked) $("#revenueOTATab-cbCheckAllSub").prop("checked", false);
        calculateTotalSelectedRevenueSubOTA();
    });
}

function calculateTotalSelectedRevenueSubOTA() {
    let totalRevenueAmount      =   0,
        totalRevenueAmountIDR   =   0;

    $.each($(".revenueOTATab-cbSubJournal:checked"), function(index, elem){
        let reservationAmount   =   parseFloat($(elem).closest('tr').find('td').eq(7).text().replace(/,/g, '')),
            reservationAmountIDR=   parseFloat($(elem).closest('tr').find('td').eq(8).text().replace(/,/g, ''));
        totalRevenueAmount      += reservationAmount;
        totalRevenueAmountIDR   += reservationAmountIDR;
    });

    $('#revenueOTATab-totalRevenueAmount').html(numberFormat(totalRevenueAmount, 2));
    $('#revenueOTATab-totalRevenueAmountIDR').html(numberFormat(totalRevenueAmountIDR));
    $('.postingJournal-accountNominalDebit, .postingJournal-accountNominalCredit').val(numberFormat(totalRevenueAmountIDR));
    calculateTotalDebitCreditJournalPosting();
}
//Revenue OTA end

//payment OTA
function generateJournalSubPaymentOTA(dataJournalSub, defaultCurrency = '', isJournalPosted = 0) {
    let $tableBody  =	$('#paymentOTATab-tableSubJournal > tbody'),
        columnNumber=	$('#paymentOTATab-tableSubJournal > thead > tr > th').length;
    if(dataJournalSub.length > 0) {
        let rowTable                =   '',
            totalPaymentAmount      =   totalPaymentAmountIDR  =   totalJournalPostAmount  =   0,
            totalCheckedSubJournal  =   0;

        $.each(dataJournalSub, function(index, journalSub){
            let isSubJournalPosted  =   journalSub.ISSUBJOURNALPOSTED == 1 ? 1 : 0,
                checkedCb           =   isSubJournalPosted == 1 ? 'checked' : '',
                badgeStatusRow      =   '-',
                exchangeRate        =   journalSub.CURRENCY == 'IDR' ? 1 : getExchangeRateToIDR(journalSub.CURRENCY),
                paymentAmount       =   journalSub.PAYMENTAMOUNT ? parseFloat(journalSub.PAYMENTAMOUNT) : 0,
                paymentAmountIDR    =   paymentAmount * exchangeRate,
                journalPostAmount   =   journalSub.JOURNALPOSTAMOUNT ? parseFloat(journalSub.JOURNALPOSTAMOUNT) : 0;

            if(defaultCurrency != journalSub.CURRENCY) {
                badgeStatusRow =   '<span class="badge badge-danger">Different Currency</span>';
            } else if(paymentAmountIDR != journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-danger">Not Match, Posted</span>' : '<span class="badge badge-info">Not Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Pending</span>';
                }
            } else if(paymentAmountIDR == journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-success">Match, Posted</span>' : '<span class="badge badge-info">Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Match, Pending</span>';
                }
            }

            rowTable    +=  '<tr>\
                                <td><label class="adomx-checkbox"><input type="checkbox" name="paymentOTATab-cbSubJournal[]" class="paymentOTATab-cbSubJournal" value="'+journalSub.IDRESERVATIONPAYMENT+'" '+checkedCb+'> <i class="icon"></i></label></td>\
                                <td>'+journalSub.REFFNUMBER+'</td>\
                                <td>'+journalSub.BOOKINGCODE+'</td>\
                                <td>'+journalSub.RESERVATIONTITLE+'</td>\
                                <td>'+journalSub.CUSTOMERNAME+'</td>\
                                <td>'+journalSub.CURRENCY+'</td>\
                                <td class="text-right">'+numberFormat(exchangeRate)+'</td>\
                                <td class="text-right">'+numberFormat(paymentAmount, 2)+'</td>\
                                <td class="text-right">'+numberFormat(paymentAmountIDR)+'</td>\
                                <td class="text-right">'+numberFormat(journalPostAmount)+'</td>\
                                <td>'+badgeStatusRow+'</td>\
                            </tr>';
            totalPaymentAmount      += paymentAmountIDR;
            totalPaymentAmountIDR   += paymentAmountIDR;
            totalJournalPostAmount  += journalPostAmount;

            if(isSubJournalPosted == 1) totalCheckedSubJournal++;
        });

        $tableBody.html(rowTable);
        calculateTotalSelectedPaymentSubOTA();
        $('#paymentOTATab-totalJournalPostAmount').html(numberFormat(totalJournalPostAmount));
        $("#paymentOTATab-cbCheckAllSub").prop("checked", totalCheckedSubJournal > 0 && totalCheckedSubJournal === dataJournalSub.length);
        activateOnClickCheckBoxAllReservationPaymentOTA();
        calculateTotalDebitCreditJournalPosting();
    } else {
        $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
    }
}

function activateOnClickCheckBoxAllReservationPaymentOTA() {
	$("#paymentOTATab-cbCheckAllSub").off('click');
    $("#paymentOTATab-cbCheckAllSub").on('click', function () {
        let thisChecked = this.checked;
        $(".paymentOTATab-cbSubJournal").prop("checked", thisChecked);
        calculateTotalSelectedPaymentSubOTA();
    });

    $(".paymentOTATab-cbSubJournal").off('click');
    $(".paymentOTATab-cbSubJournal").on('click', function () {
        let totalReservationPaymentOTA = $(".paymentOTATab-cbSubJournal").length,
            totalReservationPaymentOTAChecked = $(".paymentOTATab-cbSubJournal:checked").length;
        if (totalReservationPaymentOTA == totalReservationPaymentOTAChecked) $("#paymentOTATab-cbCheckAllSub").prop("checked", true);
        if (totalReservationPaymentOTA != totalReservationPaymentOTAChecked) $("#paymentOTATab-cbCheckAllSub").prop("checked", false);
        calculateTotalSelectedPaymentSubOTA();
    });
}

function calculateTotalSelectedPaymentSubOTA() {
    let totalPaymentAmount      =   0,
        totalPaymentAmountIDR   =   0;

    $.each($(".paymentOTATab-cbSubJournal:checked"), function(index, elem){
        let reservationAmount   =   parseFloat($(elem).closest('tr').find('td').eq(7).text().replace(/,/g, '')),
            reservationAmountIDR=   parseFloat($(elem).closest('tr').find('td').eq(8).text().replace(/,/g, ''));
        totalPaymentAmount      += reservationAmount;
        totalPaymentAmountIDR   += reservationAmountIDR;
    });

    $('#paymentOTATab-totalPaymentAmount').html(numberFormat(totalPaymentAmount, 2));
    $('#paymentOTATab-totalPaymentAmountIDR').html(numberFormat(totalPaymentAmountIDR));
    $('.postingJournal-accountNominalDebit, .postingJournal-accountNominalCredit').val(numberFormat(totalPaymentAmountIDR));
    calculateTotalDebitCreditJournalPosting();
}
//payment OTA end

//Cost Vendor
function generateJournalSubCostVendor(dataJournalSub, isJournalPosted = 0) {
    let $tableBody  =	$('#costVendorTab-tableSubJournal > tbody'),
        columnNumber=	$('#costVendorTab-tableSubJournal > thead > tr > th').length;
    if(dataJournalSub.length > 0) {
        let rowTable                =   '',
            totalCostAmount         =   totalJournalPostAmount  =   0,
            totalCheckedSubJournal  =   0;

        $.each(dataJournalSub, function(index, journalSub){
            let isSubJournalPosted  =   journalSub.ISSUBJOURNALPOSTED == 1 ? 1 : 0,
                checkedCb           =   isSubJournalPosted == 1 ? 'checked' : '',
                badgeStatusRow      =   '-',
                costAmount          =   journalSub.COSTAMOUNT ? parseFloat(journalSub.COSTAMOUNT) : 0,
                journalPostAmount   =   journalSub.JOURNALPOSTAMOUNT ? parseFloat(journalSub.JOURNALPOSTAMOUNT) : 0;

            if(costAmount != journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-danger">Not Match, Posted</span>' : '<span class="badge badge-info">Not Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Pending</span>';
                }
            } else if(costAmount == journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-success">Match, Posted</span>' : '<span class="badge badge-info">Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Match, Pending</span>';
                }
            }

            rowTable    +=  '<tr>\
                                <td><label class="adomx-checkbox"><input type="checkbox" name="costVendorTab-cbSubJournal[]" class="costVendorTab-cbSubJournal" value="'+journalSub.IDRESERVATIONDETAILS+'" '+checkedCb+'> <i class="icon"></i></label></td>\
                                <td>'+journalSub.REFFNUMBER+'</td>\
                                <td>'+journalSub.BOOKINGCODE+'</td>\
                                <td>'+journalSub.CUSTOMERNAME+'</td>\
                                <td>'+journalSub.RESERVATIONTITLE+'</td>\
                                <td>'+journalSub.PRODUCTNAME+'</td>\
                                <td class="text-right">'+numberFormat(costAmount)+'</td>\
                                <td class="text-right">'+numberFormat(journalPostAmount)+'</td>\
                                <td>'+badgeStatusRow+'</td>\
                            </tr>';
            totalCostAmount         += costAmount;
            totalJournalPostAmount  += journalPostAmount;

            if(isSubJournalPosted == 1) totalCheckedSubJournal++;
        });

        $tableBody.html(rowTable);
        calculateTotalSelectedCostSubVendor();
        $('#costVendorTab-totalJournalPostAmount').html(numberFormat(totalJournalPostAmount));
        $("#costVendorTab-cbCheckAllSub").prop("checked", totalCheckedSubJournal > 0 && totalCheckedSubJournal === dataJournalSub.length);
        activateOnClickCheckBoxAllCostVendor();
        calculateTotalDebitCreditJournalPosting();
    } else {
        $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
    }
}

function activateOnClickCheckBoxAllCostVendor() {
	$("#costVendorTab-cbCheckAllSub").off('click');
    $("#costVendorTab-cbCheckAllSub").on('click', function () {
        let thisChecked = this.checked;
        $(".costVendorTab-cbSubJournal").prop("checked", thisChecked);
        calculateTotalSelectedCostSubVendor();
    });

    $(".costVendorTab-cbSubJournal").off('click');
    $(".costVendorTab-cbSubJournal").on('click', function () {
        let totalReservationCostVendor = $(".costVendorTab-cbSubJournal").length,
            totalReservationCostVendorChecked = $(".costVendorTab-cbSubJournal:checked").length;
        $("#costVendorTab-cbCheckAllSub").prop("checked", totalReservationCostVendor == totalReservationCostVendorChecked);
        calculateTotalSelectedCostSubVendor();
    });
}

function calculateTotalSelectedCostSubVendor() {
    let totalCostAmount      =   0;

    $.each($(".costVendorTab-cbSubJournal:checked"), function(index, elem){
        let costAmount   =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
        totalCostAmount      += costAmount;
    });

    $('#costVendorTab-totalCostAmount').html(numberFormat(totalCostAmount));
    $('.postingJournal-accountNominalDebit, .postingJournal-accountNominalCredit').val(numberFormat(totalCostAmount));
    calculateTotalDebitCreditJournalPosting();
}
//Cost Vendor end

//Payment Vendor
function generateJournalSubPaymentVendor(dataJournalSub, isJournalPosted = 0) {
    let $tableBody  =	$('#paymentVendorTab-tableSubJournal > tbody'),
        columnNumber=	$('#paymentVendorTab-tableSubJournal > thead > tr > th').length;
    if(dataJournalSub.length > 0) {
        let rowTable                =   '',
            totalPaymentAmount      =   totalJournalPostAmount  =   0,
            totalCheckedSubJournal  =   0;

        $.each(dataJournalSub, function(index, journalSub){
            let isSubJournalPosted  =   journalSub.ISSUBJOURNALPOSTED == 1 ? 1 : 0,
                checkedCb           =   isSubJournalPosted == 1 ? 'checked' : '',
                badgeStatusRow      =   '-',
                paymentAmount       =   journalSub.PAYMENTAMOUNT ? parseFloat(journalSub.PAYMENTAMOUNT) : 0,
                journalPostAmount   =   journalSub.JOURNALPOSTAMOUNT ? parseFloat(journalSub.JOURNALPOSTAMOUNT) : 0;

            if(paymentAmount != journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-danger">Not Match, Posted</span>' : '<span class="badge badge-info">Not Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Pending</span>';
                }
            } else if(paymentAmount == journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-success">Match, Posted</span>' : '<span class="badge badge-info">Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Match, Pending</span>';
                }
            }

            rowTable    +=  '<tr>\
                                <td><label class="adomx-checkbox"><input type="checkbox" name="paymentVendorTab-cbSubJournal[]" class="paymentVendorTab-cbSubJournal" value="'+journalSub.IDRESERVATIONDETAILS+'" '+checkedCb+'> <i class="icon"></i></label></td>\
                                <td>'+journalSub.REFFNUMBER+'</td>\
                                <td>'+journalSub.BOOKINGCODE+'</td>\
                                <td>'+journalSub.CUSTOMERNAME+'</td>\
                                <td>'+journalSub.RESERVATIONTITLE+'</td>\
                                <td>'+journalSub.PRODUCTNAME+'</td>\
                                <td class="text-right">'+numberFormat(paymentAmount)+'</td>\
                                <td class="text-right">'+numberFormat(journalPostAmount)+'</td>\
                                <td>'+badgeStatusRow+'</td>\
                            </tr>';
            totalPaymentAmount      += paymentAmount;
            totalJournalPostAmount  += journalPostAmount;

            if(isSubJournalPosted == 1) totalCheckedSubJournal++;
        });

        $tableBody.html(rowTable);
        calculateTotalSelectedPaymentSubVendor();
        $('#paymentVendorTab-totalJournalPostAmount').html(numberFormat(totalJournalPostAmount));
        $("#paymentVendorTab-cbCheckAllSub").prop("checked", totalCheckedSubJournal > 0 && totalCheckedSubJournal === dataJournalSub.length);
        activateOnClickCheckBoxAllPaymentVendor();
        calculateTotalDebitCreditJournalPosting();
    } else {
        $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
    }
}

function activateOnClickCheckBoxAllPaymentVendor() {
	$("#paymentVendorTab-cbCheckAllSub").off('click');
    $("#paymentVendorTab-cbCheckAllSub").on('click', function () {
        let thisChecked = this.checked;
        $(".paymentVendorTab-cbSubJournal").prop("checked", thisChecked);
        calculateTotalSelectedPaymentSubVendor();
    });

    $(".paymentVendorTab-cbSubJournal").off('click');
    $(".paymentVendorTab-cbSubJournal").on('click', function () {
        let totalReservationPaymentVendor = $(".paymentVendorTab-cbSubJournal").length,
            totalReservationPaymentVendorChecked = $(".paymentVendorTab-cbSubJournal:checked").length;
        $("#paymentVendorTab-cbCheckAllSub").prop("checked", totalReservationPaymentVendor == totalReservationPaymentVendorChecked);
        calculateTotalSelectedPaymentSubVendor();
    });
}

function calculateTotalSelectedPaymentSubVendor() {
    let totalPaymentAmount      =   0;

    $.each($(".paymentVendorTab-cbSubJournal:checked"), function(index, elem){
        let paymentAmount   =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
        totalPaymentAmount  +=  paymentAmount;
    });

    $('#paymentVendorTab-totalPaymentAmount').html(numberFormat(totalPaymentAmount));
    $('.postingJournal-accountNominalDebit, .postingJournal-accountNominalCredit').val(numberFormat(totalPaymentAmount));
    calculateTotalDebitCreditJournalPosting();
}
//Payment Vendor end

//Cost Driver
function generateJournalSubCostDriver(dataJournalSub, isJournalPosted = 0) {
    let $tableBody  =	$('#costDriverTab-tableSubJournal > tbody'),
        columnNumber=	$('#costDriverTab-tableSubJournal > thead > tr > th').length;
    if(dataJournalSub.length > 0) {
        let rowTable                =   '',
            totalCostAmount         =   totalJournalPostAmount  =   0,
            totalCheckedSubJournal  =   0;

        $.each(dataJournalSub, function(index, journalSub){
            let isSubJournalPosted  =   journalSub.ISSUBJOURNALPOSTED == 1 ? 1 : 0,
                checkedCb           =   isSubJournalPosted == 1 ? 'checked' : '',
                badgeStatusRow      =   '-',
                costAmount          =   journalSub.COSTAMOUNT ? parseFloat(journalSub.COSTAMOUNT) : 0,
                journalPostAmount   =   journalSub.JOURNALPOSTAMOUNT ? parseFloat(journalSub.JOURNALPOSTAMOUNT) : 0;

            if(costAmount != journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-danger">Not Match, Posted</span>' : '<span class="badge badge-info">Not Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Pending</span>';
                }
            } else if(costAmount == journalPostAmount) {
                if(isJournalPosted == 1) {
                    badgeStatusRow  =   isSubJournalPosted == 1 ? '<span class="badge badge-success">Match, Posted</span>' : '<span class="badge badge-info">Match, Pending</span>';
                } else {
                    badgeStatusRow  =   '<span class="badge badge-info">Match, Pending</span>';
                }
            }

            rowTable    +=  '<tr>\
                                <td><label class="adomx-checkbox"><input type="checkbox" name="costDriverTab-cbSubJournal[]" class="costDriverTab-cbSubJournal" value="'+journalSub.IDRESERVATIONDETAILS+'" '+checkedCb+'> <i class="icon"></i></label></td>\
                                <td>'+journalSub.REFFNUMBER+'</td>\
                                <td>'+journalSub.BOOKINGCODE+'</td>\
                                <td>'+journalSub.CUSTOMERNAME+'</td>\
                                <td>'+journalSub.RESERVATIONTITLE+'</td>\
                                <td>'+journalSub.PRODUCTNAME+'</td>\
                                <td class="text-right">'+numberFormat(costAmount)+'</td>\
                                <td class="text-right">'+numberFormat(journalPostAmount)+'</td>\
                                <td>'+badgeStatusRow+'</td>\
                            </tr>';
            totalCostAmount         += costAmount;
            totalJournalPostAmount  += journalPostAmount;

            if(isSubJournalPosted == 1) totalCheckedSubJournal++;
        });

        $tableBody.html(rowTable);
        calculateTotalSelectedCostSubDriver();
        $('#costDriverTab-totalJournalPostAmount').html(numberFormat(totalJournalPostAmount));
        $("#costDriverTab-cbCheckAllSub").prop("checked", totalCheckedSubJournal > 0 && totalCheckedSubJournal === dataJournalSub.length);
        activateOnClickCheckBoxAllCostDriver();
        calculateTotalDebitCreditJournalPosting();
    } else {
        $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
    }
}

function activateOnClickCheckBoxAllCostDriver() {
	$("#costDriverTab-cbCheckAllSub").off('click');
    $("#costDriverTab-cbCheckAllSub").on('click', function () {
        let thisChecked = this.checked;
        $(".costDriverTab-cbSubJournal").prop("checked", thisChecked);
        calculateTotalSelectedCostSubDriver();
    });

    $(".costDriverTab-cbSubJournal").off('click');
    $(".costDriverTab-cbSubJournal").on('click', function () {
        let totalReservationCostDriver = $(".costDriverTab-cbSubJournal").length,
            totalReservationCostDriverChecked = $(".costDriverTab-cbSubJournal:checked").length;
        $("#costDriverTab-cbCheckAllSub").prop("checked", totalReservationCostDriver == totalReservationCostDriverChecked);
        calculateTotalSelectedCostSubDriver();
    });
}

function calculateTotalSelectedCostSubDriver() {
    let totalCostAmount      =   0;

    $.each($(".costDriverTab-cbSubJournal:checked"), function(index, elem){
        let costAmount   =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
        totalCostAmount      += costAmount;
    });

    $('#costDriverTab-totalCostAmount').html(numberFormat(totalCostAmount));
    $('.postingJournal-accountNominalDebit, .postingJournal-accountNominalCredit').val(numberFormat(totalCostAmount));
    calculateTotalDebitCreditJournalPosting();
}
//Cost Driver end

function activateOnchangeTabListOTAVendorDriver(dataRecapJournal) {
    $('#postingJournal-listOTAVendorDriver .nav-link').off('click');
    $('#postingJournal-listOTAVendorDriver .nav-link').on('click', function (e) {
        let typePostingJournal  =   $('a.postingJournalTab.active').data('typejournal'),
            dateJournal         =   $('#dateJournal').val(),
            idCompany           =   $('#optionCompany').val(),
            index               =   $(this).parent().index(),
            idSource            =   $(this).data('idsource'),
            idVendor            =   $(this).data('idvendor'),
            idDriver            =   $(this).data('iddriver'),
            idWithdrawalRecap   =   $(this).data('idwithdrawalrecap'),
            dataDetailJournal   =   dataRecapJournal[index],
            defaultCurrency     =   dataDetailJournal.DEFAULTCURRENCY != null && dataDetailJournal.DEFAULTCURRENCY != undefined ? dataDetailJournal.DEFAULTCURRENCY : '',
            isJournalPosted     =   parseInt(dataDetailJournal.ISJOURNALPOSTED),
            tabName             =   '',
            urlGetDataJournalSub=   '',
            $tableBody          =	null,
            columnNumber        =	0,
            dataSend            =   { dateJournal: dateJournal, idCompany: idCompany, idSource: idSource, idVendor: idVendor, idDriver: idDriver, idWithdrawalRecap: idWithdrawalRecap };
        generateDetailPostingJournal(index, dataRecapJournal);

        switch (typePostingJournal) {
            case 1:
                tabName             =   'revenueOTATab';
                urlGetDataJournalSub=   "getDataPostingJournalRevenueOTASub";
                break;
            case 2:
                tabName             =   'paymentOTATab';
                urlGetDataJournalSub=   "getDataPostingJournalPaymentOTASub";
                break;
            case 3:
                tabName             =   'costVendorTab';
                urlGetDataJournalSub=   "getDataPostingJournalCostVendorSub";
                break;
            case 4:
                tabName             =   'paymentVendorTab';
                urlGetDataJournalSub=   "getDataPostingJournalPaymentVendorSub";
                break;
            case 5:
                tabName             =   'costDriverTab';
                urlGetDataJournalSub=   "getDataPostingJournalCostDriverSub";
                break;
            case 5:
                tabName             =   'costDriverTab';
                urlGetDataJournalSub=   "getDataPostingJournalCostDriverSub";
                break;
            case 6:
                tabName             =   'paymentDriverTab';
                urlGetDataJournalSub=   "getDataPostingJournalPaymentDriverSub";
                break;
        }

        $tableBody          =	$('#' + tabName + '-tableSubJournal > tbody');
        columnNumber        =	$('#' + tabName + '-tableSubJournal > thead > tr > th').length;

        $.ajax({
            type: 'POST',
            url: baseURL + "postingJournal/" + urlGetDataJournalSub,
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
                $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">'+loaderElem+'</td></tr>');
                $('#postingJournal-accountTotalNominalDebit, #postingJournal-accountTotalNominalCredit').html(0);
                $("#window-loader").modal("show");

                switch (typePostingJournal) {
                    case 1:
                        $("#revenueOTATab-cbCheckAllSub").prop("checked", false);
                        $('#revenueOTATab-totalRevenueAmount, #revenueOTATab-totalRevenueAmountIDR, #revenueOTATab-totalJournalPostAmount').html(0);
                        break;
                    case 2:
                        $("#paymentOTATab-cbCheckAllSub").prop("checked", false);
                        $('#paymentOTATab-totalPaymentAmount, #paymentOTATab-totalPaymentAmountIDR, #paymentOTATab-totalJournalPostAmount').html(0);
                        break;
                    case 3:
                        $("#costVendorTab-cbCheckAllSub").prop("checked", false);
                        $('#costVendorTab-totalCostAmount, #costVendorTab-totalJournalPostAmount').html(0);
                        break;
                    case 4:
                        $("#paymentVendorTab-cbCheckAllSub").prop("checked", false);
                        $('#paymentVendorTab-totalPaymentAmount, #paymentVendorTab-totalJournalPostAmount').html(0);
                        break;
                    case 5:
                        $("#costDriverTab-cbCheckAllSub").prop("checked", false);
                        $('#costDriverTab-totalCostAmount, #costDriverTab-totalJournalPostAmount').html(0);
                        break;
                    case 6:
                        $("#paymentDriverTab-cbCheckAllSub").prop("checked", false);
                        $('#paymentDriverTab-totalPaymentAmount, #paymentDriverTab-totalJournalPostAmount').html(0);
                        break;
                }
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        var responseJSON    = jqXHR.responseJSON,
                            dataJournalSub  = responseJSON.dataJournalSub;
                        switch (typePostingJournal) {
                            case 1:
                                generateJournalSubRevenueOTA(dataJournalSub, defaultCurrency, isJournalPosted);
                                break;
                            case 2:
                                generateJournalSubPaymentOTA(dataJournalSub, defaultCurrency, isJournalPosted);
                                break;
                            case 3:
                                generateJournalSubCostVendor(dataJournalSub, isJournalPosted);
                                break;
                            case 4:
                                generateJournalSubPaymentVendor(dataJournalSub, isJournalPosted);
                                break;
                            case 5:
                                generateJournalSubCostDriver(dataJournalSub, isJournalPosted);
                                break;
                            case 6:
                                generateJournalSubPaymentDriver(dataJournalSub, isJournalPosted);
                                break;
                        }
                        break;
                    case 404:
                    default:
                        $tableBody.html('<tr><td colspan="' + columnNumber + '" align="center">No data available</td></tr>');
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

$("#postingJournal-saveJournal").off('click');
$("#postingJournal-saveJournal").on('click', function (e) {
    e.preventDefault();
    calculateTotalDebitCreditJournalPosting();

    let typePostingJournal          =   $('a.postingJournalTab.active').data('typejournal'),
        journalDescription          =   $('#postingJournal-journalDescription').val(),
        totalAccountDebit           =   $('.postingJournal-accountIdDebit').length,
        totalAccountCredit          =   $('.postingJournal-accountIdCredit').length,
        totalNominalAccountDebit    =   $('#postingJournal-accountTotalNominalDebit').text().replace(/,/g, ''),
        totalNominalAccountCredit   =   $('#postingJournal-accountTotalNominalCredit').text().replace(/,/g, ''),
        functionSaveJournal         =   '',
        warningMessage              =   '';

    if(journalDescription == '' || (journalDescription != '' && journalDescription.length < 5)) warningMessage += '- Journal <b>description</b> must be filled and at least 5 characters long.<br/>';
    if(totalAccountDebit == 0) warningMessage += '- Add at least one <b>debit account.</b><br/>';
    if(totalAccountCredit == 0) warningMessage += '- Add at least one <b>credit account.</b><br/>';
    if(totalNominalAccountDebit != totalNominalAccountCredit) warningMessage += '- Total debit and credit amounts must be <b>equal.</b><br/>';

    if(warningMessage != '') {
        showWarning(warningMessage);
    } else {
        let idCompany   =   $('#optionCompany').val(),
            idSource    =   $('#postingJournal-listOTAVendorDriver').find('.nav-link.active').data('idsource'),
            idVendor    =   $('#postingJournal-listOTAVendorDriver').find('.nav-link.active').data('idvendor'),
            idDriver    =   $('#postingJournal-listOTAVendorDriver').find('.nav-link.active').data('iddriver'),
            date        =   $('#dateJournal').val(),
            dataSend    =   {
                journalPostingType: typePostingJournal,
                idCompany: idCompany,
                idSource: idSource,
                idVendor: idVendor,
                idDriver: idDriver,
                date: date,
                nominal: totalNominalAccountDebit,
                description: journalDescription,
                arrAccountDetail: [],
                arrSubJournal: []
            };

        $('.postingJournal-accountIdDebit').each(function(index){
            let idAccount       =   $(this).val(),
                idJournalDetail =   $('.postingJournal-journalDetailIdDebit').eq(index).val(),
                description     =   $('.postingJournal-accountDescriptionDebit').eq(index).val(),
                nominal         =   parseFloat($('.postingJournal-accountNominalDebit').eq(index).val().replace(/,/g, ''));
            dataSend.arrAccountDetail.push([ idAccount, description, nominal, 0, idJournalDetail ]);
        });

        $('.postingJournal-accountIdCredit').each(function(index){
            let idAccount       =   $(this).val(),
                idJournalDetail =   $('.postingJournal-journalDetailIdCredit').eq(index).val(),
                description     =   $('.postingJournal-accountDescriptionCredit').eq(index).val(),
                nominal         =   parseFloat($('.postingJournal-accountNominalCredit').eq(index).val().replace(/,/g, ''));
            dataSend.arrAccountDetail.push([ idAccount, description, 0, nominal, idJournalDetail ]);
        });

        switch (typePostingJournal) {
            case 1:
                functionSaveJournal = "saveDataPostingJournalOTA";
                $.each($(".revenueOTATab-cbSubJournal:checked"), function(index, elem){
                    let idReservationPayment=   $(elem).val(),
                        nominalPayment      =   parseFloat($(elem).closest('tr').find('td').eq(8).text().replace(/,/g, ''));
                    dataSend.arrSubJournal.push([ idReservationPayment, nominalPayment ]);
                });
                break;
            case 2:
                functionSaveJournal = "saveDataPostingJournalOTA";
                $.each($(".paymentOTATab-cbSubJournal:checked"), function(index, elem){
                    let idReservationPayment=   $(elem).val(),
                        nominalPayment      =   parseFloat($(elem).closest('tr').find('td').eq(8).text().replace(/,/g, ''));
                    dataSend.arrSubJournal.push([ idReservationPayment, nominalPayment ]);
                });
                break;
            case 3:
                functionSaveJournal = "saveDataPostingJournalVendor";
                $.each($(".costVendorTab-cbSubJournal:checked"), function(index, elem){
                    let idReservationDetails=   $(elem).val(),
                        nominalPayment      =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
                    dataSend.arrSubJournal.push([ idReservationDetails, nominalPayment ]);
                });
                break;
            case 4:
                functionSaveJournal = "saveDataPostingJournalVendor";
                $.each($(".paymentVendorTab-cbSubJournal:checked"), function(index, elem){
                    let idReservationDetails=   $(elem).val(),
                        nominalPayment      =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
                    dataSend.arrSubJournal.push([ idReservationDetails, nominalPayment ]);
                });
                break;
            case 5:
                functionSaveJournal = "saveDataPostingJournalDriver";
                $.each($(".costDriverTab-cbSubJournal:checked"), function(index, elem){
                    let idReservationDetails=   $(elem).val(),
                        nominalCost         =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
                    dataSend.arrSubJournal.push([ idReservationDetails, nominalCost ]);
                });
                break;
            case 6:
                functionSaveJournal = "saveDataPostingJournalDriver";
                $.each($(".paymentDriverTab-cbSubJournal:checked"), function(index, elem){
                    let idReservationDetails=   $(elem).val(),
                        nominalCost         =   parseFloat($(elem).closest('tr').find('td').eq(6).text().replace(/,/g, ''));
                    dataSend.arrSubJournal.push([ idReservationDetails, nominalCost ]);
                });
                break;
        }
        
        $.ajax({
            type: 'POST',
            url: baseURL + "postingJournal/"+functionSaveJournal,
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
                var responseJSON    = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        toastr["info"](getMessageResponse(jqXHR));

                        let paramInitiate = {};
                        switch (typePostingJournal) {
                            case 1:
                            case 2:
                                paramInitiate = { idSource: idSource };
                                break;
                            case 3:
                            case 4:
                                paramInitiate = { idVendor: idVendor };
                                break;
                            case 5:
                            case 6:
                                paramInitiate = { idDriver: idDriver };
                                break;
                        }
                        getDataPostingJournal(typePostingJournal, paramInitiate);
                        break;
                    default:
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
});

//modal add account journal
function resetModalAddAccountJournal() {
    setOptionHelper('modalAddAccountJournal-optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
        setOptionHelper('modalAddAccountJournal-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAddJournalAccountEvent();
        }, firstValueAccountMain);
    });

    $('#modalAddAccountJournal-optionAccountMain').off('change');
    $('#modalAddAccountJournal-optionAccountMain').on('change', function (e) {
        var selectedValueAccountMain = this.value;
        setOptionHelper('modalAddAccountJournal-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAddJournalAccountEvent();
            $("#modalAddAccountJournal-optionAccountSub").select2();
        }, selectedValueAccountMain);
    });

    $('#modalAddAccountJournal-optionAccountSub').off('change');
    $('#modalAddAccountJournal-optionAccountSub').on('change', function (e) {
        afterSelectAddJournalAccountEvent();
    });

    return true;
}

function afterSelectAddJournalAccountEvent() {
    var accountType = 'main',
        selectedValue = '';
    if ($('#modalAddAccountJournal-optionAccountSub > option').length <= 0 && $('#modalAddAccountJournal-optionAccountSub > optgroup').length <= 0) {
        selectedValue = $("#modalAddAccountJournal-optionAccountMain").val();
        $("#modalAddAccountJournal-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        accountType = 'sub';
        selectedValue = $("#modalAddAccountJournal-optionAccountSub").val();
        $("#modalAddAccountJournal-optionAccountSub").prop('disabled', false);
    }

    var dataOptionHelper = JSON.parse(localStorage.getItem('optionHelper')),
        dataAccount = accountType == 'main' ? dataOptionHelper.dataAccountMain : dataOptionHelper.dataAccountSub,
        accountIndex = dataAccount.findIndex(elem => elem['ID'] == selectedValue),
        defaultDRCR = dataAccount[accountIndex].DEFAULTDRCR,
        defaultPlus = defaultDRCR == 'DR' ? 'Debit' : 'Credit',
        defaultMinus = defaultDRCR == 'DR' ? 'Credit' : 'Debit';
    $("#modalAddAccountJournal-textDefaultPositionPlus").html(defaultPlus);
    $("#modalAddAccountJournal-textDefaultPositionMinus").html(defaultMinus);

    return true;
}

 $('#modalAddAccountJournal').off('show.bs.modal');
 $('#modalAddAccountJournal').on('show.bs.modal', function (e) {
    let accountPosition =   $(e.relatedTarget).data('debitcredit');
    $("#modalAddAccountJournal-drCrPosition").val(accountPosition);
});

$("#modalAddAccountJournalForm").off('submit');
$("#modalAddAccountJournalForm").on("submit", function (e) {
    e.preventDefault();
    var idAccountMain       = $('#modalAddAccountJournal-optionAccountMain').val(),
        idAccountSub        = $('#modalAddAccountJournal-optionAccountSub').val(),
        idAccount           = idAccountSub == '0' ? idAccountMain : idAccountSub,
        textAccountMain     = $('#modalAddAccountJournal-optionAccountMain option:selected').text(),
        arrTextAccountMain  = textAccountMain.split(' '),
        accountNameMain     = arrTextAccountMain.splice(0, 1),
        accountNameMain     = arrTextAccountMain.join(' '),
        textAccountSub      = $('#modalAddAccountJournal-optionAccountSub option:selected').text(),
        arrTextAccountSub   = textAccountSub.split(' '),
        accountNameSub      = arrTextAccountSub.splice(0, 1),
        accountNameSub      = arrTextAccountSub.join(' '),
        accountName         = idAccountSub == '0' ? accountNameMain : accountNameSub,
        drCrPosition        = $("#modalAddAccountJournal-drCrPosition").val(),
        drCrTypeStr         = drCrPosition == 'DR' ? 'Debit' : 'Credit',
        elemExist           = $(".postingJournal-accountId[value='" + idAccount + "']");

    if (elemExist.length > 0) {
        let accountPosition =   elemExist.data('drcrtypestr');
        showWarning('Account already exists in the <b>' + accountPosition + '</b> list.<br/>Please choose another account.');
    } else {
        var $tableAccount   =	$('#postingJournal-accountContainer' + drCrTypeStr),
            rowAccount      =   generateRowAccountPostingJournal(drCrTypeStr, idAccount, idJournalDetailDefault, accountName);

        $('.postingJournal-emptyAccountRow'+drCrTypeStr).remove();
        $tableAccount.append(rowAccount);
        $("#modalAddAccountJournal").modal("hide");
    }
});
//modal add account journal - end

function getExchangeRateToIDR(currency) {
    let exchangeRate    =   1;
    return 1;
}

postingJournalFunc();