define([
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'swiper',
    'app/interface/GeneralCtr',
    'app/util/ajax'
], function(base, Handlebars, Swiper, GeneralCtr, Ajax) {

    let adverData = []; // 广告数据
    let aarketData = []; // 行情数据
    let typeList = {
        '0': '购买',
        '1': '出售'
    }
    let payType = {};

    init();

    // 初始化页面
    function init() {
        //base.showLoadingSpin();
        $.when(
            GeneralCtr.getDictList({ "parentKey": "pay_type" })
        ).then((data1) => {
            data1.forEach(function(item) {
                payType[item.dkey] = item.dvalue;
            })
            base.hideLoadingSpin()
        }, base.hideLoadingSpin)
        $(".head-nav-wrap .index").addClass("active")

        addListener();
        getAdvertising().then(data => {
            adverData = data.list;
            adverData.length = 4;
            let adverHtml = '';
            adverData.forEach(item => {
                let payImage = '';
                switch (item.payType) {
                    case '0':
                        payImage = '/static/images/支付宝.png';
                        break;
                    case '1':
                        payImage = '/static/images/wxpay.png';
                        break;
                    case '2':
                        payImage = '/static/images/银行卡.png';
                        break;
                }
                adverHtml += `<li>
                    <div class="bb-img">
                        <img src="${item.tradeType == 0 ? '/static/images/buy.png' : '/static/images/sell.png'}" alt="">
                    </div>
                    <h5>${typeList[item.tradeType]} ${item.tradeCoin}</h5>
                    <p>价格：<span>${(Math.floor(item.truePrice * 1000)/1000).toFixed(3)}</span> CNY</p>
                    <p>交易限额：<span>${item.minTrade}</span> ～ <span>${item.maxTrade}</span> CNY</p>
                    <p>付款方式：<span><img src="${payImage}" alt=""></span></p>
                    <div class="btn-box">
                        <button class="goHref" data-href="${item.tradeType == 0 ? '../trade/buy-list.html' : '../trade/sell-list.html'}">${typeList[item.tradeType]}</button>
                    </div>
                </li>`
            })
            $('.bb-jy ul').html(adverHtml);
        });
        getMarket('CNY').then(data => {
            aarketData = data;
            let aarketHtml = '';
            aarketData.forEach(item => {
                aarketHtml += `<li>
                    <p><span>X</span> / <span>${item.symbol}</span></p>
                    <h5>${item.lastPrice.toFixed(2)}</h5>
                    <p><span class="zj">+</span><span class="zf">1.52</span>% <span class="zf-img"><img src="/static/images/上升.png" alt=""></span></p>
                </li>`
            })
            $('.bb-hq_r ul').html(aarketHtml);
        })
    }

    // //安卓下载
    // function getDownloadUrl() {
    //     return GeneralCtr.getSysConfigType("android-c").then((data) => {
    //         $("#androidDown").click(() => {
    //             window.location.href = data.downloadUrl
    //         })
    //     }, base.hideLoadingSpin)
    // }

    // 初始化swiper
    function initSwiperBanner() {
        var _swiper = $("#swiper");
        if (_swiper.find('.swiper-slide').length <= 1) {
            _swiper.find('.swiper-pagination').hide();
        }
        var mySwiper = new Swiper('#swiper', {
            'autoplay': 5000,
            'pagination': '#swiper',
            'pagination': '#swiper .swiper-pagination',
            'paginationClickable': true,
            'preventClicksPropagation': true,
            'loop': true,
            'speed': 600
        });
        $('#swiper .arrow-left').on('click', function(e) {
            e.preventDefault()
            mySwiper.swipePrev()
        })
        $('#swiper .arrow-right').on('click', function(e) {
            e.preventDefault()
            mySwiper.swipeNext()
        })
    }

    // 获取banner
    function getBanner(refresh) {
        return GeneralCtr.getBanner({
            location: 'web_banner'
        }, refresh).then((data) => {
            var bannerHtml = "";
            data.forEach((d) => {
                var pics = base.getPicArr(d.pic);
                pics.forEach((pic) => {
                    bannerHtml += `<div class='swiper-slide'><div class="banner" data-url="${d.url || ""}" style="background-image:url(${pic});"></div></div>`;
                });
            });
            base.hideLoadingSpin()
            $("#swiper .swiper-wrapper").html(bannerHtml);
            initSwiperBanner();
        }, (msg) => {
            base.showMsg(msg || "加载失败");
        });
    }

    //获取广告信息
    function getAdvertising() {
        return Ajax.post('625225', {
            start: '1',
            limit: '10',
            statusList: ['1']
        })
    }

    // 获取币种行情
    function getMarket(ex_type) {
        return Ajax.post('650101', {
            referCurrency: ex_type
        });
    }

    function addListener() {

        $("#swiper").on("touchstart", ".swiper-slide div", function(e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper").on("touchend", ".swiper-slide div", function(e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if (Math.abs(xx) < 6) {
                var url = me.attr('data-url');
                if (url) {
                    if (!/^http/i.test(url)) {
                        location.href = "http://" + url;
                    } else {
                        location.href = url;
                    }
                }

            }
        });

    }
});