define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr'
], function(base, Validate, smsCaptcha, UserCtr) {

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

    //修改/綁定手机
    function setPhone(tradePwd, smsCaptcha) {
        return UserCtr.setPhone(tradePwd, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            base.showMsg("设置成功")
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }

    function addListener() {
        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                "mobile": {
                    required: true,
                    mobile: true
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
                return $("#mobile").valid();
            },
            bizType: "805060",
            id: "getVerification",
            mobile: "mobile",
            errorFn: function() {}
        });
        $("#subBtn").click(function() {
            if (_formWrapper.valid()) {
                base.showLoadingSpin();
                var params = _formWrapper.serializeObject()
                setPhone(params.mobile, params.captcha);
            }
        })
    }
});