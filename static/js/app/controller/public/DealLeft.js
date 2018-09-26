define([
    'app/controller/base'
], function (base) {
    $('.left-wrap .left-item .fb').click(function(){
        if (!base.isLogin()) {
            base.goLogin();
            return false;
        }
    })
    let url = location.href.split('?');
    let mod = '',
        len = 0;
    if (!/-/.test(url[0])) {
        len = url[0].split('.')[0].split('/').length - 1;
        mod = url[0].split('.')[0].split('/')[len];
    } else {
        len = url[0].split('-')[0].split('/').length - 1;
        mod = url[0].split('-')[0].split('/')[len];
    }
    switch (mod) {
        case 'buy':
            mod = 'gm';
            break;
        case 'sell':
            mod = 'cs';
            break;
        case 'order':
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            }
            mod = 'dd';
            break;
        case 'advertise':
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            }
            mod = 'gg';
            break;
        case 'trust':
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            }
            mod = 'xr';
            break;
    }
    $(`.${mod}`).addClass('sel-nav_item');
})
