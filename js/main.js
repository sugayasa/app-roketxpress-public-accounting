"use strict";

//OK
function dismissAllNotification(openedMenu = false) {
    $.ajax({
        type: "POST",
        url: baseURL + "access/dismissAllNotification",
        contentType: "application/json",
        dataType: "json",
        data: mergeDataSend(),
        cache: false,
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            $("#window-loader").modal("show");
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    getUnreadNotificationList();
                    if (openedMenu) {
                        getDataUnreadNotification();
                        getDataReadNotification();
                    }
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        setUserToken(jqXHR);
    });
}

//OK
function dismissNotification(idNotificationUserAdmin) {
    var dataSend = { idNotificationUserAdmin: idNotificationUserAdmin };
    $.ajax({
        type: "POST",
        url: baseURL + "access/dismissNotification",
        contentType: "application/json",
        dataType: "json",
        data: mergeDataSend(dataSend),
        cache: false,
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    getUnreadNotificationList();
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        setUserToken(jqXHR);
    });
}

//OK
function generateElemNotification(
    totalUnreadNotification,
    unreadNotificationArray
) {
    var notificationList = "";
    $("#containerNotificationCounter").html(
        numberFormat(totalUnreadNotification)
    );

    if (totalUnreadNotification <= 0) {
        $("#iconNewNotification").remove();
        notificationList =
            "<li id='containerEmptyNotification'><center>No new notifications shown</center></li>";
    } else {
        $("#containerEmptyNotification").remove();
        if ($("#iconNewNotification").length <= 0)
            $("#containerNotificationIcon").append(
                '<span class="badge" id="iconNewNotification"></span>'
            );
        $.each(unreadNotificationArray, function (index, array) {
            var dataParamNotif = generateDataParamNotif(
                array.IDNOTIFICATIONUSERADMIN,
                array.IDUSERADMINNOTIFICATIONTYPE,
                array.IDPRIMARY
            );
            notificationList +=
                '<li id="liNotification' +
                array.IDNOTIFICATIONUSERADMIN +
                '" class="liNotification">' +
                '<a href="#" class="btnDetailNotification" data-id="' +
                array.IDNOTIFICATIONUSERADMIN +
                '" ' +
                dataParamNotif +
                ">" +
                '<i class="' +
                array.ICON +
                '"></i>' +
                '<p style="min-width: 220px;" class="mr-2">' +
                array.TITLE +
                "<br/>" +
                "<small>" +
                array.MESSAGE.substring(0, 50) +
                "..</small><br/>" +
                "<small>" +
                array.DATETIMECREATE +
                "</small>" +
                "</p>" +
                "</a>" +
                '<button class="delete" onclick="dismissNotification(\'' +
                array.IDNOTIFICATIONUSERADMIN +
                "'" +
                ')"><i class="zmdi zmdi-close-circle-o"></i></button>' +
                "</li>";
        });
    }

    if (notificationList != "") {
        $("#containerNotificationList").html(notificationList);
        $(".btnDetailNotification").off("click");
        $(".btnDetailNotification").on("click", function () {
            openMenuFromNotification(this);
        });
    }
}

