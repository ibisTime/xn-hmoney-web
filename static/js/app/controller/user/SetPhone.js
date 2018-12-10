define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, smsCaptcha, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var type = base.getUrlParam("type");//设置类型： 0,设置  1，修改
    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .security").addClass("on")
        init();
    }

    function init() {
        $('.left-title').text(base.getText('用户中心'));
        $('.en_yhzl').text(base.getText('用户资料'));
        $('.uleft_en').text(base.getText('基本信息'));
        $('.identity').text(base.getText('身份验证'));
        $('.security').text(base.getText('安全设置'));
        $('.position').text(base.getText('当前位置', langType) + '：');
        $('.ph-en_yh').text(base.getText('用户中心', langType) + '>');
        $('.ph-en_aq').text(base.getText('安全设置', langType) + '>');
        $('.ph-en_sj').text(base.getText('手机号', langType));
        $('.title').text(base.getText('绑定手机号', langType));
        $('#getVerification').text(base.getText('获取手机验证码', langType));
        $('#subBtn').text(base.getText('确定', langType));
        $('#mobile').attr('placeholder', base.getText('请输入手机号', langType));
        $('#captcha').attr('placeholder', base.getText('手机验证码', langType));
        if(langType == 'EN'){
            $('title').text('Cellphone number-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('手机号-FUNMVP区块链技术应用实验平台');
        base.hideLoadingSpin();
        addListener();
    }

    //綁定手机
    function setPhone(mobile, smsCaptcha) {
        return UserCtr.setPhone(mobile, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            base.showMsg(base.getText('设置成功', langType))
            sessionStorage.setItem("mobile", mobile);
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }
    //修改手机
    function detPhone(mobile, smsCaptcha) {
        return UserCtr.detPhone(mobile, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            base.showMsg(base.getText('设置成功', langType))
            sessionStorage.setItem("mobile", mobile);
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