define([
    'app/controller/base',
    'app/interface/StoreCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, StoreCtr, Top, Foo) {
    init();

    function init() {
        if(!base.isLogin()){
            base.goLogin();
            return ;
        }

        let stoType = base.getUrlParam('type') || 'yx';
        if(stoType == 'rs'){
            $('.rs-li').addClass('sel-store').siblings().removeClass('sel-store');
            $('.qk-box').addClass('none');
            $('.er-box').removeClass('none');
        }
        base.showLoadingSpin();

        $.when(
            gramMoney(),
            gramUrl()
        ).then(data => {
            base.hideLoadingSpin();
            $('.yxye').text(base.formatMoney(data.balance, '', data.currency) + ' ' + data.currency);
        }, base.hideLoadingSpin)
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