//OK
function getUnreadNotificationList() {
    $.ajax({
        type: "POST",
        url: baseURL + "access/unreadNotificationList",
        contentType: "application/json",
        dataType: "json",
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            $("#containerNotificationCounter").html(0);
            $("#containerNotificationList").html(
                "<li id='containerEmptyNotification'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></li>"
            );
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                unreadNotificationArray = responseJSON.unreadNotificationArray,
                totalUnreadNotification =
                    responseJSON.totalUnreadNotification * 1;
            generateElemNotification(
                totalUnreadNotification,
                unreadNotificationArray
            );
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function generateTotalUnconfirmedReservationElem(totalUnconfirmedReservation) {
    totalUnconfirmedReservation = totalUnconfirmedReservation * 1;
    if ($("#menuRSV").length > 0) {
        $("#containerUnconfirmedReservationCounter").remove();
        if (totalUnconfirmedReservation > 0) {
            $("#menuRSV a").append('<span class="badge badge-success badge-pill ml-auto mr-1" id="containerUnconfirmedReservationCounter" data-toggle="tooltip" data-original-title="Total Unconfirmed Reservation" data-placement="right">' + numberFormat(totalUnconfirmedReservation) + '</span>');
            $('[data-toggle="tooltip"]').tooltip();
        }
    }
}

function generateTotalActiveCollectPaymentElem(totalActiveCollectPayment) {
    totalActiveCollectPayment = totalActiveCollectPayment * 1;
    if ($("#menuCP").length > 0) {
        $("#containerActiveCollectPaymentCounter").remove();
        if (totalActiveCollectPayment > 0) {
            $("#menuCP a").append('<span class="badge badge-warning badge-pill ml-auto mr-1" id="containerActiveCollectPaymentCounter" data-toggle="tooltip" data-original-title="Total Active Collect Payment" data-placement="right">' + numberFormat(totalActiveCollectPayment) + '</span>');
            $('[data-toggle="tooltip"]').tooltip();
        }
    }
}

function generateTotalActiveWithdrawalElem(totalActiveWithdrawal) {
    totalActiveWithdrawal = totalActiveWithdrawal * 1;
    if ($("#menuFIN").length > 0) {
        $("#containerActiveWithdrawalCounter").remove();
        if (totalActiveWithdrawal > 0) {
            $("#menuFIN a").append('<span class="badge badge-primary badge-pill ml-auto mr-1" id="containerActiveWithdrawalCounter" data-toggle="tooltip" data-original-title="Total Active Withdrawal" data-placement="right">' + numberFormat(totalActiveWithdrawal) + '</span>');
            $('[data-toggle="tooltip"]').tooltip();
        }
    }
}

var win = window.top;
win.onfocus = function () {
    getUnreadNotificationList();
};

function openListNotification() {
    $("#containerNotificationButton, .dropdown-menu-notifications").removeClass(
        "show"
    );
    getViewURL("notification", "NOTIF");
}

function getDataOptionByKey(keyName, optionName = 'false', keyword = 'false', callback = false) {
    $.ajax({
        type: "POST",
        url: API_URL + "/access/getDataOptionByKey/" + keyName + "/" + optionName + "/" + keyword,
        contentType: "application/json",
        dataType: "json",
        data: {},
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    var responseJSON = jqXHR.responseJSON,
                        optionHelper = JSON.parse(localStorage.getItem("optionHelper")),
                        dataOption = responseJSON.dataOption,
                        optionName = responseJSON.optionName;
                    optionHelper[optionName] = dataOption;
                    localStorage.setItem("optionHelper", JSON.stringify(optionHelper));
                    if (typeof callback == "function") callback();
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        setUserToken(jqXHR);
    });
}

$.ajaxSetup({ cache: true });
$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: API_URL + "/access/getDataOption",
        contentType: "application/json",
        dataType: "json",
        data: {},
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                optionHelper = responseJSON.data,
                optionHour = $.parseJSON(localStorage.getItem("optionHour")),
                optionMinuteInterval = $.parseJSON(localStorage.getItem("optionMinuteInterval")),
                optionMonth = $.parseJSON(localStorage.getItem("optionMonth")),
                optionYear = $.parseJSON(localStorage.getItem("optionYear"));
            optionHelper["optionHour"] = optionHour;
            optionHelper["optionMinuteInterval"] = optionMinuteInterval;
            optionHelper["optionMonth"] = optionMonth;
            optionHelper["optionYear"] = optionYear;
            localStorage.setItem("optionHelper", JSON.stringify(optionHelper));
            localStorage.removeItem("optionHour");
            localStorage.removeItem("optionMinuteInterval");
            localStorage.removeItem("optionMonth");
            localStorage.removeItem("optionYear");
        },
    }).always(function (jqXHR, textStatus) {
        setUserToken(jqXHR);
    });

    var $window = $(window);
    var $body = $("body");

    //OK
    if ($(".adomx-dropdown").length) {
        var $adomxDropdown = $(".adomx-dropdown"),
            $adomxDropdownMenu = $adomxDropdown.find(".adomx-dropdown-menu");

        $adomxDropdown.on("click", ".toggle", function (e) {
            e.preventDefault();
            var $this = $(this);
            if (!$this.parent().hasClass("show")) {
                $adomxDropdown.removeClass("show");
                $adomxDropdownMenu.removeClass("show");
                $this
                    .siblings(".adomx-dropdown-menu")
                    .addClass("show")
                    .parent()
                    .addClass("show");
            } else {
                $this
                    .siblings(".adomx-dropdown-menu")
                    .removeClass("show")
                    .parent()
                    .removeClass("show");
            }
        });

        $body.on("click", function (e) {
            var $target = e.target;
            if (
                !$($target).is(".adomx-dropdown") &&
                !$($target).parents().is(".adomx-dropdown") &&
                $adomxDropdown.hasClass("show")
            ) {
                $adomxDropdown.removeClass("show");
                $adomxDropdownMenu.removeClass("show");
            }
        });
    }

    var $headerSearchOpen = $(".header-search-open"),
        $headerSearchClose = $(".header-search-close"),
        $headerSearchForm = $(".header-search-form");
    $headerSearchOpen.on("click", function () {
        $headerSearchForm.addClass("show");
    });
    $headerSearchClose.on("click", function () {
        $headerSearchForm.removeClass("show");
    });

    var $sideHeaderToggle = $(".side-header-toggle"),
        $sideHeaderClose = $(".side-header-close"),
        $sideHeader = $(".side-header");

    function $sideHeaderClassToggle() {
        var $windowWidth = $window.width();
        if ($windowWidth >= 1200) {
            $sideHeader.removeClass("hide").addClass("show");
        } else {
            $sideHeader.removeClass("show").addClass("hide");
        }
    }
    $sideHeaderClassToggle();
    $sideHeaderToggle.on("click", function () {
        if ($sideHeader.hasClass("show")) {
            $sideHeader.removeClass("show").addClass("hide");
        } else {
            $sideHeader.removeClass("hide").addClass("show");
        }
    });

    $sideHeaderClose.on("click", function () {
        $sideHeader.removeClass("show").addClass("hide");
    });

    var $sideHeaderNav = $(".side-header-menu"),
        $sideHeaderSubMenu = $sideHeaderNav.find(".side-header-sub-menu");

    $sideHeaderSubMenu
        .siblings("a")
        .append(
            '<span class="menu-expand"><i class="fa fa-chevron-down"></i></span>'
        );
    $sideHeaderSubMenu.slideUp();
    $sideHeaderNav.on("click", "li a, li .menu-expand", function (e) {
        var $this = $(this);
        if (
            $this.parent("li").hasClass("has-sub-menu") ||
            $this.attr("href") === "#" ||
            $this.hasClass("menu-expand")
        ) {
            e.preventDefault();
            if ($this.siblings("ul:visible").length) {
                $this
                    .parent("li")
                    .removeClass("active")
                    .children("ul")
                    .slideUp()
                    .siblings("a")
                    .find(".menu-expand i")
                    .removeClass("fa-chevron-up")
                    .addClass("fa-chevron-down");
                $this
                    .parent("li")
                    .siblings("li")
                    .removeClass("active")
                    .find("ul:visible")
                    .slideUp()
                    .siblings("a")
                    .find(".menu-expand i")
                    .removeClass("fa-chevron-up")
                    .addClass("fa-chevron-down");
            } else {
                $this
                    .parent("li")
                    .addClass("active")
                    .children("ul")
                    .slideDown()
                    .siblings("a")
                    .find(".menu-expand i")
                    .removeClass("fa-chevron-down")
                    .addClass("fa-chevron-up");
                $this
                    .parent("li")
                    .siblings("li")
                    .removeClass("active")
                    .find("ul:visible")
                    .slideUp()
                    .siblings("a")
                    .find(".menu-expand i")
                    .removeClass("fa-chevron-up")
                    .addClass("fa-chevron-down");
            }
        }
    });

    var pageUrl = window.location.href.substr(
        window.location.href.lastIndexOf("/") + 1
    );

    $(".side-header-menu a").each(function () {
        if ($(this).attr("href") === pageUrl || $(this).attr("href") === "") {
            $(this)
                .closest("li")
                .addClass("active")
                .parents("li")
                .addClass("active")
                .children("ul")
                .slideDown()
                .siblings("a")
                .find(".menu-expand i")
                .removeClass("fa-chevron-down")
                .addClass("fa-chevron-up");
        } else if (
            window.location.pathname === "/" ||
            window.location.pathname === "/index.html"
        ) {
            $('.side-header-menu a[href="index.html"]')
                .closest("li")
                .addClass("active")
                .parents("li")
                .addClass("active")
                .children("ul")
                .slideDown()
                .siblings("a")
                .find(".menu-expand i")
                .removeClass("fa-chevron-down")
                .addClass("fa-chevron-up");
        }
    });

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
    tippy(".tippy, [data-tippy-content], [data-tooltip]", {
        flipOnUpdate: true,
        boundary: "window",
    });

    function tableSelectable() {
        var $tableSelectable = $(".table-selectable");
        $tableSelectable
            .find("tbody .selected")
            .find('input[type="checkbox"]')
            .prop("checked", true);
        $tableSelectable.on("click", 'input[type="checkbox"]', function () {
            var $this = $(this);
            if ($this.parent().parent().is("th")) {
                if (!$this.is(":checked")) {
                    $this
                        .closest("table")
                        .find("tbody")
                        .children("tr")
                        .removeClass("selected")
                        .find('input[type="checkbox"]')
                        .prop("checked", false);
                } else {
                    $this
                        .closest("table")
                        .find("tbody")
                        .children("tr")
                        .addClass("selected")
                        .find('input[type="checkbox"]')
                        .prop("checked", true);
                }
            } else {
                if (!$this.is(":checked")) {
                    $this.closest("tr").removeClass("selected");
                } else {
                    $this.closest("tr").addClass("selected");
                }
                if (
                    $this.closest("tbody").children(".selected").length <
                    $this.closest("tbody").children("tr").length
                ) {
                    $this
                        .closest("table")
                        .find("thead")
                        .find('input[type="checkbox"]')
                        .prop("checked", false);
                } else if (
                    $this.closest("tbody").children(".selected").length ===
                    $this.closest("tbody").children("tr").length
                ) {
                    $this
                        .closest("table")
                        .find("thead")
                        .find('input[type="checkbox"]')
                        .prop("checked", true);
                }
            }
        });
    }
    tableSelectable();

    var $chatContactOpen = $(".chat-contacts-open"),
        $chatContactClose = $(".chat-contacts-close"),
        $chatContacts = $(".chat-contacts");
    $chatContactOpen.on("click", function () {
        $chatContacts.addClass("show");
    });
    $chatContactClose.on("click", function () {
        $chatContacts.removeClass("show");
    });

    function resize() {
        $sideHeaderClassToggle();
    }

    $window.on("resize", function () {
        resize();
    });

    $(".custom-scroll").each(function () {
        var ps = new PerfectScrollbar($(this)[0]);
    });

    if (
        localStorage.getItem("OSNotificationData") === null ||
        localStorage.getItem("OSNotificationData") === undefined
    ) {
        $("#dashboard-menu").trigger("click");
    } else {
        var OSNotificationData = JSON.parse(
            localStorage.getItem("OSNotificationData")
        );
        var OSNotifType = OSNotificationData.type;
        switch (OSNotifType) {
            case "reservation":
                $("#menuRV").trigger("click");
                break;
            case "mailbox":
                $("#menuMB").trigger("click");
                break;
            case "carschedule":
                $('.menu-item[data-alias="SCRC"]').trigger("click");
                break;
            case "driverschedule":
                $('.menu-item[data-alias="SCDR"]').trigger("click");
                break;
            default:
                $("#dashboard-menu").trigger("click");
                break;
        }
    }

    getUnreadNotificationList();
}),

    $(".menu-item").on("click", function () {
        $(".menu-item").removeClass("active");
        $(".modal").modal("hide");
        $(this).addClass("active");
        NProgress.start();
        setLoaderMainContent();

        var alias = $(this).attr("data-alias"),
            url = $(this).attr("data-url");

        localStorage.setItem("lastUrl", url);
        localStorage.setItem("lastAlias", alias);
        $("#lastMenuAlias").val(alias);

        if (localStorage.getItem("form_" + alias) === null) {
            getViewURL(url, alias);
        } else {
            var htmlRes = localStorage.getItem("form_" + alias);
            renderMainView(htmlRes);
        }
    });

