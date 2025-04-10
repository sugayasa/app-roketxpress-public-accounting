if (notificationFunc == null) {
    var notificationFunc = function () {
        $(document).ready(function () {
            setOptionHelper('optionNotificationUserAdminType', 'dataNotificationUserAdminType')
            getDataUnreadNotification()
            getDataReadNotification()
        })
    }
}

$('#optionNotificationUserAdminType').off('change')
$('#optionNotificationUserAdminType').on('change', function (e) {
    getDataUnreadNotification()
    getDataReadNotification()
});

$('#keywordSearch').off('keydown')
$('#keywordSearch').on('keydown', function (e) {
    if (e.which === 13) {
        getDataUnreadNotification()
        getDataReadNotification()
    }
});

function getDataUnreadNotification(page) {
    var noDataNotificationElem =
        '<div class="col-12 mt-40 mb-30 text-center" id="noDataUnreadNotification">' +
        '   <img src="' + ASSET_IMG_URL + 'no-data.png" width="120px"/>' +
        '   <h5>No Data Found</h5>' +
        '   <p>There are no unread message</p>' +
        '</div>'

    getDataNotification(
        page,
        1,
        'Unread',
        'tableUnreadNotification',
        noDataNotificationElem
    )
}

function getDataReadNotification(page) {
    var noDataNotificationElem =
        '<div class="col-12 mt-40 mb-30 text-center" id="noDataReadNotification">' +
        '   <img src="' + ASSET_IMG_URL + 'no-data.png" width="120px"/>' +
        '   <h5>No Data Found</h5>' +
        '   <p>There are no message</p>' +
        '</div>'

    getDataNotification(
        page,
        2,
        'Read',
        'tableReadNotification',
        noDataNotificationElem
    )
}

function getDataNotification(
    page = 1,
    status,
    statusNotificationStr,
    tableId,
    noDataNotificationElem
) {
    var $tableBody = $('#' + tableId),
        idNotificationUserAdminType = $('#optionNotificationUserAdminType').val(),
        keywordSearch = $('#keywordSearch').val(),
        dataSend = {
            page: page,
            status: status,
            idNotificationUserAdminType: idNotificationUserAdminType,
            keywordSearch: keywordSearch
        }

    $.ajax({
        type: 'POST',
        url: baseURL + 'notification/getDataNotification',
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
            NProgress.set(0.4)
            $('#noData' + statusNotificationStr + 'Notification').remove()
            $tableBody.html("<center class='my-auto mx-auto'><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center>")
        },
        success: function (response) {
            var data = response.result.data,
                rows = ''

            if (data.length === 0) {
                rows = noDataNotificationElem
            } else {
                rows +=
                    '<div class="accordion w-100" id="accordion' + statusNotificationStr + 'Notification">'
                $.each(data, function (index, array) {
                    var btnDetail = generateButtonNotificationDetail(
                        array.IDMESSAGEPARTNER,
                        array.IDMESSAGEPARTNERTYPE,
                        array.IDPRIMARY
                    )
                    rows +=
                        '<div class="card">' +
                        '   <div class="card-header">' +
                        '       <h2>' +
                        '           <button>' +
                        '               <i class="' + array.ICON + '"></i> ' + array.TITLE + '<br/>' +
                        '               <p class="h6">' + array.MESSAGE + '</p>' +
                        '               <small>' + array.DATETIMEINSERT + '</small>' + btnDetail +
                        '           </button>' +
                        '       </h2>' +
                        '   </div>' +
                        '</div>'
                })
                rows += '</div>'
            }

            if (page != 1) {
                $('#btnPreviousPage' + statusNotificationStr + 'Notification').on(
                    'click',
                    function (e) {
                        getDataNotification(
                            page - 1,
                            status,
                            statusNotificationStr,
                            tableId,
                            noDataNotificationElem
                        );
                    }
                )
                $('#btnPreviousPage' + statusNotificationStr + 'Notification').removeClass('d-none')
            } else {
                $('#btnPreviousPage' + statusNotificationStr + 'Notification')
                    .off('click')
                    .addClass('d-none')
            }

            if (page != response.result.pageTotal && data.length > 0) {
                $('#btnNextPage' + statusNotificationStr + 'Notification').on(
                    'click',
                    function (e) {
                        getDataNotification(
                            page + 1,
                            status,
                            statusNotificationStr,
                            tableId,
                            noDataNotificationElem
                        );
                    }
                )
                $('#btnNextPage' + statusNotificationStr + 'Notification').removeClass('d-none')
            } else {
                $('#btnNextPage' + statusNotificationStr + 'Notification').off('click')
                $('#btnNextPage' + statusNotificationStr + 'Notification').addClass('d-none')
            }

            generateDataInfo(
                'tableDataCount' + statusNotificationStr + 'Notification',
                response.result.dataStart,
                response.result.dataEnd,
                response.result.dataTotal
            )
            $tableBody.html(rows)
            $('.btnDetailNotification').off('click')
            $('.btnDetailNotification').on('click', function () {
                openMenuFromNotification(this)
            })
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done()
        setUserToken(jqXHR)
    });
}

notificationFunc()
