define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, smsCaptcha, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var type = base.getUrlParam("type"); //设置类型： 0,開啟  1，關閉

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
        $('.gle-en_yh').text(base.getText('用户中心', langType) + '>');
        $('.gle-en_aq').text(base.getText('安全设置', langType) + '>');
        $('.gle-en_ge').text(base.getText('谷歌验证码', langType));
        $('.title').text(base.getText('谷歌验证码', langType));
        $('#getVerification').text(base.getText('获取验证码', langType));
        $('#subBtn').text(base.getText('确定', langType));
        $('#smsCaptcha').attr('placeholder', base.getText('验证码', langType));
        $('#secret').attr('placeholder', base.getText('密钥', langType));
        $('#googleCaptcha').attr('placeholder', base.getText('谷歌验证码', langType));

        if(langType == 'EN'){
            $('title').text('Google verification code-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('谷歌验证码-FUNMVP区块链技术应用实验平台');
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
            base.showMsg(base.getText('开启成功', langType));
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
            base.showMsg(base.getText('关闭成功', langType))
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