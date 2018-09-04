define([
    'jquery'
], function ($) {
    function isNumber(code) {
        if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
            return true;
        }
        return false;
    }
    function isSpecialCode(code) {
        if (code == 37 || code == 39 || code == 8 || code == 46) {
            return true;
        }
        return false;
    }
    return {
        createByEle: function (options) {
            /*
            * options = {
            *   sub: ele,
            *   add: ele,
            *   input: ele,
            *   changeFn: function
            * }
            * */
            options.sub.on("click", function() {
                var orig = options.input.val();
                if (orig == undefined || orig.trim() == "" || orig == "0" || orig == "1") {
                    orig = 2;
                }
                orig = +orig - 1;
                options.input.val(orig);
                options.input.change();
            });
            options.add.on("click", function() {
                var orig = options.input.val();
                if (orig == undefined || orig.trim() == "") {
                    orig = 0;
                }
                orig = +orig + 1;
                options.input.val(orig);
                options.input.change();
            });
            options.input.on("keyup", function(e) {
                var keyCode = e.charCode || e.keyCode;
                if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                    this.value = this.value.replace(/[^\d]/g, "");
                }
            }).on("change", function(e) {
                var keyCode = e.charCode || e.keyCode;
                var _self = $(this), val = _self.val();
                if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                    val = val.replace(/[^\d]/g, "");
                }
                if (!val) {
                    val = "1";
                }
                if (val == "0") {
                    val = "1";
                }
                _self.val(val);
                options.changeFn && options.changeFn.apply(this);
            });
        },
        createInList: function (options) {
            /*
            * options = {
            *   wrap: ele,
            *   add: string,
            *   sub: string,
            *   input: string
            *   changeFn: function
            * }
            * sub、input、add需要处于同一级
            * */
            options.wrap.on("click", options.sub, function(e) {
                e.stopPropagation();
                var $input = $(this).parent().find(options.input);
                var orig = $input.val();
                if (orig == undefined || orig.trim() == "" || orig == "0" || orig == "1") {
                    orig = 2;
                }
                orig = +orig - 1;
                $input.val(orig);
                $input.change();
            });
            options.wrap.on("click", options.add, function(e) {
                e.stopPropagation();
                var $input = $(this).parent().find(options.input);
                var orig = $input.val();
                if (orig == undefined || orig.trim() == "") {
                    orig = 0;
                }
                orig = +orig + 1;
                $input.val(orig);
                $input.change();
            });
            options.wrap.on("keyup", options.input, function(e) {
                e.stopPropagation();
                var keyCode = e.charCode || e.keyCode;
                var me = $(this);
                if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                    me.val(me.val().replace(/[^\d]/g, ""));
                }
            }).on("change", options.input, function(e) {
                e.stopPropagation();
                var keyCode = e.charCode || e.keyCode;
                var me = $(this);
                if (!isSpecialCode(keyCode)) {
                    me.val(me.val().replace(/[^\d]/g, ""));
                }
                if (!me.val()) {
                    me.val("1");
                }
                if (me.val() == "0") {
                    me.val("1");
                }
                options.changeFn && options.changeFn.apply(this);
            });
        }
    }
});
