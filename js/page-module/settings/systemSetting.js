var $confirmDialog                  =   $('#modal-confirm-action'),
    postingJournalAccountRowEmpty   =   '<tr class="postingJournalAccountRowEmpty"><td colspan="3" class="text-center">No data available</td></tr>';

if (systemSettingFunc == null) {
    var systemSettingFunc = function () {
        $(document).ready(function () {
            getDataSettingBasic(1, [1, 2]);
        });
    }
}

$('a.systemSettingTab[data-toggle="tab"]').off('shown.bs.tab');
$('a.systemSettingTab[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var typeSetting = $(e.target).data('typesetting');
    switch (typeSetting) {
        case 1:
            getDataSettingBasic(typeSetting, [1, 2]);
            break;
        case 2:
            getDataSettingBasic(typeSetting, [3]);
            break;
        case 5:
            $("#postingJournalAccountsTab-listPostingJournalType .nav-link").off('click');
            $('#postingJournalAccountsTab-listPostingJournalType .nav-link').on('click', function (e) {
                let idJournalPostingType = $(this).data('idjournalpostingtype');
                getDataPostingJournalAccounts(idJournalPostingType);
            });
            resetModalPostingJournalAccounts();
            getDataPostingJournalAccounts();
            break;
    }
});

function getDataSettingBasic(typeSetting, arrIdSystemSetting) {
    var dataSend = { arrIdSystemSetting: arrIdSystemSetting };
    $.ajax({
        type: 'POST',
        url: baseURL + "settings/systemSetting/getDataSystemSetting",
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
            initializedFormSetting(typeSetting);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    generateFormSystemSetting(typeSetting, responseJSON);
                    break;
                case 404:
                default:
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function initializedFormSetting(typeSetting) {
    switch (typeSetting) {
        case 1:
            $(".basicSettingTab-settingName, .basicSettingTab-settingDescription").html("");
            $("#basicSettingTab-initialDate, #basicSettingTab-profitLossAccount").val("");
            break;
        case 2:
            $("#cashFlowTab-tableDataChartOfCashAccount > tbody").html('<tr><td colspan="5" class="text-center">No data found</td></tr>');
            $("#cashFlowTab-containerGeneralAccountList").html("");
            break;
    }
}

function generateFormSystemSetting(typeSetting, responseJSON) {
    var dataSystemSetting = responseJSON.dataSystemSetting;
    switch (typeSetting) {
        case 1:
            var idAccountCurrentProfitLoss = false,
                idAccountParent = false,
                levelAccount = 2;
            $.each(dataSystemSetting, function (index, array) {
                var idSystemSettings = array.IDSYSTEMSETTINGS;
                $(".basicSettingTab-settingName[data-idSystemSettings=" + array.IDSYSTEMSETTINGS + "]").html(array.NAME);
                $(".basicSettingTab-settingDescription[data-idSystemSettings=" + array.IDSYSTEMSETTINGS + "]").html(array.DESCRIPTION);

                switch (idSystemSettings) {
                    case 1:
                    case "1":
                        var initialDate = array.DATASETTING,
                            initialDate = moment(initialDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
                        $("#basicSettingTab-initialDate").val(initialDate);
                        break;
                    case 2:
                    case "2":
                        var dataSetting = array.DATASETTING,
                            idAccount = dataSetting.IDACCOUNT;
                        idAccountParent = dataSetting.IDACCOUNTPARENT;
                        levelAccount = dataSetting.ACCOUNTLEVEL;
                        idAccountCurrentProfitLoss = idAccount;
                        $("#basicSettingTab-profitLossAccount").val(dataSetting.ACCOUNTCODE + ' - ' + dataSetting.ACCOUNTNAME).attr('data-idAccount', dataSetting.IDACCOUNT);
                        break;
                }
            });
            enableInputSystemSettingBasic(levelAccount, idAccountCurrentProfitLoss, idAccountParent);
            break;
        case 2:
            let arrIdAccountsCashFlow   =   dataSystemSetting.arrIdAccountsCashFlow;
                dataAccountsCashFlow    =   dataSystemSetting.dataAccountsCashFlow;
                dataCashFlowSection     =   dataSystemSetting.dataCashFlowSection;
                rowCashAccount          =   '';
            $.each(dataAccountsCashFlow, function(index, array){
                rowCashAccount  +=  generateRowCashFlowAccount(array.IDACCOUNT, array.ACCOUNTCODE, array.ACCOUNTNAME, array.DEFAULTDRCR);
            });

            if(rowCashAccount == '') rowCashAccount  =   '<tr><td colspan="4" class="text-center">No data found</td></tr>';
            $("#cashFlowTab-tableDataChartOfCashAccount > tbody").html(rowCashAccount);
            $("#cashFlowTab-arrIdAccountsCashFlow").val(JSON.stringify(arrIdAccountsCashFlow));

            let sectionElem =   '';
            $.each(dataCashFlowSection, function(indexSection, arraySection){
                let generalAccountList  =   arraySection.generalAccountList,
                    rowGeneralAccount   =   '',
                    classMarginTop      =   indexSection > 0 ? 'mt-20' : '';
                
                $.each(generalAccountList, function(index, arrayGeneralAccount){
                    let idAccountGeneral    =   arrayGeneralAccount.IDACCOUNTGENERAL,
                        dropDownMoveSection =   '';
                    dataCashFlowSection.map(itemCashFlowSection => {
                        let itemCashFlowSectionName =   itemCashFlowSection.sectionName;
                        if (itemCashFlowSectionName !== arraySection.sectionName) {
                            dropDownMoveSection +=  '<span class="dropdown-item toSection'+itemCashFlowSectionName.replace(/\s+/g, '')+'" onclick="moveToSectionCashFlow(\''+idAccountGeneral+'\', \'' + arraySection.sectionName + '\', \'' + itemCashFlowSectionName + '\')">'+
                                                        'Move to ' + itemCashFlowSectionName +
                                                    '</span>';
                        }
                    });

                    rowGeneralAccount   +=  '<div class="list-group-item py-1" data-id="'+idAccountGeneral+'">'+
                                                '<i class="fa fa-arrows mr-2 pt-2" aria-hidden="true"></i>'+
                                                '<b class="text-primary">'+arrayGeneralAccount.ACCOUNTCODE+' - '+arrayGeneralAccount.ACCOUNTNAME+'</b>'+
                                                '<div class="dropdown dropleft d-inline-flex pull-right">'+
                                                    '<button class="btn btn-primary dropdown-toggle btn-sm" type="button" data-toggle="dropdown"" aria-haspopup="true" aria-expanded="false">'+
                                                        '<span class="caret"></span>'+
                                                    '</button>' +
                                                    '<div class="dropdown-menu" style="font-size: .8rem;">'+
                                                        dropDownMoveSection+
                                                    '</div>' +
                                                '</div>'+
                                            '</div>';
                });
                
                sectionElem +=  '<div class="row rounded-lg systemSettingCardElement cashFlowTab-generalAccountSection '+classMarginTop+'">'+
                                    '<div class="col-sm-12 pt-10 pb-10">'+
                                        '<h6 class="font-weight-bold mb-10 pb-10 border-bottom cashFlowTab-generalAccountSectionTitle">'+arraySection.sectionName+'</h6>'+
                                        '<div id="cashFlowTab-sortableGeneralAccount'+arraySection.sectionName.replace(/\s+/g, '')+'" class="list-group">'+
                                            rowGeneralAccount+
                                        '</div>'+
                                    '</div>'+
                                '</div>';
            });
            $('#cashFlowTab-containerGeneralAccountList').html(sectionElem);

            let sortableGeneralAccount  =   {};
            $.each(dataCashFlowSection, function(indexSection, arraySection){
                let sectionName                 =   arraySection.sectionName,
                    keySortableGeneralAccount   = 'sortableGeneralAccount'+sectionName.replace(/\s+/g, '');
                sortableGeneralAccount[keySortableGeneralAccount]   =    Sortable.create(
                                                                            document.getElementById('cashFlowTab-sortableGeneralAccount'+sectionName.replace(/\s+/g, '')), {
                                                                                animation: 150
                                                                            }
                                                                        );                
            });
            enableOnClickSaveCashFlowAccountSetting(sortableGeneralAccount);
            break;
    }
}

// Basic Setting
function enableInputSystemSettingBasic(levelAccount, idAccountCurrentProfitLoss, idAccountParent) {
    $('#basicSettingTab-profitLossAccount').off('focus');
    $('#basicSettingTab-profitLossAccount').on('focus', function (e) {
        setOptionHelper('modalSettingBasic-optionAccountMain', 'dataAccountMain', levelAccount == 2 ? idAccountCurrentProfitLoss : idAccountParent, function (firstValueAccountMain) {
            setOptionHelper('modalSettingBasic-optionAccountSub', 'dataAccountSub', levelAccount == 3 ? idAccountCurrentProfitLoss : false, function () {
                afterSelectAccountEvent();
            }, idAccountCurrentProfitLoss == false ? firstValueAccountMain : levelAccount == 3 ? idAccountParent : idAccountCurrentProfitLoss);
        });

        $('#modalSettingBasic-optionAccountMain').off('change');
        $('#modalSettingBasic-optionAccountMain').on('change', function (e) {
            var selectedValueAccountMain = this.value;
            setOptionHelper('modalSettingBasic-optionAccountSub', 'dataAccountSub', false, function () {
                afterSelectAccountEvent();
                $("#modalSettingBasic-optionAccountSub").select2({
                    dropdownParent: $("#modalSettingBasic-chooseAccount")
                });
            }, selectedValueAccountMain);
        });

        $('#modalSettingBasic-optionAccountMain').select2({
            dropdownParent: $("#modalSettingBasic-chooseAccount")
        });
        $("#modalSettingBasic-chooseAccount").modal("show");
    });

    $("#form-modalSettingBasic-chooseAccount").off('submit');
    $("#form-modalSettingBasic-chooseAccount").on("submit", function (e) {
        e.preventDefault();
        var levelAccount = $('#modalSettingBasic-optionAccountSub').is(':disabled') ? 2 : 3,
            $optionAccount = levelAccount == 2 ? $("#modalSettingBasic-optionAccountMain") : $('#modalSettingBasic-optionAccountSub'),
            idAccountParent = levelAccount == 3 ? $("#modalSettingBasic-optionAccountMain").val() : false,
            idAccount = $optionAccount.val(),
            accountCodeName = $optionAccount.find('option:selected').text();
        $("#basicSettingTab-profitLossAccount").val(accountCodeName).attr('data-idAccount', idAccount);
        $("#modalSettingBasic-chooseAccount").modal("hide");
        enableInputSystemSettingBasic(levelAccount, idAccount, idAccountParent);
    });

    $("#basicSettingTab-btnSaveSetting").off('click');
    $("#basicSettingTab-btnSaveSetting").on("click", function (e) {
        e.preventDefault();
        var liDetailSetting = '',
            arrJsonSend = [],
            arrIdSystemSettings = [];
        $('.basicSettingTab-settingName').each(function () {
            var settingName = $(this).html(),
                idSystemSettings = $(this).attr('data-idSystemSettings'),
                systemSettingValue = $('input.basicSettingTab-inputValue[data-idSystemSettings=' + idSystemSettings + ']').val(),
                systemSettingValueStr = systemSettingValue;

            switch (idSystemSettings) {
                case 1:
                case "1":
                    systemSettingValueStr = moment(systemSettingValueStr, 'DD-MM-YYYY').format('DD MMM YYYY');
                    arrJsonSend.push([idSystemSettings, systemSettingValue]);
                    break;
                case 2:
                case "2":
                    var idAccount = $('input.basicSettingTab-inputValue[data-idSystemSettings=' + idSystemSettings + ']').attr('data-idAccount');
                    arrJsonSend.push([idSystemSettings, idAccount]);
                    break;
            }
            arrIdSystemSettings.push(idSystemSettings);
            liDetailSetting += '<li> <span>' + settingName + '</span> <span><b>' + systemSettingValueStr + '</b></span> </li>';
        });
        showModalConfirmation(liDetailSetting, JSON.stringify(arrJsonSend), 1, JSON.stringify(arrIdSystemSettings));
    });
}

function afterSelectAccountEvent() {
    if ($('#modalSettingBasic-optionAccountSub > option').length <= 0 && $('#modalSettingBasic-optionAccountSub > optgroup').length <= 0) {
        $("#modalSettingBasic-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        $("#modalSettingBasic-optionAccountSub").prop('disabled', false);
    }
    return true;
}
// Basic Setting

// Cash Flow Account Setting
function generateRowCashFlowAccount(idAccount, accountCode, accountName, defaultDrCr) {
    let btnDelete   =   '<i class="text-info fa fa-trash text16px" onclick="confirmDeleteCashFlowAccount(\'' + idAccount + '\', \'' + accountCode + '\', \'' + accountName + '\')"></i>';
    return  '<tr data-idAccount="' + idAccount + '">' +
                '<td>'+accountCode+'</td>' +
                '<td>'+accountName+'</td>' +
                '<td>'+defaultDrCr+'</td>' +
                '<td class="text-center">'+btnDelete+'</td>' +
            '</tr>';
}

$('#modalCashFlow-addAccount').off('shown.bs.modal');
$('#modalCashFlow-addAccount').on('shown.bs.modal', function (e) {
    setOptionHelper('modalCashFlow-addAccount-optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
        setOptionHelper('modalCashFlow-addAccount-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAccountCashFlowEvent();
        }, firstValueAccountMain);
    });

    $('#modalCashFlow-addAccount-optionAccountMain').off('change');
    $('#modalCashFlow-addAccount-optionAccountMain').on('change', function (e) {
        var selectedValueAccountMain = this.value;
        setOptionHelper('modalCashFlow-addAccount-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectAccountCashFlowEvent();
            $("#modalCashFlow-addAccount-optionAccountSub").select2();
        }, selectedValueAccountMain);
    });

    $('#modalCashFlow-addAccount-optionAccountSub').off('change');
    $('#modalCashFlow-addAccount-optionAccountSub').on('change', function (e) {
        afterSelectAccountCashFlowEvent();
    });

    return true;
});

function afterSelectAccountCashFlowEvent() {
    if ($('#modalCashFlow-addAccount-optionAccountSub > option').length <= 0 && $('#modalCashFlow-addAccount-optionAccountSub > optgroup').length <= 0) {
        $("#modalCashFlow-addAccount-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        $("#modalCashFlow-addAccount-optionAccountSub").prop('disabled', false);
    }
    return true;
}

$("#modalCashFlow-addAccount-form").off('submit');
$("#modalCashFlow-addAccount-form").on("submit", function (e) {
    e.preventDefault();
    var idAccountMain   =   $('#modalCashFlow-addAccount-optionAccountMain').val(),
        idAccountSub    =   $('#modalCashFlow-addAccount-optionAccountSub').val(),
        idAccount       =   idAccountSub == '0' ? idAccountMain : idAccountSub,
        textAccountMain =   $('#modalCashFlow-addAccount-optionAccountMain option:selected').text(),
        textAccountSub  =   $('#modalCashFlow-addAccount-optionAccountSub option:selected').text(),
        accountCodeName =   idAccountSub == '0' ? textAccountMain : textAccountSub,
        firstSpaceIndex =   accountCodeName.indexOf(' '),
        accountCode     =   accountCodeName.slice(0, firstSpaceIndex),
        accountName     =   accountCodeName.slice(firstSpaceIndex + 1),
        dataOptionHelper=   JSON.parse(localStorage.getItem('optionHelper')),
        dataAccount     =   idAccountSub == '0' ? dataOptionHelper.dataAccountMain : dataOptionHelper.dataAccountSub,
        accountIndex    =   dataAccount.findIndex(elem => elem['ID'] == idAccount),
        defaultDRCR     =   dataAccount[accountIndex].DEFAULTDRCR,
        isAccountExist  =   $("#cashFlowTab-tableDataChartOfCashAccount > tbody").find('tr[data-idAccount="' + idAccount + '"]').length > 0;
    
    if(isAccountExist) {
        showWarning('Account already exists in the cash flow account list.');
    } else {
        let rowCashAccount          =   generateRowCashFlowAccount(idAccount, accountCode, accountName, defaultDRCR),
            arrIdAccountsCashFlow   =   JSON.parse($("#cashFlowTab-arrIdAccountsCashFlow").val());
        arrIdAccountsCashFlow.push(idAccount);
        $("#cashFlowTab-tableDataChartOfCashAccount > tbody").append(rowCashAccount);
        $("#cashFlowTab-arrIdAccountsCashFlow").val(JSON.stringify(arrIdAccountsCashFlow));
        $("#modalCashFlow-addAccount").modal("hide");
    }
});

function confirmDeleteCashFlowAccount(idAccount, accountCode, accountName) {
    var confirmText = 'This account will be deleted from the cash flow. Details ;<br/><br/>' +
        '<div class="order-details-customer-info">' +
        '<ul>' +
        '<li> <span>Account Code</span> <span><b>' + accountCode + '</b></span> </li>' +
        '<li> <span>Account Name</span> <span><b>' + accountName + '</b></span> </li>' +
        '</ul>' +
        '</div>' +
        '<br/>Are you sure?';
    
    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-idAccount', idAccount);
    $confirmDialog.off('show.bs.modal');
    $confirmDialog.on('show.bs.modal', function() {
        $('#confirmBtn').off('click');
        $('#confirmBtn').on('click', function (e) {
            let idAccount               =   $confirmDialog.find('#confirmBtn').attr('data-idAccount'),
                arrIdAccountsCashFlow   =   JSON.parse($("#cashFlowTab-arrIdAccountsCashFlow").val());
            arrIdAccountsCashFlow       =   arrIdAccountsCashFlow.filter(item => item !== idAccount);
            $("#cashFlowTab-arrIdAccountsCashFlow").val(JSON.stringify(arrIdAccountsCashFlow));
            $("#cashFlowTab-tableDataChartOfCashAccount > tbody").find('tr[data-idAccount="' + idAccount + '"]').remove();
            if($("#cashFlowTab-tableDataChartOfCashAccount > tbody > tr").length == 0) $("#cashFlowTab-tableDataChartOfCashAccount > tbody").html('<tr><td colspan="4" class="text-center">No data found</td></tr>');
            $confirmDialog.modal('hide');
        });	
    });
    $confirmDialog.modal('show');
}

function moveToSectionCashFlow(idAccountGeneral, fromSectionName, toSectionName) {
    let fromSortable    =   Sortable.get(document.getElementById('cashFlowTab-sortableGeneralAccount'+fromSectionName.replace(/\s+/g, ''))),
        toSortable      =   Sortable.get(document.getElementById('cashFlowTab-sortableGeneralAccount'+toSectionName.replace(/\s+/g, ''))),
        itemElem        =   fromSortable.el.querySelector('[data-id="'+idAccountGeneral+'"]');
    
    let dropDownMoveSection = '';
    dataCashFlowSection.map(itemCashFlowSection => {
        let itemCashFlowSectionName = itemCashFlowSection.sectionName;
        if (itemCashFlowSectionName !== toSectionName) {
            dropDownMoveSection += '<span class="dropdown-item toSection'+itemCashFlowSectionName.replace(/\s+/g, '')+'" onclick="moveToSectionCashFlow(\''+idAccountGeneral+'\', \'' + toSectionName + '\', \'' + itemCashFlowSectionName + '\')">'+
                                        'Move to ' + itemCashFlowSectionName +
                                    '</span>';
        }
    });
    
    itemElem.querySelector('.dropdown-menu').innerHTML = dropDownMoveSection;    
    toSortable.el.appendChild(itemElem);
}

function enableOnClickSaveCashFlowAccountSetting(sortableGeneralAccount) {
    $("#cashFlowTab-btnSaveSetting").off('click');
    $("#cashFlowTab-btnSaveSetting").on("click", function (e) {
        e.preventDefault();
        var liDetailSetting         =   '<li> <span>Cash Flow Account</span> <span><b>As Listed</b></span> </li>'+
                                        '<li> <span>Account Section</span> <span><b>As Shown</b></span> </li>',
            arrIdAccountsCashFlow   =   JSON.parse($("#cashFlowTab-arrIdAccountsCashFlow").val()),
            arrCashFlowSectionData  =   [];

        $.each(sortableGeneralAccount, function(key, instanceSortable){
            let sortableElement     =   instanceSortable.el,
                parentSection       =   $(sortableElement).closest('.cashFlowTab-generalAccountSection'),
                sectionTitle        =   parentSection.find('.cashFlowTab-generalAccountSectionTitle').html(),
                generalAccountList  =   instanceSortable.toArray(),
                sectionData         =   {
                    sectionName: sectionTitle,
                    generalAccountList: generalAccountList
                };
            
            arrCashFlowSectionData.push(sectionData);
        });

        let arrJsonSend =   [[3,{arrIdAccountsCashFlow:arrIdAccountsCashFlow,dataCashFlowSection:arrCashFlowSectionData}]];
        showModalConfirmation(liDetailSetting, JSON.stringify(arrJsonSend), 1, JSON.stringify([3]));
    });
}
// Cash Flow Account Setting

function showModalConfirmation(liDetailSetting, arrJsonSend, typeSetting, arrIdSystemSettings) {
    var confirmText = 'Update system settings with details ;<br/><br/>' +
        '<div class="order-details-customer-info">' +
        '<ul>' + liDetailSetting + '</ul>' +
        '</div>' +
        '<br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-arrJsonSend', arrJsonSend).attr('data-typeSetting', typeSetting).attr('data-arrIdSystemSettings', arrIdSystemSettings).attr('data-function', "updateSystemSettings");
    $confirmDialog.modal('show');
    activateConfirmBtnClick();
}

function activateConfirmBtnClick() {
    $('#confirmBtn').off('click');
    $('#confirmBtn').on('click', function (e) {
        var funcName = $confirmDialog.find('#confirmBtn').attr('data-function'),
            arrJsonSend = $confirmDialog.find('#confirmBtn').attr('data-arrJsonSend'),
            typeSetting = $confirmDialog.find('#confirmBtn').attr('data-typeSetting'),
            arrIdSystemSettings = $confirmDialog.find('#confirmBtn').attr('data-arrIdSystemSettings'),
            arrIdSystemSettings = JSON.parse(arrIdSystemSettings),
            dataSend = { arrJsonSend: JSON.parse(arrJsonSend) };

        $.ajax({
            type: 'POST',
            url: baseURL + "settings/systemSetting/" + funcName,
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
                        getDataSettingBasic(typeSetting, arrIdSystemSettings);
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
}

// Posting Journal Accounts
function getDataPostingJournalAccounts(idJournalPostingType = false) {
    idJournalPostingType    =   idJournalPostingType || $("#postingJournalAccountsTab-listPostingJournalType .nav-link.active").data('idjournalpostingtype');
    let $tableAccountDebit  =	$('#postingJournalAccountsTab-tableAccountDebit > tbody'),
        $tableAccountCredit =	$('#postingJournalAccountsTab-tableAccountCredit > tbody'),
        loaderElem          =   '<span class="mt-20 mb-20 mx-auto"><i class="fa fa-spinner fa-pulse"></i><br/>Loading data...</span>',
        dataSend            =   {idJournalPostingType:idJournalPostingType};
    $.ajax({
        type: 'POST',
        url: baseURL + "settings/systemSetting/getDataPostingJournalAccounts",
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
            $tableAccountDebit.html('<tr><td colspan="4" class="text-center">' + loaderElem + '</td></tr>');
            $tableAccountCredit.html('<tr><td colspan="4" class="text-center">' + loaderElem + '</td></tr>');
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON    =   jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    let dataPostingJournalAccountsDebit =   responseJSON.dataPostingJournalAccountsDebit,
                        dataPostingJournalAccountsCredit=   responseJSON.dataPostingJournalAccountsCredit;

                    if(dataPostingJournalAccountsDebit.length > 0) {
                        let rowAccountDebit =   generateRowTablePostingJournalAccount(dataPostingJournalAccountsDebit, 'DR');
                        $tableAccountDebit.html(rowAccountDebit);
                    } else {
                        $tableAccountDebit.html(postingJournalAccountRowEmpty);
                    }

                    if(dataPostingJournalAccountsCredit.length > 0) {
                        let rowAccountCredit=   generateRowTablePostingJournalAccount(dataPostingJournalAccountsCredit, 'CR');
                        $tableAccountCredit.html(rowAccountCredit);
                    } else {
                        $tableAccountCredit.html(postingJournalAccountRowEmpty);
                    }              
                    break;
                case 404:
                default:
                    $tableAccountDebit.html(postingJournalAccountRowEmpty);
                    $tableAccountCredit.html(postingJournalAccountRowEmpty);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateRowTablePostingJournalAccount(dataPostingJournalAccounts, drCrType) {
    let rowAccount =   '';
    $.each(dataPostingJournalAccounts, function(index, arrayAccounts){
        rowAccount +=  generateRowAccountPostingJournal(arrayAccounts.IDACCOUNT, arrayAccounts.ACCOUNTCODE, arrayAccounts.ACCOUNTNAME, drCrType);
    });

    return rowAccount;
}

function generateRowAccountPostingJournal(idAccount, accountCode, accountName, drCrType) {
    return '<tr class="postingJournalAccountRow" data-idAccount="'+idAccount+'">'+
                '<td>'+accountCode+'</td>'+
                '<td>'+accountName+'</td>'+
                '<td class="text-center"><i class="text-info fa fa-trash text16px" onclick="deletePostingJournalAccount(\'' + idAccount + '\', \'' + drCrType + '\')"></i></td>'+
            '</tr>';
}

function resetModalPostingJournalAccounts() {
    setOptionHelper('modalPostingJournalAccounts-addAccount-optionAccountMain', 'dataAccountMain', false, function (firstValueAccountMain) {
        setOptionHelper('modalPostingJournalAccounts-addAccount-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectPostingJournalAccountEvent();
        }, firstValueAccountMain);
    });

    $('#modalPostingJournalAccounts-addAccount-optionAccountMain').off('change');
    $('#modalPostingJournalAccounts-addAccount-optionAccountMain').on('change', function (e) {
        var selectedValueAccountMain = this.value;
        setOptionHelper('modalPostingJournalAccounts-addAccount-optionAccountSub', 'dataAccountSub', false, function () {
            afterSelectPostingJournalAccountEvent();
            $("#modalPostingJournalAccounts-addAccount-optionAccountSub").select2();
        }, selectedValueAccountMain);
    });

    $('#modalPostingJournalAccounts-addAccount-optionAccountSub').off('change');
    $('#modalPostingJournalAccounts-addAccount-optionAccountSub').on('change', function (e) {
        afterSelectPostingJournalAccountEvent();
    });

    return true;
}

function afterSelectPostingJournalAccountEvent() {
    var accountType = 'main',
        selectedValue = '';
    if ($('#modalPostingJournalAccounts-addAccount-optionAccountSub > option').length <= 0 && $('#modalPostingJournalAccounts-addAccount-optionAccountSub > optgroup').length <= 0) {
        selectedValue = $("#modalPostingJournalAccounts-addAccount-optionAccountMain").val();
        $("#modalPostingJournalAccounts-addAccount-optionAccountSub").append($("<option></option>").val('0').html('No Sub Account')).prop('disabled', true);
    } else {
        accountType = 'sub';
        selectedValue = $("#modalPostingJournalAccounts-addAccount-optionAccountSub").val();
        $("#modalPostingJournalAccounts-addAccount-optionAccountSub").prop('disabled', false);
    }

    var dataOptionHelper = JSON.parse(localStorage.getItem('optionHelper')),
        dataAccount = accountType == 'main' ? dataOptionHelper.dataAccountMain : dataOptionHelper.dataAccountSub,
        accountIndex = dataAccount.findIndex(elem => elem['ID'] == selectedValue),
        defaultDRCR = dataAccount[accountIndex].DEFAULTDRCR,
        defaultPlus = defaultDRCR == 'DR' ? 'Debit' : 'Credit',
        defaultMinus = defaultDRCR == 'DR' ? 'Credit' : 'Debit';
    $("#modalPostingJournalAccounts-addAccount-textDefaultPositionPlus").html(defaultPlus);
    $("#modalPostingJournalAccounts-addAccount-textDefaultPositionMinus").html(defaultMinus);

    return true;
}

 $('#modalPostingJournalAccounts-addAccount').off('show.bs.modal');
 $('#modalPostingJournalAccounts-addAccount').on('show.bs.modal', function (e) {
    let accountPosition =   $(e.relatedTarget).data('accountposition');
    $("#modalPostingJournalAccounts-position").val(accountPosition);
});

$("#modalPostingJournalAccounts-addAccountForm").off('submit');
$("#modalPostingJournalAccounts-addAccountForm").on("submit", function (e) {
    e.preventDefault();
    var idAccountMain       = $('#modalPostingJournalAccounts-addAccount-optionAccountMain').val(),
        idAccountSub        = $('#modalPostingJournalAccounts-addAccount-optionAccountSub').val(),
        idAccount           = idAccountSub == '0' ? idAccountMain : idAccountSub,
        textAccountMain     = $('#modalPostingJournalAccounts-addAccount-optionAccountMain option:selected').text(),
        arrTextAccountMain  = textAccountMain.split(' '),
        codeAccountMain     = arrTextAccountMain[0],
        nameAccountMain     = arrTextAccountMain.splice(0, 1),
        nameAccountMain     = arrTextAccountMain.join(' '),
        textAccountSub      = $('#modalPostingJournalAccounts-addAccount-optionAccountSub option:selected').text(),
        arrTextAccountSub   = textAccountSub.split(' '),
        codeAccountSub      = arrTextAccountSub[0],
        nameAccountSub      = arrTextAccountSub.splice(0, 1),
        nameAccountSub      = arrTextAccountSub.join(' '),
        codeAccount         = idAccountSub == '0' ? codeAccountMain : codeAccountSub,
        nameAccount         = idAccountSub == '0' ? nameAccountMain : nameAccountSub,
        tablePosition       = $("#modalPostingJournalAccounts-position").val(),
        elemExist           = $(".postingJournalAccountRow[data-idAccount='" + idAccount + "']");

    if (elemExist.length > 0) {
        let accountPosition = elemExist.closest('table').attr('id') == 'postingJournalAccountsTab-tableAccountDebit' ? 'Debit' : 'Credit';
        showWarning('Account already exists in the <b>' + accountPosition + '</b> list.<br/>Please choose another account.');
    } else {
        var tablePositionName   =   tablePosition == 'DR' ? 'Debit' : 'Credit',
            $tableAccountDebit  =	$('#postingJournalAccountsTab-tableAccount'+tablePositionName+' > tbody'),
            rowAccount          =   generateRowAccountPostingJournal(idAccount, codeAccount, nameAccount, tablePosition);

        $tableAccountDebit.find('.postingJournalAccountRowEmpty').remove();
        $tableAccountDebit.append(rowAccount);
        $("#modalPostingJournalAccounts-addAccount").modal("hide");
    }
});

function deletePostingJournalAccount(idAccount, accountPosition) {
    var accountPositionName =   accountPosition == 'DR' ? 'Debit' : 'Credit',
        $tableAccount       =   $('#postingJournalAccountsTab-tableAccount'+accountPositionName+' > tbody'),
        elemDelete          =   $tableAccount.find(".postingJournalAccountRow[data-idAccount='" + idAccount + "']");
    elemDelete.remove();

    if($tableAccount.find('.postingJournalAccountRow').length == 0) {
        $tableAccount.html(postingJournalAccountRowEmpty);
    }
}

$("#postingJournalAccountsTab-btnSaveSetting").off('click');
$("#postingJournalAccountsTab-btnSaveSetting").on('click', function (e) {
    e.preventDefault();
    let $tableAccountDebit  =	$('#postingJournalAccountsTab-tableAccountDebit > tbody'),
        $tableAccountCredit =	$('#postingJournalAccountsTab-tableAccountCredit > tbody'),
        idJournalPostingType=   $("#postingJournalAccountsTab-listPostingJournalType .nav-link.active").data('idjournalpostingtype'),
        arrIdAccountDebit   =   [],
        arrIdAccountCredit  =   [],
        dataSend            =   {
            idJournalPostingType:idJournalPostingType,
            arrIdAccountDebit:[],
            arrIdAccountCredit:[]
        };

    $tableAccountDebit.find('.postingJournalAccountRow').each(function() {
        arrIdAccountDebit.push($(this).data('idaccount'));
    });

    $tableAccountCredit.find('.postingJournalAccountRow').each(function() {
        arrIdAccountCredit.push($(this).data('idaccount'));
    });

    dataSend.arrIdAccountDebit = arrIdAccountDebit;
    dataSend.arrIdAccountCredit = arrIdAccountCredit;

    $.ajax({
        type: 'POST',
        url: baseURL + "settings/systemSetting/saveDataPostingJournalAccounts",
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
                    getDataPostingJournalAccounts();
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
// Posting Journal Accounts

systemSettingFunc();