function setLoaderMainContent() {
    $("#main-content").html(loaderElem);
}

function getLevelUser() {
    var userData = $.parseJSON(localStorage.getItem("userData"));
    return userData.LEVEL;
}

function getViewURL(url, alias, callback) {
    $.ajax({
        type: "POST",
        url: baseURL + "view/" + url,
        contentType: "application/json",
        dataType: "json",
        cache: true,
        data: mergeDataSend(),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            NProgress.start(0.4);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    localStorage.setItem("form_" + alias, responseJSON.htmlRes);
                    renderMainView(responseJSON.htmlRes);
                    if (typeof callback == "function") callback();
                    break;
                default:
                    $("#main-content").html(
                        "<center>" +
                        Object.values(responseJSON.messages)[0] +
                        "</center>"
                    );
                    NProgress.done();
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function renderMainView(htmlRes, callback) {
    $("#modalWarning").off("hidden.bs.modal");
    $("#main-content").html(htmlRes);
    if ($("#opt-dataperpage").length) {
        $("#opt-dataperpage").on("change", function () {
            $("#page").val("1");
            ajaxDataTable();
        });
    }

    if ($("#form-search").length) {
        $("#form-search").keydown(function (e) {
            if (e.which === 13) {
                resetPage();
                ajaxDataTable();
            }
        });
    }

    if ($(".input-date-single").length) {
        generateDatePickerElem();
    }

    NProgress.done();

    if (typeof callback == "function") callback();
}

function generateDatePickerElem() {
    $(".input-date-single").daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: "DD-MM-YYYY",
            separator: " - ",
            applyLabel: "Save",
            cancelLabel: "Cancel",
            daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            monthNames: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ],
            firstDay: 1,
        },
    });
}

