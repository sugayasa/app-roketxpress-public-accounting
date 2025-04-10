var MAIN_URL = window.location.origin,
    API_URL = MAIN_URL,
    ASSET_IMG_URL = MAIN_URL + "/img/",
    devStatus = "development",
    urlLogout = "";

function clearUserToken() {
    localStorage.removeItem("userToken");
}

function getUserToken(logout = false) {
    if (logout) return "";
    if (
        localStorage.getItem("userToken") === null ||
        localStorage.getItem("userToken") === undefined
    ) {
        return "";
    }

    return localStorage.getItem("userToken");
}

function getHardwareID() {
    var ubid = require('ubid'),
        hardwareID = '';
    ubid.get(function (error, signatureData) {
        if (error) {
            return hardwareID;
        }

        hardwareID = signatureData.browser.signature.toString() + "";
    });

    return hardwareID;
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined
                ? true
                : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};
