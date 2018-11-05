define([
    'app/controller/base',
    'pagination',
    'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/module/tencentCloudLogin/orderList',
    'app/controller/Top',
    'app/controller/foo',
    'app/controller/public/DealLeft'
], function(base, pagination, Validate, GeneralCtr, UserCtr, TradeCtr, TencentCloudLogin, Top, Foo, DealLeft) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var coin = base.getUrlParam("coin") || 'progress';
    var statusList = {
            "progress": ["-1", "0", "1", "5"],
            "end": ["2", "3", "4"]
        },
        typeList = {
            "buy": base.getText('购买', langType),
            "sell": base.getText('出售', langType),
        },
        statusValueList = {};
    var config = {
        start: 1,
        limit: 10,
        statusList: statusList[coin.toLowerCase()]
    };
    var unreadMsgList = {},
        lists = [];
    var isUnreadList = false,
        isOrderList = false;
    init();

    function init() {
        $(".head-nav-wrap .sell").addClass("active");
        $(".titleStatus li." + coin.toLowerCase()).addClass("on").siblings('li').removeClass('on');
        base.showLoadingSpin();
        TencentCloudLogin.goLogin(function(list) {
                unreadMsgList = list;
                isUnreadList = true;
                addUnreadMsgNum();
            }) // 测试
        GeneralCtr.getDictList({ "parentKey": "trade_order_status" }).then((data) => {
                data.forEach(function(item) {
                    statusValueList[item.dkey] = item.dvalue
                });
                getPageOrder();
            }, base.hideLoadingSpin)
            // getPageOrder(); // new
        addListener();
    }
    // 初始化分页器
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
                    getPageOrder(config);
                }
            }
        });
    }

    //分页查询订单
    function getPageOrder(refresh) {
        return TradeCtr.getPageOrder(config, refresh).then((data) => {
            lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content").html(html);
                isOrderList = true;
                addUnreadMsgNum()

                $(".trade-list-wrap .no-data").addClass("hidden")
            } else {
                config.start == 1 && $("#content").empty()
                config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            if(langType == 'EN'){
                $('.k-order-list .am-button').css({
                    'width': 'auto',
                    'padding-left': '6px',
                    'padding-right': '6px',
                });
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtml(item) {
        //头像
        var photoHtml = "";
        //操作按钮
        var operationHtml = '';
        //未读消息
        var unreadHtml = '';
        //交易数量
        var quantity = '';
        //类型
        var type = '';

        //当前用户为买家
        if (item.buyUser == base.getUserId()) {
            var user = item.sellUserInfo;

            type = 'sell';
            //待支付
            if (item.status == "0") {
                operationHtml = `<div class="am-button am-button-red payBtn" data-ocode="${item.code}">${base.getText('标记付款', langType)}</div>
								<div class="am-button am-button-out ml5 cancelBtn" data-ocode="${item.code}">${base.getText('取消交易', langType)}</div>`;
            } else if (item.status == "2") {
                if (item.bsComment != "0" && item.bsComment != "1") {
                    operationHtml = `<div class="am-button am-button-red commentBtn"  data-ocode="${item.code}">${base.getText('交易评价', langType)}</div>`
                }
            }
            //当前用户为卖家
        } else {
            var user = item.buyUserInfo;

            type = 'buy';
            //待支付
            if (item.status == "1") {
                operationHtml = `<div class="am-button am-button-red releaseBtn mr10" data-ocode="${item.code}">${base.getText('解冻货币', langType)}</div>`;
            } else if (item.status == "2") {
                if (item.sbComment != "0" && item.sbComment != "1") {
                    operationHtml = `<div class="am-button am-button-red commentBtn"  data-ocode="${item.code}">${base.getText('交易评价', langType)}</div>`
                }
            }
        }

        //操作按鈕
        //已支付，待解冻
        if (item.status == "1") {
            operationHtml += `<div class="am-button arbitrationBtn"  data-ocode="${item.code}">${base.getText('申请仲裁', langType)}</div>`
        }

        //待下单
        if (item.status == "-1") {
            operationHtml += `<div class="am-button cancelBtn"  data-ocode="${item.code}">${base.getText('取消订单', langType)}</div>`
        }

        if (user.photo) {
            photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(user.photo)}')"></div>`
        } else {
            var tmpl = user.nickname ? user.nickname.substring(0, 1).toUpperCase() : '-';
            photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
        }
        if (item.status != "-1") {
            let countNum = parseFloat(base.formatMoney(item.countString, '', item.tradeCoin));
            quantity = ((Math.floor(parseFloat(countNum) * 1000)) / 1000).toFixed(3)  + item.tradeCoin;
        }
        return `<tr data-code="${item.code}">
					<td class="nickname" style="border-left:1px solid #eee;">
                        <div class="photoWrap fl goHref" data-href="../user/user-detail.html?coin=${item.tradeCoin}&userId=${type == 'sell' ? item.sellUser : item.buyUser}&adsCode=${item.code}">
							${photoHtml}
						</div>
						<samp class="name k-name">${user.nickname ? user.nickname : '-'}</samp>
					</td>
					<td class="code">${item.code.substring(item.code.length-8)}</td>
					<td class="type">${typeList[type]}${item.tradeCoin?item.tradeCoin:'ETH'}</td>
					<td class="amount">${item.status!="-1"?item.tradeAmount+'CNY':''}</td>
					<td class="quantity">${quantity}</td>
					<td class="createDatetime">${base.datetime(item.createDatetime)}</td>
					<td class="status">${item.status=="-1"? base.getText('交谈中', langType) + ','+statusValueList[item.status]:statusValueList[item.status]}</td>
                    <td class="operation">
                        ${operationHtml}
                    </td>
					<td class="goDetail" style="padding-right: 0;">
						<samp class="unread goHref fl" data-href="../order/order-detail.html?code=${item.code}"></samp>
						<i class="icon icon-detail goHref fl"  data-href="../order/order-detail.html?code=${item.code}"></i>
					</td>
				</tr>`;
    }

    //添加未读消息数
    function addUnreadMsgNum() {
        if (isUnreadList && isOrderList) {
            $("#content tr").each(function() {
                var _this = $(this)
                var oCode = _this.attr("data-code")
                if (unreadMsgList[oCode] && unreadMsgList[oCode] != '0') {
                    if (unreadMsgList[oCode] >= 100) {
                        _this.find(".unread").html('(99+)')
                    } else {
                        _this.find(".unread").html('(' + unreadMsgList[oCode] + ')')
                    }
                }
            })
        }
    }

    function addListener() {
        // 进行中，已结束 点击
        $('.titleStatus.over-hide li').click(function() {
            var _this = $(this)
            _this.addClass("on").siblings('li').removeClass("on");
            base.gohrefReplace("../order/order-list.html?coin=" + $(this).attr("data-coin").toUpperCase() + "&mod=dd");
            config.statusList = statusList[_this.attr("data-status")];
            config.start = 1;
            base.showLoadingSpin();
            getPageOrder(config);
        })

        //取消订单按钮 点击
        $("#content").on("click", ".operation .cancelBtn", function() {
            var orderCode = $(this).attr("data-ocode");
            base.confirm(base.getText('确认取消交易？', langType), base.getText('取消', langType), base.getText('确定', langType)).then(() => {
                base.showLoadingSpin()
                TradeCtr.cancelOrder(orderCode).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功', langType));
                    setTimeout(function() {
                        base.showLoadingSpin();
                        getPageOrder(true)
                    }, 1500)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })

        //標記打款按钮 点击
        $("#content").on("click", ".operation .payBtn", function() {
            var orderCode = $(this).attr("data-ocode");
            base.confirm(base.getText('确认标记打款？', langType), base.getText('取消', langType), base.getText('确定', langType)).then(() => {
                base.showLoadingSpin()
                TradeCtr.payOrder(orderCode).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功', langType));
                    setTimeout(function() {
                        base.showLoadingSpin();
                        getPageOrder(true)
                    }, 1500)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })

        //申請仲裁按钮 点击
        $("#content").on("click", ".operation .arbitrationBtn", function() {
            var orderCode = $(this).attr("data-ocode");

            $("#arbitrationDialog .subBtn").attr("data-ocode", orderCode);
            $("#arbitrationDialog").removeClass("hidden")

        })

        

        //彈窗-放棄
        $("#arbitrationDialog .closeBtn").click(function() {
            $("#arbitrationDialog").addClass("hidden");
            $("#form-wrapper .textarea-item").val("")
        })

        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                'reason': {
                    required: true
                },
            }
        })

        //彈窗-申請仲裁
        $("#arbitrationDialog .subBtn").click(function() {
            var orderCode = $(this).attr("data-ocode");
            var params = _formWrapper.serializeObject()
            base.showLoadingSpin()
            TradeCtr.arbitrationlOrder({
                code: orderCode,
                reason: params.reason
            }).then(() => {
                base.hideLoadingSpin();
                base.showMsg(base.getText('操作成功', langType));
                $("#arbitrationDialog").addClass("hidden");
                setTimeout(function() {
                    base.showLoadingSpin();
                    $("#form-wrapper .textarea-item").val("")
                    getPageOrder(true)
                }, 1500)
            }, base.hideLoadingSpin)
        })

        //交易评价按钮 点击
        $("#content").on("click", ".operation .commentBtn", function() {
            var orderCode = $(this).attr("data-ocode");
            $('#pjText').val('');
            $("#commentDialog .subBtn").attr("data-ocode", orderCode);
            $("#commentDialog").removeClass("hidden");
        })

        //解冻货币按钮 点击
        $("#content").on("click", ".operation .releaseBtn", function() {
            var orderCode = $(this).attr("data-ocode");
            base.confirm(base.getText('确认解冻货币？', langType), base.getText('取消', langType), base.getText('确定', langType)).then(() => {
                base.showLoadingSpin()
                TradeCtr.releaseOrder(orderCode).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功', langType));
                    setTimeout(function() {
                        base.showLoadingSpin();
                        getPageOrder(true)
                    }, 1500)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })

        //评价
        $("#commentDialog .comment-Wrap .item").click(function() {
            $(this).addClass("on").siblings(".item").removeClass("on")
        })

        $("#commentDialog .subBtn").click(function() {
            var orderCode = $(this).attr("data-ocode");
            var comment = $("#commentDialog .comment-Wrap .item.on").attr("data-value");
            var content = $('#pjText').val();

            base.showLoadingSpin();
            TradeCtr.commentOrder(orderCode, comment, content).then((data) => {
                base.hideLoadingSpin();
                if(data.filterFlag == '2'){
                    base.showMsg(base.getText('操作成功, 其中含有关键字，需平台进行审核', langType));
                }else{
                    base.showMsg(base.getText('操作成功', langType));
                }
                $("#commentDialog").addClass("hidden");
                setTimeout(function() {
                    base.showLoadingSpin();
                    $("#commentDialog .comment-Wrap .item").eq(0).addClass("on").siblings(".item").removeClass("on")
                    getPageOrder(true)
                }, 1500)
            }, base.hideLoadingSpin)
        })

    }
});