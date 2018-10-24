define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, smsCaptcha, UserCtr, Top, Foo) {
    var type = base.getUrlParam("type"); //设置类型： 0,開啟  1，關閉

    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .security").addClass("on")
        init();
    }

    function init() {
        base.showLoadingSpin();
        if (type == 1) {
            $('#form-wrapper div').eq(0).addClass('none');
        }
        if(base.getUserMobile()) {
            $("#mobile").val(base.getUserMobile());
            $("#mobile").siblings('.item-icon').addClass('icon-phone');
        } else {
            $("#mobile").val(base.getUserEmail());
            $("#mobile").siblings('.item-icon').addClass('icon-email');
        }
        getGooglePwd();
        addListener();
    }

    //開啟
    function openGoogle(params) {
        return UserCtr.openGoogle(params).then(() => {
            base.hideLoadingSpin()
            sessionStorage.getItem("googleAuthFlag", 'true');
            base.showMsg("开启成功");
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }

    //關閉
    function closeGoogle(googleCaptcha, smsCaptcha) {
        return UserCtr.closeGoogle(googleCaptcha, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            sessionStorage.getItem("googleAuthFlag", 'false');
            base.showMsg("关闭成功")
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }

    function getGooglePwd() {
        return UserCtr.getGooglePwd().then((data) => {
            $("#secret").val(data.secret)
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function addListener() {
        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                "secret": {
                    required: true,
                },
                "googleCaptcha": {
                    required: true,
                },
                "smsCaptcha": {
                    required: true,
                    sms: true
                },
            },
            onkeyup: false
        });
        smsCaptcha.init({
            checkInfo: function() {
                return $("#mobile").valid(); //805089
            },
            bizType: type == '1' ? "805089" : "805088",
            id: "getVerification",
            mobile: "mobile",
            errorFn: function() {}
        });
        $("#subBtn").click(function() {
            if (_formWrapper.valid()) {
                base.showLoadingSpin();
                var params = _formWrapper.serializeObject();
                params.secret = $("#secret").val();

                if (type == '0') {
                    openGoogle(params)
                } else if (type == '1') {
                    closeGoogle(params.googleCaptcha, params.smsCaptcha)
                }
            }
        })
    }
});