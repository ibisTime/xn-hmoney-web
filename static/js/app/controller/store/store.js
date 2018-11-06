define([
    'app/controller/base',
    'app/interface/StoreCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, StoreCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    init();

    function init() {

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
        });
    }
})