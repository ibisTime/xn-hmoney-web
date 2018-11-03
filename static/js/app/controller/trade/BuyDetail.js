define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/interface/AccountCtr',
    'app/module/tencentChat',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, GeneralCtr, UserCtr, TradeCtr, AccountCtr, TencentChat, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'zh';
    var code = base.getUrlParam("code");
    var isDetail = !!base.getUrlParam("isD"); //是否我的广告查看详情
    var userId = '';
    var nickname = '';
    var bizTypeList = {
        "0": "支付宝",
        "1": "微信",
        "2": "银行卡转账"
    };
    var config = {
        adsCode: code,
        tradePrice: 0
    };

    var tradePhoto = '';
    var tradePhotoMy = '';
    var userName = '',
        myName = '';
    var limit = '';
    var tradeCoin = 'ETH';
    let tradeCurrency = 'CNY';

    if (!base.isLogin()) {
        base.goLogin();
        return;
    }
    init();

    function init() {
        // 英文修改
        if(langType == 'en'){
            $('.b-en').addClass('none');
            $('.b-zh').removeClass('none');
        }
        base.showLoadingSpin();
        $(".head-nav-wrap .sell").addClass("active");
        if (!isDetail) {
            $(".buy-wrap").removeClass("hidden");
        }
        $.when(
            GeneralCtr.getSysConfig("trade_remind")  
        ).then((data) => {
            $("#tradeWarn").html(data.cvalue.replace(/\n/g, '<br>'))
            getAdvertiseDetail() 
        })
        addListener();

    }

    //获取详情
    function getAdvertiseDetail() {
        return TradeCtr.getAdvertiseDetail(code).then((data) => {
            userId = data.user.userId;
            nickname = data.user.nickname;
            tradeCurrency = data.tradeCurrency;
            $('.item-unit').text(tradeCurrency);
            $('#limit').next().text(tradeCurrency);
            var user = data.user;
            userName = user.nickname;
            tradeCoin = data.tradeCoin ? data.tradeCoin : 'ETH';

            if (user.photo) {
                tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin=' + tradeCoin + '&userId=' + user.userId + '"  style="background-image:url(\'' + base.getAvatar(user.photo) + '\')"></div>'
            } else {
                var tmpl = user.nickname ? user.nickname.substring(0, 1).toUpperCase() : '-';
                tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin=' + tradeCoin + '&userId=' + user.userId + '" ><div class="noPhoto">' + tmpl + '</div></div>'
            }

            if (data.user.photo) {
                $("#photo").css({ "background-image": "url('" + base.getAvatar(data.user.photo) + "')" })
            } else {
                var tmpl = data.user.nickname ? data.user.nickname.substring(0, 1).toUpperCase() : '';
                var photoHtml = `<div class="noPhoto">${tmpl}</div>`
                $("#photo").html(photoHtml)
            }
            config.tradePrice = data.truePrice;
            limit = data.minTrade + '-' + data.maxTrade

            $("#nickname").html(data.user.nickname);
            if(data.user.idNo){
                $('.rz').text('已认证').addClass('sp-yrz');
            }else{
                $('.rz').text('未认证').addClass('sp-wrz');
            }
            if (data.status == "1" && isDetail) {
                $("#doDownBtn").removeClass("hidden");
            }

            var totalTradeCount = data.user.userStatistics.totalTradeCount == '0' ? '0' : base.formatMoney(data.user.userStatistics.totalTradeCount, '0', data.tradeCoin) + '+';

            $("#jiaoYiCount").html(data.user.userStatistics.jiaoYiCount)
            $("#beiXinRenCount").html(data.user.userStatistics.beiXinRenCount)
            $("#beiHaoPingCount").html(base.getPercentum(data.user.userStatistics.beiHaoPingCount, data.user.userStatistics.beiPingJiaCount))
            $("#totalTradeCount").html(totalTradeCount + data.tradeCoin)
            $("#leaveMessage").html(data.leaveMessage.replace(/\n/g, '<br>'))
            $("#limit").html(limit)
            $("#payType").html(bizTypeList[data.payType])
            $("#payLimit").html(data.payLimit)

            $("#truePrice").html(Math.floor(data.truePrice * 100) / 100 + '&nbsp;'+ tradeCurrency +'/' + tradeCoin)
            $("#submitDialog .tradePrice").html(config.tradePrice + '&nbsp;'+ tradeCurrency +'/' + tradeCoin)
            $("#leftCountString").html(base.formatMoney(data.leftCountString, '', tradeCoin))
            $("#coin").text(tradeCoin)

            $.when(
                getAccount(data.tradeCoin),
                getUser()
            )

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    //我的账户
    function getAccount(currency) {
        return AccountCtr.getAccount().then((data) => {
            if (data.accountList) {
                data.accountList.forEach(function(item) {
                    if (item.currency == currency) {
                        $(".accountLeftCountString").attr('data-amount', base.formatMoneySubtract(item.amountString, item.frozenAmountString, currency));
                    }
                })

            }
            $(".accountLeftCountString").text($(".accountLeftCountString").attr('data-amount'))
        }, base.hideLoadingSpin)
    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {
            var myInfo = data;
            myName = myInfo.nickname;
            if (myInfo.photo) {
                tradePhotoMy = '<div class="photo" style="background-image:url(\'' + base.getAvatar(myInfo.photo) + '\')"></div>'
            } else {
                var tmpl = myInfo.nickname.substring(0, 1).toUpperCase();
                tradePhotoMy = '<div class="photo"><div class="noPhoto">' + tmpl + '</div></div>'
            }

            //聊天框加载
            TencentChat.addCont({
                tradePhoto: tradePhoto,
                tradePhotoMy: tradePhotoMy,
                userName: userName,
                myName: myName,
                truePrice: $("#truePrice").html(),
                limit: limit + ' ' + tradeCurrency,
                success: function() {
                    $("#chatBtn").removeClass("hidden")
                }
            });
        }, base.hideLoadingSpin)
    }

    //购买
    function buyETH() {
        config.tradeAmount = $("#buyAmount").val();
        config.count = base.formatMoneyParse($("#buyEth").val(), '', tradeCoin);
        // config.资金密码 = $('#moneyPow').val();
        return TradeCtr.buyETH(config).then((data) => {
                base.showMsg("购买成功")

                setTimeout(function() {
                    base.gohref("../order/order-list.html?mod=dd")
                }, 2000);
                base.hideLoadingSpin();
            }, base.hideLoadingSpin) //

    }

    function addListener() {
        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                'buyAmount': {
                    amountCny: true
                },
                'buyEth': {
                    amountEth: true
                },
            }
        })

        //立即下单点击
        $("#buyBtn").click(function() {
            $('.bb-m').text(tradeCoin);
            $("#submitDialog .tradeAmount").html($("#buyAmount").val() + tradeCurrency)
            $("#submitDialog .count").html($("#buyEth").val() + tradeCoin);
            UserCtr.getUser().then((data) => {
                if (data.tradepwdFlag) {
                    if (_formWrapper.valid()) {
                        if ($("#buyAmount").val() != '' && $("#buyAmount").val()) {
                            $("#submitDialog").removeClass("hidden")
                        } else {
                            base.showMsg("请输入您购买的金额")
                        }
                    }
                } else if (!data.tradepwdFlag) {
                    base.showMsg("请先设置资金密码")
                    setTimeout(function() {
                        base.gohref("../user/setTradePwd.html?type=1")
                    }, 1800)
                } 
                // else if (!data.realName) {
                //     base.showMsg("请先进行身份验证")
                //     setTimeout(function() {
                //         base.gohref("../user/identity.html")
                //     }, 1800)
                // }
            }, base.hideLoadingSpin);
        })

        //资金密码-放弃点击
        // $("#submitMon .closeBtn").click(function() {
        //     $("#submitMon").addClass("hidden");
        // })

        //下单确认弹窗-确认点击
        // $("#submitMon .subBtn").click(function() {
        //     $("#submitMon").addClass("hidden");
        //     $("#submitDialog").removeClass("hidden")
        // })

        //下单确认弹窗-放弃点击
        $("#submitDialog .closeBtn").click(function() {
            $("#submitDialog").addClass("hidden")
        })

        //下单确认弹窗-确认点击
        $("#submitDialog .subBtn").click(function() {
            buyETH();
            base.showLoadingSpin();
            $("#submitDialog").addClass("hidden")
        })

        $("#buyEth").keyup(function() {
            let truePrice = $("#buyEth").val() * config.tradePrice;
            $("#buyAmount").val((Math.floor(truePrice * 100) / 100).toFixed(2));

        })
        $("#buyAmount").keyup(function() {
            $("#buyEth").val(($("#buyAmount").val() / config.tradePrice).toFixed(8));
        })

        //下架-点击
        $("#doDownBtn").click(function() {
            base.confirm("确认下架此广告？", '取消', '确定').then(() => {
                base.showLoadingSpin()
                TradeCtr.downAdvertise(code).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg("操作成功");
                    $("#doDownBtn").addClass("hidden");
                    setTimeout(function() {
                        base.gohref("./buy-list.html?mod=gm");
                    }, 1000)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })

        //聊天按钮点击
        $(".det-lx").click(function() {
            base.showLoadingSpin();
            // 购买开始聊天，提交交易订单
            TradeCtr.chatOrderBuy(code).then((data) => {
                TencentChat.showCont({
                    code: data.code,
                })
            }, base.hideLoadingSpin)

        });

        // 查看评价
        $('.detail-container-wrap').on('click', '.topj', function(){
            base.gohref(`../user/user-pj.html?userId=${userId}&nickname=${nickname}`);
        })
    }
});