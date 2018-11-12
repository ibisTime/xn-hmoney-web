define([
    'app/controller/base'
], function (base) {
    let mod = base.getUrlParam('mod');
    let langType = localStorage.getItem('langType') || 'ZH';
    if(langType == 'EN'){
        $('title').text('Fiat-FUNMVP blockchain technology application experimental platform');
    }
    $('title').text('场外交易-FUNMVP区块链技术应用实验平台');
    if (!base.isLogin() && mod != 'gm' && mod != 'cs') {
        base.goLogin();
        return false;
    }
    $(".trade").addClass('active');
    $('#left-wrap').on('click', '.left-item .fb',function(){
        if (!base.isLogin()) {
            base.goLogin();
            return false;
        }
    });

    mod && $('#left-wrap .' + mod).addClass('sel-nav_item');
})
