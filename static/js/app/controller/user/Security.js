define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .security").addClass("on")
        init();
    }

    function init() {
        base.showLoadingSpin();
        setHtml();
        getUser();
        addListener();
    }

    function setHtml() {
        $('title').text(base.getText('安全设置') + '-' +base.getText('FUNMVP区块链技术应用实验平台'));
        $('.left-title').text(base.getText('用户中心'));
        $('.en_yhzl').text(base.getText('用户资料'));
        $('.uleft_en').text(base.getText('基本信息'));
        $('.identity').text(base.getText('身份验证'));
        $('.security').text(base.getText('安全设置'));
        $('.sec-en_aq').text(base.getText('安全设置', langType));
        $('.sec-en_zj').text(base.getText('交易密码', langType));
        $('.sec-en_tx').text(base.getText('提现、修改安全设置时输入', langType));
        $('.sec-en_em').text(base.getText('绑定邮箱', langType));
        $('.sec-en_sj').text(base.getText('绑定手机号', langType));
        $('.sec-en_dlmm').text(base.getText('登录密码', langType));
        $('.sec-en_dlsr').text(base.getText('用户登录账户时输入', langType));
        $('.sec-en_xg').text(base.getText('修改', langType));
        $('.sec-en_gg').text(base.getText('谷歌验证', langType));
        $('.sec-en_bd').text(base.getText('绑定后,登录、提现时需要谷歌密码二次验证', langType));
        $('.sec-en_dl').text(base.getText('登录', langType));
        $('.fy_ljsz').text(base.getText('立即设置', langType));
        $('.fy_ybd').text(base.getText('已绑定', langType));
        $('.setGoogle .close').text(base.getText('关闭', langType));
        $('.setGoogle .open').text(base.getText('启用', langType));
        $('.sec-en_ecyz').text(base.getText('提现时需要谷歌二次验证', langType));

    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {
            if (data.tradepwdFlag) {
                $(".setTradPwd .edit").removeClass("hidden")
            } else {
                $(".setTradPwd .set").removeClass("hidden")
            }

            if (data.email) {
                $(".setEmail .edit").removeClass("hidden")
            } else {
                $(".setEmail .set").removeClass("hidden")
            }

            if (data.googleAuthFlag) {
                $(".setGoogle .close").removeClass("hidden")
            } else {
                $(".setGoogle .open").removeClass("hidden")
            }
            if(data.mobile){
                $('.setPhone .b_phone').removeClass('hidden');
            }else{
                $('.setPhone .o_phone').removeClass('hidden');
            }

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function addListener() {}
});