//OK
function resetPage() {
    if ($("#page").length) {
        $("#page").val(1);
    }
}

//OK
function generateDataInfo(idcontainer, datastart, dataend, datatotal) {
    $("#" + idcontainer).html("Show data from " + numberFormat(datastart) + " to " + numberFormat(dataend) + ". Total " + numberFormat(datatotal) + " data");
}

//OK
function setOptionHelper(
    elementIDArr,
    table,
    iddata = false,
    callback = false,
    parentValue = false,
    parentValue2 = false
) {
    var arrID = Array.isArray(elementIDArr) ? elementIDArr : [elementIDArr];
    arrID.forEach(function (elementID) {
        if ($("#" + elementID).length) {
            var dataOpt = JSON.parse(localStorage.getItem("optionHelper")),
                options = dataOpt[table];
            $("#" + elementID).empty();

            var options = parentValue2 != false ? options.filter(options => [parentValue2].includes(options.PARENTVALUE2)) : options,
                optionAll = $("#" + elementID).attr("option-all"),
                optionAllVal = $("#" + elementID).attr("option-all-value"),
                optionAllVal = typeof optionAllVal !== typeof undefined && optionAllVal !== false ? optionAllVal : "",
                firstValue = false,
                isOptGroup = typeof options[0] !== 'undefined' ? options[0].hasOwnProperty('IDGROUP') : false,
                arrIdGroup = [],
                lastIndex = parentValue !== false &&
                    parentValue !== 0 &&
                    parentValue !== '' &&
                    typeof parentValue !== 'undefined' &&
                    isOptGroup ? options.filter((obj) => obj.IDGROUP === parentValue).length - 1 : options.length - 1,
                indexElem = 0,
                optGroupElem;

            if (typeof optionAll !== typeof undefined && optionAll !== false) {
                $("#" + elementID).prepend($("<option></option>").val(optionAllVal).html(optionAll)).prop('selected', true);
            }

            var foundIdData = false;
            $("#" + elementID).each(function (i, obj) {
                $.each(options, function (index, array) {
                    var selected = "";
                    if (table == "optionYear") {
                        var thisYear = moment().year();
                        if (array.ID == thisYear) selected = "selected";
                    }

                    if (
                        parentValue === false ||
                        parentValue === '' ||
                        (parentValue !== false &&
                            parentValue !== 0 &&
                            (array.PARENTVALUE == parentValue || array.IDGROUP == parentValue)) ||
                        (parentValue2 !== false &&
                            parentValue2 !== 0 &&
                            (array.PARENTVALUE2 == parentValue2 || array.IDGROUP == parentValue2))
                    ) {
                        var optElem = $("<option " + selected + "></option>").val(array.ID).html(array.VALUE);
                        firstValue = !firstValue ? array.ID : firstValue;
                        if (isOptGroup) {
                            var idGroup = array.IDGROUP,
                                isIdGroupExist = arrIdGroup.includes(idGroup);
                            if (!isIdGroupExist) {
                                if (optGroupElem && optGroupElem != '' && typeof optGroupElem !== 'undefined') $("#" + elementID).append(optGroupElem);
                                optGroupElem = $("<optgroup label='" + array.VALUEGROUP + "'>");
                                arrIdGroup.push(idGroup);
                            }
                            optGroupElem.append(optElem);
                            if (indexElem == lastIndex) $("#" + elementID).append(optGroupElem);
                        } else {
                            $("#" + elementID).append(optElem);
                        }
                        if (iddata && array.ID === iddata) foundIdData = true;
                        indexElem++;
                    }
                });
                if (iddata != false && foundIdData) {
                    $("#" + elementID).val(iddata);
                }
            });
        }

        if (typeof callback == "function") callback(firstValue);
    });
}

