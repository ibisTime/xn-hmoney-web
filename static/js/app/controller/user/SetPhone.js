define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr'
], function(base, Validate, smsCaptcha, UserCtr) {
    var type = base.getUrlParam("type");//设置类型： 0,设置  1，修改 
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

    //綁定手机
    function setPhone(tradePwd, smsCaptcha) {
        return UserCtr.setPhone(tradePwd, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            base.showMsg("设置成功")
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }
    //修改手机
    function detPhone(tradePwd, smsCaptcha) {
        return UserCtr.detPhone(tradePwd, smsCaptcha).then(() => {
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
            bizType: type=='1'?"805061":"805060",
            id: "getVerification",
            mobile: "mobile",
            errorFn: function() {}
        });
        $("#subBtn").click(function() {
            if (_formWrapper.valid()) {
                base.showLoadingSpin();
                var params = _formWrapper.serializeObject();
                if(type == 1){
                    detPhone(params.mobile, params.captcha);
                }
                if(type == 0){
                    setPhone(params.mobile, params.captcha);
                }
            }
        })
    }
});