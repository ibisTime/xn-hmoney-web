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
        // getSysConfig();   // 测试
        base.hideLoadingSpin(); // 测试
        addListener();

    }

    function getSysConfig() {
        return GeneralCtr.getSysConfig("reg_protocol").then((data) => {
            $("#content").html(data.cvalue);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    // 注册
    function register(params, type) {
        console.log(params);
        if (type == 'mobile') {
            return UserCtr.register(params).then((data) => {
                base.hideLoadingSpin()
                base.showMsg("注册成功");
                let loginParams = {
                    loginName: params.mobile,
                    loginPwd :params.loginPwd
                };
                console.log(loginParams);
                UserCtr.login(loginParams).then((data) => {
                    base.setSessionUser(data);
                    UserCtr.getUser(true).then((item) => {
                        sessionStorage.setItem("nickname", item.nickname);
                        sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
                        sessionStorage.setItem("mobile", item.mobile);
                        sessionStorage.setItem("inviteCode", item.userId);
                        base.hideLoadingSpin();
                        base.showMsg("登录成功")
                        setTimeout(function() {
                            base.goReturn()
                        }, 800)
                    })
                })
            }, base.hideLoadingSpin)
        } else {
            return UserCtr.emailRegister(params).then(() => {
                base.hideLoadingSpin();
                base.showMsg("注册成功");
                let loginParams = {
                    loginName: params.email,
                    loginPwd :params.loginPwd
                };
                UserCtr.login(loginParams).then((data) => {
                    base.setSessionUser(data);
                    UserCtr.getUser(true).then((item) => {
                        sessionStorage.setItem("nickname", item.nickname);
                        sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
                        sessionStorage.setItem("mobile", item.mobile);
                        sessionStorage.setItem("inviteCode", item.userId);
                        base.hideLoadingSpin()
                        base.showMsg("登录成功")
                        setTimeout(function() {
                            base.goReturn()
                        }, 800)
                    })
                })
            }, base.hideLoadingSpin)
        }
    }
    //获取邮箱验证码
    function emailYzm(config) {

        return UserCtr.emailYzm(config).then((data) => {
            console.log(data);
        });
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
                "smsCaptcha": {
                    required: true,
                    sms: true
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
                    register(params, 'mobile');
                }
            }
        })

        // 邮箱验证
        $("#subBtn1").click(function() {
            if (!$(this).hasClass("am-button-disabled")) {
                if (_registerForm1.valid()) {
                    base.showLoadingSpin()
                    var params = _registerForm1.serializeObject();
                    var params1 = {
                        loginPwd: params.loginPwd1,
                        nickname: params.nickname1,
                        email: params.email,
                        captcha: params.captcha
                    };
                    inviteCode != "" && inviteCode ? params1.inviteCode = inviteCode : '';
                    register(params1, 'email');
                }
            }
        })

        function gcGetYzm() {
            var i = 60;
            $('#getVerification1').css({
                color: '#ccc',
                'background-color': '#fff'
            });
            $('#getVerification1').prop("disabled", true)
            var timer = window.setInterval(() => {
                if (i > 0 && $('#getVerification1').prop("disabled")) {
                    $('#getVerification1').text("重新发送(" + i-- + "s)");
                } else {
                    $('#getVerification1').text("获取验证码").prop("disabled", false);
                    $('#getVerification1').css({
                        color: '#d53d3d'
                    });
                    clearInterval(timer);
                }
            }, 1000);
        }

        //邮箱注册
        $('#getVerification1').off('click').click(function() {
            let reg = /^[a-z0-9._%-]+@([a-z0-9-]+\.)+[a-z]{2,4}$/;
            if ($('#email').val().match(reg)) {
                emailYzm({
                    bizType: '805043',
                    email: $('#email').val()
                }).then(data => {
                    gcGetYzm();
                });
            }
            return false;
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