//OK
function updateDataOptionHelper(arrayName, arrayValue) {
    var dataOptionHelper = JSON.parse(localStorage.getItem("optionHelper"));
    dataOptionHelper[arrayName] = arrayValue;

    localStorage.setItem("optionHelper", JSON.stringify(dataOptionHelper));
}

//OK
function maskNumberInput(
    minValue = 0,
    maxValue = false,
    elemID = false,
    callback = false
) {
    var $input;

    if (elemID == false) {
        $input = $(".maskNumber");
    } else {
        $input = $("#" + elemID);
    }

    if ($input.val() == "") {
        $input.val(0);
    }
    $input.on("keyup", function (event) {
        var selection = window.getSelection().toString();
        if (selection !== '') {
            return;
        }
        if ($.inArray(event.keyCode, [38, 40, 37, 39]) !== -1) {
            return;
        }

        maxValue = decimalInput === true ? 99 : maxValue;
        minValue = decimalInput === true ? 0 : minValue;
        var $this = $(this),
            showcomma = $this.hasClass("nocomma") ? false : true,
            showzero = $this.hasClass("nozero") ? false : true,
            decimalInput = $this.hasClass("decimalInput"),
            input = $this.val(),
            input = input.replace(/[^0-9.]/g, '');

        if (!decimalInput) {
            input = input < minValue ? minValue : parseInt(input, 10);
            input = maxValue != false && input > maxValue ? maxValue : parseInt(input, 10);
        }

        $this.val(function () {
            if (!decimalInput) {
                if (showcomma) {
                    input = input ? parseInt(input, 10) : 0;
                    if (showzero) {
                        return (input === 0) ? "0" : input.toLocaleString("en-US");
                    } else {
                        return (input === 0) ? "" : input.toLocaleString("en-US");
                    }
                } else {
                    return input;
                }
            } else {
                return input;
            }

            if (typeof callback == "function") {
                callback(input);
            }
        });
    });
}

//OK
function replaceAll(str, find, replace) {
    if (str === undefined || str === null) {
        return "";
    }
    return str.replace(new RegExp(find, "g"), replace);
}

//OK
function numberFormat(number) {
    if (number % 1 == 0) {
        number = number ? parseInt(number, 10) : 0;
    }
    return number === 0 || number === undefined || number === null
        ? "0"
        : number.toLocaleString("en-US");
}

//OK
function convertSerializeArrayToObject(dataArray) {
    var dataObj = {};

    $(dataArray).each(function (i, field) {
        dataObj[field.name] = field.value;
    });

    return dataObj;
}

//OK
function generatePagination(
    idcontainer,
    page,
    pageTotal,
    funcGenerateDataTable = "generateDataTable"
) {
    var nextpage = page * 1 + 1;
    var next = page == pageTotal || pageTotal == 0 || nextpage > pageTotal ? "disabled" : "";
    var nextOnClick = page == pageTotal || pageTotal == 0 || nextpage > pageTotal ? "" : funcGenerateDataTable + "(" + nextpage + ")";
    var nextButton = "<li class='page-item " + next + "' onclick='" + nextOnClick + "'><b role='button' class='page-link'>></b></li>";

    var prevpage = page * 1 - 1;
    var previous = page == 1 || pageTotal <= 1 ? "disabled" : "";
    var prevOnClick = page == 1 || pageTotal <= 1 ? "" : "setPageAjaxDataTable(" + prevpage + ", " + funcGenerateDataTable + ")";
    var prevButton = "<li class='page-item " + previous + "' onclick='" + prevOnClick + "'><b role='button' class='page-link'><</b></li>";
    var pagesBtn = "";

    if (pageTotal > 0) {
        if (pageTotal <= 8) {
            for (var i = 1; i <= pageTotal; i++) {
                var activeStr = i == page ? "active" : "";
                var onClick =
                    i == page ? "" : funcGenerateDataTable + "(" + i + ")";
                pagesBtn += "<li class='page-item " + activeStr + "' onclick='" + onClick + "'><b role='button' class='page-link'>" + i + "</b></li>";
            }
        } else {
            var lastNum, nextNum;

            if (page > pageTotal - 5) {
                lastNum = page - (8 - (pageTotal - page + 1));
                nextNum = pageTotal;
            } else {
                lastNum = page <= 4 ? 1 : page - 4;
                nextNum = page <= 4 ? 8 : page * 1 + 5;
            }

            var pagesPrev = "";
            var pagesNext = "";

            if (page != 1) {
                for (var i = lastNum; i < page; i++) {
                    var activeStr = i == page ? "active" : "";
                    var onClick =
                        i == page ? "" : funcGenerateDataTable + "(" + i + ")";
                    pagesPrev += "<li class='page-item " + activeStr + "' onclick='" + onClick + "'><b role='button' class='page-link'>" + i + "</b></li>";
                }
            }

            for (var j = page; j <= nextNum; j++) {
                var activeStr = j == page ? "active" : "";
                var onClick =
                    j == page ? "" : funcGenerateDataTable + "(" + j + ")";
                pagesNext += "<li class='page-item " + activeStr + "' onclick='" + onClick + "'><b role='button' class='page-link'>" + j + "</b></li>";
            }

            pagesBtn = pagesPrev + pagesNext;
        }
    }

    $("#" + idcontainer).html(prevButton + pagesBtn + nextButton);
}

