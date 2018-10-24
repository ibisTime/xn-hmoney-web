define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/echarts',
    'app/interface/GeneralCtr',
    'pagination',
    'app/interface/AccountCtr',
    'app/module/charting_library/charting_library.min',
    'app/module/datafeeds/udf/dist/bundle',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function (base, Ajax, echarts, GeneralCtr, pagination, AccountCtr, TradingView, Datafeeds, UserCtr, Top, Foo) {
    $('.trade').addClass('active');
    let userConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '30'
    };
    let hisConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '10'
    };
    let pkObjData = {}; // 盘口最优买卖价
    let statusValueList = {}; // 状态
    let userData = [];
    let bazaarData = []; // 交易对数据 
    let setBazDeal = JSON.parse(sessionStorage.getItem('setBazDeal')) || {
        symbol: 'FMVP',
        toSymbol: 'BTC'
    };
    let isType = 0; // 0 表示限价 1 表示市价
    let buyHandicapData = []; // 买盘口数据
    let sellHandicapData = []; // 卖盘口数据

    let userOrderData = []; // 用户当前委托数据
    let userHistoryData = []; //用户历史委托数据

    let realTimeData = []; // 实时成交数据

    let ggDataList = []; // 公告

    let toSyUserMoney = ''; // toSymbol用户拥有量
    let syUserMoney = ''; // symbol用户拥有量

    let bb_exchange = 0;

    let oneIndex = 0;

    let zfData = 0;

    init();

    function init() {
        addLister();
        base.showLoadingSpin(); // 显示加载
        
        getBBDataFn();
        //公告
        notice().then(data => {
            ggDataList = data.list;
            let ggHtml = '';
            ggDataList.forEach(item => {
                ggHtml += `<li>
                    <h5>${item.content}</h5>
                    <p>${base.formateDatetime(item.createDatetime)}</p>
                </li>
                `
            })
            $('.affic-list').html(ggHtml);
        });


        k(); // k线

        clearInterval(timeReal);
        var timeReal = setInterval(() => {
            autoRealData();
        }, 3900);

        // 判断是否登录
        if (!base.isLogin()) {
            $('.con-r-current').addClass('none');
            $('.con-r-history').addClass('none');
            $('.user-jy').addClass('none');
            $('.user-baz').addClass('none');
            $('.tologin').removeClass('none');
            $('.am-btn').addClass('dis-btn');
            $('.sel-span').css('background-color', '#ccc');
        } else {
            //状态
            GeneralCtr.getDictList({
                "parentKey": "simu_order_status"
            }).then((data) => {
                data.forEach(function (item) {
                    statusValueList[item.dkey] = item.dvalue
                })
            }, base.hideLoadingSpin);
            getUserMoney();
            userAllMoneyX();
            autoGetMyDatata();
            clearInterval(timeMy);
            var timeMy = setInterval(() => {
                autoGetMyDatata();
            }, 2800);

            function autoGetMyDatata() {
                getMyorderTicket(userConfig).then(data => {
                    userOrderData = data.list;
                    curOrder(userOrderData);
                })
            }
            autoGetHisData();
            clearInterval(timeHis);
            var timeHis = setInterval(() => {
                autoGetHisData();
            }, 3400);

            function autoGetHisData() {
                getMyHistoryData(hisConfig).then(data => {
                    userHistoryData = data.list;
                    hisOrder(userHistoryData);
                })
            }

            let jyType = sessionStorage.getItem('jyType');
            if(jyType == 'xj'){
                $('.xj_type').addClass('sel-jy').siblings().removeClass('sel-jy');
                jyFn($('.xj_type').text());
            }
            if(jyType == 'sj'){
                $('.sj_type').addClass('sel-jy').siblings().removeClass('sel-jy');
                jyFn($('.sj_type').text());
            }

        }

        $('a').off('click').click(function () {
            sessionStorage.setItem('l-return', '../bbdeal/bbdeal.html');
        })


    }

    function getBBDataFn(){
        getBazaarData().then(data => { // 加载市场数据
            // 指定币种换算数据
            let setBBList = data.list.filter(item => {
                return item.symbol == setBazDeal.symbol && item.toSymbol == setBazDeal.toSymbol;
            })
            // 涨幅、k数据
            let zfKData = setBBList[0].dayLineInfo;
            zfData = setBBList[0].exchangeRate * 100;
            if(zfKData){
                $('.t-zf').text(`${zfData}%`)
                $('.t-g').text(base.formatMoney(`${zfKData.high}`, '', setBazDeal.symbol));
                $('.t-d').text(base.formatMoney(`${zfKData.low}`, '', setBazDeal.symbol));
                $('.t-h').text(base.formatMoney(`${zfKData.volume}`, '', setBazDeal.toSymbol));
                debugger;
            }
            $('.t-jym').text(setBBList[0].price);
            $('.sym-exc').text((Math.floor(setBBList[0].currencyPrice * 100) / 100).toFixed(2));
            upBazaarData(setBBList);
            data.list.forEach((item, i) => {
                $('.baz-list>h5 span').eq(i).text(item.toSymbol);
                if(item.toSymbol == setBazDeal.toSymbol){
                    $('.baz-list>h5 span').eq(i).addClass('sel-sp');
                }
            });
            showBazaar(bazaarData[0]);
            autoGetData();
            clearInterval(timeGet);
            var timeGet = setInterval(() => {
                autoGetData();
            }, 2000);

            setInterval(() => {
                sdFn()
            }, 4000);
            sdFn();
            function sdFn(){
                getDepthData().then(data => {
                    let buyData = data.bids;
                    let sellData = data.asks;
                    // 深度图
                    if (buyData.length == 0 && sellData.length == 0) {
                        $('.depth-c').css({
                            overflow: 'hidden',
                            height: 0,
                        })
                        return false;
                    }
                    depthFn(buyData, sellData);
                });
            }

            $('.c-b').text(setBazDeal.symbol);
            $('.r-b').text(setBazDeal.symbol);
            $('#tv_chart_container iframe').css('height', '500px');

            setTimeout(() => {
                window.scrollTo(0, 0);
                base.hideLoadingSpin(); // 隐藏加载
            }, 500);

        });
    }

    function autoRealData() {
        getRealTimeData().then(data => {
            if (data.list.length > 0) {
                realTimeData = data.list;
                let bb_zxj = base.formatMoney(`${realTimeData[0].tradedPrice}`, '', setBazDeal.toSymbol);
                let zx_exc = (Math.floor(bb_zxj * bb_exchange * 100) / 100).toFixed(2);
                $('.bb-zxj').text(bb_zxj);
                $('.zx-exc').text(zx_exc);
                let realTimeHtml = '';
                realTimeData.forEach(item => {
                    realTimeHtml += `<tr>
                                <td>${base.todayDatetime(item.createDatetime)}</td>
                                <td class="${item.direction == 0 ? 'd-mr' : 'd-mc'}">${item.direction == 0 ? '买入' : '卖出'}</td>
                                <td>${base.formatMoney(`${item.tradedPrice}`, '', setBazDeal.toSymbol, false)}</td>
                                <td>${base.formatMoney(`${item.tradedCount}`, '', setBazDeal.symbol, false)}</td>
                            </tr>`
                });
                // ${base.formatMoney(`${item.tradedPrice}`, '', item.toSymbol)}
                $('.dep-table tbody').html(realTimeHtml);
            } else {
                $('.bb-zxj').text('0.00');
                $('.zx-exc').text('0.00');
            }
        });
    }

    function autoGetData() {
        getHandicapData().then(data => {
            buyHandicapData = data.bids;
            sellHandicapData = data.asks;
            if (oneIndex == 0) {
                pkObjData.buy = buyHandicapData[0];
                pkObjData.sell = sellHandicapData[0];
                if (pkObjData.buy) {
                    let toPrice = base.formatMoney(`${pkObjData.buy.price}`, '', setBazDeal.toSymbol);
                    $('#ym-price').val(toPrice);
                    $('.mr-exc').text((Math.floor(toPrice * bb_exchange * 100) / 100).toFixed(2));
                    $('.all-bb').text((Math.floor((toSyUserMoney / toPrice) * 100) / 100).toFixed(2));
                }
                if (pkObjData.sell) {
                    let toPrice = base.formatMoney(`${pkObjData.sell.price}`, '', setBazDeal.toSymbol)
                    $('#yr-price').val(toPrice);
                    $('.mc-exc').text(((Math.floor(toPrice * bb_exchange) * 100) / 100).toFixed(2));
                    $('.all-bb_c').text((Math.floor((syUserMoney) * 100) / 100).toFixed(2)); //syUserMoney
                }
            }
            oneIndex++;
            let slen = 7 - sellHandicapData.length;
            let blen = 7 - buyHandicapData.length;
            if (slen > 0) {
                for (let i = 0; i < slen; i++) {
                    sellHandicapData.push(0);
                }
            }
            if (blen > 0) {
                for (let i = 0; i < blen; i++) {
                    buyHandicapData.push(0);
                }
            }
            let buyHtml = '',
                sellHtml = '';
            buyHandicapData.forEach((item, i) => {
                buyHtml += `<li>
                        <p class="b-p">买<span>${i + 1}</span></p>
                        <p>${item.price ? base.formatMoney(item.price, '', setBazDeal.toSymbol, false) : '--'}</p>
                        <p>${item.count ? base.formatMoney(item.count, '', setBazDeal.symbol, false) : '--'}</p>
                    </li>`
            })
            $('.b-new_ul').html(buyHtml);
            for (let i = 6; i >= 0; i--) {
                sellHtml += `<li>
                        <p class="s-p">卖<span>${i + 1}</span></p>
                        <p>${sellHandicapData[i].price ? base.formatMoney(sellHandicapData[i].price, '', setBazDeal.toSymbol, false) : '--'}</p>
                        <p>${sellHandicapData[i].count ? base.formatMoney(sellHandicapData[i].count, '', setBazDeal.symbol, false) : '--'}</p>
                    </li>`
            }
            $('.s-new_ul').html(sellHtml)

        });
    }

    function getExchange() {
        getBBExchange('CNY').then(data => {
            if (data.length != 0) {
                let lastPrice = Math.floor(data[0].lastPrice * 1000) / 1000;
                bb_exchange = lastPrice.toFixed(3);
                $('.bb-exc').text(bb_exchange);
                autoRealData();
            } else {
                return false;
            }
        })
    }

    function symbolDetail() {
        getSymbolDetail().then(data => {
            $('.bzz-con_l .txt-h').html(data.cname);
            $('bzz-con_l .txt-p').html(data.ename);
            $('.bzz-box .txt-p').html(data.introduction);
            $('.bzz-time').html(data.icoDatetime ? new Date(data.icoDatetime).toLocaleDateString() : '');
            $('.bzz-f_all').html(data.maxSupply);
            $('.bzz-l_all').html(data.totalSupply);
            $('.bzz-bps').html(data.whitePaper);
            $('.bzz-gw').html(data.webUrl);
            $('.bzz-qk').html(data.blockUrl);
        })
    }


    // 查看历史委托函数
    function hisOrder(userHistoryData) {
        //base.formatMoney(`${item.tradedCount}`, '', item.symbol)
        //base.formatMoney(`${item.totalCount}`, '', item.symbol)
        if (userHistoryData.length == 0) {
            $('.his-cur').removeClass('none');
            $('.his-cur').parent('tr').siblings().addClass('none');
            return false;
        }
        let userHistoryHtml = '';
        userHistoryData.forEach(item => {
            userHistoryHtml += `<tr>
            <td colspan="2">${base.formateDatetime(item.createDatetime)}</td>
            <td>${item.symbol}/${item.toSymbol}</td>
            <td>${item.direction == 0 ? '买入' : '卖出'}</td>
            <td>${item.type == 0 ? '市价' : base.formatMoney(`${item.price}`, '', item.toSymbol)}</td>
            <td>${base.formatMoney(`${item.totalCount}`, '', item.symbol)}</td>
            <td>${base.formatMoney(`${item.tradedCount}`, '', item.symbol)}</td>
            <td>${item.avgPrice ? base.formatMoney(`${item.avgPrice}`, '', item.toSymbol) : '-'}</td>
            <td>${statusValueList[item.status]}</td>
        </tr>`
        })
        userHistoryHtml += `<tr>
        <td colspan="9" class="no-cur his-cur none">暂无记录</td>
    </tr>`;
        $('.his-table tbody').html(userHistoryHtml);
    }

    // 查当前委托函数
    function curOrder(userOrderData) {
        if (userOrderData.length == 0) {
            $('.dq-cur').removeClass('none');
            $('.dq-cur').parent('tr').siblings().addClass('none');
            return false;
        }
        let userOrderHtml = '';

        userOrderData.forEach((item, i) => {
            //base.formatMoney(`${item.totalCount - item.tradedCount}`, '', item.symbol) (item.totalCount - item.tradedCount).toFixed(2)
            //base.formatMoney(`${item.tradedCount}`, '', item.symbol)
            //base.formatMoney(`${item.totalCount}`, '', item.symbol)
            let showTotalCount = item.direction == 0 && item.type == 0;
            let showTotalAmount = item.direction == 1 && item.type == 0;
            userOrderHtml += `<tr>
                    <td colspan="2">${base.formateDatetime(item.createDatetime)}</td>
                    <td>${item.symbol}/${item.toSymbol}</td>
                    <td>${item.direction == 0 ? '买入' : '卖出'}</td>
                    <td>${item.type == 0 ? '市价' : base.formatMoney(`${item.price}`, '', item.toSymbol)}</td>
                    <td>${showTotalCount ? '-' : (base.formatMoney(`${item.totalCount}`, '', item.symbol))}</td>
                    <td>${showTotalAmount ? '-' : (base.formatMoney(`${item.totalAmount}`, '', item.toSymbol))}</td>
                    <td>${base.formatMoney(`${item.tradedCount}`, '', item.symbol)}</td>
                    <td>${base.formatMoney(`${item.totalCount - item.tradedCount}`, '', item.symbol)}</td>
                    <td>
                        <button data-code="${item.code}" class="${item.tradedCount > 0 ? 'no-cz' : 'y-cz'}">取消</button>
                    </td>
                </tr>`
        })
        userOrderHtml += `<tr>
                    <td colspan="9" class="no-cur dq-cur none">暂无记录</td>
                </tr>`;
        $('.cur-table tbody').removeClass('none').html(userOrderHtml);
        addLister();
    }


    //更新bazaarData的值
    function upBazaarData(data) {
        bazaarData = data;
        if (bazaarData.lenght > 0) {
            setBazDeal.symbol = bazaarData[0].symbol;
            setBazDeal.toSymbol = bazaarData[0].toSymbol;
        }
        userConfig = {
            ...userConfig,
            ...setBazDeal
        }
        hisConfig = {
            ...hisConfig,
            ...setBazDeal
        }
    }

    // 市场（交易对）
    function getBazaarData() {
        return Ajax.post("650100", {
            start: '1',
            limit: '10'
        }, true);
    }

    // 交易  
    function getLimitedPriceData(type, direction, price, totalCount) {
        if (price) {
            price = base.formatMoneyParse(price, '', setBazDeal.toSymbol);
            totalCount = base.formatMoneyParse(totalCount, '', setBazDeal.symbol);
        } else {
            if (direction == '0') {
                totalCount = base.formatMoneyParse(totalCount, '', setBazDeal.toSymbol);
            } else {
                totalCount = base.formatMoneyParse(totalCount, '', setBazDeal.symbol);
            }

        }
        base.showLoadingSpin();
        return Ajax.post("650050", {
            userId: base.getUserId(),
            type, // 委托类型，0=市价，1=限价
            direction, //委托买卖方向，0=买入，1=卖出
            price, // 限价时必填，委托价格
            totalCount, // 委托数量
            ...setBazDeal
        }, true);
    }


    // 盘口查询

    function getHandicapData() {
        return Ajax.post("650065", {
            ...setBazDeal
        }, true);
    }

    // 分页查询我的委托单
    function getMyorderTicket(config) {
        return Ajax.post('650058', config);
    }

    // 分页查询我的历史委托单
    function getMyHistoryData(config) {
        return Ajax.post('650059', config);
    }

    // 分页查询成交明细 （实时成交）
    function getRealTimeData() {
        return Ajax.post('650057', {
            start: '1',
            limit: '10',
            ...setBazDeal
        })
    }

    // 取消委托
    function rmOrder(code) {
        return Ajax.post('650051', {
            code
        })
    }

    // 获取币种汇率、行情
    function getBBExchange(ex_type) {
        return Ajax.post('650101', {
            symbol: setBazDeal.toSymbol,
            referCurrency: ex_type
        });
    }

    // 获取k线数据
    function getKLineData(kType) {
        return Ajax.post('650066', {
            ...setBazDeal,
            period: kType
        })
    }

    // 根据symbol查资料
    function getSymbolDetail() {
        return Ajax.get('802008', {
            symbol: setBazDeal.symbol
        })
    }

    // 系统公告
    function notice() {
        return Ajax.post('805305', {
            start: '1',
            limit: '10',
            status: '1'
        });
    }

    //总资产
    function userAllMoneyX() {
        UserCtr.userAllMoneyX('CNY').then(data => {
            $('.u-bb').text(data.symbol).attr('title', data.symbol);
            let currency = (Math.floor(data.currency * 100) / 100).toFixed(2);
            $('.u-money').text(currency).prop('title', currency);
        })
    }

    function showBazaar(bazaarData) {
        let bazULHtml = '';
        if (bazaarData) {
            bazULHtml += `<li>
                        <p class="li-left">
                            <img src="/static/images/zx.png" alt="">
                            <img src="/static/images/xxk.png" alt="" class="none">
                            <span>${bazaarData.symbol}</span>
                        </p>
                        <p class="li-con bb-zxj">0.0</p>
                        <p class="li-right d-baz"><span> </span>${zfData}%</p>
                    </li>`;
            $('.baz-ul').html(bazULHtml);
            setBazDeal.symbol = bazaarData.symbol;
            setBazDeal.toSymbol = bazaarData.toSymbol;
            // 汇率
            getExchange();
            // symbol资料
            symbolDetail();


            $('.yj-m span').text(setBazDeal.toSymbol);
            $('.jy-b').text(setBazDeal.toSymbol);
            $('.btc-put span').text(setBazDeal.symbol);
            $('.am-btn span').text(setBazDeal.symbol);
            $('.t-jyd').text(`${setBazDeal.symbol}/${setBazDeal.toSymbol}`)
        }
    }

    // 查用户余额
    function getUserMoney() {
        AccountCtr.getAccount().then(data => {
            userData = data;
            let btcData = userData.filter((item) => {
                return item.currency == setBazDeal.toSymbol;
            })
            let syData = userData.filter(item => {
                return item.currency == setBazDeal.symbol;
            })
            syUserMoney = base.formatMoneySubtract(`${syData[0].amount}`, `${syData[0].frozenAmount}`, setBazDeal.symbol);
            toSyUserMoney = base.formatMoneySubtract(`${btcData[0].amount}`, `${btcData[0].frozenAmount}`, setBazDeal.toSymbol);
            $('.baz-all').text(toSyUserMoney);
            $('.sy_all').text(syUserMoney).attr('title', syUserMoney);
            $('.toSdw').text(btcData[0].currency);
            if (toSyUserMoney == 0) {
                $('.bb-exc').text('0.00');
            }
        });
    }


    function addLister() {
        // 显示与隐藏
        $('.bb-container .bb-conRight .con-h').off('click').click(function (e) {
            let target = e.target;
            if (target.tagName == 'SPAN') {
                let dom = $(Array.from($(target).siblings())[0]);
                if (dom.hasClass('none')) {
                    dom.removeClass('none');
                    dom.next('b').addClass('none');
                    dom.parent().nextAll('div').animate({
                        'height': '100%'
                    }, 300);
                } else {
                    dom.addClass('none');
                    dom.next('b').removeClass('none');
                    dom.parent().nextAll('div').css({
                        'overflow': 'hidden',
                        'padding': '0'
                    }).animate({
                        'height': '0'
                    }, 300);
                }
            }
        })

        // 选择基础币种
        $('.baz-list>h5 span').off('click').click(function () {
            $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
            sessionStorage.setItem('setBazDeal', JSON.stringify({
                symbol: 'FMVP',
                toSymbol: $(this).text()
            }));
            location.reload();
            // switch ($(this).text()) {
            //     case bazaarData[0].toSymbol:
            //         showBazaar(bazaarData[0]);
            //         break;
            //     case bazaarData[1].toSymbol:
            //         showBazaar(bazaarData[1]);
            //         break;
            // }
            // getBBDataFn();
            // 查用户余额
            // if (base.isLogin()) {
            //     getUserMoney();
            // }
        })

        // 限价交易与市价交易
        $('.bb-jiaoyi>h5 span').off('click').click(function () {
            $(this).addClass('sel-jy').siblings().removeClass('sel-jy');
            jyFn($(this).text());
        })

        // input验证事件
        function outBlur(that) {
            let reg = /^[1-9]\d*.?\d*$|0.\d*[1-9]\d*$/;
            if ($(that).val().match(reg)) {
                $(that).css('border-color', '#e5e5e5');
                return true;
            } else {
                $(that).css('border-color', '#d53d3d');
                return false;
            }
        }
        $('.bb-jiaoyi input').blur(function () {
            outBlur(this);
        })
        $('.bb-jiaoyi input').focus(function () {
            let isBuy = $(this).parent('div').prev().text();
            if (isBuy == '买入价' || isBuy == '买入量') {
                $('#yr-price').css('border-color', '#e5e5e5');
                $('#sellNum').css('border-color', '#e5e5e5');
            }
            if (isBuy == '卖出价' || isBuy == '卖出量') {
                $('#ym-price').css('border-color', '#e5e5e5');
                $('#buyNum').css('border-color', '#e5e5e5');
            }
            return;
        })

        // 限价交易 下订单
        function placeAnOrder(direction, inpPrice, inpNum) {
            let totalCount = $(inpNum).val().trim();
            if (isType == 0) {
                let price = $(inpPrice).val().trim();
                if(price == 0){
                    base.showMsg('价格不能小于等于0');
                }
                if (outBlur(inpPrice) && outBlur(inpNum) && price != '0') {
                    getLimitedPriceData('1', direction, price, totalCount).then(data => {
                        base.hideLoadingSpin();
                        $(inpNum).val('');
                        $(inpPrice).val('');
                        $('.mr-exc').text('0.00');
                        $('.mc-exc').text('0.00');
                        $('.y-sp .br-p').css('width', '0%');
                        $('.y-sp span:not(.sel-span)').css('background-color', '#f1f1f1');
                        $('.j-sp .br-p').css('width', '0%');
                        $('.j-sp span:not(.sel-span)').css('background-color', '#f1f1f1');
                        $('.br-sp .sel-span').css('left', '0%');
                        if (data.code) {
                            base.showMsg('订单提交成功');
                            getUserMoney();
                        } else {
                            base.showMsg('订单提交失败');
                            return false;
                        }
                        setTimeout(() => {
                            getMyorderTicket(userConfig).then(data => {
                                userOrderData = data.list;
                                curOrder(userOrderData);
                            })
                        }, 200);
                    }, base.hideLoadingSpin); // 委托类型，买卖方向，价格，委托数量
                } else {
                    return false;
                }
                $('.y-sp .br-p').css('width', '0%');
                $('.y-sp span:not(.sel-span)').css('background-color', '#f1f1f1');
                $('.j-sp .br-p').css('width', '0%');
                $('.j-sp span:not(.sel-span)').css('background-color', '#f1f1f1');
                $('.br-sp .sel-span').css('left', '0%');
            }
            if (isType == 1) {
                if (outBlur(inpNum)) {
                    getLimitedPriceData('0', direction, '', totalCount).then(data => {
                        base.hideLoadingSpin();
                        $(inpNum).val('');
                        if (data.code) {
                            base.showMsg('订单提交成功');
                        } else {
                            base.showMsg('订单提交失败');
                            return false;
                        }
                        setTimeout(() => {
                            getMyorderTicket(userConfig).then(data => {
                                userOrderData = data.list;
                                curOrder(userOrderData);
                            })
                        }, 200);
                    }, () => {
                        base.hideLoadingSpin();
                    }); // 委托类型，买卖方向，价格，委托数量
                } else {
                    return false;
                }
            }
            $('.jy-ce').text('0.00000000');
            $('.jy-me').text('0.00000000');
            $('#buyNum').val('');
            $('#sellNum').val('');
        }
        //买入
        $('.jy-con-left .am-button-g').off('click').click(function () {
            if (!base.isLogin()) {
                return false;
            }
            placeAnOrder('0', '#ym-price', '#buyNum');
        })
        //卖出
        $('.jy-con-right .am-button-red').off('click').click(function () {
            if (!base.isLogin()) {
                return false;
            }

            placeAnOrder('1', '#yr-price', '#sellNum');
        })

        //我的委托单 买入 卖出
        $('.con-r-current .cur-p span').off('click').click(function () {
            setStu(this, userConfig);
            getMyorderTicket(userConfig).then(data => {
                userOrderData = data.list;
                curOrder(userOrderData);
            })
        })

        // 充币
        $('.bb-jiaoyi').off('click').click(function(e){
            let target = e.target;
            if($(target).hasClass('bb-cb')){
                base.gohref(base.changeURLArg('../wallet/wallet.html', "key", setBazDeal.toSymbol));
            }
        })

        // 历史委托单 买入 卖出
        $('.con-r-history .his-p span').off('click').click(function () {
            setStu(this, hisConfig);
            getMyHistoryData(hisConfig).then(data => {
                userHistoryData = data.list;
                hisOrder(userHistoryData);
            })
        })

        // 取消委托操作
        $('.cur-table .y-cz').off('click').click(function () {
            let code = $(this).attr('data-code');
            rmOrder(code).then(data => {
                getMyorderTicket(userConfig).then(data => {
                    userOrderData = data.list;
                    curOrder(userOrderData);
                })
            });
        })

        //订单输入 汇率换算
        $('#ym-price').keyup(function () {
            let ym_price = $(this).val();
            // let ym =  (ym_price > 0 && /^\d+(?:\.\d{1,8})?$/.test(ym_price));
            let yRight = ym_price.split('.')[1];
            let yLeft = ym_price.split('.')[0];
            if(yRight.length > 8){
                yRight = yRight.substring(0, 8);
                base.showMsg('小数点后最大不得大于八位');
                $(this).val(yLeft + '.' + yRight);
                return;
            }
            $('.mr-exc').text(((Math.floor(ym_price * bb_exchange) * 100) / 100).toFixed(2));
            if (ym_price > 0) {
                $('.all-bb').text((Math.floor((toSyUserMoney / ym_price) * 100) / 100).toFixed(2));
            }
        })
        $('#yr-price').keyup(function () {
            let yr_price = $(this).val();
            let yRight = yr_price.split('.')[1];
            let yLeft = yr_price.split('.')[0];
            if(yRight.length > 8){
                yRight = yRight.substring(0, 8);
                base.showMsg('小数点后最大不得大于八位');
                $(this).val(yLeft + '.' + yRight);
                return;
            }
            $('.mc-exc').text(((Math.floor(yr_price * bb_exchange) * 100) / 100).toFixed(2));
            if (yr_price > 0) {
                $('.all-bb_c').text((Math.floor((syUserMoney / yr_price) * 100) / 100).toFixed(2));
            }
        })

        // 交易额-计算
        $('#buyNum').keyup(function (e) {
            let buyPassage = 0;
            if (outBlur(this)) {
                if(parseFloat($('.baz-all').text()) != 0){
                    $('.jy-me').text(((($('#ym-price').val() * $('#buyNum').val()) * 100000000) / 100000000).toFixed(8) + ' ');
                }
                let buyNumValue = parseFloat($(this).val());
                let buyAllValue = parseFloat($('.all-bb').text());
                if(buyAllValue > 0){
                    if (buyNumValue < buyAllValue) {
                        buyPassage = (buyNumValue / buyAllValue) * 100;
                    } else {
                        buyPassage = 0;
                        $('.jy-me').text(buyAllValue);
                    }
                }
                let index = parseInt(buyPassage / 26) + 2;
                $('.j-sp .sel-span').css('left', buyPassage + '%');
                $('.j-sp .br-p').css('width', buyPassage + '%');
                for (let i = 1; i < index; i++) {
                    $(`.j-sp .br-${i}`).css('background-color', '#d53d3d');
                }
                for (let i = index; i < 6; i++) {
                    $(`.j-sp .br-${i}`).css('background-color', '#f1f1f1');
                }
            } else {
                $('.jy-me').text('0.00000000')
            }
        })
        $('#sellNum').keyup(function () {
            let sellPassage = 0;
            if (outBlur(this)) {
                if(parseFloat($('.baz-all').text()) != 0){
                    $('.jy-ce').text($('#yr-price').val() * $('#sellNum').val() + ' ');
                }
                let sellNumValue = parseFloat($(this).val());
                let sellAllValue = parseFloat($('.all-bb_c').text());
                if(sellAllValue > 0){
                    if (sellNumValue < sellAllValue) {
                        sellPassage = (sellNumValue / sellAllValue) * 100;
                    } else {
                        sellPassage = 100;
                        $('.jy-ce').text(buyAllValue);
                    }
                }
                let index = sellPassage / 26 + 1;
                for (let i = 1; i < index; i++) {
                    $(`.y-sp .br-${i}`).css('background-color', '#d53d3d');
                }
                for (let i = index; i < 6; i++) {
                    $(`.y-sp .br-${i}`).css('background-color', '#f1f1f1');
                }
                $('.y-sp .sel-span').css('left', sellPassage + '%');
                $('.y-sp .br-p').css('width', sellPassage + '%');
            } else {
                $('.jy-ce').text('0.00000000 ')
            }
        })

        function setStu(that, config) {
            $(that).addClass('sel-sp').siblings().removeClass('sel-sp');
            if ($(that).text() == '买入') {
                config.direction = '0';
            }
            if ($(that).text() == '卖出') {
                config.direction = '1';
            }
            if ($(that).text() == '全部') {
                delete config.direction;
            }
        }

        // 选中盘口事件
        //卖
        $('.s-new_ul').off('click').click(function (e) {
            setNewLiData(e, '#yr-price', '.mc-exc', '#yr-price', '.jy-ce');
        })
        // 买
        $('.b-new_ul').off('click').click(function (e) {
            setNewLiData(e, '#ym-price', '.mr-exc', '#buyNum', '.jy-me');
        })

        function setNewLiData(ev, inpPrise, hsPrice, jyNum, jyPrice) {
            let target = ev.target;
            let toPrice = $(target).parent().children().eq(1).text();
            if (!isNaN(parseFloat(toPrice))) {
                $(inpPrise).val(toPrice);
                $(hsPrice).text(parseFloat(toPrice) * bb_exchange);
                $(jyPrice).text($(inpPrise).val() * $(jyNum).val() + ' ')
            } else {
                $(inpPrise).val('0');
                $(hsPrice).text('0');
                $(jyPrice).text('0');
                return false;
            }
        }

        // 选中span事件
        let isClick = true;
        $('.bb-jy-con span').off('click').click(function (e) {
            i = 0;
            let target = e.target;
            let goLeft = $(target).css('left');
            let index = $(target).index() - 1;
            if (isClick && base.isLogin()) {
                clickGo(target, goLeft, index);
            } else {
                return false;
            }
        })

        // 交易滑动事件
        //买
        $('.j-sp .sel-span').mousedown(function (e) {
            isClick = false;
            togo(this, e, '买');
        })
        // 卖
        $('.y-sp .sel-span').mousedown(function (e) {
            isClick = false;
            togo(this, e, '卖');
        })
        //取消mousemove事件
        $('.dr-box').mouseleave(function () {
            $(this).unbind('mousemove');
            if ($('#buyNum').val() > 0) {
                outBlur('#buyNum');
            }
            if ($('#sellNum').val() > 0) {
                outBlur('#sellNum');
            }
        })
        $('.dr-box').mouseenter(function () {
            $(this).unbind('mousemove');
        })

        function clickGo(target, goLeft, index) {
            let parseWidth = $(target).parents('.dr-box').width();
            if ($(target).parent().hasClass('j-sp')) {
                // 限价交易-买入
                $('.j-sp .sel-span').css('left', goLeft);
                $('.j-sp .br-p').css('width', goLeft);

                let gleft = (Math.floor(parseFloat(goLeft) / parseFloat(parseWidth) * 1000) / 1000).toFixed(3);
                let mcBB = parseFloat($('.all-bb').text());
                let r_bb = (Math.floor((gleft * mcBB) * 10000) / 10000).toFixed(4);
                $(target).parents('.dr-box').prev().children('input').val(r_bb);
                $('.jy-me').text(((Math.floor((r_bb * $('#ym-price').val()) * 100000000)) / 100000000).toFixed(8));

                for (let i = 1; i < index; i++) {
                    $(`.j-sp .br-${i}`).css('background-color', '#d53d3d');
                }
                for (let i = index; i < 6; i++) {
                    $(`.j-sp .br-${i}`).css('background-color', '#f1f1f1');
                }
            } else if ($(target).parent().hasClass('y-sp')) {
                // 限价交易-卖出
                $('.y-sp .sel-span').css('left', goLeft);
                $('.y-sp .br-p').css('width', goLeft);

                let gleft = (Math.floor(parseFloat(goLeft) / parseFloat(parseWidth) * 1000) / 1000).toFixed(3);
                let mcBB = parseFloat($('.all-bb_c').text());
                let r_bb = (Math.floor((gleft * mcBB) * 10000) / 10000).toFixed(4);
                $(target).parents('.dr-box').prev().children('input').val(r_bb);
                $('.jy-ce').text(((Math.floor((r_bb * $('#yr-price').val()) * 100000000)) / 100000000).toFixed(8));

                for (let i = 1; i < index; i++) {
                    $(`.y-sp .br-${i}`).css('background-color', '#d53d3d');
                }
                for (let i = index; i < 6; i++) {
                    $(`.y-sp .br-${i}`).css('background-color', '#f1f1f1');
                }
            }
        }
    }

    function jyFn(jyText){
        $('.jy-btc1 .c-b').text(setBazDeal.symbol);
        $('.y-sp .br-p').css('width', '0%');
        $('.y-sp span:not(.sel-span)').css('background-color', '#f1f1f1');
        $('.j-sp .br-p').css('width', '0%');
        $('.j-sp span:not(.sel-span)').css('background-color', '#f1f1f1');
        $('.br-sp .sel-span').css('left', '0%');
        switch (jyText) {
            case '限价交易':
                isType = 0;
                sessionStorage.setItem('jyType', 'xj');
                $('.yj-m>input').eq(0).val('').prop('disabled', false).removeClass('dis-inp');
                $('.jy-r>input').val('').prop('disabled', false).removeClass('dis-inp');
                $('.yj-btc').css('opacity', '1').eq(0).next().text('买入量');
                $('.btc-toSm span').text(setBazDeal.symbol); // 当前交易对 sm
                $('.jy-btc1 .r-b').text(setBazDeal.symbol);
                $('.bb-jiaoyi input').css('border-color', '#e5e5e5').val('');
                $('.jy-money').css('opacity', '1');
                $('.all-bb').text('0.00');
                $('.jy-me').text('0.00000000');
                $('.mr-exc').text('0.00');
                break;
            case '市价交易':
                isType = 1;
                sessionStorage.setItem('jyType', 'sj');
                $('.bb-jiaoyi input').css('border-color', '#e5e5e5').val('');
                $('.yj-m>input').eq(0).val('以市场上最优价格买入').prop('disabled', true).addClass('dis-inp');
                $('.jy-r>input').val('以市场最优价格卖出').prop('disabled', true).addClass('dis-inp');
                $('.yj-btc').css('opacity', '0').eq(0).next().text('交易额');
                $('.btc-toSm span').text(setBazDeal.toSymbol); // 当前交易对 tosm
                $('.jy-btc1 .r-b').text(setBazDeal.toSymbol);
                $('.jy-money').css('opacity', '0');
                $('.all-bb').text($('.baz-all').text());
                $('.all-bb_c').text($('.sy_all').text());
                $('.mcexc').text('0.00');
                break;
        }
    }

    function autoGo(gLeft, that) {
        let intLeft = Math.floor(gLeft / 26) + 1;
        for (let i = 0; i < intLeft; i++) {
            $(that).nextAll().eq(i).css('background-color', '#d53d3d');
        }
        if (intLeft < 3) {
            for (let i = intLeft; i < 6 - intLeft; i++) {
                $(that).nextAll().eq(i).css('background-color', '#f1f1f1');
            }
        } else {
            for (let i = 6; i >= intLeft; i--) {
                $(that).nextAll().eq(i).css('background-color', '#f1f1f1');
            }
        }
        if (gLeft == 0) {
            $(that).next().css('background-color', '#f1f1f1');
        }
    }

    let i = 0;

    function togo(that, e, type) {
        if (!base.isLogin()) {
            return false;
        }
        let parWidth = $(that).parent('.br-sp').width();
        let goLeft = parseInt($(that).css('left')) / parWidth * 100;
        let goX = e.pageX;
        $(that).parents('.dr-box').mousemove(e => {
            let mlen = (((e.pageX - goX) / parWidth) * 100).toFixed(2);
            let gLeft = goLeft + parseInt(mlen);
            if (gLeft >= 100) {
                gLeft = 100;
            }
            if (gLeft <= 0) {
                gLeft = 0;
            }
            $(that).css({
                left: (gLeft) + '%'
            })
            autoGo(gLeft, that);
            $(that).prev().css({
                width: gLeft + '%'
            })

            //买入量
            let allBB = parseFloat($('.all-bb').text());
            if (allBB != 0 && type == '买') {
                let m_bb = (Math.floor(((gLeft * allBB) / 100) * 10000) / 10000).toFixed(4);
                $(that).parents('.dr-box').prev().children('input').val(m_bb);
                $('.jy-me').text(((Math.floor((m_bb * $('#ym-price').val()) * 100000000)) / 100000000).toFixed(8));
            }
            // 卖人量
            let mcBB = parseFloat($('.all-bb_c').text());
            let r_bb = (Math.floor(((gLeft * mcBB) / 100) * 10000) / 10000).toFixed(4);
            if (mcBB != 0 && type == '卖') {
                $(that).parents('.dr-box').prev().children('input').val(r_bb);
                $('.jy-ce').text(((Math.floor((r_bb * $('#yr-price').val()) * 100000000)) / 100000000).toFixed(8));
            }
            i++;
        }).one('mouseup', function () {
            $(this).unbind('mousemove');
            if (i == 1) {
                setTimeout(() => {
                    isClick = true;
                }, 200);
            }
        })
    }

    function getDepthData() {
        return Ajax.post('650064', {
            ...setBazDeal
        })
    }

    function depthFn(buyData, sellData) {
        let sellList = [],
            sellLjListData = [],
            buyLjListData = [],
            sellWtData = [],
            sellLjData = [],
            buyWtData = [],
            buyLjData = [],
            wtXListData = [];
        //卖
        sellData.forEach((item) => {
            // buyList.push(0);
            sellWtData.push(base.formatMoney(`${item.price}`, '', setBazDeal.toSymbol));
            sellLjData.push(base.formatMoney(`${item.count}`, '', setBazDeal.symbol));
        })
        // sellWtListData = [...sellWtData, ...sellList];
        //买
        buyData.forEach((item) => {
            sellList.push('');
            buyWtData.push(base.formatMoney(`${item.price}`, '', setBazDeal.toSymbol));
            buyLjData.push(base.formatMoney(`${item.count}`, '', setBazDeal.symbol));
        })
        buyWtData.sort((a, b) => (a - b));
        buyLjData.sort((a, b) => (b - a));
        // wtListData = [...buyList, ...sellWtData];
        buyLjListData = [...buyLjData];
        sellLjListData = [...sellList, ...sellLjData];
        wtXListData = [...buyWtData, ...sellWtData];
        var myChart = echarts.init(document.getElementById('main'));
        var colors = ['rgba(79, 213, 141, 0.8)', 'rgba(225, 118, 118, 0.8)', '#6a7985'];

        var option = {
            color: colors,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                confine: true,
                formatter: function (data) {
                    if (data[0].value == 0 && data[1]) {
                        return `委托价：${data[1].name}</br>累计：${data[1].value}`;
                    }
                    return `委托价：${data[0].name}</br>累计：${data[0].value}`;
                }
            },
            grid: {
                top: 70,
                bottom: 50
            },
            xAxis: [{
                    type: 'category',
                    scale: true,
                    boundaryGap: false,
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        onZero: false
                    },
                    data: wtXListData
                },
                {
                    type: 'category',
                    scale: true,
                    boundaryGap: false,
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: 'transparent'
                        }
                    },
                    data: wtXListData
                }
            ],
            yAxis: [{
                type: 'value',
                scale: true
            }],
            series: [{
                    name: '买入',
                    type: 'line',
                    smooth: false,
                    step: 'end',
                    lineStyle: {
                        width: 0
                    },
                    areaStyle: {
                        normal: {}
                    },
                    data: buyLjListData
                },
                {
                    name: '卖出',
                    type: 'line',
                    // barCategoryGap: 0,
                    smooth: false,
                    step: 'end',
                    lineStyle: {
                        width: 0
                    },
                    areaStyle: {
                        normal: {}
                    },
                    data: sellLjListData
                }
            ]
        };
        myChart.setOption(option)

    }

    function k() {

        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        //				var widget = window.tvWidget = new TradingView.widget({
        //					// debug: true, // uncomment this line to see Library errors and warnings in the console
        //					fullscreen: true,
        //					symbol: 'AAPL',
        //					interval: 'D',
        //					container_id: "tv_chart_container",
        //
        //					//	BEWARE: no trailing slash is expected in feed URL
        //					datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
        //					library_path: "charting_library/",
        //					locale: getParameterByName('lang') || "en",
        //
        //					disabled_features: ["use_localstorage_for_settings"],
        //					enabled_features: ["study_templates"],
        //					charts_storage_url: 'http://saveload.tradingview.com',
        //					charts_storage_api_version: "1.1",
        //					client_id: 'tradingview.com',
        //					user_id: 'public_user_id',
        //					theme: getParameterByName('theme'),
        //				});

        var widget = new TradingView.widget({
            width: '100%',
            height: '500px',
            fullscreen: false,
            symbol: 'FMVP',
            interval: '1', // 时间
            container_id: "tv_chart_container",
            //	BEWARE: no trailing slash is expected in feed URL
            datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
            library_path: "/static/js/app/module/charting_library/",
            locale: getParameterByName('lang') || "zh",
            disabled_features: [
                'use_localstorage_for_settings',
                // 头部
                'header_symbol_search', // 符号搜索
                'symbol_search_hot_key', // 按任意键进行符号搜索
                'header_chart_type', // 类型
                'header_compare', // 指标
                'header_indicators',
                'header_undo_redo', // 撤销/返回
                'header_saveload', // 隐藏保存/加载按钮
                'header_screenshot', //保存图片
                // 底部
                'go_to_date',
                'timeframes_toolbar',
                'display_market_status', // 状态
                'volume_force_overlay'
            ],
            // 启用
            enabled_features: [
                'study_templates',
                'hide_left_toolbar_by_default', // 当用户第一次打开图表时，隐藏左侧工具栏
                'legend_context_menu'
            ],
            overrides: {
                'paneProperties.legendProperties.showLegend': false,
            },
        });
        widget.onChartReady(() => {

            const _self = this;
            let chart = widget.chart();
            let activeChart = widget.activeChart();
            const btnList = [
              {
                label:'分时',
                resolution: "1",
                chartType: 3
              },{
                label:'1min',
                resolution: "1",
              },
              {
                label:'5min',
                resolution: "5",
              },
              {
                label:'30min',
                resolution: "30",
              },
              {
                label:'1 h',
                resolution: "60",
              },
              {
                class:'selected',
                label:'1 day',
                resolution: "1D"
              },{
                class:'selected',
                label:'1 week',
                resolution: "1W"
              },{
                class:'selected',
                label:'1 month',
                resolution: "1M"
              }
            ];
            activeChart.setTimezone('Asia/Shanghai');
            chart.onIntervalChanged().subscribe(null, function (interval, obj) {
              widget.changingInterval = false;
            });
            btnList.forEach(function (item) {
              let button = widget.createButton({
                align: "left"
              });
              item.resolution === widget._options.interval && updateSelectedIntervalButton(button);
              button.attr('class', "button " + item.class).attr("data-chart-type", item.chartType === undefined ? 8 : item.chartType).on('click', function (e) {
                // if (!_self.widget.changingInterval && !button.hasClass("selected")) {
                let chartType = +button.attr("data-chart-type");
                // let resolution = button.attr("data-resolution");
                if (chart.resolution() !== item.resolution) {
                  // _self.widget.changingInterval = true;
                  chart.setResolution(item.resolution);
                }
                if (chart.chartType() !== chartType) {
                  chart.setChartType(chartType);
                }
                updateSelectedIntervalButton(button);
                // }
              }).append(item.label);
            });
            function updateSelectedIntervalButton(button) {
              widget.selectedIntervalButton && widget.selectedIntervalButton.removeClass("selected");
              button.addClass("selected");
              widget.selectedIntervalButton = button;
            }
          })
    }
})