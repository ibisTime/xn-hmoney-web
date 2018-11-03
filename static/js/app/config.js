var SYSTEM_CODE = "CD-HPMN000024"; //
var COMPANY_CODE = "CD-HPMN000024";
var PIC_PREFIX = 'http://pgf8juy5p.bkt.clouddn.com/'; // 七牛云
var PHOTO_SUFFIX = '?imageMogr2/auto-orient/thumbnail/!150x150r';
var THUMBNAIL_SUFFIX = "";
// web 域名
//var DOMAIN_NAME = 'http://localhost:4009';
// h5 域名
//var INVITATION_HREF = 'http://localhost:4009';
// web 域名 测试 邀请好友  http://www.funmvp.com/
var DOMAIN_NAME = 'http://www.funmvp.com';
// h5 域名 测试 邀请好友
var INVITATION_HREF = 'http://m.funmvp.com';
//帮助中心
var HELPCONTENT = 'https://funmvp.zendesk.com/hc/zh-cn/';
var ZENDESK_LABEL = 'search';
var FOOT_TETUI = 'Bcoin Exchange';
var FOOT_EMAIL = 'contact@bcoin.im';
var COIN_DEFAULTDATA = {
    "BTC": { "coin": "BTC", "unit": "8", "name": "比特币", "type": "0" },
    "ETH": { "coin": "ETH", "unit": "18", "name": "以太坊", "type": "0" },
    "SC": { "coin": "SC", "unit": "24", "name": "云储币", "type": "0" }
}
(function() {
    if (/AppleWebKit.*Mobile/i.test(navigator.userAgent)  ||  (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
        if (window.location.href.indexOf("?mobile") < 0) {
            try {
                if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
                    window.location.href = INVITATION_HREF;
                } else
                if (/iPad/i.test(navigator.userAgent)) {
                    window.location.href = INVITATION_HREF;
                } else {
                    window.location.href = INVITATION_HREF;
                }
            } catch (e) {}
        }
    }
})()