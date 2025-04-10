var DashboarfdChartjs, ChartElem;
if (dashboardFunc == null) {
    var dashboardFunc = function () {
        $(document).ready(function () {
            setOptionHelper("optionMonth", "optionMonth", thisMonth, false);
            setOptionHelper("optionYear", "optionYear", false, false);
            getDataDashboard();
        });
    };
}

$("#optionMonth, #optionYear").off("change");
$("#optionMonth, #optionYear").on("change", function (e) {
    $("#chartjs-statistic").remove();
    getDataDashboard();
});

function getDataDashboard() {
    // var strmonth = $("#optionMonth option:selected").text(),
    //     month = $("#optionMonth").val(),
    //     year = $("#optionYear").val(),
    //     dataSend = { month: month, year: year };

    // $.ajax({
    //     type: "POST",
    //     url: baseURL + "access/getDataDashboard",
    //     contentType: "application/json",
    //     dataType: "json",
    //     data: mergeDataSend(dataSend),
    //     xhrFields: {
    //         withCredentials: true,
    //     },
    //     headers: {
    //         Authorization: "Bearer " + getUserToken(),
    //     },
    //     beforeSend: function () {
    //         NProgress.set(0.4);
    //         $("#window-loader").modal("show");
    //         $("#totalAllTime, #totalThisMonth, #totalToday, #totalTomorrow").html("0");
    //         $("#bodyTopProductList").html("<tr><td colspan='2'><center><i class='fa fa-spinner fa-pulse'></i><br/>Loading data...</center></td></tr>");

    //         DashboarfdChartjs = null;
    //         $(".chartjs-revenue-statistics-chart").html('<canvas id="chartjs-statistic"></canvas>');
    //     },
    //     complete: function (jqXHR, textStatus) {
    //         var response = jqXHR.responseJSON,
    //             dataReservation = response.dataReservation,
    //             dataTopProduct = response.dataTopProduct;

    //         if (dataReservation != undefined || dataReservation.length != 0) {
    //             $("#totalAllTime").html(
    //                 numberFormat(dataReservation.TOTALRESERVATIONALLTIME)
    //             );
    //             $("#totalThisMonth").html(
    //                 numberFormat(dataReservation.TOTALRESERVATIONTHISMONTH)
    //             );
    //             $("#totalToday").html(
    //                 numberFormat(dataReservation.TOTALRESERVATIONTODAY)
    //             );
    //             $("#totalTomorrow").html(
    //                 numberFormat(dataReservation.TOTALRESERVATIONTOMORROW)
    //             );
    //             $("#percentageThisMonth").html(
    //                 dataReservation.PERCENTAGETHISMONTH
    //             );
    //             $("#percentageToday").html(dataReservation.PERCENTAGETODAY);
    //             $("#percentageTomorrow").html(
    //                 dataReservation.PERCENTAGETOMORROW
    //             );
    //             $("#progessbarThisMonth").css(
    //                 "width",
    //                 dataReservation.PERCENTAGETHISMONTHSTYLE + "%"
    //             );
    //             $("#progessbarToday").css(
    //                 "width",
    //                 dataReservation.PERCENTAGETODAY + "%"
    //             );
    //             $("#progessbarTomorrow").css(
    //                 "width",
    //                 dataReservation.PERCENTAGETOMORROW + "%"
    //             );
    //         }

    //         if (dataTopProduct !== false && dataTopProduct.length > 0) {
    //             var trTopProduct = "";
    //             $.each(dataTopProduct, function (index, array) {
    //                 styleNoBorder =
    //                     index == 0 ? "border-top:none !important" : "";
    //                 trTopProduct +=
    //                     "<tr>" +
    //                     '<td style="' +
    //                     styleNoBorder +
    //                     '">' +
    //                     '<h5 class="topSourceContent">' +
    //                     array.PRODUCTNAME +
    //                     "</h5>" +
    //                     '<p class="topSourceContent mt-5">' +
    //                     numberFormat(array.TOTALRESERVATIONOFMONTH) +
    //                     " Reservation at selected period</p>" +
    //                     '<small class="topSourceContent">' +
    //                     numberFormat(array.AVERAGERESERVATIONPERMONTH) +
    //                     " Avg Reservation / month</small>" +
    //                     "</td>" +
    //                     "</tr>";
    //             });

    //             $("#bodyTopProductList").html(trTopProduct);
    //         } else {
    //             $("#bodyTopProductList").html(
    //                 "<tr><td class='text-center'>No data found</td></tr>"
    //             );
    //         }

    //         if (response.dataStatistic !== false) {
    //             if ($("#chartjs-statistic").length) {
    //                 var canvas = document.getElementById("chartjs-statistic");
    //                 ChartElem = canvas.getContext("2d");
    //                 ChartElem.clearRect(
    //                     0,
    //                     0,
    //                     ChartElem.canvas.width,
    //                     ChartElem.canvas.height
    //                 );

    //                 var Chartconfig = {
    //                     type: "line",
    //                     data: {
    //                         labels: response.dataStatistic.arrDates,
    //                         datasets: response.dataStatistic.arrDetailData,
    //                     },
    //                     options: {
    //                         maintainAspectRatio: false,
    //                         legend: {
    //                             display: true,
    //                             labels: {
    //                                 fontColor: "#aaaaaa",
    //                             },
    //                         },
    //                         tooltips: {
    //                             mode: "index",
    //                             intersect: false,
    //                             xPadding: 10,
    //                             yPadding: 10,
    //                             caretPadding: 10,
    //                             cornerRadius: 4,
    //                             titleMarginBottom: 4,
    //                             displayColors: false,
    //                             callbacks: {
    //                                 title: function (tooltipItems, data) {
    //                                     return (
    //                                         tooltipItems[0].xLabel +
    //                                         " " +
    //                                         strmonth +
    //                                         " " +
    //                                         year
    //                                     );
    //                                 },
    //                             },
    //                         },
    //                         scales: {
    //                             xAxes: [
    //                                 {
    //                                     display: true,
    //                                     gridLines: {
    //                                         display: false,
    //                                     },
    //                                     ticks: {
    //                                         fontColor: "#aaaaaa",
    //                                     },
    //                                 },
    //                             ],
    //                             yAxes: [
    //                                 {
    //                                     display: true,
    //                                     labelString: "probability",
    //                                     gridLines: {
    //                                         color: "rgba(136,136,136,0.1)",
    //                                         lineWidth: 3,
    //                                         drawBorder: false,
    //                                         zeroLineWidth: 3,
    //                                         zeroLineColor:
    //                                             "rgba(136,136,136,0.1)",
    //                                     },
    //                                     ticks: {
    //                                         padding: 15,
    //                                         stepSize: 10,
    //                                         fontColor: "#aaaaaa",
    //                                     },
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                 };
    //                 DashboarfdChartjs = new Chart(ChartElem, Chartconfig);
    //             }
    //         }
    //     },
    // }).always(function (jqXHR, textStatus) {
    //     NProgress.done();
    //     $("#window-loader").modal("hide");
    //     setUserToken(jqXHR);
    // });
}

