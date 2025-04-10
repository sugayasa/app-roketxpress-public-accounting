var $confirmDialog = $('#modal-confirm-action');
if (userAdminFunc == null) {
    var userAdminFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionLevelUserAdmin', 'dataUserAdminLevel');
            setOptionHelper('editorUserAdmin-optionUserAdminLevel', 'dataUserAdminLevel');
            getDataUserAdmin();
        });
    }
}

$('#optionLevelUserAdmin').off('change');
$('#optionLevelUserAdmin').on('change', function (e) {
    getDataUserAdmin();
});

$('#searchKeyword').off('keypress');
$("#searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataUserAdmin();
    }
});

function getDataUserAdmin() {
    var $tableBodyUserAdmin = $('#table-dataUserAdmin > tbody'),
        columnNumber = $('#table-dataUserAdmin > thead > tr > th').length,
        idLevelUserAdmin = $('#optionLevelUserAdmin').val(),
        searchKeyword = $('#searchKeyword').val(),
        dataSend = { idLevelUserAdmin: idLevelUserAdmin, searchKeyword: searchKeyword };
    $.ajax({
        type: 'POST',
        url: baseURL + "settings/userAdmin/getDataTable",
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
                    var dataUserAdmin = responseJSON.result;
                    $.each(dataUserAdmin, function (index, array) {
                        var badgeStatus = array.STATUS == 1 ? '<b class="text-success">Active</b>' : '<b class="text-danger">Inactive</b>',
                            iconStatusUserAdmin = array.STATUS == 1 ? "fa-eye-slash" : "fa-eye",
                            btnEditUserAdmin = array.STATUS == 1 ? '<i class="text-info fa fa-pencil text18px" data-idUserAdmin="' + array.IDUSERADMIN + '" data-idUserAdminLevel="' + array.IDUSERADMINLEVEL + '" data-toggle="modal" data-target="#modal-editorUserAdmin"></i>' : '',
                            btnUpdateStatusUserAdmin = '<i class="btnUpdateStatusUserAdmin text-info fa ' + iconStatusUserAdmin + ' text18px mr-2" data-idUserAdmin="' + array.IDUSERADMIN + '" data-status="' + array.STATUS + '"></i>';
                        rows += "<tr class='trDataUserAdmin' data-idUserAdmin='" + array.IDUSERADMIN + "' > " +
                            "<td class='searchTd tdDataUserAdmin-levelName'>" + array.LEVELNAME + "</td>" +
                            "<td class='searchTd tdDataUserAdmin-name'>" + array.NAME + "</td>" +
                            "<td class='searchTd tdDataUserAdmin-email'>" + array.EMAIL + "</td>" +
                            "<td class='searchTd tdDataUserAdmin-userName'>" + array.USERNAME + "</td>" +
                            "<td class='tdDataUserAdmin-status' data-status='" + array.STATUS + "'>" + badgeStatus + "</td>" +
                            "<td class='text-right'>" + btnUpdateStatusUserAdmin + btnEditUserAdmin + "</td>" +
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
            $('.btnUpdateStatusUserAdmin').off('click');
            $('.btnUpdateStatusUserAdmin').on('click', function (e) {
                var idUserAdmin = $(this).attr('data-idUserAdmin'),
                    status = $(this).attr('data-status');
                confirmUpdateStatusUserAdmin(idUserAdmin, status);
            });
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

$('#modal-editorUserAdmin').off('shown.bs.modal');
$('#modal-editorUserAdmin').on('shown.bs.modal', function (e) {
    var idUserAdmin = $(e.relatedTarget).attr('data-idUserAdmin'),
        idUserAdminLevel = $(e.relatedTarget).attr('data-idUserAdminLevel');

    $('#editorUserAdmin-nameUser, #editorUserAdmin-userEmail, #editorUserAdmin-username, #editorUserAdmin-oldPassword, #editorUserAdmin-newPassword, #editorUserAdmin-repeatPassword, #editorUserAdmin-idUserAdmin').val('');
    $('#editorUserAdmin-containerWarningUpdatePassword, #editorUserAdmin-oldPasswordContainer').addClass('d-none');

    if (idUserAdmin !== null && idUserAdmin !== undefined && idUserAdmin != "") {
        var $trDataUserAdmin = $('tr.trDataUserAdmin[data-idUserAdmin="' + idUserAdmin + '"]'),
            name = $trDataUserAdmin.find('td.tdDataUserAdmin-name').html(),
            email = $trDataUserAdmin.find('td.tdDataUserAdmin-email').html(),
            userName = $trDataUserAdmin.find('td.tdDataUserAdmin-userName').html(),
            status = $trDataUserAdmin.find('td.tdDataUserAdmin-status').attr('data-status');

        if (status != 1) {
            $(this).modal('hide');
            showWarning('Please activate the admin user status first before making any data changes.');
        } else {
            $('#editorUserAdmin-optionUserAdminLevel').val(idUserAdminLevel);
            $('#editorUserAdmin-nameUser').val(name);
            $('#editorUserAdmin-userEmail').val(email);
            $('#editorUserAdmin-username').val(userName);
            $('#editorUserAdmin-idUserAdmin').val(idUserAdmin);
            $('#editorUserAdmin-containerWarningUpdatePassword, #editorUserAdmin-oldPasswordContainer').removeClass('d-none');
        }
    }
});

$("#form-editorUserAdmin").off('submit');
$("#form-editorUserAdmin").on("submit", function (e) {
    e.preventDefault();
    var idUserAdmin = $('#editorUserAdmin-idUserAdmin').val(),
        urlFunction = idUserAdmin == '' ? 'insertDataUserAdmin' : 'updateDataUserAdmin',
        oldPassword = $("#editorUserAdmin-oldPassword").val(),
        newPassword = $("#editorUserAdmin-newPassword").val(),
        repeatPassword = $("#editorUserAdmin-repeatPassword").val(),
        msgWarning = '';

    if (idUserAdmin == '') {
        if (newPassword == '' || repeatPassword == '') {
            msgWarning = 'A password is required if you want to add a new admin user.';
        } else if (newPassword.length < 8 || repeatPassword.length < 8) {
            msgWarning = 'The password must be at least 8 characters long.';
        } else if (newPassword != repeatPassword) {
            msgWarning = 'The new password confirmation does not match.';
        }
    } else {
        if ((newPassword != '' || repeatPassword != '') && oldPassword == '') {
            msgWarning = 'Please enter the old password to change the admin user`s password.';
        } else if (oldPassword != '' && (newPassword == '' || repeatPassword == '')) {
            msgWarning = 'Please enter the new password and repeat password to change the admin user`s password.';
        } else if (newPassword != '' && (newPassword.length < 8 || repeatPassword.length < 8)) {
            msgWarning = 'The password must be at least 8 characters long.';
        } else if (newPassword != repeatPassword) {
            msgWarning = 'The new password confirmation does not match.';
        }
    }

    if (msgWarning != '') {
        showWarning(msgWarning);
    } else {
        var idUserAdminLevel = $("#editorUserAdmin-optionUserAdminLevel").val(),
            nameUser = $('#editorUserAdmin-nameUser').val(),
            userEmail = $("#editorUserAdmin-userEmail").val(),
            username = $("#editorUserAdmin-username").val(),
            dataSend = {
                idUserAdmin: idUserAdmin,
                idUserAdminLevel: idUserAdminLevel,
                nameUser: nameUser,
                userEmail: userEmail,
                username: username,
                oldPassword: oldPassword,
                newPassword: newPassword,
                repeatPassword: repeatPassword,
            };

        $.ajax({
            type: 'POST',
            url: baseURL + "settings/userAdmin/" + urlFunction,
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
                $("#form-editorUserAdmin :input").attr("disabled", true);
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        $("#modal-editorUserAdmin").modal('hide');
                        getDataUserAdmin();
                        break;
                    default: break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#form-editorUserAdmin :input").attr("disabled", false);
            $("#window-loader").modal("hide");
            NProgress.done();
            generateWarningMessageResponse(jqXHR);
            setUserToken(jqXHR);
        });
    }
});

function confirmUpdateStatusUserAdmin(idUserAdmin, status) {
    var $trDataUserAdmin = $('tr.trDataUserAdmin[data-idUserAdmin="' + idUserAdmin + '"]'),
        name = $trDataUserAdmin.find('td.tdDataUserAdmin-name').html(),
        levelName = $trDataUserAdmin.find('td.tdDataUserAdmin-levelName').html(),
        badgeStatus = status == 1 ? '<b class="text-danger">deactivevated</b>' : '<b class="text-success">activevated</b>',
        confirmText = 'This user admin data will be ' + badgeStatus + '. Details ;<br/><br/>' +
            '<div class="order-details-customer-info">' +
            '<ul>' +
            '<li> <span>Name</span> <span><b>' + name + '</b></span> </li>' +
            '<li> <span>Level</span> <span><b>' + levelName + '</b></span> </li>' +
            '</ul>' +
            '</div>' +
            '<br/>Are you sure?';

    $confirmDialog.find('#modal-confirm-body').html(confirmText);
    $confirmDialog.find('#confirmBtn').attr('data-idUserAdmin', idUserAdmin).attr('data-status', status).attr('data-function', "updateStatusUserAdmin");
    $confirmDialog.modal('show');
}

$('#confirmBtn').off('click');
$('#confirmBtn').on('click', function (e) {
    var idUserAdmin = $confirmDialog.find('#confirmBtn').attr('data-idUserAdmin'),
        status = $confirmDialog.find('#confirmBtn').attr('data-status'),
        funcName = $confirmDialog.find('#confirmBtn').attr('data-function'),
        dataSend = { idUserAdmin: idUserAdmin, status: status };

    $.ajax({
        type: 'POST',
        url: baseURL + "settings/userAdmin/" + funcName,
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
                    getDataUserAdmin();
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

userAdminFunc();