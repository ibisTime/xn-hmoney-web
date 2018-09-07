define([
    'jquery',
    'app/util/dialog',
    'app/interface/GeneralCtr'
], function($, dialog, GeneralCtr) {
    function _showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, time || 1500);
    }

    function initSms(opt) {
        this.options = $.extend({}, this.defaultOptions, opt);
        var _self = this;
        var verification = $("#" + _self.options.id);
        verification.text("获取验证码").prop("disabled", false);
        clearInterval(_self.timer);

        $("#" + this.options.id).off("click")
            .on("click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                _self.options.checkInfo() && _self.handleSendVerifiy();
            });
    }
    initSms.prototype.defaultOptions = {
        id: "getVerification",
        mobile: "mobile",
        checkInfo: function() {
            return $("#" + this.mobile).valid();
        },
        sendCode: '630090' // 805040 805950
    };
    initSms.prototype.handleSendVerifiy = function() {
        var _this = this
        var verification = $("#" + _this.options.id);
        verification.prop("disabled", true);
        GeneralCtr.sendCaptcha(_this.options.bizType, $("#" + _this.options.mobile).val(), _this.options.sendCode)
            .then(() => {
                var i = 60;
                $('#getVerification').css({
                    color: '#ccc',
                    'background-color': '#fff'
                });
                _this.timer = window.setInterval(() => {
                    if (i > 0 && verification.attr("disabled")) {
                        verification.text("重新發送(" + i-- + "s)");
                    } else {
                        verification.text("获取验证码").prop("disabled", false);
                        $('#getVerification').css({
                            color: '#d53d3d'
                        });
                        clearInterval(_this.timer);
                    }
                }, 1000);
            }, function() {
                _this.options.errorFn && _this.options.errorFn();
                verification.text("获取验证码").prop("disabled", false);
            });
    };
    return {
        init: function(options) {
            new initSms(options);
        }
    }
});