//OK
$("#modal-userProfile").off("show.bs.modal");
$("#modal-userProfile").on("show.bs.modal", function () {
    $.ajax({
        type: "POST",
        url: baseURL + "access/detailProfileSetting",
        contentType: "application/json",
        dataType: "json",
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            NProgress.set(0.4);
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    var responseJSON = jqXHR.responseJSON;
                    $("#name").val(responseJSON.name);
                    $("#email").val(responseJSON.email);
                    $("#username").val(responseJSON.username);

                    $("#saveSetting").off("click");
                    $("#saveSetting").on("click", function (e) {
                        e.preventDefault();
                        var dataForm = $("#form-userProfile :input").serializeArray();
                        var dataSend = {};

                        $.each(dataForm, function () {
                            dataSend[this.name] = this.value;
                        });

                        $("#form-userProfile :input").attr("disabled", true);

                        $.ajax({
                            type: "POST",
                            url: baseURL + "access/saveDetailProfileSetting",
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
                                NProgress.set(0.4);
                            },
                            complete: function (jqXHR, textStatus) {
                                var responseJSON = jqXHR.responseJSON;
                                switch (jqXHR.status) {
                                    case 200:
                                        showWarning(responseJSON.message);
                                        $("#modal-userProfile").modal("hide");
                                        $("#spanNameUser, #linkNameUser").html(responseJSON.name);
                                        $("#linkEmailUser").html(responseJSON.email);

                                        if (responseJSON.relogin) {
                                            window.location.replace($("#linkLogout").attr("href"));
                                        }
                                        break;
                                    default:
                                        generateWarningMessageResponse(jqXHR);
                                        break;
                                }
                            },
                        }).always(function (jqXHR, textStatus) {
                            $("#form-userProfile :input").attr("disabled", false);
                            NProgress.done();
                            setUserToken(jqXHR);
                        });
                    });
                    break;
                default:
                    showWarning(jqXHR.messages);
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
});

//OK
function generateWarningMessageResponse(jqXHR) {
    var responseMessage = getMessageResponse(jqXHR);
    showWarning(responseMessage);
}

function getMessageResponse(jqXHR) {
    var responseMessage;
    try {
        var responseJSON = jqXHR.responseJSON;
        responseMessage = Object.values(responseJSON.messages)[0];
    } catch (err) {
        responseMessage =
            jqXHR.messages != "" &&
                jqXHR.messages !== null &&
                jqXHR.messages !== undefined
                ? Object.values(jqXHR.messages)[0]
                : "";
    }
    return responseMessage;
}

//OK
function showWarning(message) {
    $("#modalWarning").on("show.bs.modal", function () {
        $("#modalWarningBody").html(message);
    });
    $("#modalWarning").modal("show");
}

function searchForArray(haystack, needle) {
    var i, j, current;
    for (i = 0; i < haystack.length; ++i) {
        if (needle.length === haystack[i].length) {
            current = haystack[i];
            for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
            if (j === needle.length) return i;
        }
    }
    return -1;
}

//OK
function toggleSlideContainer(leftContainer, rightContainer) {
    if ($("#" + leftContainer).hasClass("show")) {
        $("#" + leftContainer)
            .find(".box, .row, .nav")
            .addClass("d-none");
        $("#" + leftContainer)
            .removeClass("show")
            .addClass("hide");
        $("#" + rightContainer)
            .removeClass("hide")
            .addClass("show");
        $("#" + rightContainer)
            .find(".box, .row, .nav")
            .removeClass("d-none");
    } else {
        $("#" + rightContainer)
            .find(".box, .row, .nav")
            .addClass("d-none");
        $("#" + rightContainer)
            .removeClass("show")
            .addClass("hide");
        $("#" + leftContainer)
            .removeClass("hide")
            .addClass("show");
        $("#" + leftContainer)
            .find(".box, .row, .nav")
            .removeClass("d-none");
    }
}

function getDateToday() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();

    return (
        (("" + day).length < 2 ? "0" : "") + day + "-" +
        (("" + month).length < 2 ? "0" : "") + month + "-" + year
    );
}

function getDateTomorrow() {
    var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();

    return (
        (("" + day).length < 2 ? "0" : "") + day + "-" +
        (("" + month).length < 2 ? "0" : "") + month + "-" + year
    );
}

function generateButtonMessageDetail(
    idNotificationUserAdmin,
    idMessageType,
    idPrimary
) {
    var dataParamNotif = generateDataParamNotif(
        idNotificationUserAdmin,
        idMessageType,
        idPrimary
    );
    return (
        '<div class="button button-round button-primary button-sm pull-right btnDetailNotification" ' +
        dataParamNotif +
        ">" +
        '<i aria-hidden="true" class="fa fa-info mr-0"></i>' +
        "</div>"
    );
}

