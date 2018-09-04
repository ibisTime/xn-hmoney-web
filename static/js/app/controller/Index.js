define([
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'swiper',
    'app/interface/GeneralCtr'
], function(base, Handlebars, Swiper,GeneralCtr) {
	
    init();
    
    // 初始化页面
    function init() {
    	base.showLoadingSpin();
    	$.when(
    		getBanner(),
    		getDownloadUrl()
    	)
    	$(".head-nav-wrap .index").addClass("active")
    	
        addListener();
    }
    
    //安卓下载
    function getDownloadUrl(){
    	return GeneralCtr.getSysConfigType("android-c").then((data)=>{
			$("#androidDown").click(()=>{
				window.location.href= data.downloadUrl
			})
    	},base.hideLoadingSpin)
    }
    
    // 初始化swiper
    function initSwiperBanner(){
        var _swiper = $("#swiper");
        if(_swiper.find('.swiper-slide').length <= 1){
            _swiper.find('.swiper-pagination').hide();
        }
        var mySwiper = new Swiper('#swiper', {
            'autoplay': 5000,
            'pagination': '#swiper',
            'pagination' : '#swiper .swiper-pagination',
            'paginationClickable' :true,
            'preventClicksPropagation': true,
            'loop' : true,
            'speed': 600
        });
        $('#swiper .arrow-left').on('click', function(e){
			e.preventDefault()
			mySwiper.swipePrev()
		})
		$('#swiper .arrow-right').on('click', function(e){
			e.preventDefault()
			mySwiper.swipeNext()
		})
    }
    
    // 获取banner
    function getBanner(refresh){
        return GeneralCtr.getBanner({
        	location: 'web_banner'
        },refresh).then((data) => {
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
	
    function addListener() {
        
        $("#swiper").on("touchstart", ".swiper-slide div", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper").on("touchend", ".swiper-slide div", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if(Math.abs(xx) < 6){
                var url = me.attr('data-url');
                if(url){
                	if(!/^http/i.test(url)){
                		location.href = "http://"+url;
                	}else{
                		location.href = url;
                	}
                }

            }
        });
        
    }
});
