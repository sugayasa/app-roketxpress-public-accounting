var $confirmDialog = $('#modal-confirm-action');
if (userLevelMenuFunc == null) {
    var userLevelMenuFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionLevelUserAdmin', 'dataUserAdminLevel');
            getDataUserLevelMenu();
        });
    }
}

$('#optionLevelUserAdmin').off('change');
$('#optionLevelUserAdmin').on('change', function (e) {
    getDataUserLevelMenu();
});

$('#searchKeyword').off('keypress');
$("#searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataUserLevelMenu();
    }
});

function getDataUserLevelMenu() {
    var $tableBodyUserAdmin = $('#table-dataUserLevelMenu > tbody'),
        columnNumber = $('#table-dataUserLevelMenu > thead > tr > th').length,
        idLevelUserAdmin = $('#optionLevelUserAdmin').val(),
        searchKeyword = $('#searchKeyword').val(),
        dataSend = { idLevelUserAdmin: idLevelUserAdmin, searchKeyword: searchKeyword };
    $.ajax({
        type: 'POST',
        url: baseURL + "settings/userLevelMenu/getDataTable",
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
            $tableBodyUserAdmin.html("<tr><td colspan='" + columnNumber + "'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var dataUserLevelMenu = responseJSON.result,
                        arrGroupname = [];
                    $.each(dataUserLevelMenu, function (index, array) {
                        var menuName = array.GROUPNAME == array.MENUNAME ? "" : array.MENUNAME,
                            groupName = array.GROUPNAME,
                            selectedYes = array.OPEN != 0 ? "checked" : "",
                            selectedNo = array.OPEN == 0 ? "checked" : "";

                        var radioMenu = "<div class='adomx-checkbox-radio-group inline'>" +
                            "<label class='adomx-radio-2'><input type='radio' class='idLevelUserMenu' value='1' " + selectedYes + " data-idMenuAdmin='" + array.IDMENUADMIN + "' name='idLevelUserMenu" + array.IDMENUADMIN + "'>" +
                            "<i class='icon'></i> Yes" +
                            "</label>" +
                            "<label class='adomx-radio-2'><input type='radio' class='idLevelUserMenu' value='0' " + selectedNo + " data-idMenuAdmin='" + array.IDMENUADMIN + "' name='idLevelUserMenu" + array.IDMENUADMIN + "'>" +
                            "<i class='icon'></i> No" +
                            "</label>" +
                            "</div>";

                        if (arrGroupname.includes(groupName)) {
                            groupName = "";
                        } else {
                            arrGroupname.push(array.GROUPNAME);
                        }

                        rows += "<tr>" +
                            "<td>" + groupName + "</td>" +
                            "<td>" + menuName + "</td>" +
                            "<td>" + radioMenu + "</td>" +
                            "</tr>";
                    });
                    break;
                case 404:
                default:
                    rows = "<tr><td colspan='" + columnNumber + "' align='center'><center>" + getMessageResponse(jqXHR) + "</center></td></tr>";
                    break;
            }

            $tableBodyUserAdmin.html(rows);
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

$('#btnSaveUserLevelMenu').off('click');
$('#btnSaveUserLevelMenu').on('click', function (e) {
    var userLevelAdminText = $('#optionLevelUserAdmin > option:selected').text();

    $('#confirmSaveUserLevelMenu-userLevelName').html(userLevelAdminText);
    $('#modal-confirmSaveUserLevelMenu').modal('show');
});

$('#confirmSaveUserLevelMenu-btnConfirmSaveUserLevelMenu').off('click');
$('#confirmSaveUserLevelMenu-btnConfirmSaveUserLevelMenu').on('click', function (e) {
    var arrIdMenuLevelUser = {},
        idLevelUserAdmin = $('#optionLevelUserAdmin').val();
    $('.idLevelUserMenu:radio:checked').each(function () {
        var arrName = $(this).attr('data-idMenuAdmin');
        arrIdMenuLevelUser[arrName] = $(this).val();
    });

    var dataSend = { idLevelUserAdmin: idLevelUserAdmin, arrIdMenuLevelUser: arrIdMenuLevelUser };
    $.ajax({
        type: 'POST',
        url: baseURL + "settings/userLevelMenu/saveDataUserLevelMenu",
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
            $('#modal-confirmSaveUserLevelMenu').modal('hide');
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    getDataUserLevelMenu();
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

userLevelMenuFunc();