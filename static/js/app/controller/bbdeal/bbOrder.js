define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'pagination',
    'app/interface/AccountCtr'
], function(base, Ajax, GeneralCtr, pagination, AccountCtr) {
    let ortype = localStorage.getItem("type") || 'newaday';
    let userConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '10'
    };
    let hisConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '10'
    };

    let userOrderData = []; // 用户当前委托数据
    let userHistoryData = []; //用户历史委托数据

    init();

    function init() {
        addLister();
        // 判断是否登录
        if (!base.isLogin()) {
            base.goLogin();
            return false;
        } else {
            if (ortype == newaday) {
                getMyorderTicket(userConfig).then(data => {
                    userOrderData = data.list;
                    let userOrderHtml = '';
                    userOrderData.forEach(item => {
                        userOrderHtml += `<tr>
                            <td>${base.formatDate(item.createDatetime)}</td>
                            <td>${item.symbol}/${item.toSymbol}</td>
                            <td class="${item.direction == 0 ? 'or-mr' : 'or-mc'}">${item.direction == 0 ? '买入' : '卖出'}</td>
                            <td>委托方式</td>
                            <td>委托价</td>
                            <td>40.0000</td>
                            <td>587.4 USD</td>
                            <td>40.0000</td>
                            <td>0.0000</td>
                            <td>587.4 USD</td>
                            <td>
                                <button class="no-cz">取消</button>
                            </td>
                        </tr>`
                    })
                    $('.bb-table tbody').html(userOrderHtml);
                })
            } else {
                getMyHistoryData(hisConfig).then(data => {
                    userHistoryData = data.list;
                })
            }
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

    // 分页查询我的委托单
    function getMyorderTicket(config) {
        return Ajax.post('650058', config);
    }

    // 分页查询我的历史委托单
    function getMyHistoryData(config) {
        return Ajax.post('650059', config);
    }


    function addLister() {
        $('.bbOrder-wrap>p span').off('click').click(function() {
            $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
            localStorage.setItem('type', $(this).attr('data-type'));
        })
    }
})