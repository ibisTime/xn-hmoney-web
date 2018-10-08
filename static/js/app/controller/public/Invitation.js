define([
    'app/controller/base',
    'pagination',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, pagination, GeneralCtr, UserCtr) {
    var inviteCode = sessionStorage.getItem("inviteCode")
    var config = {
        start: 1,
        limit: 5,
        userId: base.getUserId()
    };
    let inviNumber = 0;

    init();

    function init() {
        // base.showLoadingSpin();
        $(".head-nav-wrap .advertise").addClass("active");//DOMAIN_NAME
        $("#invitationDialog .hrefWrap p").html(DOMAIN_NAME + "/user/register.html?inviteCode=" + inviteCode)
        var qrcode = new QRCode('qrcode', INVITATION_HREF + "/user/register.html?inviteCode=" + inviteCode);
        qrcode.makeCode(INVITATION_HREF + "/user/register.html?inviteCode=" + inviteCode);

        $.when(
            getInvitationHistory(config),
            getInvitation(),
            getSysConfig(),
            // getUserInviteProfit()
        )
        addListener();

    }

    //获取我推荐的人数和收益统计
    function getInvitation() {
        return UserCtr.getInvitation().then((data) => {
            let settleCount = base.formatMoney(`${data.nosettleCount + data.settleCount + data.unsettleCount}`, '', 'X');
            $('.inviteProfit').text(settleCount);
        }, base.hideLoadingSpin)
    }

    //获取用户收益
    function getUserInviteProfit() {
        return UserCtr.getUserInviteProfit().then((data) => {
            if (data.length > 0) {
                $(".inviteProfit").html(inviteProfit + data[0].coin.symbol + "<i class='more'>查看更多</i>");

                var html = '';
                data.forEach((item) => {
                    html += `<tr>
							<td><div class="img"><img src="${base.getPic(item.coin.icon,"?imageMogr2/auto-orient/thumbnail/!150x150r")}"/></div></td>
							<td><div>${item.coin.cname}(${item.coin.symbol})</div></td>
							<td>
								<div>${base.formatMoney(item.inviteProfit,'',item.coin.symbol)}&nbsp;${item.coin.symbol}</div>
							</td>
						</tr>`
                })
                $("#inviteProfitList").html(html)
            }

            $(".inviteProfit i.more").on("click", function() {
                $("#inviteProfitDialog").removeClass("hidden")
            })
        })
    }

    //活动说明
    function getSysConfig() {
        return GeneralCtr.getSysConfig("activity_rule").then((data) => {
            $(".activity-content").html(data.cvalue.replace(/\n/g, '<br>'));
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
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
            jumpBtn: '确定',
            isHide: true,
            callback: function(_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getInvitationHistory(config);
                }
            }
        });
    }

    //获取推荐人历史
    function getInvitationHistory(refresh) {
        return UserCtr.getInvitationHistory(config, refresh).then((data) => {
            var lists = data.list;
            inviNumber = data.totalCount;
            $('.inviteCount').text(inviNumber);
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    let tradeAwardCount = base.formatMoney(`${item.tradeAwardCount}`, '', 'X')
                    let awardCount = (parseFloat(tradeAwardCount) + item.regAwardCount) + ' X ';
                    let tradeAwardTxt = `(交易佣金：${tradeAwardCount})`;
                    if(item.tradeAwardCount != 0){
                        awardCount += tradeAwardTxt;
                    }
                    html += `<tr>
                        <td>${item.nickname}</td>
                        <td>${base.datetime(item.createDatetime)}</td>
                        <td>${base.formatMoney(`${item.tradeCount}`, '', 'X')} X</td>
                        <td>${awardCount}</td>
                    </tr>`;
                });
                $("#yq-content").html(html);
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtml(item) {
        var photoHtml = ""
        if (item.photo) {
            photoHtml = `<div class="photo goHref" style="background-image:url('${base.getAvatar(item.photo)}')" data-href="../user/user-detail.html?userId=${item.userId}"></div>`
        } else {
            var tmpl = item.nickname.substring(0, 1).toUpperCase();
            photoHtml = `<div class="photo"><div class="noPhoto goHref" data-href="../user/user-detail.html?userId=${item.userId}">${tmpl}</div></div>`
        }

        return `<tr>
					<td>
						<div class="photoWrap">${photoHtml}</div>
					</td>
					<td><div class="txt1">${item.nickname}</div></td>
					<td class="credit">
						<p>交易${item.userStatistics.jiaoYiCount}&nbsp;·&nbsp;
						好评率${base.getPercentum(item.userStatistics.beiHaoPingCount,item.userStatistics.beiPingJiaCount)}&nbsp;·&nbsp;
						信任${item.userStatistics.beiXinRenCount}</p>
					</td>
					<td>
						<div class="datetime">${base.formatDate(item.createDatetime)}</div>
					</td>
				</tr>`;
    }

    function addListener() {
        $("#qrcodeBtn").click(function() {
            $("#qrcodeDialog").removeClass("hidden")
        })
        $("#invitationBtn").click(function() {
            $("#invitationDialog").removeClass("hidden")
        })


    }
});