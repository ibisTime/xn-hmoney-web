define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    init();

    function init() {
        if(base.isLogin()){
            gramMoney().then(data => {
                $('.yxye').text(base.formatMoney(data.balance, '', data.currency) + ' ' + data.currency);
            })
        }else{
            base.goLogin();
        }
        let stoType = base.getUrlParam('type');
        if(stoType == 'rs'){
            $('.rs-li').addClass('sel-store').siblings().removeClass('sel-store');
            $('.qk-box').addClass('none');
            $('.er-box').removeClass('none');
        }
        base.showLoadingSpin();
        $('.head-nav-wrap .store').addClass('active');
        addLister();
        base.hideLoadingSpin();
    }

    // 进入游戏
    function gramUrl(){
        return Ajax.post('600101');
    }

    // 游戏余额
    function gramMoney(){
        return Ajax.post('600104');
    }

    function addLister() {
        $('.store-left li').off('click').click(function() {
            $(this).addClass('sel-store').siblings().removeClass('sel-store');
            if ($(this).hasClass('sel-store')) {
                let index = $(this).index() - 1;
                $('.store-right>div').eq(index).removeClass('none').siblings().addClass('none');
            }
        })

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

        $('.str-h_r').click(function(){
            gramUrl().then(data => {
                location.href = `${data.gameUrl}?userId=${data.userId}&phone=${data.phone}&hashID=${data.hashID}&sign=${data.sign}`;
            })
        })
    }
})