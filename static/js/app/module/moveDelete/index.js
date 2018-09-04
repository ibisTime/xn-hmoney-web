define([
    'jquery'
], function ($) {
    return {
        init: function (id, cl) {
            $("#" + id).on("touchstart", "." + cl, function (e) {
                e.stopPropagation();
                var touches = e.originalEvent.targetTouches[0],
                    me = $(this);
                var left = me.offset().left;
                me.data("x", touches.clientX);
                me.data("offsetLeft", left);
            })
                .on("touchmove",  "." + cl, function (e) {
                    e.stopPropagation();
                    var touches = e.originalEvent.changedTouches[0],
                        me = $(this),
                        ex = touches.clientX,
                        xx = parseInt(me.data("x")) - ex,
                        left = me.data("offsetLeft");
                    if (xx > 10) {
                        me.css({
                            "transition": "none",
                            "transform": "translate3d(" + (-xx / 2) + "px, 0px, 0px)"
                        });
                    } else if (xx < -10) {
                        me.css({
                            "transition": "none",
                            "transform": "translate3d(" + (left + (-xx / 2)) + "px, 0px, 0px)"
                        });
                    }
                })
                .on("touchend",  "." + cl, function (e) {
                    e.stopPropagation();
                    var me = $(this);
                    var touches = e.originalEvent.changedTouches[0],
                        ex = touches.clientX,
                        xx = parseInt(me.data("x")) - ex;
                    if (xx > 56) {
                        me.css({
                            "transition": "-webkit-transform 0.2s ease-in",
                            "transform": "translate3d(-56px, 0px, 0px)"
                        });
                    } else {
                        me.css({
                            "transition": "-webkit-transform 0.2s ease-in",
                            "transform": "translate3d(0px, 0px, 0px)"
                        });
                    }
                });
        }
    }
});
