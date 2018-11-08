define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/interface/AccountCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, GeneralCtr, UserCtr, TradeCtr, AccountCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var code = base.getUrlParam("code") || '';
    var coin = base.getUrlParam("coin"); // 币种
    var status = '1';
    let payType = {};
    var mid = 0,
        jdLeft = 0,
        selOnlyCert = 0;
    var pay = '';
    var midBlv = 0;
    var isKup = true;
    init();

    function init() {
        if(langType == 'EN'){
            $('.en_fbgg').html('Release <span class="bb-name"></span> trading advertisement');
        }else{
            $('.en_fbgg').html('发布<span class="bb-name"></span>交易广告')
        }
        $(".head-nav-wrap .sell").addClass("active");
        // let index = 0;
        // if (coin == 'ETH') {
        //     index = 1;
        //     selTradeCoin = 'ETH';
        // }
        // $('.fb-ul li').eq(index).addClass('fb-sel').siblings('li').removeClass('fb-sel');
        base.showLoadingSpin();
        if (code != "") {
            $("#draftBtn").addClass("hidden")
        }

        //根据config配置设置 币种列表
        function getCoinList() {
            var coinList = base.getCoinList();
            var coinListKey = Object.values(coinList);
            var listHtml = '';
            for (var i = 0; i < coinListKey.length; i++) {
                var tmpl = coinListKey[i]
                listHtml += `<li class="${tmpl.coin}" data-coin="${tmpl.coin.toLowerCase()}">${tmpl.coin}</li>`;
            }
            $(".fb-ul").html(listHtml);
            if (coin) {
                $('.' + coin).addClass('fb-sel');
            } else {
                $(".fb-ul li:nth-of-type(1)").addClass("fb-sel");
                coin = coinListKey[0].coin.toUpperCase();
            }
            $('.bb-name').text(coin);
        }

        //币种下拉
        getCoinList();
        $("#coin").text(coin.toUpperCase())
        $("#tradeCoin").val(coin.toUpperCase())

        // if (coin && base.getCoinType($('.fb-sel').text()) == "1") {
        //     mid = ''
        //     
        //     $(".premiumRateExp-wrap").addClass("hidden");
        // }
        $("#price").attr("disabled", true);
        // if (code != "") {
        //     getAdvertiseDetail(); // 测试
        // }
        // getAdvertisePrice().then(data => {
        //         mid = data.mid;
        //         if(coin != 'X'){
        //             $('#price').val(mid);
        //         }else{}
        //     }) // 测试
        $.when(
            GeneralCtr.getSysConfig("trade_remind"),
            GeneralCtr.getDictList({ "parentKey": "trade_time_out" }),
            getAdvertisePrice(),
            GeneralCtr.getDictList({ "parentKey": "pay_type" }),
            getExplain('sell'),
            getAccount(coin.toUpperCase())
        ).then((data1, data2, data3, data4) => {
            //说明
            $("#tradeWarn").html(data1.cvalue.replace(/\n/g, '<br>'));

            //付款时限
            var html = '';
            data2.reverse().forEach((item) => {
                html += `<option value="${item.dvalue}">${item.dvalue}</option>`
            });
            $("#payLimit").html(html);

            // 支付方式
            let payHtml = '';
            data4.forEach(item => {
                payType[item.dkey] = item.dvalue;
                payHtml += `<option value="${item.dkey}">${item.dvalue}</option>`
            })
            $('#payType').html(payHtml);

            //价格
            $("#price").attr("data-coin", coin.toUpperCase());

            if (code == ""){
                $("#price").val(data3.mid);
                mid = data3.mid;
            }

            if (code != "") {
                getAdvertiseDetail(); // 正式
            } else {
                base.hideLoadingSpin()
            }
        }, base.hideLoadingSpin)

        // 高级设置-开放时间
        var htmlStart = '<option value="24">'+base.getText('关闭', langType)+'</option>';
        var htmlEnd = '<option value="24">'+base.getText('关闭', langType)+'</option>';

        for (var i = 0; i <= 23; i++) {
            if (i < 10) {
                htmlStart += `<option value="${i}">0${i}:00</option>`
            } else {
                htmlStart += `<option value="${i}">${i}:00</option>`
            }
        }

        for (var i = 1; i <= 23; i++) {
            if (i < 10) {
                htmlEnd += `<option value="${i}">0${i}:00</option>`
            } else {
                htmlEnd += `<option value="${i}">${i}:00</option>`
            }
        }
        htmlEnd += `<option value="24">23:59</option>`
        $(".selectWrap select.startTime").html(htmlStart)
        $(".selectWrap select.endTime").html(htmlEnd);

        addListener();
    }

    function getAdvertisePrice(setCoin, m_type) {
        let wantCoin = setCoin || coin;
        return TradeCtr.getAdvertisePrice(wantCoin, m_type);
        // if (base.getCoinType(coin.toUpperCase()) == '0') {
        //     // return TradeCtr.getAdvertisePrice(coin.toUpperCase());
        // } else {
        //     return '-';
        // }

    }

    //根据config配置设置 币种列表
    // function getCoinList() {
    //     var coinList = base.getCoinList();
    //     var coinListKey = Object.keys(coinList);
    //     var listHtml = '';

    //     for (var i = 0; i < coinListKey.length; i++) {
    //         // console.log(coinList[coinListKey[i]])
    //         var tmpl = coinList[coinListKey[i]]
    //         listHtml += `<option value="${tmpl.coin}">${tmpl.name}(${tmpl.coin})</option>`;
    //     }
    //     $("#tradeCoin").html(listHtml);
    // }

    //我的账户
    function getAccount(currency) {
        return AccountCtr.getAccount().then((data) => {
            // if (data.accountList) {
            //     data.accountList.forEach(function(item) {
            //         if (item.currency == currency) {
            //             $(".accountLeftCountString").attr('data-amount', base.formatMoneySubtract(item.amountString, item.frozenAmountString, currency));
            //         }
            //     })
            // }
            data.forEach(function(item) {
                if (item.currency == currency) {
                    $(".accountLeftCountString").attr('data-amount', base.formatMoneySubtract(`${item.amount}`, `${item.frozenAmount}`, currency));
                }
            })

            $(".accountLeftCountString").text($(".accountLeftCountString").attr('data-amount'))
        }, base.hideLoadingSpin)
    }

    //获取广告详情
    function getAdvertiseDetail() {
        return TradeCtr.getAdvertiseDetail(code).then((data) => {
            pay = data.tradeCurrency
            if(pay == 'CNY'){
                $('.m-type').text('CNY');
            }else{
                $('.m-type').text('USD');
            }
            status = data.status;
            data.premiumRate = data.premiumRate * 10;
            let premiumRate = (Math.floor(data.premiumRate * 1000) / 100).toFixed(2);
            data.minTrade = data.minTrade;
            data.maxTrade = (Math.floor(parseInt(data.maxTrade) * 100) / 100).toFixed(2);
            mid = data.marketPrice;
            var tradeCoin = data.tradeCoin ? data.tradeCoin : 'ETH';
            data.totalCount = base.formatMoney(data.totalCountString, '', tradeCoin)
            // 进度条初始化
            $('.yj-num').val(premiumRate);
            let parWidth = $('.num-huadtiao').width();
            let xLeft = (parWidth * data.premiumRate) / 30;
            jdLeft = parseInt($('.num-go').css('left')) - 50 - xLeft;
            $('.num-go').css({
                left: (50 + xLeft) + '%'
            })
            //广告类型
            if (data.tradeType == '1') {
                $(".trade-type .item").eq(0).addClass("on").siblings('.item').removeClass("on").addClass("hidden")
            } else {
                $(".trade-type .item").eq(1).addClass("on").siblings('.item').removeClass("on").addClass("hidden")
            }
            // $(".trade-type .item.on .icon-check").click();

            $("#form-wrapper").setForm(data);

            //币种
            $("#tradeCoin").val(data.tradeCoin).attr("disabled", true);

            //账户余额
            $("#coin").text($("#tradeCoin").val())
            $("#price").attr("data-coin", $("#tradeCoin").val());
            $("#price").val((Math.floor(data.truePrice * 100) / 100).toFixed(2));
            //正式
            //账户余额
            $(".accountLeftCountString").text($(".accountLeftCountString").attr('data-amount'))

            //是否仅粉丝
            if (data.onlyTrust == '1') {
                $("#onlyTrust").addClass("on")
            } else {
                $("#onlyTrust").removeClass("on")
            }

            //开放时间
            if (data.displayTime.length && data.displayTime.length > 0) { //自定义
                $(".time-type .item").eq(1).addClass("on").siblings(".item").removeClass("on");
                $("#timeWrap").removeClass("hide")

                $("#timeWrap .time-item:nth-of-type(1) .startTime").val(data.displayTime[0].startTime);
                $("#timeWrap .time-item:nth-of-type(1) .endTime").val(data.displayTime[0].endTime)
                $("#timeWrap .time-item:nth-of-type(2) .startTime").val(data.displayTime[1].startTime);
                $("#timeWrap .time-item:nth-of-type(2) .endTime").val(data.displayTime[1].endTime)
                $("#timeWrap .time-item:nth-of-type(3) .startTime").val(data.displayTime[2].startTime);
                $("#timeWrap .time-item:nth-of-type(3) .endTime").val(data.displayTime[2].endTime)
                $("#timeWrap .time-item:nth-of-type(4) .startTime").val(data.displayTime[3].startTime);
                $("#timeWrap .time-item:nth-of-type(4) .endTime").val(data.displayTime[3].endTime)
                $("#timeWrap .time-item:nth-of-type(5) .startTime").val(data.displayTime[4].startTime);
                $("#timeWrap .time-item:nth-of-type(5) .endTime").val(data.displayTime[4].endTime)
                $("#timeWrap .time-item:nth-of-type(6) .startTime").val(data.displayTime[5].startTime);
                $("#timeWrap .time-item:nth-of-type(6) .endTime").val(data.displayTime[5].endTime)
                $("#timeWrap .time-item:nth-of-type(7) .startTime").val(data.displayTime[6].startTime);
                $("#timeWrap .time-item:nth-of-type(7) .endTime").val(data.displayTime[6].endTime)

            } else { // 任何时候
                $(".time-type .item").eq(0).addClass("on").siblings(".item").removeClass("on");
                $("#timeWrap").addClass("hide")
            }

            if (data.status == "1") {
                $("#doDownBtn").removeClass("hidden")
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    //获取广告说明 type = buy ,sell
    function getExplain(type) {
        var param = ''
        if (type == 'buy') {
            param = 'buy_ads_hint'
        } else if (type == 'sell') {
            param = 'sell_ads_hint'
        }
        if(document.getElementById("form-wrapper")){
            document.getElementById("form-wrapper").reset();
        }
        $("#price").val(mid);

        return GeneralCtr.getSysConfigType(param, true).then((data) => {
            $("#displayTimeExp").html(data.displayTime)
            $("#maxTradeExp").html(data.maxTrade)
            $("#minTradeExp").html(data.minTrade)
            $("#payLimitExp").html(data.payLimit)
            $("#payTypeExp").html(data.payType)
            $("#premiumRateExp").html(data.premiumRate)
            $("#priceExp").html(data.price);

            if (type == 'buy') {
                $("#protectPriceExp").siblings('.txt').text(base.getText('最高价格', langType) + '：');
                $("#protectPrice").attr('placeholder', base.getText('广告最高可成交的价格', langType));
                $("#totalCountExp").siblings('.txt').text(base.getText('购买总量', langType) + '：');
                $("#totalCount").attr('placeholder', base.getText('请输请入购买币的总量', langType));
            } else if (type == 'sell') {
                $("#protectPriceExp").siblings('.txt').text(base.getText('最低价格', langType) + '：')
                $("#protectPrice").attr('placeholder', base.getText('广告最低可成交的价格', langType));
                $("#totalCountExp").siblings('.txt').text(base.getText('出售总量', langType) + '：');
                $("#totalCount").attr('placeholder', base.getText('请输入售卖币的总量', langType));
            }

            $("#protectPriceExp").html(data.protectPrice);
            $("#totalCountExp").html(data.totalCount);
            $("#trustExp").html(data.trust);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function addListener() {

        //選擇切換-点击
        $(".trade-type .icon-check").click(function() {
            var _this = $(this);
            base.showLoadingSpin();
            //在线出售
            if (_this.parent(".item").index() == '0') {
                $(".accountCount").removeClass("hidden")
                getExplain('sell')
                    //在线购买
            } else if (_this.parent(".item").index() == '1') {
                $(".accountCount").addClass("hidden")
                getExplain('buy');
                $('.num-go').css('left', '50%');
                $('.yj-num').val('0.00');
            }
            _this.parent(".item").addClass("on").siblings(".item").removeClass("on");
        })

        //受信任-点击
        $("#onlyTrust").click(function() {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
            } else {
                $(this).addClass("on");
            }
        })

        //開放時間選擇-点击
        $(".time-type .icon-check").click(function() {
            var _this = $(this)
            _this.parent(".item").addClass("on").siblings(".item").removeClass("on")
            if (_this.parent(".item").hasClass("all")) {
                $("#timeWrap").addClass("hide")
            } else {
                $("#timeWrap").removeClass("hide")
            }
        })

        //显示高级设置 - 点击
        $(".advertise-hidden").click(function() {
            var _this = $(this)
            if (_this.hasClass("hide")) {
                $(".advertise-set .set-wrap").removeClass("hidden")
                _this.removeClass("hide")
                _this.text(base.getText('隐藏高级设置', langType) + "...")
            } else {
                $(".advertise-set .set-wrap").addClass("hidden")
                _this.text(base.getText('显示高级设置', langType) + "...")
                _this.addClass("hide")
            }
        })

        //切换广告类型
        $('.fb-ul').click((e) => {
            let target = e.target;
            if (target.tagName == 'LI') {
                base.gohrefReplace("../trade/advertise.html?mod=gg&coin=" + $(target).attr("data-coin").toUpperCase())
            }
        })


        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                "truePrice": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "premiumRate": {
                    required: true,
                    number: true,
                    tofixed2: true,
                    range: [-99.99, 99.99]
                },
                "protectPrice": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "minTrade": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "maxTrade": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "totalCount": {
                    required: true,
                    number: true,
                    amountEth: true
                },
                "payType": {
                    required: true,
                },
                "payLimit": {
                    required: true,
                },
                "leaveMessage": {
                    required: true,
                },
            },
            onkeyup: false
        })

        $('.yj-num').keyup(function(){//(parWidth * data.premiumRate) / 100;
            let leftValue = parseFloat($(".yj-num").val());
            if($(".yj-num").val() != '-' && $(".yj-num").val().length == 1){
                if(isNaN(leftValue)){
                    base.showMsg(base.getText('请输入数字', langType));
                }
                return;
            }
            if($(".yj-num").val() == ''){
                $(".yj-num").val('0');
                leftValue = 0;
            }
            if(leftValue > 50){
                $(".yj-num").val('50');
                leftValue = 50;
            }
            if(leftValue < -50){
                $(".yj-num").val('-50');
                leftValue = -50;
            }
            let parWidth = $('.num-huadtiao').width();
            jdLeft = (parWidth * leftValue) / 100;
            isKup = false;
            let jdValue = (mid + mid * leftValue / 100).toFixed(2);
            let ccWidth = 50 / $('.num-huadtiao').width();
            $("#price").val(jdValue);
            $('.num-go').css({
                left: (50 + leftValue - ccWidth) + '%'
            });
        })

        //发布
        $("#submitBtn").click(function() {
            if (!base.isLogin()) {
                base.goLogin();
                return;
            }
            if (_formWrapper.valid()) {
                var publishType = '0'; // 0
                //草稿发布
                if (code != "" && status != '1') {
                    publishType = '2';
                    //编辑发布，原广告下
                } else if (code && status == '1') {
                    publishType = '3';
                    //直接发布
                } else {
                    publishType = '1';
                }
                doSubmit(publishType);
            }
        })

        //保存草稿
        $("#draftBtn").click(function() {
            if (!base.isLogin()) {
                base.goLogin();
                return;
            }
            if (_formWrapper.valid()) {
                var publishType = '0';
                doSubmit(publishType);
            }
        })

        //发布/保存草稿
        function doSubmit(publishType) {
            var params = _formWrapper.serializeObject();

            if (code != "") {
                params.adsCode = code;
            }

            // 是否实名
            params.onlyCert = selOnlyCert;

            params.premiumRate = params.premiumRate / 100;
            //广告类型 0=买币，1=卖币
            params.tradeType = $(".trade-type .item.on").index() == '0' ? '1' : '0';
            params.onlyTrust = $("#onlyTrust").hasClass("on") ? '1' : '0';
            // params.tradeCoin = $("#tradeCoin").val();
            params.publishType = publishType;

            if (base.getCoinType(params.tradeCoin) == '1') {
                params.protectPrice = params.truePrice;
            } else {
                params.truePrice = '0';
            }

            // 总价
            params.payLimit = 12;
            params.premiumRate = parseFloat($('.yj-num').val()) / 100;
            params.tradeCoin = coin;
            params.minTrade = params.minTrade;

            params.totalCount = base.formatMoneyParse(params.totalCount, '', params.tradeCoin);
            if ($(".time-type .item.on").index() == "1") {
                params.displayTime = [{
                    week: '1',
                    startTime: $("#timeWrap .time-item:nth-of-type(1) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(1) .endTime").val()
                }, {
                    week: '2',
                    startTime: $("#timeWrap .time-item:nth-of-type(2) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(2) .endTime").val()
                }, {
                    week: '3',
                    startTime: $("#timeWrap .time-item:nth-of-type(3) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(3) .endTime").val()
                }, {
                    week: '4',
                    startTime: $("#timeWrap .time-item:nth-of-type(4) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(4) .endTime").val()
                }, {
                    week: '5',
                    startTime: $("#timeWrap .time-item:nth-of-type(5) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(5) .endTime").val()
                }, {
                    week: '6',
                    startTime: $("#timeWrap .time-item:nth-of-type(6) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(6) .endTime").val()
                }, {
                    week: '7',
                    startTime: $("#timeWrap .time-item:nth-of-type(7) .startTime").val(),
                    endTime: $("#timeWrap .time-item:nth-of-type(7) .endTime").val()
                }]
            }
            base.showLoadingSpin()
            return TradeCtr.submitAdvertise(params).then(() => {
                base.showMsg(base.getText('操作成功', langType));
                base.showLoadingSpin();
                setTimeout(() => {
                    if (params.tradeType == '0') {
                        base.gohref('../trade/sell-list.html?coin=' + coin + '&mod=cs');
                    } else {
                        base.gohref('../trade/buy-list.html?coin=' + coin + '&mod=gm');
                    }
                    base.hideLoadingSpin()
                }, 1000)
            }, base.hideLoadingSpin)

        }

        //下架
        $("#doDownBtn").on("click", function() {
            if (!base.isLogin()) {
                base.goLogin();
                return;
            }
            base.confirm(base.getText('确认下架此广告？', langType), base.getText('取消', langType), base.getText('确认', langType)).then(() => {
                base.showLoadingSpin()
                TradeCtr.downAdvertise(code).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功', langType));
                    setTimeout(function() {
                        history.go(-1)
                    }, 1500)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })


        // 选择实名
        // $('.check-wrap').on("click", function(e) {
        //     let target = e.target,
        //         reg = /userDefined|usersel/g;
        //     if (reg.test($(target).attr('class'))) {
        //         $(target).parent('.item').addClass('on').siblings().removeClass('on');
        //         selOnlyCert = $(target).attr('data-type');
        //     }
        // })

        // 进度条实现
        let i = 0,
            goX = 0,
            goLeft = '';
        $('.num-go').mousedown(function(e) {
            if (i == 0) {
                goX = e.pageX - jdLeft;
                goLeft = parseInt($(this).css('left')) - jdLeft;
            }
            i++;
            let parWidth = $('.num-huadtiao').width();
            let left = (goLeft / parWidth).toFixed(1) * 100;
            $('.go-box').mousemove(e => {
                let mlen = (((e.pageX - goX) / parWidth) * 100).toFixed(2);
                if (mlen >= 50) {
                    mlen = 50;
                }
                if (mlen <= -50) {
                    mlen = -50;
                }
                $('.num-go').css({
                    left: (left + Number(mlen)) + '%'
                })
                $('.yj-num').val(mlen);
                //溢价
                if ($(".yj-num").val() == '0' || !$(".yj-num").val()) {
                    $("#price").val(mid);
                } else {
                    $("#price").val((mid + mid * ($(".yj-num").val() / 100)).toFixed(2));
                }
            }).mouseup(() => {
                $('.go-box').unbind('mousemove');
            })
        })

        // 金钱选择

        function advertiseData(mType) {
            var m_type = mType;
            let protectPrice = $('#protectPrice').val() || 0;
            let minTrade = $('#minTrade').val() || 0;
            let maxTrade = $('#maxTrade').val() || 0;
            getAdvertisePrice(coin, m_type).then(data => {
                mid = data.mid;
                let bblv = midBlv / mid;
                $("#price").val(mid);
                if(bblv < 0){
                    $('#protectPrice').val((bblv * parseFloat(protectPrice)).toFixed(2));
                    $('#minTrade').val((bblv * parseFloat(minTrade)).toFixed(2));
                    $('#maxTrade').val((bblv * parseFloat(maxTrade)).toFixed(2));
                }else{
                    $('#protectPrice').val((parseFloat(protectPrice) / bblv).toFixed(2));
                    $('#minTrade').val((parseFloat(minTrade) / bblv).toFixed(2));
                    $('#maxTrade').val((parseFloat(maxTrade) / bblv).toFixed(2));
                }
            });
        }

        $('#tradeCurrency').change(function() {
            midBlv = $('#price').val() || 0;
            let receiveType = $(this).find("option:selected").val();
            switch (receiveType) {
                case 'CNY':
                    $('.m-type').text('CNY');
                    advertiseData('CNY');
                    break;
                case 'USD':
                    $('.m-type').text('USD');
                    advertiseData('USD');
                    break;
            }
        })

        base.hideLoadingSpin();
    }

    //交易币种 change
    // function tradeCoinChange(type) {
    //     if (type == '0') {
    //         return $.when(
    //             TradeCtr.getAdvertisePrice($("#tradeCoin").val()),
    //             getAccount($("#tradeCoin").val())
    //         ).then()
    //     } else if (type == '1') {
    //         return $.when(
    //             getAccount($("#tradeCoin").val())
    //         ).then()
    //     }

    // }

});