define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'pagination',
    'app/interface/AccountCtr'
], function(base, Ajax, GeneralCtr, pagination, AccountCtr) {
    let userConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '10'
    };
    let hisConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '10'
    };
    let userData = [];
    let bazaarData = []; // 交易对数据
    let setBazDeal = {
        symbol: '',
        toSymbol: ''
    };
    let buyHandicapData = []; // 买盘口数据
    let sellHandicapData = []; // 卖盘口数据

    let userOrderData = []; // 用户当前委托数据
    let userHistoryData = []; //用户历史委托数据

    let realTimeData = []; // 实时成交数据

    init();

    function init() {
        base.showLoadingSpin(); // 显示加载
        base.hideLoadingSpin(); // 隐藏加载
        addLister();
        // 判断是否登录
        if (!base.isLogin()) {
            $('.con-r-current').addClass('none');
            $('.con-r-history').addClass('none');
            $('.user-jy').addClass('none');
            $('.user-baz').addClass('none');
            $('.tologin').removeClass('none');
            $('.am-btn').addClass('dis-btn');
        } else {
            // GeneralCtr.getDictList({ "parentKey": "trade_order_status" }).then((data) => {
            //     data.forEach(function(item) {
            //         statusValueList[item.dkey] = item.dvalue
            //     })
            // }, base.hideLoadingSpin)
            AccountCtr.getAccount().then(data => {
                userData = data;
                let btcData = userData.filter((item) => {
                    return item.currency == 'BTC';
                })
                let userMoney = base.formatMoneySubtract(`${btcData[0].amount}`, `${btcData[0].frozenAmount}`, 'BTC');
                $('.baz-all').text(userMoney);
                $('.toSdw').text('BTC');
            });
            getBazaarData().then(data => {
                upBazaarData(data);
                bazaarData.forEach((item, i) => {
                    $('.baz-list>h5 span').eq(i).text(item.toSymbol);
                });
                showBazaar(bazaarData[0]);
                getHandicapData().then(data => {
                    buyHandicapData = data.asks;
                    sellHandicapData = data.bids;
                    let slen = 7 - sellHandicapData.length;
                    let blen = 7 - buyHandicapData.length;
                    if (slen > 0) {
                        for (let i = 0; i < slen; i++) {
                            sellHandicapData.push(0);
                        }
                    }
                    if (blen > 0) {
                        for (let i = 0; i < slen; i++) {
                            buyHandicapData.push(0);
                        }
                    }
                    let buyHtml = '',
                        sellHtml = '';
                    buyHandicapData.forEach((item, i) => {
                        buyHtml += `<li>
                            <p class="b-p">买<span>${i + 1}</span></p>
                            <p>${item.price ? item.price : '--'}</p>
                            <p>${item.count ? item.count : '--'}</p>
                            <p>617.98</p>
                        </li>`
                    })
                    $('.b-new_ul').html(buyHtml);
                    sellHandicapData.forEach((item, i) => {
                        sellHtml += `<li>
                            <p class="s-p">卖<span>${7 - i}</span></p>
                            <p>${item.price ? item.price : '--'}</p>
                            <p>${item.count ? item.count : '--'}</p>
                            <p>617.98</p>
                        </li>`
                    })
                    $('.s-new_ul').html(sellHtml)
                });
            });
            getMyorderTicket(userConfig).then(data => {
                userOrderData = data.list;
                curOrder(userOrderData);
            })

            getMyHistoryData(hisConfig).then(data => {
                userHistoryData = data.list;
                if (!userOrderData) {
                    $('.no-cur').removeClass('none');
                }
                let userHistoryHtml = '';
                userHistoryData.forEach(item => {
                    userHistoryHtml += `<tr>
                        <td colspan="2">${base.formatDate(item.createDatetime)}</td>
                        <td>${item.symbol}/${item.toSymbol}</td>
                        <td>${item.direction == 0 ? '买入' : '卖出'}</td>
                        <td>${item.price}</td>
                        <td>${item.totalCount}</td>
                        <td>${item.tradedCount}</td>
                        <td>${item.avgPrice}</td>
                        <td>${item.status}</td>
                        <td>
                            <button>操作</button>
                        </td>
                    </tr>`
                })
                $('.his-table tbody').html(userHistoryHtml);
            })

            getRealTimeData().then(data => {
                realTimeData = data.list;
                let realTimeHtml = '';
                realTimeData.forEach(item => {
                    realTimeHtml += `<tr>
                        <td>${base.formatDate(item.createDatetime)}</td>
                        <td class="d-mc">卖出</td>
                        <td>6360.46</td>
                        <td>0.0080</td>
                    </tr>`
                });
                $('.dep-table tbody').html(realTimeHtml);
            })
        }

    }

    // 查当前委托函数
    function curOrder(userOrderData) {
        if (!userOrderData) {
            $('.no-cur').removeClass('none');
        }
        let userOrderHtml = '';
        userOrderData.forEach((item, i) => {
            userOrderHtml += `<tr>
                    <td colspan="2">${base.formatDate(item.createDatetime)}</td>
                    <td>${item.symbol}/${item.toSymbol}</td>
                    <td>${item.direction == 0 ? '买入' : '卖出'}</td>
                    <td>${item.price}</td>
                    <td>${item.totalCount}</td>
                    <td>${item.totalAmount}</td>
                    <td>${item.tradedCount}</td>
                    <td>${item.totalCount - item.tradedCount}</td>
                    <td>
                        <button>操作</button>
                    </td>
                </tr>`
        })
        $('.cur-table tbody').html(userOrderHtml);
    }


    // 初始化交易记录分页器
    function initPagination(data) {
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: config.limit,
            jump: true,
            coping: true,
            prevContent: '<img src="/static/images/arrow---left.png" />',
            nextContent: '<img src="/static/images/arrow---right.png" />',
            keepShowPN: true,
            totalData: data.totalCount,
            jumpIptCls: 'pagination-ipt',
            jumpBtnCls: 'pagination-btn',
            jumpBtn: '确定',
            isHide: true,
            callback: function(_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getInvitationHistory(config);
                }
            }
        });
    }


    //更新bazaarData的值
    function upBazaarData(data) {
        bazaarData = data.list;
        setBazDeal.symbol = bazaarData[0].symbol;
        setBazDeal.toSymbol = bazaarData[0].toSymbol;
    }

    // 市场
    function getBazaarData() {
        return Ajax.post("650100", {
            start: '1',
            limit: '10'
        }, true);
    }

    // 交易  
    function getLimitedPriceData(type, direction, price, totalCount) {
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
        return Ajax.post('650058', config)
    }

    // 分页查询我的历史委托单
    function getMyHistoryData(config) {
        return Ajax.post('650059', config);
    }

    // 分页查询成交明细 （实时成交）
    function getRealTimeData() {
        return Ajax.post('650057', {
            start: '1',
            limit: '10'
        })
    }


    function showBazaar(bazaarData) {
        let bazULHtml = '';
        bazULHtml += `<li>
                        <p class="li-left">
                            <img src="/static/images/自选.png" alt="">
                            <img src="/static/images/星星空.png" alt="" class="none">
                            <span>${bazaarData.symbol}</span>
                        </p>
                        <p class="li-con">0.086690</p>
                        <p class="li-right d-baz"><span>-</span>2.53%</p>
                    </li>`;
        $('.baz-ul').html(bazULHtml);
        setBazDeal.symbol = bazaarData.symbol;
        setBazDeal.toSymbol = bazaarData.toSymbol;
        $('.yj-m span').text(setBazDeal.symbol);
        $('.btc-put span').text(setBazDeal.toSymbol);
    }


    function addLister() {

        // 显示与隐藏
        $('.bb-container .bb-conRight .con-h').off('click').click(function(e) {
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
        $('.baz-list>h5 span').off('click').click(function() {
            $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
            switch ($(this).text()) {
                case bazaarData[0].toSymbol:
                    showBazaar(bazaarData[0]);
                    break;
                case bazaarData[1].toSymbol:
                    showBazaar(bazaarData[1]);
                    break;
            }
            // 查盘口
            getHandicapData().then(data => {
                console.log(data);
                buyHandicapData = data.asks;
                buyHandicapData.length = 7;
                sellHandicapData = data.bids;
                sellHandicapData.length = 7;
                console.log('买', buyHandicapData);
                console.log('卖', sellHandicapData);
            });
            // 查用户余额
            AccountCtr.getAccount().then(data => {
                userData = data;
                let btcData = userData.filter((item) => {
                    return item.currency == setBazDeal.toSymbol;
                })
                let userMoney = base.formatMoneySubtract(`${btcData[0].amount}`, `${btcData[0].frozenAmount}`, 'BTC');
                $('.baz-all').text(userMoney);
                $('.toSdw').text(btcData[0].currency);
            });
        })

        // 限价交易与市价交易
        $('.bb-jiaoyi>h5 span').off('click').click(function() {
            $(this).addClass('sel-jy').siblings().removeClass('sel-jy');
            switch ($(this).text()) {
                case '限价交易':
                    $('.yj-m>input').eq(0).val('').prop('disabled', false).removeClass('dis-inp');
                    $('.jy-r>input').val('').prop('disabled', false).removeClass('dis-inp');
                    $('.yj-btc').css('opacity', '1').eq(0).next().text('买入量');
                    $('.btc-toSm span').text(setBazDeal.toSymbol); // 当前交易对 sm
                    $('.bb-jiaoyi input').css('border-color', '#e5e5e5');
                    break;
                case '市价交易':
                    $('.yj-m>input').eq(0).val('以市场上最优价格买入').prop('disabled', true).addClass('dis-inp');
                    $('.jy-r>input').val('以市场最优价格卖出').prop('disabled', true).addClass('dis-inp');
                    $('.yj-btc').css('opacity', '0').eq(0).next().text('交易额');
                    $('.btc-toSm span').text(setBazDeal.symbol); // 当前交易对 tosm
                    $('.bb-jiaoyi input').css('border-color', '#e5e5e5');
                    break;
            }
        })

        // input验证事件
        function outBlur(that) {
            let reg = /^[0-9]+$/;
            if ($(that).val().match(reg)) {
                $(that).css('border-color', '#e5e5e5');
                return true;
            } else {
                $(that).css('border-color', '#d53d3d');
                return false;
            }
        }
        $('.bb-jiaoyi input').blur(function() {
            outBlur(this);
        })

        // 限价交易 下订单
        //买入
        $('.jy-con-left .am-button-g').off('click').click(function() {
                let price = $('#ym-price').val().trim();
                let totalCount = $('#buyNum').val().trim();
                if (outBlur('#ym-price') && outBlur('#buyNum')) {
                    getLimitedPriceData('1', '0', price, totalCount).then(data => {
                        $('.bb-jiaoyi input').val('');
                        if (data.code) {
                            base.showMsg('订单提交成功');
                        } else {
                            base.showMsg('订单提交失败');
                            return false;
                        }
                        setTimeout(() => {
                            window.location.reload()
                        }, 200);
                    }); // 委托类型，买卖方向，价格，委托数量
                } else {
                    return false;
                }
            })
            //卖出
        $('.jy-con-right .am-button-red').off('click').click(function() {
            let price = $('#yr-price').val().trim();
            let totalCount = $('#sellNum').val().trim();
            if (outBlur('#yr-price') && outBlur('#sellNum')) {
                getLimitedPriceData('1', '1', price, totalCount).then(data => {
                    $('.bb-jiaoyi input').val('');
                    if (data.code) {
                        base.showMsg('订单提交成功');
                    } else {
                        base.showMsg('订单提交失败');
                        return false;
                    }
                    setTimeout(() => {
                        window.location.reload()
                    }, 200);
                });
            } else {
                return false;
            }
        })

        //我的委托单 买入 卖出
        $('.con-r-current .cur-p span').off('click').click(function() {
            setStu(this, userConfig);
            getMyorderTicket(userConfig).then(data => {
                userOrderData = data.list;
                curOrder(userOrderData);
            })
        })

        // 历史委托单 买入 卖出
        $('.con-r-history .his-p span').off('click').click(function() {
            setStu(this, hisConfig);
            getMyHistoryData(hisConfig);
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

        // 选中span事件
        $('.bb-jy-con').off('click').click(function(e) {
            let target = e.target;
            if ($(target).parent().hasClass('j-sp')) {
                // 限价交易-买入
                $(target).addClass('sel-span').siblings().removeClass('sel-span');
            } else if ($(target).parent().hasClass('y-sp')) {
                // 限价交易-卖出
                $(target).addClass('sel-span').siblings().removeClass('sel-span');
            }
        })

        // 交易滑动事件
        $('.j-sp .sel-span').mousedown(function(e) {
            //togo(this, e);
        })

        function togo(that, e) {
            let parWidth = $(that).parent('.br-sp').width();
            let goLeft = parseInt($(that).css('left'));
            let goX = e.pageX;
            $(that).parent('.br-sp').mousemove(e => {
                let mlen = (((e.pageX - goX) / parWidth) * 100).toFixed(2);
                if (mlen >= 100) {
                    mlen = 100;
                }
                if (mlen <= 0) {
                    mlen = 0;
                }

                console.log('mlen:', goLeft + parseInt(mlen))
                console.log('goLeft:', goLeft + parseInt(goLeft))
                $(that).css({
                        left: (goLeft + parseInt(mlen))
                    })
                    //交易额
                    // if ($(".yj-num").text() == '0' || !$(".yj-num").text()) {
                    //     $("#price").val(mid);
                    // } else {
                    //     $("#price").val((mid + mid * ($(".yj-num").text() / 100)).toFixed(2));
                    // }
            }).mouseup(function() {
                $(this).unbind('mousemove');
            })
        }
    }
})