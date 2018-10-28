(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.Datafeeds = {})));
}(this, (function(exports) {
    'use strict';
    const PERIODLIST = ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'];

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] }
            instanceof Array && function(d, b) { d.__proto__ = b; }) ||
        function(d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };

    function __extends(d, b) {
        extendStatics(d, b);

        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * If you want to enable logs from datafeed set it to `true`
     */
    var isLoggingEnabled = false;

    function logMessage(message) {
        if (isLoggingEnabled) {
            var now = new Date();
        }
    }

    function getErrorMessage(error) {
        if (error === undefined) {
            return '';
        } else if (typeof error === 'string') {
            return error;
        }
        return error.message;
    }
    //日期格式化 format|| 'yyyy-MM-dd';
    function formatDate(date, format) {
        var format = format || 'yyyy-MM-dd';
        return date ? new Date(date).format(format) : "--";
    }

    var HistoryProvider = /** @class */ (function() {
        function HistoryProvider(datafeedUrl, requester) {
            this._datafeedUrl = datafeedUrl;
            this._requester = requester;
        }
        HistoryProvider.prototype.getBars = function(symbolInfo, resolution, rangeStartDate, rangeEndDate) {
            var _this = this;
            let reg = /[a-zA-Z]/g;
            let period = '';
            var loadTime = new Date(Number($("#tv_chart_container").attr("firstLoadTime"))).getTime();
            var foramtList = {
                '1': '1min',
                '5': '5min',
                '15': '15min',
                '30': '30min',
                '60': '60min',
                '240': '4hour',
                '1D': '1day',
                '1W': '1week',
                '1M': '1mon'
            }
            period = foramtList[resolution];
            // if(!resolution.match(reg)){
            //     loadTime = new Date(loadTime + resolution * 60 * 1000);
            // }else{
            //     loadTime = new Date(loadTime + 60 * 1000 * 60);
            // }
            // setTimeout(() => {
            //     $("#tv_chart_container").attr("firstLoad", "0");
            // }, 500);
            var requestParams = {
                symbol: 'FMVP',
                toSymbol: symbolInfo.toSymbol || 'BTC',
                period: period,
                resolution: resolution,
                startDatetime: formatDate(new Date(rangeStartDate * 1000), 'yyyy-MM-dd hh:mm'),
                endDatetime: formatDate(new Date(rangeEndDate * 1000), 'yyyy-MM-dd hh:mm')
            };

            if ($("#tv_chart_container").attr("firstLoad") === "1") {
                $("#tv_chart_container").attr("startDatetime", requestParams.startDatetime);
                requestParams.endDatetime = $("#tv_chart_container").attr("startDatetime");
            }
            var sendParam = {
                code: '650066',
                json: JSON.stringify(requestParams)
            };
            return new Promise(function(resolve, reject) {
                $.ajax({
                    type: 'post',
                    url: '/api',
                    data: sendParam
                }).then(function(res) {
                    // var response = [{"time":1505865600000,"close":156.07,"open":157.9,"high":158.26,"low":153.83,"volume":51693239},{"time":1505952000000,"close":153.39,"open":155.8,"high":155.8,"low":152.75,"volume":36643382},{"time":1506038400000,"close":151.89,"open":152.02,"high":152.27,"low":150.56,"volume":46114424},{"time":1506297600000,"close":150.55,"open":149.99,"high":151.83,"low":149.16,"volume":43922334},{"time":1506384000000,"close":153.14,"open":151.78,"high":153.92,"low":151.69,"volume":35470985},{"time":1506470400000,"close":154.23,"open":153.8,"high":154.7189,"low":153.54,"volume":24959552},{"time":1506556800000,"close":153.28,"open":153.89,"high":154.28,"low":152.7,"volume":21896592},{"time":1506643200000,"close":154.12,"open":153.21,"high":154.13,"low":152,"volume":25856530},{"time":1506902400000,"close":153.81,"open":154.26,"high":154.45,"low":152.72,"volume":18524860},{"time":1506988800000,"close":154.48,"open":154.01,"high":155.09,"low":153.91,"volume":16146388},{"time":1507075200000,"close":153.4508,"open":153.63,"high":153.86,"low":152.46,"volume":19844177},{"time":1507161600000,"close":155.39,"open":154.18,"high":155.44,"low":154.05,"volume":21032800},{"time":1507248000000,"close":155.3,"open":154.97,"high":155.49,"low":154.56,"volume":16423749},{"time":1507507200000,"close":155.84,"open":155.81,"high":156.73,"low":155.485,"volume":16200129},{"time":1507593600000,"close":155.9,"open":156.055,"high":158,"low":155.1,"volume":15456331},{"time":1507680000000,"close":156.55,"open":155.97,"high":156.98,"low":155.75,"volume":16607693},{"time":1507766400000,"close":156,"open":156.35,"high":157.37,"low":155.7299,"volume":16045720},{"time":1507852800000,"close":156.99,"open":156.73,"high":157.28,"low":156.41,"volume":16287608},{"time":1508112000000,"close":159.88,"open":157.9,"high":160,"low":157.65,"volume":23894630},{"time":1508198400000,"close":160.47,"open":159.78,"high":160.87,"low":159.23,"volume":18816438},{"time":1508284800000,"close":159.76,"open":160.42,"high":160.71,"low":159.6,"volume":16158659},{"time":1508371200000,"close":155.98,"open":156.75,"high":157.08,"low":155.02,"volume":42111326},{"time":1508457600000,"close":156.16,"open":156.61,"high":157.75,"low":155.96,"volume":23612246},{"time":1508716800000,"close":156.17,"open":156.89,"high":157.69,"low":155.5,"volume":21654461},{"time":1508803200000,"close":157.1,"open":156.29,"high":157.42,"low":156.2,"volume":17137731},{"time":1508889600000,"close":156.405,"open":156.91,"high":157.55,"low":155.27,"volume":20126554},{"time":1508976000000,"close":157.41,"open":157.23,"high":157.8295,"low":156.78,"volume":16751691},{"time":1509062400000,"close":163.05,"open":159.29,"high":163.6,"low":158.7,"volume":43904150},{"time":1509321600000,"close":166.72,"open":163.89,"high":168.07,"low":163.72,"volume":43923292},{"time":1509408000000,"close":169.04,"open":167.9,"high":169.6499,"low":166.94,"volume":35474672},{"time":1509494400000,"close":166.89,"open":169.87,"high":169.94,"low":165.61,"volume":33100847},{"time":1509580800000,"close":168.11,"open":167.64,"high":168.5,"low":165.28,"volume":32710040},{"time":1509667200000,"close":172.5,"open":174,"high":174.26,"low":171.12,"volume":58683826},{"time":1509926400000,"close":174.25,"open":172.365,"high":174.99,"low":171.72,"volume":34242566},{"time":1510012800000,"close":174.81,"open":173.91,"high":175.25,"low":173.6,"volume":23910914},{"time":1510185600000,"close":175.88,"open":175.11,"high":176.095,"low":173.14,"volume":28636531},{"time":1510272000000,"close":174.67,"open":175.11,"high":175.38,"low":174.27,"volume":25061183},{"time":1510531200000,"close":173.97,"open":173.5,"high":174.5,"low":173.4,"volume":16828025},{"time":1510617600000,"close":171.34,"open":173.04,"high":173.48,"low":171.18,"volume":23588451},{"time":1510704000000,"close":169.08,"open":169.97,"high":170.3197,"low":168.38,"volume":28702351},{"time":1510790400000,"close":171.1,"open":171.18,"high":171.87,"low":170.3,"volume":23497326},{"time":1510876800000,"close":170.15,"open":171.04,"high":171.39,"low":169.64,"volume":21665811},{"time":1511136000000,"close":169.98,"open":170.29,"high":170.56,"low":169.56,"volume":15974387},{"time":1511222400000,"close":173.14,"open":170.78,"high":173.7,"low":170.78,"volume":24875471},{"time":1511308800000,"close":174.96,"open":173.36,"high":175,"low":173.05,"volume":24997274},{"time":1511481600000,"close":174.97,"open":175.1,"high":175.5,"low":174.6459,"volume":14026519},{"time":1511740800000,"close":174.09,"open":175.05,"high":175.08,"low":173.34,"volume":20536313},{"time":1511827200000,"close":173.07,"open":174.3,"high":174.87,"low":171.86,"volume":25468442},{"time":1511913600000,"close":169.48,"open":172.63,"high":172.92,"low":167.16,"volume":40788324},{"time":1512000000000,"close":171.85,"open":170.43,"high":172.14,"low":168.44,"volume":40172368},{"time":1512086400000,"close":171.05,"open":169.95,"high":171.67,"low":168.5,"volume":39590080},{"time":1512345600000,"close":169.8,"open":172.48,"high":172.62,"low":169.63,"volume":32115052},{"time":1512432000000,"close":169.64,"open":169.06,"high":171.52,"low":168.4,"volume":27008428},{"time":1512518400000,"close":169.01,"open":167.5,"high":170.2047,"low":166.46,"volume":28224357},{"time":1512604800000,"close":169.452,"open":169.03,"high":170.44,"low":168.91,"volume":24469613},{"time":1512691200000,"close":169.37,"open":170.49,"high":171,"low":168.82,"volume":23096872},{"time":1512950400000,"close":172.67,"open":169.2,"high":172.89,"low":168.79,"volume":33092051},{"time":1513036800000,"close":171.7,"open":172.15,"high":172.39,"low":171.461,"volume":18945457},{"time":1513123200000,"close":172.27,"open":172.5,"high":173.54,"low":172,"volume":23142242},{"time":1513209600000,"close":172.22,"open":172.4,"high":173.13,"low":171.65,"volume":20219307},{"time":1513296000000,"close":173.87,"open":173.63,"high":174.17,"low":172.46,"volume":37054632},{"time":1513555200000,"close":176.42,"open":174.88,"high":177.2,"low":174.86,"volume":28831533},{"time":1513641600000,"close":174.54,"open":175.03,"high":175.39,"low":174.09,"volume":27078872},{"time":1513728000000,"close":174.35,"open":174.87,"high":175.42,"low":173.25,"volume":23000392},{"time":1513814400000,"close":175.01,"open":174.17,"high":176.02,"low":174.1,"volume":20356826},{"time":1513900800000,"close":175.01,"open":174.68,"high":175.424,"low":174.5,"volume":16052615},{"time":1514246400000,"close":170.57,"open":170.8,"high":171.47,"low":169.679,"volume":32968167},{"time":1514332800000,"close":170.6,"open":170.1,"high":170.78,"low":169.71,"volume":21672062},{"time":1514419200000,"close":171.08,"open":171,"high":171.85,"low":170.48,"volume":15997739},{"time":1514505600000,"close":169.23,"open":170.52,"high":170.59,"low":169.22,"volume":25643711},{"time":1514851200000,"close":172.26,"open":170.16,"high":172.3,"low":169.26,"volume":25048048},{"time":1514937600000,"close":172.23,"open":172.53,"high":174.55,"low":171.96,"volume":28819653},{"time":1515024000000,"close":173.03,"open":172.54,"high":173.47,"low":172.08,"volume":22211345},{"time":1515110400000,"close":175,"open":173.44,"high":175.37,"low":173.05,"volume":23016177},{"time":1515369600000,"close":174.35,"open":174.35,"high":175.61,"low":173.93,"volume":20134092},{"time":1515456000000,"close":174.33,"open":174.55,"high":175.06,"low":173.41,"volume":21262614},{"time":1515542400000,"close":174.29,"open":173.16,"high":174.3,"low":173,"volume":23589129},{"time":1515628800000,"close":175.28,"open":174.59,"high":175.4886,"low":174.49,"volume":17523256},{"time":1515715200000,"close":177.09,"open":176.18,"high":177.36,"low":175.65,"volume":25039531},{"time":1516060800000,"close":176.19,"open":177.9,"high":179.39,"low":176.14,"volume":29159005},{"time":1516147200000,"close":179.1,"open":176.15,"high":179.25,"low":175.07,"volume":32752734},{"time":1516233600000,"close":179.26,"open":179.37,"high":180.1,"low":178.25,"volume":30234512},{"time":1516320000000,"close":178.46,"open":178.61,"high":179.58,"low":177.41,"volume":30827809},{"time":1516579200000,"close":177,"open":177.3,"high":177.78,"low":176.6016,"volume":26023683},{"time":1516665600000,"close":177.04,"open":177.3,"high":179.44,"low":176.82,"volume":31702531},{"time":1516752000000,"close":174.22,"open":177.25,"high":177.3,"low":173.2,"volume":50562257},{"time":1516838400000,"close":171.11,"open":174.505,"high":174.95,"low":170.53,"volume":39661804},{"time":1516924800000,"close":171.51,"open":172,"high":172,"low":170.06,"volume":37121805},{"time":1517184000000,"close":167.96,"open":170.16,"high":170.16,"low":167.07,"volume":48434424},{"time":1517270400000,"close":166.97,"open":165.525,"high":167.37,"low":164.7,"volume":45137026},{"time":1517356800000,"close":167.43,"open":166.87,"high":168.4417,"low":166.5,"volume":30984099},{"time":1517443200000,"close":167.78,"open":167.165,"high":168.62,"low":166.76,"volume":38099665},{"time":1517529600000,"close":160.37,"open":166,"high":166.8,"low":160.1,"volume":85436075},{"time":1517788800000,"close":157.49,"open":159.1,"high":163.88,"low":156,"volume":66090446},{"time":1517875200000,"close":163.03,"open":154.83,"high":163.72,"low":154,"volume":66625484},{"time":1517961600000,"close":159.54,"open":163.085,"high":163.4,"low":159.0685,"volume":50852130},{"time":1518048000000,"close":155.32,"open":160.29,"high":161,"low":155.03,"volume":49594129},{"time":1518134400000,"close":155.97,"open":157.07,"high":157.89,"low":150.24,"volume":66723743},{"time":1518393600000,"close":162.71,"open":158.5,"high":163.89,"low":157.51,"volume":60560145},{"time":1518480000000,"close":164.34,"open":161.95,"high":164.75,"low":161.65,"volume":32104756},{"time":1518566400000,"close":167.37,"open":163.045,"high":167.54,"low":162.88,"volume":39669178},{"time":1518652800000,"close":172.99,"open":169.79,"high":173.09,"low":169,"volume":50609595},{"time":1518739200000,"close":172.43,"open":172.36,"high":174.82,"low":171.77,"volume":39638793},{"time":1519084800000,"close":171.85,"open":172.05,"high":174.26,"low":171.42,"volume":33531012},{"time":1519171200000,"close":171.07,"open":172.83,"high":174.12,"low":171.01,"volume":35833514},{"time":1519257600000,"close":172.6,"open":171.8,"high":173.95,"low":171.71,"volume":30504116},{"time":1519344000000,"close":175.555,"open":173.67,"high":175.65,"low":173.54,"volume":33329232},{"time":1519603200000,"close":178.97,"open":176.35,"high":179.39,"low":176.21,"volume":36886432},{"time":1519689600000,"close":178.39,"open":179.1,"high":180.48,"low":178.16,"volume":38685165},{"time":1519776000000,"close":178.12,"open":179.26,"high":180.615,"low":178.05,"volume":33604574},{"time":1519862400000,"close":175,"open":178.54,"high":179.775,"low":172.66,"volume":48801970},{"time":1519948800000,"close":176.21,"open":172.8,"high":176.3,"low":172.45,"volume":38453950},{"time":1520208000000,"close":176.82,"open":175.21,"high":177.74,"low":174.52,"volume":28401366},{"time":1520294400000,"close":176.67,"open":177.91,"high":178.25,"low":176.13,"volume":23788506},{"time":1520380800000,"close":175.03,"open":174.94,"high":175.85,"low":174.27,"volume":31703462},{"time":1520467200000,"close":176.94,"open":175.48,"high":177.12,"low":175.07,"volume":23163767},{"time":1520553600000,"close":179.98,"open":177.96,"high":180,"low":177.39,"volume":31385134},{"time":1520812800000,"close":181.72,"open":180.29,"high":182.39,"low":180.21,"volume":32055405},{"time":1520899200000,"close":179.97,"open":182.59,"high":183.5,"low":179.24,"volume":31168404},{"time":1520985600000,"close":178.44,"open":180.32,"high":180.52,"low":177.81,"volume":29075469},{"time":1521072000000,"close":178.65,"open":178.5,"high":180.24,"low":178.0701,"volume":22584565},{"time":1521158400000,"close":178.02,"open":178.65,"high":179.12,"low":177.62,"volume":36836456},{"time":1521417600000,"close":175.3,"open":177.32,"high":177.47,"low":173.66,"volume":32804695},{"time":1521504000000,"close":175.24,"open":175.24,"high":176.8,"low":174.94,"volume":19314039},{"time":1521590400000,"close":171.27,"open":175.04,"high":175.09,"low":171.26,"volume":35247358},{"time":1521676800000,"close":168.845,"open":170,"high":172.68,"low":168.6,"volume":41051076},{"time":1521763200000,"close":164.94,"open":168.39,"high":169.92,"low":164.94,"volume":40248954},{"time":1522022400000,"close":172.77,"open":168.07,"high":173.1,"low":166.44,"volume":36272617},{"time":1522108800000,"close":168.34,"open":173.68,"high":175.15,"low":166.92,"volume":38962839}];
                    var response = res.data;
                    //	        	if (response.s !== 'ok' && response.s !== 'no_data') {
                    //                  reject(response.errmsg);
                    //                  return;
                    //              }
                    var bars = [];
                    var meta = {
                        noData: false,
                    };
                    if ($("#tv_chart_container").attr("firstLoad") === "0") {
                        $("#tv_chart_container").attr("firstLoad", "1");
                        $("#tv_chart_container").attr("startDatetime", requestParams.startDatetime);
                    }
                    if (response.length <= 0) {
                        //              if (response.length <= 0) {
                        meta.noData = true;
                        // meta.nextTime = parseInt((new Date().getTime() + 1000 * 60 * 5) / 1000);
                    } else {
                        let setBazDeal = JSON.parse(sessionStorage.getItem('setBazDeal')) || {
                            symbol: 'FMVP',
                            toSymbol: 'BTC'
                        };
                        for (var i = 0; i < response.length; ++i) {
                            var barValue = {
                                time: Date.parse(new Date(response[i].createDatetime)),//createDatetime
                                close: response[i].close,
                                open: response[i].open,
                                high: response[i].high,
                                low: response[i].low,
                                volume: response[i].volume,
                                isBarClosed: true,
                                isLastBar: false
                            };
                            if (i == response.length - 1) {
                                barValue.isBarClosed = false;
                                barValue.isLastBar = true;
                            }
                            bars.push(barValue);
                        }
                    }
                    // console.log(bars, meta);
                    resolve({
                        bars: bars,
                        meta: meta,
                    });

                }).fail(function(error) {
                    error && logMessage(error);
                });
            });
        };
        
        return HistoryProvider;
    }());

    var DataPulseProvider = /** @class */ (function() {
        function DataPulseProvider(historyProvider, updateFrequency) {
            this._subscribers = {};
            this._requestsPending = 0;
            this._historyProvider = historyProvider;
            //      setInterval(this._updateData.bind(this), updateFrequency);
        }
        DataPulseProvider.prototype.subscribeBars = function(symbolInfo, resolution, newDataCallback, listenerGuid) {
            if (this._subscribers.hasOwnProperty(listenerGuid)) {
                logMessage("DataPulseProvider: already has subscriber with id=" + listenerGuid);
                return;
            }
            this._subscribers[listenerGuid] = {
                lastBarTime: null,
                listener: newDataCallback,
                resolution: resolution,
                symbolInfo: symbolInfo,
            };
            logMessage("DataPulseProvider: subscribed for #" + listenerGuid + " - {" + symbolInfo.name + ", " + resolution + "}");
        };
        DataPulseProvider.prototype.unsubscribeBars = function(listenerGuid) {
            delete this._subscribers[listenerGuid];
            logMessage("DataPulseProvider: unsubscribed for #" + listenerGuid);
        };
        DataPulseProvider.prototype._updateData = function() {
            var this$1 = this;

            var _this = this;
            if (this._requestsPending > 0) {
                return;
            }
            this._requestsPending = 0;
            var _loop_1 = function(listenerGuid) {
                this_1._requestsPending += 1;
                this_1._updateDataForSubscriber(listenerGuid)
                    .then(function() {
                        _this._requestsPending -= 1;
                        logMessage("DataPulseProvider: data for #" + listenerGuid + " updated successfully, pending=" + _this._requestsPending);
                    })
                    .catch(function(reason) {
                        _this._requestsPending -= 1;
                        logMessage("DataPulseProvider: data for #" + listenerGuid + " updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
                    });
            };
            var this_1 = this;
            for (var listenerGuid in this$1._subscribers) {
                _loop_1(listenerGuid);
            }
        };
        DataPulseProvider.prototype._updateDataForSubscriber = function(listenerGuid) {
            var _this = this;
            var subscriptionRecord = this._subscribers[listenerGuid];
            var rangeEndTime = parseInt((Date.now() / 1000).toString());
            // BEWARE: please note we really need 2 bars, not the only last one
            // see the explanation below. `10` is the `large enough` value to work around holidays
            var rangeStartTime = rangeEndTime - periodLengthSeconds(subscriptionRecord.resolution, 10);
            return this._historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, rangeStartTime, rangeEndTime)
                .then(function(result) {
                    _this._onSubscriberDataReceived(listenerGuid, result);
                });
        };
        DataPulseProvider.prototype._onSubscriberDataReceived = function(listenerGuid, result) {
            // means the subscription was cancelled while waiting for data
            if (!this._subscribers.hasOwnProperty(listenerGuid)) {
                logMessage("DataPulseProvider: Data comes for already unsubscribed subscription #" + listenerGuid);
                return;
            }
            var bars = result.bars;
            if (bars.length === 0) {
                return;
            }
            var lastBar = bars[bars.length - 1];
            var subscriptionRecord = this._subscribers[listenerGuid];
            if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
                return;
            }
            var isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
            // Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
            // old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
            if (isNewBar) {
                if (bars.length < 2) {
                    throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
                }
                var previousBar = bars[bars.length - 2];
                subscriptionRecord.listener(previousBar);
            }
            subscriptionRecord.lastBarTime = lastBar.time;
            subscriptionRecord.listener(lastBar);
        };
        return DataPulseProvider;
    }());

    function periodLengthSeconds(resolution, requiredPeriodsCount) {
        var daysCount = 0;
        if (resolution === 'D' || resolution === '1D') {
            daysCount = requiredPeriodsCount;
        } else if (resolution === 'M' || resolution === '1M') {
            daysCount = 31 * requiredPeriodsCount;
        } else if (resolution === 'W' || resolution === '1W') {
            daysCount = 7 * requiredPeriodsCount;
        } else {
            daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60);
        }
        return daysCount * 24 * 60 * 60;
    }

    var QuotesPulseProvider = /** @class */ (function() {
        function QuotesPulseProvider(quotesProvider) {
            this._subscribers = {};
            this._requestsPending = 0;
            this._quotesProvider = quotesProvider;
            setInterval(this._updateQuotes.bind(this, 1 /* Fast */ ), 10000 /* Fast */ );
            setInterval(this._updateQuotes.bind(this, 0 /* General */ ), 60000 /* General */ );
        }
        QuotesPulseProvider.prototype.subscribeQuotes = function(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
            this._subscribers[listenerGuid] = {
                symbols: symbols,
                fastSymbols: fastSymbols,
                listener: onRealtimeCallback,
            };
            logMessage("QuotesPulseProvider: subscribed quotes with #" + listenerGuid);
        };
        QuotesPulseProvider.prototype.unsubscribeQuotes = function(listenerGuid) {
            delete this._subscribers[listenerGuid];
            logMessage("QuotesPulseProvider: unsubscribed quotes with #" + listenerGuid);
        };
        QuotesPulseProvider.prototype._updateQuotes = function(updateType) {
            var this$1 = this;

            var _this = this;
            if (this._requestsPending > 0) {
                return;
            }
            var _loop_1 = function(listenerGuid) {
                this_1._requestsPending++;
                var subscriptionRecord = this_1._subscribers[listenerGuid];
                this_1._quotesProvider.getQuotes(updateType === 1 /* Fast */ ? subscriptionRecord.fastSymbols : subscriptionRecord.symbols)
                    .then(function(data) {
                        _this._requestsPending--;
                        if (!_this._subscribers.hasOwnProperty(listenerGuid)) {
                            return;
                        }
                        subscriptionRecord.listener(data);
                        logMessage("QuotesPulseProvider: data for #" + listenerGuid + " (" + updateType + ") updated successfully, pending=" + _this._requestsPending);
                    })
                    .catch(function(reason) {
                        _this._requestsPending--;
                        logMessage("QuotesPulseProvider: data for #" + listenerGuid + " (" + updateType + ") updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
                    });
            };
            var this_1 = this;
            for (var listenerGuid in this$1._subscribers) {
                _loop_1(listenerGuid);
            }
        };
        return QuotesPulseProvider;
    }());

    function extractField$1(data, field, arrayIndex) {
        var value = data[field];
        return Array.isArray(value) ? value[arrayIndex] : value;
    }
    var SymbolsStorage = /** @class */ (function() {
        function SymbolsStorage(datafeedUrl, datafeedSupportedResolutions, requester) {
            this._exchangesList = ['NYSE', 'FOREX', 'AMEX'];
            this._symbolsInfo = {};
            this._symbolsList = [];
            this._datafeedUrl = datafeedUrl;
            this._datafeedSupportedResolutions = datafeedSupportedResolutions;
            this._requester = requester;
            this._readyPromise = this._init();
            this._readyPromise.catch(function(error) {
                // seems it is impossible
                console.error("SymbolsStorage: Cannot init, error=" + error.toString());
            });
        }
        // BEWARE: this function does not consider symbol's exchange
        SymbolsStorage.prototype.resolveSymbol = function(symbolName) {
            var _this = this;
            return this._readyPromise.then(function() {
                var symbolInfo = _this._symbolsInfo[symbolName];
                if (symbolInfo === undefined) {
                    return Promise.reject('invalid symbol');
                }
                return Promise.resolve(symbolInfo);
            });
        };
        SymbolsStorage.prototype.searchSymbols = function(searchString, exchange, symbolType, maxSearchResults) {
            var _this = this;
            return this._readyPromise.then(function() {
                var weightedResult = [];
                var queryIsEmpty = searchString.length === 0;
                searchString = searchString.toUpperCase();
                var _loop_1 = function(symbolName) {
                    var symbolInfo = _this._symbolsInfo[symbolName];
                    if (symbolInfo === undefined) {
                        return "continue";
                    }
                    if (symbolType.length > 0 && symbolInfo.type !== symbolType) {
                        return "continue";
                    }
                    if (exchange && exchange.length > 0 && symbolInfo.exchange !== exchange) {
                        return "continue";
                    }
                    var positionInName = symbolInfo.name.toUpperCase().indexOf(searchString);
                    var positionInDescription = symbolInfo.description.toUpperCase().indexOf(searchString);
                    if (queryIsEmpty || positionInName >= 0 || positionInDescription >= 0) {
                        var alreadyExists = weightedResult.some(function(item) { return item.symbolInfo === symbolInfo; });
                        if (!alreadyExists) {
                            var weight = positionInName >= 0 ? positionInName : 8000 + positionInDescription;
                            weightedResult.push({ symbolInfo: symbolInfo, weight: weight });
                        }
                    }
                };
                for (var _i = 0, _a = _this._symbolsList; _i < _a.length; _i++) {
                    var symbolName = _a[_i];
                    _loop_1(symbolName);
                }
                var result = weightedResult
                    .sort(function(item1, item2) { return item1.weight - item2.weight; })
                    .slice(0, maxSearchResults)
                    .map(function(item) {
                        var symbolInfo = item.symbolInfo;
                        return {
                            symbol: symbolInfo.name,
                            full_name: symbolInfo.full_name,
                            description: symbolInfo.description,
                            exchange: symbolInfo.exchange,
                            params: [],
                            type: symbolInfo.type,
                            ticker: symbolInfo.name,
                        };
                    });
                return Promise.resolve(result);
            });
        };
        SymbolsStorage.prototype._init = function() {
            var this$1 = this;

            var _this = this;
            var promises = [];
            var alreadyRequestedExchanges = {};
            for (var _i = 0, _a = this._exchangesList; _i < _a.length; _i++) {
                var exchange = _a[_i];
                if (alreadyRequestedExchanges[exchange]) {
                    continue;
                }
                alreadyRequestedExchanges[exchange] = true;
                promises.push(this$1._requestExchangeData(exchange));
            }
            return Promise.all(promises)
                .then(function() {
                    _this._symbolsList.sort();
                    logMessage('SymbolsStorage: All exchanges data loaded');
                });
        };
        SymbolsStorage.prototype._requestExchangeData = function(exchange) {
            var _this = this;
            return new Promise(function(resolve, reject) {
                _this._requester.sendRequest(_this._datafeedUrl, 'symbol_info', { group: exchange })
                    .then(function(response) {
                        try {
                            _this._onExchangeDataReceived(exchange, response);
                        } catch (error) {
                            reject(error);
                            return;
                        }
                        resolve();
                    })
                    .catch(function(reason) {
                        logMessage("SymbolsStorage: Request data for exchange '" + exchange + "' failed, reason=" + getErrorMessage(reason));
                        resolve();
                    });
            });
        };
        SymbolsStorage.prototype._onExchangeDataReceived = function(exchange, data) {
            var this$1 = this;

            var symbolIndex = 0;
            try {
                var symbolsCount = data.symbol.length;
                var tickerPresent = data.ticker !== undefined;
                for (; symbolIndex < symbolsCount; ++symbolIndex) {
                    var symbolName = data.symbol[symbolIndex];
                    var listedExchange = extractField$1(data, 'exchange-listed', symbolIndex);
                    var tradedExchange = extractField$1(data, 'exchange-traded', symbolIndex);
                    var fullName = tradedExchange + ':' + symbolName;
                    var ticker = tickerPresent ? extractField$1(data, 'ticker', symbolIndex) : symbolName;
                    var symbolInfo = {
                        ticker: ticker,
                        name: symbolName,
                        base_name: [listedExchange + ':' + symbolName],
                        full_name: fullName,
                        listed_exchange: listedExchange,
                        exchange: tradedExchange,
                        description: extractField$1(data, 'description', symbolIndex),
                        has_intraday: definedValueOrDefault(extractField$1(data, 'has-intraday', symbolIndex), false),
                        has_no_volume: definedValueOrDefault(extractField$1(data, 'has-no-volume', symbolIndex), false),
                        minmov: extractField$1(data, 'minmovement', symbolIndex) || extractField$1(data, 'minmov', symbolIndex) || 0,
                        minmove2: extractField$1(data, 'minmove2', symbolIndex) || extractField$1(data, 'minmov2', symbolIndex),
                        fractional: extractField$1(data, 'fractional', symbolIndex),
                        pricescale: extractField$1(data, 'pricescale', symbolIndex),
                        type: extractField$1(data, 'type', symbolIndex),
                        session: extractField$1(data, 'session-regular', symbolIndex),
                        timezone: extractField$1(data, 'timezone', symbolIndex),
                        supported_resolutions: definedValueOrDefault(extractField$1(data, 'supported-resolutions', symbolIndex), this$1._datafeedSupportedResolutions),
                        force_session_rebuild: extractField$1(data, 'force-session-rebuild', symbolIndex),
                        has_daily: definedValueOrDefault(extractField$1(data, 'has-daily', symbolIndex), true),
                        intraday_multipliers: definedValueOrDefault(extractField$1(data, 'intraday-multipliers', symbolIndex), ['1', '5', '15', '30', '60']),
                        has_weekly_and_monthly: extractField$1(data, 'has-weekly-and-monthly', symbolIndex),
                        has_empty_bars: extractField$1(data, 'has-empty-bars', symbolIndex),
                        volume_precision: definedValueOrDefault(extractField$1(data, 'volume-precision', symbolIndex), 0),
                    };
                    this$1._symbolsInfo[ticker] = symbolInfo;
                    this$1._symbolsInfo[symbolName] = symbolInfo;
                    this$1._symbolsInfo[fullName] = symbolInfo;
                    this$1._symbolsList.push(symbolName);
                }
            } catch (error) {
                throw new Error("SymbolsStorage: API error when processing exchange " + exchange + " symbol #" + symbolIndex + " (" + data.symbol[symbolIndex] + "): " + error.message);
            }
        };
        return SymbolsStorage;
    }());

    function definedValueOrDefault(value, defaultValue) {
        return value !== undefined ? value : defaultValue;
    }

    function extractField(data, field, arrayIndex) {
        var value = data[field];
        return Array.isArray(value) ? value[arrayIndex] : value;
    }
    /**
     * This class implements interaction with UDF-compatible datafeed.
     * See UDF protocol reference at https://github.com/tradingview/charting_library/wiki/UDF
     */
    var UDFCompatibleDatafeedBase = /** @class */ (function() {
        function UDFCompatibleDatafeedBase(datafeedURL, quotesProvider, requester, updateFrequency) {
            if (updateFrequency === void 0) { updateFrequency = 10 * 1000; }
            var _this = this;
            this._configuration = defaultConfiguration();
            this._symbolsStorage = null;
            this._datafeedURL = datafeedURL;
            this._requester = requester;
            this._historyProvider = new HistoryProvider(datafeedURL, this._requester);
            this._quotesProvider = quotesProvider;
            this._dataPulseProvider = new DataPulseProvider(this._historyProvider, updateFrequency);
            this._quotesPulseProvider = new QuotesPulseProvider(this._quotesProvider);
            this._configurationReadyPromise = this._requestConfiguration()
                .then(function(configuration) {
                    if (configuration === null) {
                        configuration = defaultConfiguration();
                    }
                    _this._setupWithConfiguration(configuration);
                });
        }
        UDFCompatibleDatafeedBase.prototype.onReady = function(callback) {
            var _this = this;
            this._configurationReadyPromise.then(function() {
                callback(_this._configuration);
            });
        };
        UDFCompatibleDatafeedBase.prototype.getQuotes = function(symbols, onDataCallback, onErrorCallback) {
            this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
        };
        UDFCompatibleDatafeedBase.prototype.subscribeQuotes = function(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
            this._quotesPulseProvider.subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid);
        };
        UDFCompatibleDatafeedBase.prototype.unsubscribeQuotes = function(listenerGuid) {
            this._quotesPulseProvider.unsubscribeQuotes(listenerGuid);
        };
        UDFCompatibleDatafeedBase.prototype.calculateHistoryDepth = function(resolution, resolutionBack, intervalBack) {
            return undefined;
        };
        UDFCompatibleDatafeedBase.prototype.getMarks = function(symbolInfo, from, to, onDataCallback, resolution) {
            if (!this._configuration.supports_marks) {
                return;
            }
            var requestParams = {
                symbol: symbolInfo.ticker || '',
                from: from,
                to: to,
                resolution: resolution,
            };
            this._send('marks', requestParams)
                .then(function(response) {
                    if (!Array.isArray(response)) {
                        var result = [];
                        for (var i = 0; i < response.id.length; ++i) {
                            result.push({
                                id: extractField(response, 'id', i),
                                time: extractField(response, 'time', i),
                                color: extractField(response, 'color', i),
                                text: extractField(response, 'text', i),
                                label: extractField(response, 'label', i),
                                labelFontColor: extractField(response, 'labelFontColor', i),
                                minSize: extractField(response, 'minSize', i),
                            });
                        }
                        response = result;
                    }
                    onDataCallback(response);
                })
                .catch(function(error) {
                    logMessage("UdfCompatibleDatafeed: Request marks failed: " + getErrorMessage(error));
                    onDataCallback([]);
                });
        };
        UDFCompatibleDatafeedBase.prototype.getTimescaleMarks = function(symbolInfo, from, to, onDataCallback, resolution) {
            if (!this._configuration.supports_timescale_marks) {
                return;
            }
            var requestParams = {
                symbol: symbolInfo.ticker || '',
                from: from,
                to: to,
                resolution: resolution,
            };
            this._send('timescale_marks', requestParams)
                .then(function(response) {
                    if (!Array.isArray(response)) {
                        var result = [];
                        for (var i = 0; i < response.id.length; ++i) {
                            result.push({
                                id: extractField(response, 'id', i),
                                time: extractField(response, 'time', i),
                                color: extractField(response, 'color', i),
                                label: extractField(response, 'label', i),
                                tooltip: extractField(response, 'tooltip', i),
                            });
                        }
                        response = result;
                    }
                    onDataCallback(response);
                })
                .catch(function(error) {
                    logMessage("UdfCompatibleDatafeed: Request timescale marks failed: " + getErrorMessage(error));
                    onDataCallback([]);
                });
        };
        UDFCompatibleDatafeedBase.prototype.getServerTime = function(callback) {
            if (!this._configuration.supports_time) {
                return;
            }
            this._send('time')
                .then(function(response) {
                    var time = parseInt(response);
                    if (!isNaN(time)) {
                        callback(time);
                    }
                })
                .catch(function(error) {
                    logMessage("UdfCompatibleDatafeed: Fail to load server time, error=" + getErrorMessage(error));
                });
        };
        UDFCompatibleDatafeedBase.prototype.searchSymbols = function(userInput, exchange, symbolType, onResult) {
            if (this._configuration.supports_search) {
                var params = {
                    limit: 30 /* SearchItemsLimit */ ,
                    query: userInput.toUpperCase(),
                    type: symbolType,
                    exchange: exchange,
                };
                this._send('search', params)
                    .then(function(response) {
                        if (response.s !== undefined) {
                            logMessage("UdfCompatibleDatafeed: search symbols error=" + response.errmsg);
                            onResult([]);
                            return;
                        }
                        onResult(response);
                    })
                    .catch(function(reason) {
                        logMessage("UdfCompatibleDatafeed: Search symbols for '" + userInput + "' failed. Error=" + getErrorMessage(reason));
                        onResult([]);
                    });
            } else {
                if (this._symbolsStorage === null) {
                    throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
                }
                this._symbolsStorage.searchSymbols(userInput, exchange, symbolType, 30 /* SearchItemsLimit */ )
                    .then(onResult)
                    .catch(onResult.bind(null, []));
            }
        };
        UDFCompatibleDatafeedBase.prototype.resolveSymbol = function(symbolName, onResolve, onError) {
            logMessage('Resolve requested');
            var resolveRequestStartTime = Date.now();

            function onResultReady(symbolInfo) {
                logMessage("Symbol resolved: " + (Date.now() - resolveRequestStartTime) + "ms");
                onResolve(symbolInfo);
            }

            let setBazDeal = JSON.parse(sessionStorage.getItem('setBazDeal')) || {
                symbol: 'FMVP',
                toSymbol: 'BTC'
            }
            var symbolInfo = {
                'name': 'FMVP',
                'timezone': 'Asia/Shanghai',
                'minmov': 1,
                'pointvalue': 1,
                'session': "24x7",
                'has_intraday': !0,
                'has_daily': !0,
                'has_weekly_and_monthly': !0,
                'description': 'BTC',
                'type': "coin",
                'ticker': setBazDeal.symbol,
                'toSymbol': setBazDeal.toSymbol,
                'pricescale': 100000000,
                'volumescale': 100000000,
                'intraday-multipliers': []
            };
            onResultReady(symbolInfo);
            //      if (!this._configuration.supports_group_request) {
            //          var params = {
            //              symbol: symbolName,
            //          };
            //          this._send('symbols', params)
            //              .then(function (response) {
            //              if (response.s !== undefined) {
            //                  onError('unknown_symbol');
            //              }
            //              else {
            //                  onResultReady(response);
            //              }
            //          })
            //              .catch(function (reason) {
            //              logMessage("UdfCompatibleDatafeed: Error resolving symbol: " + getErrorMessage(reason));
            //              onError('unknown_symbol');
            //          });
            //      }
            //      else {
            //          if (this._symbolsStorage === null) {
            //              throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            //          }
            //          this._symbolsStorage.resolveSymbol(symbolName).then(onResultReady).catch(onError);
            //      }
        };
        UDFCompatibleDatafeedBase.prototype.getBars = function(symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError) {
            this._historyProvider.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate)
                .then(function(result) {
                    onResult(result.bars, result.meta);
                })
                .catch(onError);
        };
        UDFCompatibleDatafeedBase.prototype.subscribeBars = function(symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
            this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid);
        };
        UDFCompatibleDatafeedBase.prototype.unsubscribeBars = function(listenerGuid) {
            this._dataPulseProvider.unsubscribeBars(listenerGuid);
        };
        UDFCompatibleDatafeedBase.prototype._requestConfiguration = function() {
            //      return this._send('config')
            //          .catch(function (reason) {
            //          logMessage("UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=" + getErrorMessage(reason));
            //          return null;
            //      });

            return Promise.resolve(defaultConfiguration());
        };
        UDFCompatibleDatafeedBase.prototype._send = function(urlPath, params) {
            return this._requester.sendRequest(this._datafeedURL, urlPath, params);
        };
        UDFCompatibleDatafeedBase.prototype._setupWithConfiguration = function(configurationData) {
            this._configuration = configurationData;
            if (configurationData.exchanges === undefined) {
                configurationData.exchanges = [];
            }
            if (!configurationData.supports_search && !configurationData.supports_group_request) {
                throw new Error('Unsupported datafeed configuration. Must either support search, or support group request');
            }
            if (configurationData.supports_group_request || !configurationData.supports_search) {
                this._symbolsStorage = new SymbolsStorage(this._datafeedURL, configurationData.supported_resolutions || [], this._requester);
            }
            logMessage("UdfCompatibleDatafeed: Initialized with " + JSON.stringify(configurationData));
        };
        return UDFCompatibleDatafeedBase;
    }());

    function defaultConfiguration() {
        return {
            supports_search: true,
            supports_group_request: false,
            supported_resolutions: PERIODLIST,
            supports_marks: false,
            supports_timescale_marks: false,
        };
    }

    var QuotesProvider = /** @class */ (function() {
        function QuotesProvider(datafeedUrl, requester) {
            this._datafeedUrl = datafeedUrl;
            this._requester = requester;
        }
        QuotesProvider.prototype.getQuotes = function(symbols) {
            var _this = this;
            return new Promise(function(resolve, reject) {
                _this._requester.sendRequest(_this._datafeedUrl, 'quotes', { symbols: symbols })
                    .then(function(response) {
                        if (response.s === 'ok') {
                            resolve(response.d);
                        } else {
                            reject(response.errmsg);
                        }
                    })
                    .catch(function(error) {
                        var errorMessage = getErrorMessage(error);
                        logMessage("QuotesProvider: getQuotes failed, error=" + errorMessage);
                        reject("network error: " + errorMessage);
                    });
            });
        };
        return QuotesProvider;
    }());

    var Requester = /** @class */ (function() {
        function Requester(headers) {
            if (headers) {
                this._headers = headers;
            }
        }
        Requester.prototype.sendRequest = function(datafeedUrl, urlPath, params) {
            if (params !== undefined) {
                var paramKeys = Object.keys(params);
                if (paramKeys.length !== 0) {
                    urlPath += '?';
                }
                urlPath += paramKeys.map(function(key) {
                    return encodeURIComponent(key) + "=" + encodeURIComponent(params[key].toString());
                }).join('&');
            }
            logMessage('New request: ' + urlPath);
            // Send user cookies if the URL is on the same origin as the calling script.
            var options = { credentials: 'same-origin' };
            if (this._headers !== undefined) {
                options.headers = this._headers;
            }
            return new Promise(function(resolve, reject) {
                return [];
            })
            // return fetch(datafeedUrl + "/" + urlPath, options)
            //     .then(function(response) { return response.text(); })
            //     .then(function(responseTest) { return JSON.parse(responseTest); });
        };
        return Requester;
    }());

    var UDFCompatibleDatafeed = /** @class */ (function(_super) {
        __extends(UDFCompatibleDatafeed, _super);

        function UDFCompatibleDatafeed(datafeedURL, updateFrequency) {
            if (updateFrequency === void 0) { updateFrequency = 10 * 1000; }
            var _this = this;
            var requester = new Requester();
            var quotesProvider = new QuotesProvider(datafeedURL, requester);
            _this = _super.call(this, datafeedURL, quotesProvider, requester, updateFrequency) || this;
            return _this;
        }
        return UDFCompatibleDatafeed;
    }(UDFCompatibleDatafeedBase));

    exports.UDFCompatibleDatafeed = UDFCompatibleDatafeed;

    Object.defineProperty(exports, '__esModule', { value: true });

})));