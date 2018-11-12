define([
    'app/controller/base',
    'pagination',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, pagination, TradeCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var userId = base.getUrlParam('userId');
    var nickname = base.getUrlParam('nickname');
    var isGood = {
        '0': base.getText('否', langType),
        '2': base.getText('是', langType)
    }
    var config = {
        start: 1,
        limit: 10,
        objectUserId: userId
    }
    init();
    function init() {
        $('.pj-en_pr').text(base.getText('评价人', langType));
        $('.pj-en_sfhp').text(base.getText('是否好评', langType));
        $('.pj-en_nr').text(base.getText('评价内容', langType));
        $('.pj-en_sj').text(base.getText('评价时间', langType));

        if(langType == 'EN'){
            $('.p-zh').addClass('none');
            $('.p-en').removeClass('none');
            $('title').text('evaluate-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('评价-FUNMVP区块链技术应用实验平台');
        base.showLoadingSpin();
        $('.userName').text(nickname);
        $.when(
            userEvaluate()
        ).then((data1, data2) => {
           
        })

    }

   // 查询用户评价
   function userEvaluate(){
       return TradeCtr.userEvaluate(config).then(data => {
        var lists = data.list;
        if (data.list.length) {
            var html = "";
            lists.forEach((item, i) => {
                html += buildHtml(item);
            });
            $("#content").html(html);
            $(".trade-list-wrap .no-data").addClass("hidden");
        } else {
            config.start == 1 && $("#content").empty()
            config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
        }
        config.start == 1 && initPagination(data);
        base.hideLoadingSpin();
        }, base.hideLoadingSpin);
   }

    function buildHtml(item) {
        return `<tr>
					<td class="currency">${item.user.nickname}</td>
                    <td class="payType">${isGood[item.starLevel]}</td>
					<td class="limit" colspan="2">${item.content ? item.content : '-'}</td>
                    <td class="payType">${base.formateDatetime(item.commentDatetime)}</td>
				</tr>`

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
                    userEvaluate();
                }
            }
        });
    }

});