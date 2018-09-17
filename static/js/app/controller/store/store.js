define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    init();

    function init() {
        base.showLoadingSpin();
        $('.head-nav-wrap .store').addClass('active');
        addLister();
        base.hideLoadingSpin();
    }

    function addLister() {
        $('.store-left li').off('click').click(function() {
            $(this).addClass('sel-store').siblings().removeClass('sel-store');
            if ($(this).attr('class') == 'sel-store') {
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
        })
    }
})