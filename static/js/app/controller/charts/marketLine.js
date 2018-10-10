define([
    'app/controller/base',
    'app/module/echarts'
], function(base, echarts) {
    var symbolVal = base.getUrlParam("symbol") || "btcusdt", //交易对
        exchange = base.getUrlParam("exchange") || "huobiPro"; //交易所

    var config = {
        symbol: symbolVal,
        exchange: exchange,
    };

    var myChart = echarts.init(document.getElementById('chart'));
    var chartOption = {};
    var option = {};
    var primaryColor = '#348ff6';
    var buyColor = '#3cbc98';
    var sellColor = '#fc5858';

    init();

    function init() {
        // base.showLoading();
        getBuySellFive();
        addListener();


    }

    function getBuySellFive(refresh) {
        var data = {
            "bids": [
                { "price": 3.0, "count": 100.0 },
                { "price": 2.0, "count": 200.0 },
                { "price": 1.0, "count": 300.0 }
            ],
            "asks": [{ "price": 5.0, "count": 95.0 },
                { "price": 6.0, "count": 195.0 },
                { "price": 7.0, "count": 185.0 }
            ]
        }
        option = {
            price: [],
            amount: [],
        };

        data.bids.forEach((item, i) => {
            option.price.push(item.price);
            option.amount.push({
                value: item.count,
                itemStyle: {
                    color: buyColor
                }
            });
        })
        data.asks.forEach((item, i) => {
            option.price.push(item.price);
            option.amount.push({
                value: item.count,
                itemStyle: {
                    color: sellColor
                }
            });
        })
        setChart(refresh);
    }

    function setChart(refresh) {
        chartOption = {
            animation: false,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        color: primaryColor
                    },
                },
                confine: true,
            },
            xAxis: {
                type: 'category',
                data: option.price,
                axisLine: {
                    lineStyle: {
                        color: '#eeeeee',
                    }
                },
                axisLabel: {
                    color: '#999999',
                    fontSize: '.24rem',
                },
            },
            yAxis: {
                scale: true,
                axisLine: {
                    lineStyle: {
                        color: '#eeeeee',
                    }
                },
                axisLabel: {
                    color: '#999999',
                    fontSize: '.24rem',
                },
                splitLine: {
                    lineStyle: {
                        color: '#eee',
                    }
                },
            },
            grid: [{
                left: '10%',
                right: '10%',
                top: '5%',
                height: '80%'
            }],
            series: [{
                data: option.amount,
                type: 'bar',
                showSymbol: false,
                barWidth: $(".braWidth").width(),
                itemStyle: {
                    color: buyColor,
                    barBorderRadius: [2, 2, 0, 0]
                }
            }]
        }
        if (refresh) {
            myChart.clear();
        }
        myChart.setOption(chartOption)
    }

    function addListener() {

    }

});