//OK
function generateDataParamNotif(idNotificationUserAdmin, idMessageType, idPrimary) {
    var urlView = "",
        aliasView = "",
        tabMenuView = "",
        idReservationDetails = 0,
        idCollectPayment = 0,
        idWithdrawalRecap = 0;

    switch (idMessageType) {
        case "1":
        case "2":
        case "3":
            urlView = "reservation";
            aliasView = "RSV";
            idReservationDetails = idPrimary;
            break;
        case "7":
            urlView = "collectPayment";
            aliasView = "CP";
            idCollectPayment = idPrimary;
            break;
        case "8":
            urlView = "withdrawal";
            aliasView = "WD";
            idWithdrawalRecap = idPrimary;
            break;
        default:
            break;
    }

    return (
        'data-idNotificationUserAdmin="' +
        idNotificationUserAdmin +
        '" ' +
        'data-idMessageType="' +
        idMessageType +
        '" ' +
        'data-urlView="' +
        urlView +
        '" ' +
        'data-aliasView="' +
        aliasView +
        '" ' +
        'data-tabMenuView="' +
        tabMenuView +
        '" ' +
        'data-idReservationDetails="' +
        idReservationDetails +
        '" ' +
        'data-idCollectPayment="' +
        idCollectPayment +
        '" ' +
        'data-idWithdrawalRecap="' +
        idWithdrawalRecap +
        '"'
    );
}

function openMenuFromNotification(elem) {
    var idNotificationUserAdmin = $(elem).attr("data-idNotificationUserAdmin"),
        idMessageType = $(elem).attr("data-idMessageType"),
        urlView = $(elem).attr("data-urlView"),
        aliasView = $(elem).attr("data-aliasView"),
        tabMenuView = $(elem).attr("data-tabMenuView"),
        dateSchedule = $(elem).attr("data-dateSchedule"),
        idMailbox = $(elem).attr("data-idMailbox"),
        idReservation = $(elem).attr("data-idReservation"),
        idReservationDetails = $(elem).attr("data-idReservationDetails"),
        idDayOffRequest = $(elem).attr("data-idDayOffRequest");

    localStorage.removeItem("OSNotificationData");
    var OSNotificationData = {};
    switch (idMessageType) {
        case "1":
            OSNotificationData = { type: urlView, idMailbox: idMailbox };
            break;
        case "2":
            OSNotificationData = {
                type: urlView,
                idReservation: idReservation,
            };
            break;
        case "3":
            break;
        case "4":
            OSNotificationData = {
                type: urlView,
                idReservationDetails: idReservationDetails,
                dateSchedule: dateSchedule,
            };
            break;
        case "5":
            OSNotificationData = {
                type: urlView,
                idDayOffRequest: idDayOffRequest,
                tabMenuView: tabMenuView,
            };
            break;
        case "6":
            OSNotificationData = {
                type: urlView,
                idReservationDetails: idReservationDetails,
                tabMenuView: tabMenuView,
                dateSchedule: dateSchedule,
            };
            break;
        default:
            break;
    }
    localStorage.setItem(
        "OSNotificationData",
        JSON.stringify(OSNotificationData)
    );

    getViewURL(urlView, aliasView, function () {
        dismissNotification(idNotificationUserAdmin);
        getUnreadNotificationList();
        $(
            "#containerNotificationButton, #containerNotificationIconBodyList"
        ).removeClass("show");
    });
}

function jumpFocusToElement(elementID) {
    if ($("#" + elementID).length != 0) {
        document.getElementById(elementID).scrollIntoView();
    }
}

//OK
function buildPINInputEvent(className) {
    $("." + className).val('');
    const inputs = document.querySelectorAll('input.' + className);
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('keydown', function (event) {
            if (event.key === "Backspace") {
                inputs[i].value = '';
                if (i !== 0) inputs[i - 1].focus();
            } else {
                if (i === inputs.length - 1 && inputs[i].value !== '') {
                    return true;
                } else if (event.keyCode > 47 && event.keyCode < 58) {
                    inputs[i].value = event.key;
                    if (i !== inputs.length - 1) inputs[i + 1].focus();
                    event.preventDefault();
                } else if (event.keyCode > 64 && event.keyCode < 91) {
                    inputs[i].value = String.fromCharCode(event.keyCode);
                    if (i !== inputs.length - 1) inputs[i + 1].focus();
                    event.preventDefault();
                }
            }
        });
    }
}
$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

function toCamelCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            if (index === 0) return word; // Keep the first word lowercase
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
}

