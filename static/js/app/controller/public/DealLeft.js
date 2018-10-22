define([
    'app/controller/base'
], function (base) {
    let mod = base.getUrlParam('mod');
    if (!base.isLogin() && mod != 'gm' && mod != 'cs') {
        base.goLogin();
        return false;
    }
    $('.trade').addClass('active');
    $('.left-wrap .left-item .fb').click(function(){
        if (!base.isLogin()) {
            base.goLogin();
            return false;
        }
    })
   
    $('.'+mod).addClass('sel-nav_item');
})
