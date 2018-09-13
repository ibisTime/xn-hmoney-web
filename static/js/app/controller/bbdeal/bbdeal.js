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
            let statusValueList = {}; // 状态
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
                getBazaarData().then(data => { // 加载市场数据
                    upBazaarData(data);
                    bazaarData.forEach((item, i) => {
                        $('.baz-list>h5 span').eq(i).text(item.toSymbol);
                    });
                    showBazaar(bazaarData[0]);
                    autoGetData();
                    clearInterval(timeGet);
                    var timeGet = setInterval(() => {
                        autoGetData();
                    }, 2000);

                    function autoGetData() {
                        getHandicapData().then(data => {
                            buyHandicapData = data.bids;
                            sellHandicapData = data.asks;
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
                        <p>${item.price ? item.price : '--'}</p>
                        <p>${item.count ? item.count : '--'}</p>
                    </li>`
                            })
                            $('.b-new_ul').html(buyHtml);
                            for (let i = 6; i >= 0; i--) {
                                sellHtml += `<li>
                        <p class="s-p">卖<span>${i + 1}</span></p>
                        <p>${sellHandicapData[i].price ? sellHandicapData[i].price : '--'}</p>
                        <p>${sellHandicapData[i].count ? sellHandicapData[i].count : '--'}</p>
                    </li>`
                            }
                            $('.s-new_ul').html(sellHtml)
                        });
                    }
                    $('.c-b').text(setBazDeal.symbol);
                    $('.r-b').text(setBazDeal.symbol);
                });
                // 判断是否登录
                if (!base.isLogin()) {
                    $('.con-r-current').addClass('none');
                    $('.con-r-history').addClass('none');
                    $('.user-jy').addClass('none');
                    $('.user-baz').addClass('none');
                    $('.tologin').removeClass('none');
                    $('.am-btn').addClass('dis-btn');
                } else {
                    //状态
                    GeneralCtr.getDictList({ "parentKey": "simu_order_status" }).then((data) => {
                        data.forEach(function(item) {
                            statusValueList[item.dkey] = item.dvalue
                        })
                    }, base.hideLoadingSpin)
                    AccountCtr.getAccount().then(data => {
                        userData = data;
                        let btcData = userData.filter((item) => {
                            return item.currency == 'BTC';
                        })
                        let userMoney = base.formatMoneySubtract(`${btcData[0].amount}`, `${btcData[0].frozenAmount}`, 'BTC');
                        $('.baz-all').text(userMoney);
                        $('.toSdw').text('BTC');
                    });
                    getMyorderTicket(userConfig).then(data => {
                        userOrderData = data.list;
                        curOrder(userOrderData);
                    })
                    clearInterval(timeHis);
                    autoGetHisData();
                    var timeHis = setInterval(() => {
                        autoGetHisData();
                    }, 2100);

                    function autoGetHisData() {
                        getMyHistoryData(hisConfig).then(data => {
                            userHistoryData = data.list;
                            hisOrder(userHistoryData);
                        })
                    }

                    getRealTimeData().then(data => {
                        realTimeData = data.list;
                        let realTimeHtml = '';
                        realTimeData.forEach(item => {
                            realTimeHtml += `<tr>
                        <td>${base.formatDate(item.createDatetime)}</td>
                        <td class="${item.direction == 0 ? 'd-mr' : 'd-mc'}">${item.direction == 0 ? '买入' : '卖出'}</td>
                        <td>${item.tradedPrice}</td>
                        <td>${item.tradedCount}</td>
                    </tr>`
                        });
                        // ${base.formatMoney(`${item.tradedPrice}`, '', item.toSymbol)}
                        $('.dep-table tbody').html(realTimeHtml);
                    });

                }

                $('a').off('click').click(function() {
                    debugger
                    sessionStorage.setItem('l-return', '../bbdeal/bbdeal.html');
                })


            }
            // 查看历史委托函数
            function hisOrder(userHistoryData) {
                if (userHistoryData.length == 0) {
                    $('.his-cur').removeClass('none');
                    $('.his-cur').parent('tr').siblings().addClass('none');
                    return false;
                }
                let userHistoryHtml = '';
                userHistoryData.forEach(item => {
                            userHistoryHtml += `<tr>
                <td colspan="2">${base.formatDate(item.createDatetime)}</td>
                <td>${item.symbol}/${item.toSymbol}</td>
                <td>${item.direction == 0 ? '买入' : '卖出'}</td>
                <td>${item.type == 0 ? '市价' : base.formatMoney(`${item.price}`, '', item.toSymbol)}</td>
                <td>${item.totalCount}</td>
                <td>${item.tradedCount}</td>
                <td>${item.avgPrice}</td>
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
            userOrderHtml += `<tr>
                    <td colspan="2">${base.formatDate(item.createDatetime)}</td>
                    <td>${item.symbol}/${item.toSymbol}</td>
                    <td>${item.direction == 0 ? '买入' : '卖出'}</td>
                    <td>${item.type == 0 ? '市价' : base.formatMoney(`${item.price}`, '', item.toSymbol)}</td>
                    <td>${item.totalCount}</td>
                    <td>${item.totalAmount}</td>
                    <td>${item.tradedCount}</td>
                    <td>${item.totalCount - item.tradedCount}</td>
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
        $('.yj-m span').text(setBazDeal.toSymbol);
        $('.jy-b').text(setBazDeal.toSymbol);
        $('.btc-put span').text(setBazDeal.symbol);
        $('.am-btn span').text(setBazDeal.symbol);
        $('.t-jyd').text(`${setBazDeal.symbol}/${setBazDeal.toSymbol}`)
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
            // 查用户余额
            if (base.isLogin()) {
                AccountCtr.getAccount().then(data => {
                    userData = data;
                    let btcData = userData.filter((item) => {
                        return item.currency == setBazDeal.toSymbol;
                    })
                    let userMoney = base.formatMoneySubtract(`${btcData[0].amount}`, `${btcData[0].frozenAmount}`, 'BTC');
                    $('.baz-all').text(userMoney);
                    $('.toSdw').text(btcData[0].currency);
                });
            }
        })

        // 限价交易与市价交易
        let isType = 0; // 0 表示限价 1 表示市价
        $('.bb-jiaoyi>h5 span').off('click').click(function() {
            $(this).addClass('sel-jy').siblings().removeClass('sel-jy');
            $('.jy-btc1 .c-b').text(setBazDeal.symbol);
            switch ($(this).text()) {
                case '限价交易':
                    isType = 0;
                    $('.yj-m>input').eq(0).val('').prop('disabled', false).removeClass('dis-inp');
                    $('.jy-r>input').val('').prop('disabled', false).removeClass('dis-inp');
                    $('.yj-btc').css('opacity', '1').eq(0).next().text('买入量');
                    $('.btc-toSm span').text(setBazDeal.symbol); // 当前交易对 sm
                    $('.jy-btc1 .r-b').text(setBazDeal.symbol);
                    $('.bb-jiaoyi input').css('border-color', '#e5e5e5').val('');
                    $('.jy-money').css('opacity', '1');
                    break;
                case '市价交易':
                    isType = 1;
                    $('.bb-jiaoyi input').css('border-color', '#e5e5e5').val('');
                    $('.yj-m>input').eq(0).val('以市场上最优价格买入').prop('disabled', true).addClass('dis-inp');
                    $('.jy-r>input').val('以市场最优价格卖出').prop('disabled', true).addClass('dis-inp');
                    $('.yj-btc').css('opacity', '0').eq(0).next().text('交易额');
                    $('.btc-toSm span').text(setBazDeal.toSymbol); // 当前交易对 tosm
                    $('.jy-btc1 .r-b').text(setBazDeal.toSymbol);
                    $('.jy-money').css('opacity', '0');
                    break;
            }
        })

        // input验证事件
        function outBlur(that) {
            let reg = /^[0-9.]+$/;
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
        $('.bb-jiaoyi input').focus(function() {
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
                if (outBlur(inpPrice) && outBlur(inpNum)) {
                    getLimitedPriceData('1', direction, price, totalCount).then(data => {
                        $(inpNum).val('');
                        $(inpPrice).val('');
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
                    }); // 委托类型，买卖方向，价格，委托数量
                } else {
                    return false;
                }
            }
            if (isType == 1) {
                if (outBlur(inpNum)) {
                    getLimitedPriceData('0', direction, '', totalCount).then(data => {
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
                    }); // 委托类型，买卖方向，价格，委托数量
                } else {
                    return false;
                }
            }
        }
        //买入
        $('.jy-con-left .am-button-g').off('click').click(function() {
                if (!base.isLogin()) {
                    return false;
                }
                placeAnOrder('0', '#ym-price', '#buyNum');
            })
            //卖出
        $('.jy-con-right .am-button-red').off('click').click(function() {
            if (!base.isLogin()) {
                return false;
            }
            placeAnOrder('1', '#yr-price', '#sellNum');
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
            getMyHistoryData(hisConfig).then(data => {
                userHistoryData = data.list;
                hisOrder(userHistoryData);
            })
        })

        // 取消委托操作
        $('.cur-table .y-cz').off('click').click(function() {
            let code = $(this).attr('data-code');
            rmOrder(code).then(data => {
                getMyorderTicket(userConfig).then(data => {
                    userOrderData = data.list;
                    curOrder(userOrderData);
                })
            });
        })

        // 交易额-计算
        $('#buyNum').keyup(function() {
            if (outBlur(this)) {
                $('.jy-me').text($('#ym-price').val() * $('#buyNum').val() + ' ')
            } else {
                $('.jy-me').text('0 ')
            }
        })
        $('#sellNum').keyup(function() {
            if (outBlur(this)) {
                $('.jy-ce').text($('#yr-price').val() * $('#sellNum').val() + ' ')
            } else {
                $('.jy-ce').text('0 ')
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
        $('.s-new_ul').off('click').click(function(e) {
                setNewLiData(e, '#yr-price');
            })
            // 买
        $('.b-new_ul').off('click').click(function(e) {
            setNewLiData(e, '#ym-price');
        })

        function setNewLiData(ev, inpPrise) {
            let target = ev.target;
            let toPrice = $(target).parent().children().eq(1).text();
            if (!isNaN(parseInt(toPrice))) {
                $(inpPrise).val(toPrice);
            } else {
                return false;
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
        //买
        $('.j-sp .sel-span').mousedown(function(e) {
            togo(this, e);
        })
        // 卖
        $('.y-sp .sel-span').mousedown(function(e) {
            togo(this, e);
        })

        function togo(that, e) {
            let parWidth = $(that).parent('.br-sp').width();
            let goLeft = parseInt($(that).css('left')) / parWidth * 100;
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
                        left: (goLeft + parseInt(mlen)) + '%'
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