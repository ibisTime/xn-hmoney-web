define([
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'swiper',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/util/ajax',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Handlebars, Swiper, GeneralCtr, UserCtr, Ajax, Top, Foo) {

    let adverData = []; // 广告数据
    let aarketData = []; // 行情数据
    let typeList = {
        '0': '出售',
        '1': '购买'
    }
    let payType = {};

    init();

    // 初始化页面
    function init() {
        base.showLoadingSpin();
        $.when(
            getBanner(),
            GeneralCtr.getDictList({ "parentKey": "pay_type" })
        ).then((data,data1) => {
            data1.forEach(function(item) {
                payType[item.dkey] = item.dvalue;
            })
            base.hideLoadingSpin()
        }, base.hideLoadingSpin)
        $(".head-nav-wrap .index").addClass("active");
        if(base.isLogin()){
            UserCtr.getUser(true).then((item) => {
                base.hideLoadingSpin();
                if (!item.mobile){
                    setTimeout(() => {
                        base.showMsg('请绑定手机号');
                        setTimeout(() => {
                            base.gohrefReplace("../user/setPhone.html");
                        }, 2000)
                    }, 500);
                }
            })
        }

        addListener();
        getAdvertising().then(data => {
            adverData = data.list;
            adverData.length = 4;
            let adverHtml = '';
            adverData.forEach(item => {
                let payImage = '';
                switch (item.payType) {
                    case '0':
                        payImage = '/static/images/zfb.png';
                        break;
                    case '1':
                        payImage = '/static/images/wxpay.png';
                        break;
                    case '2':
                        payImage = '/static/images/yhk.png';
                        break;
                }
                let mButHtml = '';
                mButHtml = `<button class="goHref" data-href="${item.tradeType == 0 ? '../trade/sell-list.html?coin=' + item.tradeCoin : '../trade/buy-list.html?coin=' + item.tradeCoin}">${typeList[item.tradeType]}</button>`
                adverHtml += `<li>
                    <div class="bb-img">
                        <img src="${item.tradeType == 1 ? '/static/images/buy.png' : '/static/images/sell.png'}" alt="">
                    </div>
                    <h5>${typeList[item.tradeType]} ${item.tradeCoin}</h5>
                    <p>价格：<span>${(Math.floor(item.truePrice * 1000)/1000).toFixed(3)}</span>  ${item.tradeCurrency}</p>
                    <p>交易限额：<span>${item.minTrade}</span> ～ <span>${item.maxTrade}</span>  ${item.tradeCurrency}</p>
                    <p>付款方式：<span><img src="${payImage}" alt=""></span></p>
                    <div class="btn-box">
                        ${mButHtml}
                    </div>
                </li>`
            })
            $('.bb-jy ul').html(adverHtml);
        });
        getBazaarData().then(data => {
            let bzfList = [];
            aarketData = data.list;
            aarketData.forEach(item => {
                let exchangeRate = item.exchangeRate;
                bzfList.push(`${exchangeRate < 0 ? '-' : '+'}` + exchangeRate * 100);
            })
            aarketData.length = 2;
            let aarketHtml = '';
            aarketData.forEach((item, index) => {
                aarketHtml += `<li class="toHref" style="cursor: pointer;" data-href="../bbdeal/bbdeal.html" data-sym="${item.toSymbol}">
                    <p><span>${item.symbol}</span> / <span>${item.toSymbol}</span></p>
                    <h5>${(Math.floor(item.price * 10000) / 10000).toFixed(4)}</h5>
                    <p><span class="zj"></span><span class="zf">${bzfList[index]}</span>% <span class="zf-img"><img src=${bzfList[index].indexOf('-') == 0 ? '/static/images/xj.png' : '/static/images/ss.png'} alt=""></span></p>
                </li>`
            })
            $('.bb-hq_r ul').html(aarketHtml);
            $('.bb-hq_r li').click(function(){
                let href = $(this).attr('data-href');
                let sym = $(this).attr('data-sym');
                let setBazDeal = {
                    symbol: 'FMVP',
                    toSymbol: 'BTC',
                    unit: base.getCoinUnit('FMVP'),
                    toUnit: base.getCoinUnit('BTC')
                }
                if(sym == 'ETH'){
                    setBazDeal.toSymbol = 'ETH';
                    setBazDeal.toUnit = base.getCoinUnit('ETH');
                }
                sessionStorage.setItem('setBazDeal', JSON.stringify(setBazDeal));
                base.gohref(href);
            })
        })
    }

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
            type: '2',
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

    // 市场（交易对）
    function getBazaarData() {
        return Ajax.post("650100", {
            start: '1',
            limit: '10'
        }, true);
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