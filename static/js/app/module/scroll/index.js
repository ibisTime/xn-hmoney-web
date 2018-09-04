define([
    'jquery',
    'iScroll',
], function ($, iScroll) {
    function Scroll() {
        this.defaultOption = {
            wrapper: "wrapper",
            pullDownEl: '#pullDown',
            loadMore: function () {
                setTimeout(function () {
                    myScroll.refresh();
                }, 1000);
            },
            refresh: function () {
                setTimeout(function () {
                    myScroll.refresh();
                }, 1000);
            }
        };
        this.myScroll = null;
    }

    Scroll.prototype.getScrollByParam = function (option) {
        this.myScroll = new iScroll(option.id, option.param);
        return this;
    }

    Scroll.prototype.getNormalScroll = function (option) {
        option = option || {};

        $.extend(this.defaultOption, option);

        var pullDownEl, pullDownOffset, $pullDownEl;

        $pullDownEl = $(this.defaultOption.pullDownEl);

        pullDownEl = $pullDownEl[0];
        pullDownOffset = pullDownEl.offsetHeight;
        var that = this;
        this.myScroll = new iScroll(this.defaultOption.wrapper, {
            useTransition: false,
            topOffset: pullDownOffset,
            onRefresh: function () {
                if ($pullDownEl.hasClass('scroll-loading')) {
                    $pullDownEl.removeClass('scroll-loading flip');
                }
            },
            onScrollMove: function () {
                if (this.y > 5 && !$pullDownEl.hasClass("flip")) {
                    $pullDownEl.addClass("flip");
                    this.minScrollY = 0;
                } else if (this.y < 5 && $pullDownEl.hasClass("flip")) {
                    $pullDownEl.removeClass("flip");
                    this.minScrollY = -pullDownOffset;
                } else if (this.y - 120 < this.maxScrollY) {
                    that.defaultOption.loadMore && that.defaultOption.loadMore();
                }
            },
            onScrollEnd: function () {
                if ($pullDownEl.hasClass("flip")) {
                    $pullDownEl.addClass("scroll-loading");
                    that.defaultOption.refresh && that.defaultOption.refresh();
                }
            }
        });
        return this;
    }

    Scroll.prototype.getSimpleClickScroll = function (option) {
        option = option || {};
        $.extend(this.defaultOption, option);

        this.myScroll = new iScroll(this.defaultOption.wrapper, {
            useTransition: false,
            click: true
        });
        return this;
    }
    // 上滑加载
    Scroll.prototype.getOnlyDownScroll = function (option) {
        option = option || {};
        $.extend(this.defaultOption, option);
        var that = this;
        this.myScroll = new iScroll(this.defaultOption.wrapper, {
            useTransition: false,
            onScrollMove: function () {
                if (this.y - 120 < this.maxScrollY) {
                    that.defaultOption.loadMore && that.defaultOption.loadMore();
                }
            }
        });
        return this;
    }
    // 下拉刷新
    Scroll.prototype.getOnlyUpScroll = function (option) {
        option = option || {};
        $.extend(this.defaultOption, option);

        var pullDownEl, pullDownOffset, $pullDownEl;

        $pullDownEl = $(this.defaultOption.pullDownEl);

        pullDownEl = $pullDownEl[0];
        pullDownOffset = pullDownEl.offsetHeight;

        var that = this;
        this.myScroll = new iScroll(this.defaultOption.wrapper, {
            useTransition: false,
            topOffset: pullDownOffset,
            onRefresh: function () {
                if ($pullDownEl.hasClass('scroll-loading')) {
                    $pullDownEl.removeClass('scroll-loading flip');
                }
            },
            onScrollMove: function () {
                if (this.y > 5 && !$pullDownEl.hasClass("flip")) {
                    $pullDownEl.addClass("flip");
                    this.minScrollY = 0;
                } else if (this.y < 5 && $pullDownEl.hasClass("flip")) {
                    $pullDownEl.removeClass("flip");
                    this.minScrollY = -pullDownOffset;
                }
            },
            onScrollEnd: function () {
                if ($pullDownEl.hasClass("flip")) {
                    $pullDownEl.addClass("scroll-loading");
                    that.defaultOption.refresh && that.defaultOption.refresh();
                }
            }
        });
        return this;
    }

    Scroll.prototype.refresh = function () {
        this.myScroll && this.myScroll.refresh();
        return this;
    }

    return {
        getInstance: function () {
            return new Scroll();
        }
    }
});
