var $confirmDialog = $('#modal-confirm-action');
if (systemSettingFunc == null) {
    var systemSettingFunc = function () {
        $(document).ready(function () {
            getDataSettingBasic(1, [1, 2]);
        });
    }
}

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
    }
}

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

function showModalConfirmation(liDetailSetting, arrJsonSend, typeSetting, arrIdSystemSettings) {
    var confirmText = 'Update system settings with details ;<br/><br/>' +
        '<div class="order-details-customer-info">' +
        '<ul>' + liDetailSetting + '</ul>' +
        '</div>' +
        '<br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-arrJsonSend', arrJsonSend).attr('data-typeSetting', typeSetting).attr('data-arrIdSystemSettings', arrIdSystemSettings).attr('data-function', "updateSystemSettings");
    $confirmDialog.modal('show');
}

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

systemSettingFunc();