var $exampleEchartBarDataset = $('.example-echart-bar-dataset');
if ($exampleEchartBarDataset.length) {
    var $exampleEchartBarDatasetId = $exampleEchartBarDataset.attr('id');
    var $exampleEchartBarDatasetActive = echarts.init(document.getElementById($exampleEchartBarDatasetId));
    var option = {
        legend: {
            textStyle: {
                color: '#aaaaaa'
            }
        },
        tooltip: {},
        dataset: {
            source: [
                ['status', 'Income', 'Expense', 'Margin'],
                ['Yesterday', 43.3, 85.8, 93.7],
                ['Today', 83.1, 73.4, 55.1],
                ['last Month', 86.4, 65.2, 82.5],
                ['This Month', 72.4, 53.9, 39.1]
            ]
        },
        xAxis: {
            type: 'category',
            axisTick: {
                show: false,
            },
            axisLine: {
                show: false,
            },
            axisLabel: {
                color: '#aaaaaa',
            },
        },
        yAxis: {
            type: 'value',
            axisTick: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(136,136,136,0.2)',
                }
            },
            axisLabel: {
                color: '#aaaaaa',
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(136,136,136,0.2)',
                }
            },
        },
        series: [
            { type: 'bar' },
            { type: 'bar' },
            { type: 'bar' }
        ]
    };
    $exampleEchartBarDatasetActive.setOption(option);
}

var $exampleEchartDoughnutChart = $('.example-echart-doughnut-chart');
if ($exampleEchartDoughnutChart.length) {

    var $exampleEchartDoughnutChartId = $exampleEchartDoughnutChart.attr('id');
    var $exampleEchartDoughnutChartActive = echarts.init(document.getElementById($exampleEchartDoughnutChartId));
    // specify chart configuration item and data
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data: ['Revenue', 'Expense', 'Liabilities'],
            textStyle: {
                color: '#aaaaaa'
            }
        },
        series: [
            {
                name: 'Doughnut',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '13',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [
                    { value: 1548, name: 'Revenue' },
                    { value: 310, name: 'Expense' },
                    { value: 234, name: 'Liabilities' }
                ]
            }
        ]
    };
    // use configuration item and data specified to show chart
    $exampleEchartDoughnutChartActive.setOption(option);
}

if ($('#example-chartjs-line').length) {
    var ECL = document.getElementById('example-chartjs-line').getContext('2d');
    var ECLconfig = {
        type: 'line',
        data: {
            labels: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50'],
            datasets: [{
                label: 'Total Sale',
                data: [10, 20, 27, 50, 60, 55, 65, 90, 70, 85, 90],
                backgroundColor: '#fb7da4',
                borderColor: '#fb7da4',
                pointBorderColor: '#fb7da4',
                fill: false,
            },
            {
                label: 'Total View',
                data: [20, 15, 8, 60, 68, 35, 60, 80, 65, 60, 85],
                backgroundColor: '#428bfa',
                borderColor: '#428bfa',
                pointBorderColor: '#428bfa',
                fill: false,
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                labels: {
                    fontColor: '#aaaaaa',
                }
            },
            scales: {
                xAxes: [{
                    display: true,
                    gridLines: {
                        color: 'rgba(136,136,136,0.1)',
                        lineWidth: 1,
                        drawBorder: false,
                        zeroLineWidth: 1,
                        zeroLineColor: 'rgba(136,136,136,0.1)',
                    },
                    ticks: {
                        fontColor: '#aaaaaa',
                    },
                }],
                yAxes: [{
                    display: true,
                    gridLines: {
                        color: 'rgba(136,136,136,0.1)',
                        lineWidth: 1,
                        drawBorder: false,
                        zeroLineWidth: 1,
                        zeroLineColor: 'rgba(136,136,136,0.1)',
                    },
                    ticks: {
                        fontColor: '#aaaaaa',
                    },
                }],
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    };
    var ECLchartjs = new Chart(ECL, ECLconfig);
}
dashboardFunc();