function capitalizeFirstLetter(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function showGeneralLedger(idAccount, dateStart, dateEnd) {
    var dataSend = {
        idAccount: idAccount,
        dateStart: dateStart,
        dateEnd: dateEnd
    };

    $.ajax({
        type: 'POST',
        url: baseURL + "generalLedger/getDataPerAccountPeriod",
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
            $(".modalGeneral-generalLedger-trTransaction").remove();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var detailAccount = responseJSON.detailAccount,
                        beginningBalanceData = responseJSON.beginningBalanceData,
                        transactionData = responseJSON.transactionData;
                    if (beginningBalanceData.length !== 0) {
                        var dateStartStr = moment(dateStart, "DD-MM-YYYY").format("DD MMM YYYY"),
                            dateEndStr = moment(dateEnd, "DD-MM-YYYY").format("DD MMM YYYY"),
                            defaultDRCR = beginningBalanceData.DEFAULTDRCR,
                            beginningBalance = parseInt(beginningBalanceData.BEGINNINGBALANCE),
                            beginningBalanceDR = 0,
                            beginningBalanceCR = 0,
                            totalMutationDebit = 0,
                            totalMutationCredit = 0,
                            rowTransaction = '';

                        if (defaultDRCR == 'DR') {
                            if (beginningBalance > 0) beginningBalanceDR = numberFormat(beginningBalance);
                            if (beginningBalance < 0) beginningBalanceCR = numberFormat(beginningBalance);
                        } else {
                            if (beginningBalance > 0) beginningBalanceCR = numberFormat(beginningBalance);
                            if (beginningBalance < 0) beginningBalanceDR = numberFormat(beginningBalance);
                        }

                        $.each(transactionData, function (index, arrayTransaction) {
                            totalMutationDebit += parseInt(arrayTransaction.DEBIT);
                            totalMutationCredit += parseInt(arrayTransaction.CREDIT);
                            rowTransaction += '<tr class="modalGeneral-generalLedger-trTransaction">' +
                                '<td align="center">' + arrayTransaction.DATETRANSACTION + '</td>' +
                                '<td>' + arrayTransaction.REFFNUMBER + '</td>' +
                                '<td>' + arrayTransaction.DESCRIPTIONRECAP + '<br/><small class="font-italic">' + arrayTransaction.DESCRIPTIONDETAIL + '</small></td>' +
                                '<td align="right">' + numberFormat(arrayTransaction.DEBIT) + '</td>' +
                                '<td align="right">' + numberFormat(arrayTransaction.CREDIT) + '</td>' +
                                '</tr>';

                        });

                        var totalMutation = defaultDRCR == 'DR' ? totalMutationDebit - totalMutationCredit : totalMutationCredit - totalMutationDebit;

                        $("#modalGeneral-generalLedger-trTotalMutation").before(rowTransaction);
                        $("#modalGeneral-generalLedger-detailAccountDatePeriod").html(detailAccount.ACCOUNTCODE + " " + detailAccount.ACCOUNTNAME + "<span class='pull-right'>" + dateStartStr + " to " + dateEndStr + "</span>");
                        $("#modalGeneral-generalLedger-beginningBalanceDebit").html(numberFormat(beginningBalanceDR));
                        $("#modalGeneral-generalLedger-beginningBalanceCredit").html(numberFormat(beginningBalanceCR));
                        $("#modalGeneral-generalLedger-totalMutationDebit").html(numberFormat(totalMutationDebit));
                        $("#modalGeneral-generalLedger-totalMutationCredit").html(numberFormat(totalMutationCredit));
                        $("#modalGeneral-generalLedger-footerBeginningBalance").html((beginningBalance == 0 ? 0 : numberFormat(beginningBalance)));
                        $("#modalGeneral-generalLedger-footerTotalMutation").html(numberFormat(totalMutation));
                        $("#modalGeneral-generalLedger-footerEndingBalance").html(numberFormat((beginningBalance == 0 ? 0 : beginningBalance) + totalMutation));
                        $("#modalGeneral-generalLedger").modal("show");
                    } else {
                        showWarning("No general ledger data shown");
                    }
                    break;
                case 404:
                default:
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $("#window-loader").modal("hide");
        NProgress.done()
        setUserToken(jqXHR)
    });
}

function generateTableListAccountCheckbox(dataAllAccountJournal, tableAccountName) {
    var codeNumberGeneral = '',
        codeNumberMain = '',
        codeNumberSub = '',
        textClass = '',
        additionalText = '',
        rowsAccount = '';
    $.each(dataAllAccountJournal, function (index, array) {
        var isParentAccount = dataAllAccountJournal.filter(obj => obj.IDACCOUNTPARENT.includes(array.IDACCOUNT)).length > 0 ? true : false,
            checkboxAccount = !isParentAccount ? '<label class="adomx-checkbox"><input type="checkbox" data-idAccount="' + array.IDACCOUNT + '" data-idAccountParent="' + array.IDACCOUNTPARENT + '" data-levelAccount="' + array.LEVEL + '" data-accountName="' + array.ACCOUNTCODEFULL + ' ' + array.ACCOUNTNAME + '" class="checkboxAccount"/> <i class="icon"></i></label>' : "";
        switch (array.LEVEL) {
            case '1':
            case 1:
                codeNumberGeneral = array.ACCOUNTCODE;
                codeNumberMain = '';
                codeNumberSub = '';
                textClass = '';
                additionalText = '';
                break;
            case '2':
            case 2:
                codeNumberMain = array.ACCOUNTCODE;
                codeNumberSub = '';
                textClass = 'ml-10';
                additionalText = '<span class="h4">↳ </span>';
                break;
            case '3':
            case 3:
                codeNumberSub = array.ACCOUNTCODE;
                textClass = 'ml-20';
                additionalText = '<span class="h4">↳ </span>';
                break;
        }

        rowsAccount += "<tr>" +
            "<td class='pr-1' width='40'>" + codeNumberGeneral + "</td>" +
            "<td class='px-1' width='40'>" + codeNumberMain + "</td>" +
            "<td class='pl-1' width='40'>" + codeNumberSub + "</td>" +
            "<td ><span class='" + textClass + "'>" + additionalText + array.ACCOUNTNAME + "</span></td>" +
            "<td class='text-center' width='40'>" + checkboxAccount + "</td>" +
            "</tr>";
        $("#" + tableAccountName + " > tbody").html(rowsAccount);
    });
}