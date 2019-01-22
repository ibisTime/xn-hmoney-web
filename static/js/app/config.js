var SYSTEM_CODE = "CD-HPMN000024"; //
var COMPANY_CODE = "CD-HPMN000024";
var PIC_PREFIX = 'http://image.hp.hichengdai.com/'; // 七牛云
var PHOTO_SUFFIX = '?imageMogr2/auto-orient/thumbnail/!150x150r';
var THUMBNAIL_SUFFIX = "";
// web 域名 邀请好友
var DOMAIN_NAME = 'http://www.funmvp.com';
// h5 域名 邀请好友
// var INVITATION_HREF = 'http://m.funmvp.com';
var INVITATION_HREF = 'http://localhost:2812';
//帮助中心
var HELPCONTENT = 'https://funmvp.zendesk.com/hc/zh-cn/';
var ZENDESK_LABEL = 'search';
var FOOT_TETUI = 'Bcoin Exchange';
var FOOT_EMAIL = 'contact@bcoin.im';
var COIN_DEFAULTDATA = {
    "FMVP": { "id": "1", "coin": "FMVP", "unit": "1e18", "name": "FMVP币", "type": "0T" },
    "BTC": { "id": "2", "coin": "BTC", "unit": "1e8", "name": "比特币", "type": "1" },
    "ETH": { "id": "3", "coin": "ETH", "unit": "1e18", "name": "以太坊", "type": "0"}
};
var COIN_DEFAULTDATALIST = [
    { "id": "1", "coin": "FMVP", "unit": "1e18", "name": "FMVP币", "type": "0T" },
    { "id": "2", "coin": "BTC", "unit": "1e8", "name": "比特币", "type": "1" },
    { "id": "3", "coin": "ETH", "unit": "1e18", "name": "以太坊", "type": "0"}
];

// 当前langType
var NOWLANG = localStorage.getItem('langType') || 'ZH';
(function() {
    var userId = '', token = '', gameFlag = false;
    // 游戏跳转
    // 只跳转首页
    if (/\/index\.html/.test(location.href)) {
        var regUserId = new RegExp("(^|&)userId=([^&]*)(&|$)", "i"),
            regToken = new RegExp("(^|&)token=([^&]*)(&|$)", "i");
        var thisUrlUserId = window.location.search.substr(1).match(regUserId);
        var thisUrlToken = window.location.search.substr(1).match(regToken);
        gameFlag = true;

        if (thisUrlUserId != null){
            userId = decodeURIComponent(thisUrlUserId[2]);
        }
        if (thisUrlToken != null){
            token = decodeURIComponent(thisUrlToken[2]);
        }
    }
    if (/AppleWebKit.*Mobile/i.test(navigator.userAgent)  ||  (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
        if (window.location.href.indexOf("?mobile") < 0) {
            try {
                if(gameFlag && userId && token) {
                    setConfigCookie("userId", userId);
                    setConfigCookie("token", token);
                }
                var thisPage = getThispage(window.location.href, gameFlag, userId, token);
                if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
                    window.location.href = INVITATION_HREF + thisPage;
                } else
                if (/iPad/i.test(navigator.userAgent)) {
                    window.location.href = INVITATION_HREF + thisPage;
                } else {
                    window.location.href = INVITATION_HREF + thisPage;
                }
            } catch (e) {}
        }
    } else {
        if(gameFlag && userId && token) {
            sessionStorage.setItem("userId", userId);
            sessionStorage.setItem("token", token);
        }
    }
})();
function getThispage(href, gameFlag, userId, token) {
    if (href.indexOf('/login.html') > -1) {
        return '/login';
    } else if(href.indexOf('/register.html') > -1) {
        return '/registered';
    } else if(href.indexOf('/index.html') > -1) {
        if (gameFlag) {
            return '/page?userId=' + userId + '&token=' + token;
        } else {
            return '/page';
        }
    } else  {
        return '';
    }
}
function setConfigCookie(name, value, expires) {
    var expr = '';
    if (!expires) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        expr = ';expires=' + exp.toGMTString();
    }
    document.cookie = name + '=' + escape(value) + expr + ';path=/;';
}