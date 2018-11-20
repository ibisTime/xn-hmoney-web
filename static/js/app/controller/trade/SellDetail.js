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
    let langType = localStorage.getItem('langType') || 'ZH';
    var code = base.getUrlParam("code");
    var isDetail = !!base.getUrlParam("isD"); //是否我的广告查看详情
    var userId = '';
    var nickname = '';
    var bizTypeList = {
        "0": base.getText('支付宝', langType),
        "1": base.getText('微信', langType),
        "2": base.getText('银行卡转账', langType)
    };

    var config = {
        adsCode: code,
        tradePrice: 0
    }

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
        base.showLoadingSpin();
        setHtml();

        if (!isDetail) {
            $(".buy-wrap").removeClass("hidden")
        }
        $.when(
            GeneralCtr.getSysConfig("trade_remind")  // 测试
        ).then((data) => {
            $("#tradeWarn").html(data.cvalue.replace(/\n/g, '<br>'))
            getAdvertiseDetail()   // 正式
        }, base.hideLoadingSpin)
        addListener();

    }
    function setHtml() {
        $('title').text(base.getText('出售详情') + '-' +base.getText('FUNMVP区块链技术应用实验平台'));
        $('.en-buy_jy').text(base.getText('交易次数', langType));
        $('.en-buy_xr').text(base.getText('信任人数', langType));
        $('.en-buy_hp').text(base.getText('好评率', langType));
        $('.en-buy_ls').text(base.getText('历史成交', langType));
        $('.sp-lx').text(base.getText('联系对方', langType));
        $('.en-buy_bj').text(base.getText('报价', langType) + ':');
        $('.en-buy_xe').text(base.getText('交易限额', langType) + ':');
        $('.en-buy_sl').text(base.getText('交易数量', langType) + ':');
        $('.en-buy_fk').text(base.getText('付款方式', langType) + ':');
        $('.en-buy_fkqx').text(base.getText('付款期限', langType) + ':');
        $('.en-sell_mjly').text(base.getText('买家留言', langType) + ':');
        $('.en-buy_csds').text(base.getText('你想出售多少', langType) + '?');
        $('.en-buy_kyyy span').text(base.getText('账户可用余额', langType) + ':' + '');
        $('.en-buy_fz').text(base.getText('分钟', langType));
        $('.en-buy_tx').text(base.getText('交易提醒', langType));
        $('.warnWrap .warn-txt1').html(base.getText('提醒：请确认价格再下单,下单彼此交易的'));
        $('.warnWrap .warn-txt2').html(base.getText('将被托管锁定，请放心购买。'));
    }
    //获取详情
    function getAdvertiseDetail() {
        return TradeCtr.getAdvertiseDetail(code).then((data) => {
            userId = data.user.userId;
            nickname = data.user.nickname;
            var user = data.user;
            userName = user.nickname;
            tradeCoin = data.tradeCoin ? data.tradeCoin : 'ETH';
            let totalCountString = base.formatMoney(data.totalCountString, '', tradeCoin);
            if (user.photo) {
                tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin=' + tradeCoin + '&userId=' + user.userId + '"  style="background-image:url(\'' + base.getAvatar(user.photo) + '\')"></div>'
            } else {
                var tmpl = user.nickname ? user.nickname.substring(0, 1).toUpperCase(): '-';
                tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin=' + tradeCoin + '&userId=' + user.userId + '" ><div class="noPhoto">' + tmpl + '</div></div>'
            }

            if (data.user.photo) {
                $("#photo").css({ "background-image": "url('" + base.getAvatar(data.user.photo) + "')" })
            } else {
                var tmpl = data.user.nickname ? data.user.nickname.substring(0, 1).toUpperCase(): '-';
                var photoHtml = `<div class="noPhoto">${tmpl}</div>`
                $("#photo").html(photoHtml)
            }

            config.tradePrice = Math.floor(data.truePrice * 100) / 100;
            limit = data.minTrade + '-' + data.maxTrade
            $("#nickname").html(data.user.nickname);
            if(data.user.idNo){
                $('.rz').text(base.getText('已认证', langType)).addClass('sp-yrz');
            }else{
                $('.rz').text(base.getText('未认证', langType)).addClass('sp-wrz');
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
            $("#limit").html(limit);
            $('#countString').html(totalCountString);
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
                // data.accountList.forEach(function(item) {
                //     if (item.currency == currency) {
                //         $(".accountLeftCountString").attr('data-amount', base.formatMoneySubtract(item.amountString, item.frozenAmountString, currency));
                //     }
                // })
            }

            data.forEach(function(item) {
                if (item.currency == currency) {
                    $(".accountLeftCountString").attr('data-amount', base.formatMoneySubtract(`${item.amount}`, `${item.frozenAmount}`, currency));
                }
            })

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

    //出售
    function sellETH() {
        config.tradeAmount = $("#buyAmount").val();
        config.count = base.formatMoneyParse($("#buyEth").val(), '', tradeCoin);
        config.tradePwd = $('#moneyPow').val();
        return TradeCtr.sellETH(config).then((data) => {
            base.showMsg(base.getText('下单成功', langType));
            setTimeout(function() {
                base.gohref("../order/order-list.html?mod=dd");
            }, 2000)
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)

    }

    function addListener() {

        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                'buyAmount': {
                    min: '0',
                    amountCny: true
                },
                'buyEth': {
                    min: '0',
                    amountEth: true
                },
            }
        })

        //立即下单点击
        $("#buyBtn").click(function() {
            $('.bb-m').text(tradeCoin);
            $("#submitDialog .tradeAmount").html($("#buyAmount").val() + tradeCurrency);
            $("#submitDialog .count").html($("#buyEth").val() + tradeCoin);
            if (_formWrapper.valid()) {
                // if ($("#buyAmount").val() != '' && $("#buyAmount").val()) {
                //     $("#submitDialog").removeClass("hidden")
                // } else {
                //     base.showMsg("请输入您购买的金額")
                // }
            }
            UserCtr.getUser().then((data) => {
                if (data.tradepwdFlag) {
                    if (_formWrapper.valid()) {
                        if ($("#buyAmount").val() != '' && $("#buyAmount").val()) {
                            $("#submitDialog").removeClass("hidden")
                        } else {
                            base.showMsg(base.getText('请输入您出售的金额', langType));
                        }
                    }
                } else if (!data.tradepwdFlag) {
                    base.showMsg(base.getText('请先设置交易密码', langType))
                    setTimeout(function() {
                        base.gohref("../user/setTradePwd.html?type=1&mod=dd");
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

        //交易密码-放弃点击
        $("#submitMon .closeBtn").click(function() {
            $("#submitMon").addClass("hidden");
            $('#moneyPow').val('');
        })

        //下单确认弹窗-确认点击
        $("#submitMon .subBtn").click(function() {
            if (!$('#moneyPow').val() || $('#moneyPow').val() === '') {
                base.showMsg(base.getText('请输入交易密码'));
                return false;
            }
            sellETH();
            $("#submitMon").addClass("hidden");
            $('#moneyPow').val('');
        })


        //下单确认弹窗-放弃点击
        $("#submitDialog .closeBtn").click(function() {
            $("#submitDialog").addClass("hidden");
        })

        //下单确认弹窗-确认点击
        $("#submitDialog .subBtn").click(function() {
            $("#submitDialog").addClass("hidden");
            $("#submitMon").removeClass("hidden");
        })
        $("#buyEth").keyup(function() {
            $("#buyAmount").val(($("#buyEth").val() * config.tradePrice).toFixed(2));
        })
        $("#buyAmount").keyup(function() {
                $("#buyEth").val(($("#buyAmount").val() / config.tradePrice).toFixed(8));
            })
            //下架-点击
        $("#doDownBtn").click(function() {
            base.confirm(base.getText('确认下架此广告？', langType), base.getText('取消', langType), base.getText('确定', langType)).then(() => {
                base.showLoadingSpin()
                TradeCtr.downAdvertise(code).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功', langType));
                    $("#doDownBtn").addClass("hidden");

                    setTimeout(function() {
                        base.gohref("./sell-list.html?mod=cs");
                    }, 1000)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })

        //聊天按钮点击
        $(".det-lx").click(function() {
            base.showLoadingSpin();
            // 购买开始聊天，提交交易订单
            TradeCtr.chatOrderSell(code).then((data) => {
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