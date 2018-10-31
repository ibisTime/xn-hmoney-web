define([
    'app/util/cookie',
    'app/util/dialog',
    'app/module/loading',
    'BigDecimal',
    'app/interface/BaseCtr'
], function(CookieUtil, dialog, loading, BigDecimal, BaseCtr) {

    // if (/AppleWebKit.*Mobile/i.test(navigator.userAgent)  ||  (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
    //     if (window.location.href.indexOf("?mobile") < 0) {
    //         try {
    //             if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
    //                 window.location.href = INVITATION_HREF + '/share/share-upload.html'
    //             } else 
    //             if (/iPad/i.test(navigator.userAgent)) {
    //                 window.location.href = INVITATION_HREF + '/share/share-upload.html'
    //             } else {
    //                 window.location.href = INVITATION_HREF + '/share/share-upload.html'
    //             }
    //         } catch (e) {}
    //     }
    // }

    if (Number.prototype.toFixed) {
        var ori_toFixed = Number.prototype.toFixed;
        Number.prototype.toFixed = function() {
            var num = ori_toFixed.apply(this, arguments);
            if (num == 0 && num.indexOf('-') == 0) { // -0 and 0
                num = num.slice(1);
            }
            return num;
        }
    }

    setTimeout(() => {
        $("body").on("click", ".goHref", function() {
            var thishref = $(this).attr("data-href");
            if (thishref != "" && thishref) {
                if (Base.isLogin()) {
                    Base.updateLoginTime();
                }
                Base.gohref(thishref)
            }
        })
    }, 1);

    //给form表单赋值
    $.fn.setForm = function(jsonValue) {
        var obj = this;
        $.each(jsonValue, function(name, ival) {
            if (obj.find("#" + name).length) {
                var $oinput = obj.find("#" + name);
                if ($oinput.attr("type") == "radio" || $oinput.attr("type") == "checkbox") {
                    $oinput.each(function() {
                        if (Object.prototype.toString.apply(ival) == '[object Array]') { //是复选框，并且是数组  
                            for (var i = 0; i < ival.length; i++) {
                                if ($(this).val() == ival[i])
                                    $(this).attr("checked", "checked");
                            }
                        } else {
                            if ($(this).val() == ival) {
                                $(this).attr("checked", "checked")
                            };
                        }
                    });
                } else if ($oinput.attr("type") == "textarea") { //多行文本框  
                    obj.find("[name=" + name + "]").html(ival);
                } else {
                    if ($oinput.attr("data-format")) { //需要格式化的日期 如:data-format="yyyy-MM-dd"
                        obj.find("[name=" + name + "]").val(Base.formatDate(ival, $oinput.attr("data-format")));
                    } else if ($oinput.attr("data-amount")) { //需要格式化的日期 如:data-format="yyyy-MM-dd"
                        obj.find("[name=" + name + "]").val(Base.formatMoney(ival));
                    } else {
                        obj.find("[name=" + name + "]").val(ival);
                    }
                }
            }
        });
    };

    String.prototype.temp = function(obj) {
        return this.replace(/\$\w+\$/gi, function(matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return (returns + "") == "undefined" ? "" : returns;
        });
    };

    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function() {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };

    var Base = {
        //日期格式化 format|| 'yyyy-MM-dd';
        formatDate: function(date, format) {
            var format = format || 'yyyy-MM-dd';
            return date ? new Date(date).format(format) : "--";
        },
        //日期格式化 yyyy-MM-dd hh:mm:ss
        formateDatetime: function(date) {
            return date ? new Date(date).format("yyyy-MM-dd hh:mm:ss") : "--";
        },
        //日期格式化 MM-dd hh:mm:ss
        datetime: function(date) {
            return date ? new Date(date).format("MM-dd hh:mm") : "--";
        },
        //日期格式化 hh:mm:ss
        todayDatetime: function(date) {
            return date ? new Date(date).format("hh:mm:ss") : "--";
        },
        //获取链接入参
        getUrlParam: function(name, locat) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var locat = locat ? "?" + locat.split("?")[1] : '';
            var r = (locat ? locat : window.location.search).substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        // 金额格式化 默认保留t || 8位  小数 coin 默认eth
        formatMoney: function(s, t, coin, noZero = true) {
            var unit = coin ? Base.getCoinUnit(coin) : "1000";

            if (!$.isNumeric(s)){
                return "-"
            } else {
                s = Number(s).toString();
            }
            if (t == '' || t == null || t == undefined || typeof t == 'object') {
                if(coin === 'CNY') {
                  t = 2;
                } else {
                  t = 8;
                }
            }
            //保留8位小数
            s = new BigDecimal.BigDecimal(s);
            s = s.divide(new BigDecimal.BigDecimal(unit), t, BigDecimal.MathContext.ROUND_DOWN).toString();
            if (noZero) {
                s = s.replace(/(-?\d+)\.0+$/, '$1')
                if (!/^-?\d+$/.test(s)) {
                    s = s.replace(/(.+[^0]+)0+$/, '$1')
                }
            }
            return s;
        },
        //金额减法 s1-s2
        formatMoneySubtract: function(s1, s2, coin) {
            if (!$.isNumeric(s1) || !$.isNumeric(s2))
                return "-";
            var s1 = new BigDecimal.BigDecimal(s1);
            var s2 = new BigDecimal.BigDecimal(s2);
            return Base.formatMoney(s1.subtract(s2).toString(), '', coin);
        },
        //金额乘法 s1-s2
        formatMoneyMultiply: function(s1, s2, coin) {
            if (!$.isNumeric(s1) || !$.isNumeric(s2))
                return "-";
            var s1 = new BigDecimal.BigDecimal(s1);
            var s2 = new BigDecimal.BigDecimal(s2);
            return Base.formatMoney(s1.multiply(s2).toString(), '', coin);
        },
        //金额金额放大 默认 放大 r || 8位 
        formatMoneyParse: function(m, r, coin) {
            var unit = coin ? Base.getCoinUnit(coin) : "1e18";
            var r = r || new BigDecimal.BigDecimal(unit);
            if (m == '') {
                return '-';
            } else {
                m = Number(m).toString();
            }
            m = new BigDecimal.BigDecimal(m);
            m = m.multiply(r).toString();
            return m;
        },
        //密码强度等级判断
        calculateSecurityLevel: function(password) {
            var strength_L = 0;
            var strength_M = 0;
            var strength_H = 0;

            for (var i = 0; i < password.length; i++) {
                var code = password.charCodeAt(i);
                // 数字
                if (code >= 48 && code <= 57) {
                    strength_L++;
                    // 小写字母 大写字母
                } else if ((code >= 65 && code <= 90) ||
                    (code >= 97 && code <= 122)) {
                    strength_M++;
                    // 特殊符号
                } else if ((code >= 32 && code <= 47) ||
                    (code >= 58 && code <= 64) ||
                    (code >= 94 && code <= 96) ||
                    (code >= 123 && code <= 126)) {
                    strength_H++;
                }
            }
            // 弱
            if ((strength_L == 0 && strength_M == 0) ||
                (strength_L == 0 && strength_H == 0) ||
                (strength_M == 0 && strength_H == 0)) {
                return "1";
            }
            // 强
            if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
                return "3";
            }
            // 中
            return "2";
        },
        //计算日期相隔时间
        calculateDays: function(start, end) {
            if (!start || !end)
                return 0;
            start = new Date(start);
            end = new Date(end);
            return (end - start) / (60 * 1000);
        },
        //图片格式化
        getPic: function(pic, suffix) {
            if (!pic) {
                return "";
            }
            pic = pic.split(/\|\|/)[0];
            if (!/^http|^data:image/i.test(pic)) {
                suffix = suffix || "?imageMogr2/auto-orient/interlace/1"
                pic = PIC_PREFIX + pic + suffix;
            }
            return pic;
        },
        //图片格式化-pic为数组
        getPicArr: function(pic, suffix) {
            if (!pic) {
                return [];
            }
            return pic.split(/\|\|/).map(function(p) {
                return Base.getPic(p, suffix);
            });
        },
        //图片格式化-头像
        getAvatar: function(pic, suffix) {
            var defaultAvatar = __inline("../images/default-avatar.png");
            var suffix = suffix || PHOTO_SUFFIX;
            if (!pic) {
                pic = defaultAvatar;
            }
            return Base.getPic(pic, suffix);
        },
        //获取网站地址 不包含?后面的入参
        getDomain: function() {
            return location.origin;
        },
        isNotFace: function(value) {
            var pattern = /^[\s0-9a-zA-Z\u4e00-\u9fa5\u00d7\u300a\u2014\u2018\u2019\u201c\u201d\u2026\u3001\u3002\u300b\u300e\u300f\u3010\u3011\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff0d\uff03\uffe5\x21-\x7e]*$/;
            return pattern.test(value)
        },
        // 提醒
        showMsg: function(msg, time) {
            var d = dialog({
                content: msg,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 1500);
        },
        makeReturnUrl: function(param) {
            var url = location.pathname + location.search;
            if (param) {
                var str = "";
                for (var n in param) {
                    str += "&" + n + "=" + param[n];
                }
                if (/\?/i.test(url)) {
                    url = url + str;
                } else {
                    url = url + "?" + str.substr(1, str.length);
                }
            }
            return encodeURIComponent(url);
        },
        goBack: function() {
            window.history.back();
        },
        goReturn: function() {
            var returnUrl = sessionStorage.getItem("l-return");
            sessionStorage.removeItem("l-return");
            Base.gohref(returnUrl || "../index.html");
        },
        isLogin: function() {
            return !!sessionStorage.getItem("userId");
        },
        goLogin: function(flag) {
            Base.clearSessionUser();
            if (flag) {
                sessionStorage.removeItem("l-return");
            } else {
                sessionStorage.setItem("l-return", location.pathname + location.search);
            }
            Base.gohref("../user/login.html");
        },
        getUserId: function() {
            return sessionStorage.getItem("userId");
        },
        getUserMobile: function() {
            return sessionStorage.getItem("mobile");
        },
        getUserEmail: function() {
            return sessionStorage.getItem("email");
        },
        getToken: function() {
            return sessionStorage.getItem("token");
        },
        //谷歌验证
        getGoogleAuthFlag: function() {
            return sessionStorage.getItem("googleAuthFlag");
        },
        setSessionUser: function(data) {
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("token", data.token);
        },
        clearSessionUser: function() {
            sessionStorage.removeItem("userId"); //userId
            sessionStorage.removeItem("token"); //token
            sessionStorage.removeItem("googleAuthFlag"); //token
            sessionStorage.removeItem("mobile"); //token
            sessionStorage.removeItem("email"); //token
            sessionStorage.removeItem("nickname"); //token
        },
        //登出
        logout: function() {
            Base.clearSessionUser();
            Base.gohref("../user/login.html");
        },
        /**
         * 弹窗
         * base.confirm.then()
         * */
        confirm: function(msg) {
            return (new Promise(function(resolve, reject) {
                var d = dialog({
                    content: msg,
                    ok: function() {
                        var that = this;
                        setTimeout(function() {
                            that.close().remove();
                        }, 1000);
                        resolve();
                        return true;
                    },
                    cancel: function() {
                        reject();
                        return true;
                    },
                    cancelValue: '取消',
                    okValue: '确定'
                });
                d.showModal();
            }));

        },
        showLoading: function(msg) {
            loading.createLoading(msg);
        },
        hideLoading: function() {
            loading.hideLoading();
        },
        showLoadingSpin: function() {
            $("#loadingSpin").removeClass("hidden");
            $('html').css('overflow', 'hidden');
        },
        hideLoadingSpin: function() {
            $("#loadingSpin").addClass("hidden");
            $('html').css('overflow', 'auto');
        },
        // 获取数据字典
        getDictListValue: function(dkey, arrayData) { //类型
            for (var i = 0; i < arrayData.length; i++) {
                if (dkey == arrayData[i].dkey) {
                    return arrayData[i].dvalue;
                }
            }
        },
        //超过num个字符多余"..."显示
        format2line: function(num, cont) {
            return cont ?
                cont.length > num ?
                cont.substring(0, num) + "..." :
                cont :
                "";
        },
        emptyFun: function() {

        },
        //获取地址json
        getAddress: function() {
            var addr = localStorage.getItem("addr");
            if (addr) {
                var defer = jQuery.Deferred();
                addr = $.parseJSON(addr);
                if (!addr.citylist) {
                    addr = $.parseJSON(addr);
                }
                defer.resolve(addr);
                return defer.promise();
            } else {
                return $.get("/static/js/lib/city.min.json")
                    .then(function(res) {
                        if (res.citylist) {
                            localStorage.setItem("addr", JSON.stringify(res));
                            return res;
                        }
                        localStorage.setItem("addr", JSON.stringify(res));
                        return $.parseJSON(res);
                    });
            }
        },
        /* 
         * url 目标url 
         * arg 需要替换的参数名称 
         * arg_val 替换后的参数的值 
         * return url 参数替换后的url 
         */
        changeURLArg: function(url, arg, arg_val) {
            var pattern = arg + '=([^&]*)';
            var replaceText = arg + '=' + arg_val;
            if (url.match(pattern)) {
                var tmp = '/(' + arg + '=)([^&]*)/gi';
                tmp = url.replace(eval(tmp), replaceText);
                return tmp;
            } else {
                if (url.match('[\?]')) {
                    return url + '&' + replaceText;
                } else {
                    return url + '?' + replaceText;
                }
            }
            return url + '\n' + arg + '\n' + arg_val;
        },
        //跳转 location.href
        gohref: function(href) {
            var timestamp = new Date().getTime();
            //判断链接后是否有带参数
            if (href.split("?")[1]) {
                //判断是否有带v的参数，有则替换v的参数
                if (Base.getUrlParam("v", href) != "" && Base.getUrlParam("v", href)) {
                    location.href = Base.changeURLArg(href, "v", timestamp)
                } else {
                    location.href = href + "&v=" + timestamp
                }
            } else {
                location.href = href + "?v=" + timestamp
            }
        },
        //跳转 location.replace
        gohrefReplace: function(href) {
            var timestamp = new Date().getTime();
            //判断链接后是否有带参数
            if (href.split("?")[1]) {
                //判断是否有带v的参数，有则替换v的参数
                if (Base.getUrlParam("v", href) != "" && Base.getUrlParam("v", href)) {
                    location.replace(Base.changeURLArg(href, "v", timestamp))
                } else {
                    location.replace(href + "&v=" + timestamp)
                }
            } else {
                location.replace(href + "?v=" + timestamp)
            }
        },
        //隐藏手机号中间4位
        hideMobile: function(mobile) {
            var mobile = mobile ? mobile.substring(0, 3) + "****" + mobile.substring(7, 11) : '';
            return mobile;
        },
        //计算百分比
        getPercentum: function(n1, n2) {
            if (n1 == '0' && n2 == '0') {
                return '0';
            }
            var n = n1 / n2 * 100
            return parseInt(n) + "%"
        },
        //更新登录时间
        updateLoginTime: function() {
            BaseCtr.updateLoginTime();
        },
        //获取币种列表
        getCoinList: function() {
            if (sessionStorage.getItem('coinList')) {
                return JSON.parse(sessionStorage.getItem('coinList'));
            } else {
                return COIN_DEFAULTDATA;
            }
        },
        //获取币种名字
        getCoinName: function(coin) {
            var n = Base.getCoinList()[coin].name
            return n;
        },
        //获取币种unit
        getCoinUnit: function(coin) {
            var n = Base.getCoinList()[coin].unit
            return n;
        },
        //获取币种type  1是token币
        getCoinType: function(coin) {
            if (Base.getCoinList()[coin]) {
                var n = Base.getCoinList()[coin].type
                return n;
            }
            return '';
        },
        //获取币种coin
        getCoinCoin: function(coin) {
            var n = Base.getCoinList()[coin].coin
            return n;
        },
        //获取币种withdrawFee
        getCoinWithdrawFee: function(coin) {
            var n = Base.getCoinList()[coin].withdrawFeeString
            return n;
        },
        // 根据语言获取文本
        getText: function(text, lang) {
            if (lang == '' || !lang) {
                lang = NOWLANG
            }
            var t = LANGUAGE[text] && LANGUAGE[text][lang] ? LANGUAGE[text][lang] : '';
            if (!LANGUAGE[text] || t == '') {
                if (!LANGUAGE[text]) {
                    t = text;
                    console.log('[' + text + ']没有翻译配置');
                } else {
                    if (!LANGUAGE[text]['EN']) {
                        t = LANGUAGE[text]['ZH_CN']
                    } else {
                        t = LANGUAGE[text]['EN'];
                    }
                    console.log(lang + ': [' + text + ']没有翻译配置');
                }
            }
            return t;
        }
    };

    return Base;
});