define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, smsCaptcha, UserCtr, Top, Foo) {

    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .security").addClass("on")
        init();
    }

    function init() {

        base.hideLoadingSpin();
        addListener();
    }

    //修改/綁定邮箱
    function setEmail(email, smsCaptcha) {
        return UserCtr.setEmail(email, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            base.showMsg("设置成功")
            sessionStorage.setItem("email", email);
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }

    function addListener() {
        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                "email": {
                    required: true,
                    email: true
                },
                "captcha": {
                    required: true,
                    sms: true
                },
            },
            onkeyup: false
        });
        smsCaptcha.init({
            checkInfo: function() {
                return $("#email").valid();
            },
            bizType: "805086",
            id: "getVerification",
            mobile: "email",
            sendCode: '630093',
            errorFn: function() {}
        });
        $("#subBtn").click(function() {
            if (_formWrapper.valid()) {
                base.showLoadingSpin();
                var params = _formWrapper.serializeObject()
                setEmail(params.email, params.captcha)
            }
        })
    }
});