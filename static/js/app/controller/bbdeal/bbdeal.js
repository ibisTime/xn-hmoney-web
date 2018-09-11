define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    init();

    function init() {
        base.showLoadingSpin(); // 显示加载
        base.hideLoadingSpin(); // 隐藏加载
        addLister();
    }

    function addLister() {

        // 显示与隐藏
        $('.bb-container .bb-conRight .con-h').off('click').click(function(e) {
            let target = e.target;
            if (target.tagName == 'SPAN') {
                let dom = $(Array.from($(target).siblings())[0]);
                //let arr = Array.from(dom.parent().nextAll());
                // let tag = "";
                // for (let i, len = arr.length; i < len; i++) {
                //     if (arr[i].tagName == 'DIV') {
                //         tag = item.tagName.toLocaleLowerCase();
                //         break;
                //     }
                // }
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
    }
})