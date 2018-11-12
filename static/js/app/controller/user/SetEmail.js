define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, smsCaptcha, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .security").addClass("on")
        init();
    }

    function init() {
        $('.position').text(base.getText('当前位置', langType) + '：');
        $('.email-en_yh').text(base.getText('用户中心', langType) + '>');
        $('.em-en_ay').text(base.getText('安全设置', langType));
        $('.em-en_yx').text(base.getText('邮箱', langType));
        $('.title').text(base.getText('设置邮箱', langType));
        $('#getVerification').text(base.getText('获取邮箱验证码', langType));
        $('#subBtn').text(base.getText('确定', langType));
        $('#email').attr('placeholder', base.getText('请输入邮箱', langType));
        $('#captcha').attr('placeholder', base.getText('邮箱验证码', langType));

        if(langType == 'EN'){
            $('title').text('mailbox-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('邮箱-FUNMVP区块链技术应用实验平台');
        base.hideLoadingSpin();
        addListener();
    }

    //修改/綁定邮箱
    function setEmail(email, smsCaptcha) {
        return UserCtr.setEmail(email, smsCaptcha).then(() => {
            base.hideLoadingSpin()
            base.showMsg(base.getText('设置成功', langType))
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