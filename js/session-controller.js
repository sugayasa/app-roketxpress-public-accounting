$(document).ready(function () {
    var urlPaths = $(location).attr("href").split("/"),
        logout = urlPaths.slice(-1) == "logoutPage" ? true : false,
        token = getUserToken(logout);
    if (logout) localStorage.setItem("lastMessage", "");
    $.ajax({
        type: "POST",
        url: API_URL + "/access/check",
        contentType: "application/json",
        dataType: "json",
        data: mergeDataSend(),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + token,
        },
        beforeSend: function () {
            NProgress.start();
            clearUserToken();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    $("#loadtext").html("Redirecting to main page...");
                    setTimeout(callMainPage, 500);
                    break;
                case 401:
                    $("#loadtext").html("Redirecting to login...");
                    setTimeout(loadLogin, 500);
                    break;
                case 403:
                    urlLogout = MAIN_URL + "/access/logout/" + getUserToken();
                    window.location.href = urlLogout;
                    break;
                default:
                    $(".login_content").html(
                        "<center>" +
                        Object.values(responseJSON.messages)[0] +
                        "</center>"
                    );
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR, false, token);
    });
});

function loadLogin() {
    $.ajax({
        type: "GET",
        url: MAIN_URL + "/loginPage",
        beforeSend: function () {
            $("#loadtext").html("Loading login page...");
        },
        success: function (htmlRes) {
            var lastMessage = localStorage.getItem("lastMessage");
            $("#mainbody").html(htmlRes);
            if (
                lastMessage != "" &&
                lastMessage !== null &&
                lastMessage !== undefined
            ) {
                if ($("#warning-element").length) {
                    $("#warning-element")
                        .removeClass("d-none")
                        .find("strong")
                        .html(lastMessage);
                }
            }
            $.get(MAIN_URL + "/access/captcha/" + getUserToken(), function (data) {
                $('#captchaImage').attr('src', data);
            });

            $('#btnRefreshCaptcha').off('click')
            $('#btnRefreshCaptcha').on('click', function (e) {
                e.preventDefault();
                var token = getUserToken();
                $.ajax({
                    type: "POST",
                    url: API_URL + "/access/check",
                    contentType: "application/json",
                    dataType: "json",
                    data: mergeDataSend(),
                    xhrFields: {
                        withCredentials: true,
                    },
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                    beforeSend: function () {
                        NProgress.start();
                        clearUserToken();
                        $("#window-loader").modal("show");
                    },
                    complete: function (jqXHR, textStatus) {
                        var responseJSON = jqXHR.responseJSON;
                        $.get(MAIN_URL + "/access/captcha/" + responseJSON.token, function (data) {
                            $('#captchaImage').attr('src', data);
                        });
                    },
                }).always(function (jqXHR, textStatus) {
                    $("#window-loader").modal("hide");
                    NProgress.done();
                    setUserToken(jqXHR, false, token);
                });
            });
        },
        error: function () {
            $("#center_content").html("<center>Error on connection</center>");
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
    });
}

function callMainPage() {
    var lastPageAlias =
        localStorage.getItem("lastAlias") == null
            ? ""
            : localStorage.getItem("lastAlias"),
        dataSend = { lastPageAlias: lastPageAlias };
    $.ajax({
        type: "POST",
        url: MAIN_URL + "/mainPage",
        contentType: "application/json",
        dataType: "json",
        data: mergeDataSend(dataSend),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            NProgress.start();
            $("#loadtext").html("Loading main page...");
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    $("body").html(responseJSON.htmlRes);
                    break;
                case 401:
                case 403:
                    $("#loadtext").html(
                        Object.values(responseJSON.messages)[0]
                    );
                    setTimeout(loadLogin, 500);
                    break;
                default:
                    $("#center_content").html(
                        "<center>" +
                        Object.values(responseJSON.messages)[0] +
                        "</center>"
                    );
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function setUserToken(jqXHR, showWarningModal = true, defaultToken) {
    var token, responseMessage, urlLogout;

    try {
        var responseJSON = jqXHR.responseJSON,
            token = responseJSON.token;
    } catch (err) {
        token = jqXHR.token;
    }

    try {
        var responseJSON = jqXHR.responseJSON,
            responseMessage = Object.values(responseJSON.messages)[0];
    } catch (err) {
        responseMessage =
            jqXHR.messages != "" &&
                jqXHR.messages !== null &&
                jqXHR.messages !== undefined
                ? Object.values(jqXHR.messages)[0]
                : "";
    }

    if ((jqXHR.status == 401 || jqXHR.status == 403) && showWarningModal) {
        $("#modalWarning").on("show.bs.modal", function () {
            $("#modalWarningBody").html(responseMessage);
        });
        $("#modalWarning").off("hidden.bs.modal");
        $("#modalWarning").on("hidden.bs.modal", function () {
            urlLogout = MAIN_URL + "/access/logout/" + getUserToken();
            localStorage.clear();
            window.location.href = urlLogout;
            return;
        });
        $("#modalWarning").modal("show");
    }

    if (token != "" && token !== null && token !== undefined) {
        localStorage.setItem("userToken", token.valueOf());
        urlLogout = MAIN_URL + "/access/logout/" + token;
        if ($("#linkLogout").length) {
            $("#linkLogout").attr("href", urlLogout);
        }
    } else if (
        defaultToken != "" &&
        defaultToken !== null &&
        defaultToken !== undefined
    ) {
        localStorage.setItem("userToken", defaultToken);
    }

    if (
        responseMessage != "" &&
        responseMessage !== null &&
        responseMessage !== undefined
    )
        localStorage.setItem("lastMessage", responseMessage);

    return true;
}

function mergeDataSend(dataMerge = null) {
    var hardwareID = { hardwareID: getHardwareID() },
        dataSend =
            dataMerge == null
                ? $.extend({}, hardwareID)
                : $.extend({}, dataMerge, hardwareID);
    return JSON.stringify(dataSend);
}
