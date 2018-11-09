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
        $('.sec-en_aq').text(base.getText('安全设置', langType));
        $('.sec-en_zj').text(base.getText('资金密码', langType));
        $('.sec-en_tx').text(base.getText('提现、修改安全设置时输入', langType));
        $('.sec-en_em').text(base.getText('绑定邮箱', langType));
        $('.sec-en_sj').text(base.getText('绑定手机号', langType));
        $('.sec-en_dlmm').text(base.getText('登录密码', langType));
        $('.sec-en_dlsr').text(base.getText('用户登录账户时输入', langType));
        $('.sec-en_xg').text(base.getText('修改', langType));
        $('.sec-en_gg').text(base.getText('谷歌验证', langType));
        $('.sec-en_bd').text(base.getText('绑定后', langType) + ',');
        $('.sec-en_dl').text(base.getText('登录', langType));
        $('.sec-en_ecyz').text(base.getText('提现时需要谷歌二次验证', langType));

        getUser();
        addListener();
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