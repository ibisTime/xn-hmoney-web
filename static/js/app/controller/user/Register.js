define([
    'app/controller/base',
    'swiper',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/interface/GeneralCtr',
    'app/module/smsCaptcha',
], function(base, Swiper, Validate, UserCtr, GeneralCtr, smsCaptcha) {
    var inviteCode = base.getUrlParam("inviteCode") || "";

    if (inviteCode != "") {
        $("#userReferee-Wrap").addClass("hidden")
    }
    if (base.isLogin()) {
        base.gohref("../user/user.html")
    } else {
        init();
    }

    function init() {
        $(".head-button-wrap .button-login").removeClass("hidden");
        base.showLoadingSpin();
        getSysConfig();
        addListener();

    }

    function getSysConfig() {
        return GeneralCtr.getSysConfig("reg_protocol").then((data) => {
            $("#content").html(data.cvalue);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function register(params) {
        return UserCtr.register(params).then((data) => {
            base.hideLoadingSpin()
            base.showMsg("注册成功")
            setTimeout(function() {
                base.gohref("../user/login.html")
            }, 800)
        }, base.hideLoadingSpin)
    }

    function addListener() {
        var _registerForm = $("#register-form");
        var _registerForm1 = $("#register-form1");
        _registerForm.validate({
            'rules': {
                "nickname": {
                    required: true,
                    english: true
                },
                "mobile": {
                    required: true,
                    mobile: true
                },
                "smsCaptcha": {
                    required: true,
                    sms: true
                },
                "loginPwd": {
                    required: true,
                    minlength: 6,
                },
                "userReferee": {
                    mobile: true
                },
            },
            onkeyup: false
        });
        _registerForm1.validate({
            'rules': {
                "nickname1": {
                    required: true,
                    english: true
                },
                "email": {
                    required: true
                },
                "loginPwd1": {
                    required: true,
                    minlength: 6,
                }
            },
            onkeyup: false
        });

        $("#subBtn").click(function() {
            if (!$(this).hasClass("am-button-disabled")) {
                if (_registerForm.valid()) {
                    base.showLoadingSpin()
                    var params = _registerForm.serializeObject()
                    inviteCode != "" && inviteCode ? params.inviteCode = inviteCode : '';

                    register(params);
                }
            }
        })

        // 邮箱验证
        $("#subBtn1").click(function() {
            if (!$(this).hasClass("am-button-disabled")) {
                if (_registerForm1.valid()) {
                    base.showLoadingSpin()
                    var params = _registerForm1.serializeObject()
                    inviteCode != "" && inviteCode ? params.inviteCode = inviteCode : '';

                    register(params);
                }
            }
        })

        $("#subFlag").click(function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active")
                $("#subBtn").addClass("am-button-disabled")
            } else {
                $(this).addClass("active")
                $("#subBtn").removeClass("am-button-disabled")
            }
        })
        smsCaptcha.init({
            checkInfo: function() {
                return $("#mobile").valid();
            },
            bizType: "805041",
            id: "getVerification",
            mobile: "mobile",
            errorFn: function() {}
        });

        $('.protocol').click(function() {
            $("#registerDialog").removeClass("hidden")
        })

        //切换登录方式
        $('.sel-mod').click(function(e) {
            let target = e.target;
            if (target.tagName == 'LI') {
                $(target).addClass('sel-li_m').siblings('li').removeClass('sel-li_m');
                if ($(target).prop('class') == 'sel-phone sel-li_m') {
                    $('.phone-reg').removeClass('none').next().addClass('none');
                } else {
                    $('.eml-reg').removeClass('none').prev().addClass('none');
                }
            }
        })
    }
});