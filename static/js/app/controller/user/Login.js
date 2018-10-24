define([
    'app/controller/base',
    'swiper',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Swiper, Validate, UserCtr, Top, Foo) {

    if (base.isLogin()) {
        base.gohref("../user/user.html")
    } else {
        init();
    }

    function init() {
        $(".head-button-wrap .button-register").removeClass("hidden");
        initSwiperBanner();
        addListener();
        setTimeout(function() {
            base.hideLoadingSpin();
        }, 100)
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
    }

    function login(params) {
        /* sessionStorage.setItem("nickname", 'kylong');
        sessionStorage.setItem("googleAuthFlag", false);
        sessionStorage.setItem("mobile", '13516726254');
        sessionStorage.setItem("inviteCode", 'U201809031708129148742');
        sessionStorage.setItem("l-return", 'advertise.html');
        setTimeout(function() {
                base.goReturn()
            }, 800) */
        return UserCtr.login(params).then((data) => {
            base.setSessionUser(data);
            base.showMsg("登录成功");
            UserCtr.getUser(true).then((item) => {
                sessionStorage.setItem("nickname", item.nickname);
                sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
                sessionStorage.setItem("mobile", item.mobile);
                sessionStorage.setItem("inviteCode", item.userId);
                base.hideLoadingSpin();
                // if (!item.mobile){
                //     setTimeout(() => {
                //         base.showMsg('请绑定手机号');
                //         setTimeout(() => {
                //             base.gohrefReplace("../user/setPhone.html");
                //         }, 2500)
                //     }, 1500);
                // }else{
                    
                // }
                setTimeout(function() {
                    base.goReturn()
                }, 800)
            })
        }, base.hideLoadingSpin)
    }

    function addListener() {
        var _loginForm = $("#login-form");
        _loginForm.validate({
            'rules': {
                "loginName": {
                    required: true,
                    mm: true
                },
                "loginPwd": {
                    required: true
                },
            },
            onkeyup: false
        });

        $("#subBtn").click(function() {
            if (_loginForm.valid()) {
                base.showLoadingSpin()
                var params = _loginForm.serializeObject()
                login(params);
            }
        })
        $(document).keyup(function(event) {
            if (event.keyCode == 13) {
                $("#subBtn").click()
            }
        });


    }
});