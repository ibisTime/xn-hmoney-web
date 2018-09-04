define([
    'jquery',
    'app/module/validate',
    'app/module/loading',
    'app/interface/userCtr'
], function ($, Validate, loading, userCtr) {
    var tmpl = __inline("index.html");
    var defaultOpt = {};
    var first = true;

    function _identity(){
        loading.createLoading("认证中...");
        userCtr.identity({
            realName: $("#identityRealName").val(),
            idNo: $("#identityIdNo").val()
        }).then(function(){
            loading.hideLoading();
            identity.hideCont(defaultOpt.success);
            $("#authentication-identity-btn").parent().hide();
            $("#identityRealName, #identityIdNo").attr("disabled", "disabled");
        }, function(msg){
            defaultOpt.error && defaultOpt.error(msg || "实名认证失败");
        });
    }
    var identity = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#authentication-identity");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                $("#authentication-identity-back")
                    .on("click", function(){
                        identity.hideCont();
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                if(!defaultOpt.disabled){
                    $("#authentication-identity-btn")
                        .on("click", function(){
                            if($("#authentication-identity-form").valid()){
                                _identity();
                            }
                        });
                    $("#authentication-identity-form").validate({
                        'rules': {
                            identityRealName: {
                                required: true,
                                maxlength: 32,
                                isNotFace: true
                            },
                            identityIdNo: {
                                required: true,
                                isIdCardNo: true
                            }
                        }
                    });
                }else{
                    $("#authentication-identity-btn").parent().hide();
                    $("#identityRealName").val(defaultOpt.realName || "").attr("disabled", "disabled");
                    $("#identityIdNo").val(defaultOpt.idNo || "").attr("disabled", "disabled");
                }
            }

            first = false;
            return this;
        },
        hasCont: function(){
            if(!$("#authentication-identity").length)
                return false
            return true;
        },
        showCont: function (){
            if(this.hasCont()){
                var wrap = $("#authentication-identity");
                wrap.css("top", $(window).scrollTop()+"px");
                wrap.show().animate({
                    left: 0
                }, 200, function(){
                    defaultOpt.showFun && defaultOpt.showFun();
                });

            }
            return this;
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#authentication-identity");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                    $("#identityRealName").val("");
                    $("#identityIdNo").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return identity;
});
