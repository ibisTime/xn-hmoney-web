define([
    'app/controller/base',
    'app/interface/StoreCtr',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, StoreCtr, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let config = {
        userId: '',
        count: 0
        // tradePwd: ''
    }
    init();

    function init() {
        $('.store_en').text(base.getText('商城', langType));
        $('.store_gm').text(base.getText('区块链游戏', langType));
        $('.zb-btn').text(base.getText('转入游戏', langType));
        $('.go_en').text(base.getText('进入游戏', langType));
        $('.store_car').text(base.getText('二手车兑换', langType));
        $('.store-right').removeClass('none');
        if(langType == 'EN'){
            $('title').text('Store-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('商城-FUNMVP区块链技术应用实验平台');
        let stoType = base.getUrlParam('type') || 'yx';
        if(stoType == 'rs'){
            $('.rs-li').addClass('sel-store').siblings().removeClass('sel-store');
            $('.qk-box').addClass('none');
            $('.er-box').removeClass('none');
            base.hideLoadingSpin();
        }else{
            if(!base.isLogin()){
                base.goLogin();
                return ;
            }
            base.showLoadingSpin();
            config.userId = base.getUserId();
            $.when(
                gramMoney(),
                gramUrl()
            ).then(data => {
                base.hideLoadingSpin();
                $('.yxye').text((Math.floor(parseFloat(data.balance) * 100000000) / 100000000).toFixed(8) + data.currency);
            }, base.hideLoadingSpin);
        }
        $('.head-nav-wrap .store').addClass('active');
        addLister();
        base.hideLoadingSpin();
    }

    // 进入游戏
    function gramUrl(){
        return StoreCtr.gramUrl().then(data => {
            var url = `${data.gameUrl}?userId=${data.userId}&phone=${data.phone}&hashID=${data.hashID}&sign=${data.sign}`;
            $(".goGram").attr('href', url);
        });
    }

    // 游戏余额
    function gramMoney(){
        return StoreCtr.gramMoney().then();
    }

    function addLister() {

        //转币
        $('.zb-btn').off('click').click(function() {
            $('.str-zb').removeClass('none');
            $('html').addClass('overflow');
        })

        // 转币框
        $('.str-zb').off('click').click(function(e) {
            let target = e.target;
            if ($(target).attr('class') == 'qx' || $(target).attr('class') == 'str-zb') {
                $('.str-zb').addClass('none');
                $('html').removeClass('overflow');
            }
            if($(target).attr('class') == 'qr'){
                let count = $('#gramNum').val().trim();
                // 11/12 去掉充值交易密码
                // let tradePwd = $('#tradePwd').val().trim();
                if(count == ''){
                    base.showMsg('数量不能为空');
                    return;
                // }else if(tradePwd == ''){
                //     base.showMsg('请输入交易密码');
                //     return;
                }
                // UserCtr.getUser(true, base.getUserId()).then(res => {
                //     if (res.tradepwdFlag) {
                        config.count = base.formatMoneyParse(count, '', 'FMVP');
                        // config.tradePwd = tradePwd;
                        base.showLoadingSpin();
                        StoreCtr.rechargeGram(config).then(data => {
                            base.hideLoadingSpin();
                            if(data.code){
                                base.showMsg('充值成功');
                                setTimeout(() => {
                                    location.reload();
                                }, 1000);
                            }
                        }, () => {
                            base.hideLoadingSpin();
                            $('#gramNum').val('');
                            // $('#tradePwd').val('');
                        });
                //     } else{
                //         base.showMsg(base.getText('请先设置交易密码', langType))
                //         setTimeout(function () {
                //             base.gohref("../user/setTradePwd.html?type=1")
                //         }, 1800)
                //     }
                // });
            }
        });
    }
})