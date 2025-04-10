$(document).ready(function () {
    $(".show-password").on("click", function () {
        showPassword(this);
    });

    $("#warning-element")
        .find("span")
        .on("click", function () {
            clearWarningElement();
        });

    $("#login-form").submit(function (e) {
        e.preventDefault();
        var username = $("#username").val(),
            password = $("#password").val(),
            captcha = $("#captcha").val(),
            userCredentials = { captcha: captcha, username: username, password: password };

        if (captcha == "") {
            var msg = "Please enter the captcha code shown";
            $("#warning-element")
                .removeClass("d-none")
                .find("strong")
                .html(msg)
                .addClass('animated bounce infinite');
            localStorage.setItem("lastMessage", msg);
            return;
        }

        $.ajax({
            type: "POST",
            url: API_URL + "/access/login",
            contentType: "application/json",
            dataType: "json",
            data: mergeDataSend(userCredentials),
            xhrFields: {
                withCredentials: true,
            },
            headers: {
                Authorization: "Bearer " + getUserToken(),
            },
            beforeSend: function () {
                NProgress.start();
                clearWarningElement();
                $("#username, #password").prop("readonly", true);
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        callMainPage();
                        break;
                    default:
                        $("#warning-element")
                            .removeClass("d-none")
                            .find("strong")
                            .html(Object.values(responseJSON.messages)[0]);
                        break;
                }
            },
        }).always(function (jqXHR, textStatus) {
            $("#username, #password").prop("readonly", false);
            NProgress.done();
            setUserToken(jqXHR, false);
        });
    });

    $('#clearCacheReloadLink').off('click');
    $('#clearCacheReloadLink').on('click', function (e) {
        console.log('sdfa');
        e.preventDefault();
        var localStorageKeys = Object.keys(localStorage),
            localStorageIdx = localStorageKeys.length;
        for (var i = 0; i < localStorageIdx; i++) {
            var keyName = localStorageKeys[i];
            localStorage.removeItem(keyName);
        }
        location.reload();
    });
});

function clearWarningElement() {
    $("#warning-element").addClass("d-none").find("strong").html("");
}

function showPassword(a) {
    var e = $(a).parent().find("input");
    "password" === e.attr("type")
        ? e.attr("type", "text")
        : e.attr("type", "password");
}
