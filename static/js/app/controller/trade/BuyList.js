define([
    'app/controller/base',
    'pagination',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo',
    'app/controller/public/DealLeft'
], function(base, pagination, TradeCtr, Top, Foo, DealLeft) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var coin = base.getUrlParam("coin"); // 币种
    //币种
    var config = {
        start: 1,
        limit: 10,
        tradeType: 1,
        coin: coin.toUpperCase()
    };
    var bizTypeList = {
        "0": base.getText('支付宝', langType),
        "1": base.getText('微信', langType),
        "2": base.getText('银行卡转账', langType)
    };

    init();

    function init() {
        $('.en_nick').text(base.getText('昵称', langType));
        $('.en_pay').text(base.getText('付款方式', langType));
        $('.en_count').text(base.getText('Avaliable', langType));
        $('.en_xe').text(base.getText('限额', langType));
        $('.en_price').text(base.getText('价格', langType));
        if(langType == 'EN'){
            $('.search-wrap .searchType-wrap').css('width', '200px');
            $('.search-wrap .search-con').css('width', '562px');
            $('.show-search').text('All currencies, all payment methods');
        }else{
            $('.show-search').text('全部货币，全部付款方式');
        }
        base.showLoadingSpin();
        getCoinList();
        $(".head-nav-wrap .sell").addClass("active");
        getPageAdvertise();
        addListener();
    }

    //根据config配置设置 币种列表
    function getCoinList() {
        var coinList = base.getCoinList();
        var coinListKey = Object.values(coinList);
        var listHtml = '';
        // coinListKey.length = 2;
        // coinListKey = coinListKey.filter(item => {
        //     return item.id > 1;
        // });
        // for (var i = coinListKey.length - 1; i > -1; i--) {
        //     var tmpl = coinListKey[i]
        //     listHtml += `<li class="${tmpl.coin.toLowerCase()}" data-coin="${tmpl.coin}">${tmpl.coin}</li>`;
        // }
        for (var i = 0; i < coinListKey.length; i++) {
            var tmpl = coinListKey[i]
            listHtml += `<li class="${tmpl.coin.toLowerCase()}" data-coin="${tmpl.coin}">${tmpl.coin}</li>`;
        }
        $("#coin-top ul").html(listHtml);
        if (coin) {
            $("#coin-top ul li." + coin.toLowerCase()).addClass("on");
        } else {
            $("#coin-top ul li:nth-of-type(1)").addClass("on");
            config.coin = coinListKey[0].coin.toUpperCase();
        }
    }

    // 初始化交易记录分页器
    function initPagination(data) {
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: config.limit,
            jump: true,
            coping: true,
            prevContent: '<img src="/static/images/arrow---left.png" />',
            nextContent: '<img src="/static/images/arrow---right.png" />',
            keepShowPN: true,
            totalData: data.totalCount,
            jumpIptCls: 'pagination-ipt',
            jumpBtnCls: 'pagination-btn',
            jumpBtn: base.getText('确定', langType),
            isHide: true,
            callback: function(_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getPageAdvertise();
                }
            }
        });
    }

    //分页查询广告
    function getPageAdvertise() {
        return TradeCtr.getPageAdvertise(config, true).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content").html(html);
                $(".trade-list-wrap .no-data").addClass("hidden")

                $("#content .operation .goHref").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
                $("#content .photoWrap").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
            } else {
                config.start == 1 && $("#content").empty()
                config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtml(item) {
        //头像
        var photoHtml = ""
        if (item.user.photo) {
            photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(item.user.photo)}')"></div>`
        } else {
            var tmpl = item.user.nickname.substring(0, 1).toUpperCase();
            photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
        }

        //登录状态
        var loginStatus = '';
        var time = base.calculateDays(item.user.lastLogin, new Date())
        if (time <= 10) {
            loginStatus = 'green'
        } else if (time <= 30) {
            loginStatus = 'yellow'
        } else {
            loginStatus = 'gray'
        }

        var operationHtml = '';

        if (item.userId == base.getUserId()) {
            operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/advertise.html?code=${item.code}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`;
        } else {
            operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/buy-detail.html?code=${item.code}">${base.getText('购买', langType)}${item.tradeCoin}</div>`;
        }
        let hpCount = 0;
        if (item.userStatistics.beiPingJiaCount != 0) {
            hpCount = base.getPercentum(item.userStatistics.beiHaoPingCount, item.userStatistics.beiPingJiaCount);
        }
        let payTypeList = {
            '0': '/static/images/pay-zfb.png',
            '1': '/static/images/pay-bankcard.png',
            '2': '/static/images/pay-weChat.png',
        };

        let payTypeHtml = ``;
        if (payTypeList[item.payType]) {
            payTypeHtml = `<i class="icon" style="background-image: url('${payTypeList[item.payType]}')"></i>`;
        } else {
            payTypeHtml = bizTypeList[item.payType];
        }
        return `<tr>
					<td class="nickname" style="padding-left: 20px;">
						<div class="photoWrap fl goHref" data-href="../user/user-detail.html?coin=${item.tradeCoin}&userId=${item.userId}&adsCode=${item.code}" style="margin-right: 10px;">
							${photoHtml}
							<div class="dot ${loginStatus}"></div>
						</div>
                        <samp class="name">${item.user.nickname ? item.user.nickname : '-'}</samp>
                        <p class="n-dist"><samp>${base.getText('交易', langType)}<i>${item.userStatistics.jiaoYiCount}</i></samp> ·
                            <samp>${base.getText('好评度', langType)}<i>${hpCount}</i></samp> ·
                            <samp>${base.getText('信任', langType)}<i>${item.userStatistics.beiXinRenCount}</i></samp>
                        </p>
					</td>
					<td class="avaliable">${base.formatMoney(item.leftCountString, '', item.tradeCoin)}</td>
					<td class="limit">${item.minTrade}-${item.maxTrade} ${item.tradeCurrency}</td>
					<td class="price">${item.truePrice.toFixed(2)} ${item.tradeCurrency}</td>
					<td class="payType">${payTypeHtml}</td>
					<td class="operation">
						${operationHtml}
					</td>
				</tr>`
    }

    //用户昵称查询广告
    function getListAdvertiseNickname(nickName) {
        return TradeCtr.getListAdvertiseNickname(nickName, true).then((data) => {
            var lists = data;
            if (lists.length) {
                var html = "";
                lists.forEach((item, i) => {
                    if (item.tradeType == '1s') {
                        html += buildHtml(item);
                    }
                });
                $("#content").html(html);
                $(".trade-list-wrap .no-data").addClass("hidden")

                $("#content .operation .goHref").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
                $("#content .photoWrap").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
            } else {
                $("#content").empty()
                $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)

    }

    function addListener() {
        $("#searchTypeWrap .select-ul li").click(function() {
            var _this = $(this);
            var _thisType = $(this).attr("data-type")

            if ($("#searchTypeWrap .show-wrap").attr("data-type") != _thisType) {
                $("#searchTypeWrap .show-wrap").attr("data-type", _thisType);
                $("#searchTypeWrap .show-wrap samp").text(_this.text());
                $("#searchConWrap ." + _thisType).removeClass("hidden").siblings().addClass("hidden")
            }
        })

        $("#searchBtn").click(function() {
            var _searchType = $("#searchTypeWrap .show-wrap").attr("data-type");
            //搜广告
            if (_searchType == "adver") {
                if ($("#searchConWrap .minPrice").val()) {
                    config.minPrice = $("#searchConWrap .minPrice").val();
                } else {
                    delete config.minPrice;
                }
                if ($("#searchConWrap .maxPrice").val()) {
                    config.maxPrice = $("#searchConWrap .maxPrice").val();
                } else {
                    delete config.maxPrice;
                }
                if ($("#searchConWrap .payType").val()) {
                    config.payType = $("#searchConWrap .payType").val();
                } else {
                    delete config.payType
                }
                if ($("#searchConWrap .payTypeMoney").val()) {
                    config.tradeCurrency = $("#searchConWrap .payTypeMoney").val();
                } else {
                    delete config.tradeCurrency
                }

                config.start = 1;
                base.showLoadingSpin();

                getPageAdvertise();
                //搜用户
            } else if (_searchType == "user") {
                if ($("#searchConWrap .nickname").val()) {
                    base.showLoadingSpin()
                    getListAdvertiseNickname($("#searchConWrap .nickname").val())
                }
            }
        })

        //币种点击
        $("#coin-top ul li").click(function() {
            base.gohref("../trade/buy-list.html?coin=" + $(this).attr("data-coin").toUpperCase() + "&mod=gm")
        })

        $('.show-search').click(() => {
            let reg = /none/g;
            if (reg.test($('.search-wrap').attr('class'))) {
                $('.search-wrap').removeClass('none');
            } else {
                $('.search-wrap').addClass('none');
            }
        })
    }
});