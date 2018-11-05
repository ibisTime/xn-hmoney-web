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