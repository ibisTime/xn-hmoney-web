define([
    'app/controller/base',
    'pagination',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo'
], function (base, pagination, Ajax, GeneralCtr, TradeCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let userCTSList = [];

    let statusList = {}
    let typeList = {
        '0': base.getText('买入', langType),
        '1': base.getText('卖出', langType)
    }

    let j_config = {
        limit: '10',
        start: '1',
        userId: base.getUserId()
    }

    init();

    function init() {
        base.showLoadingSpin();
        $('.tradeRecord-wrap-title').text(base.getText('订单记录', langType));
        $('.wajl-en_lx').text(base.getText('类型', langType));
        $('.wajl-en_bz').text(base.getText('币种', langType));
        $('.wajl-en_zje').text(base.getText('总金额', langType));
        $('.date_n').text(base.getText('数量', langType));
        $('.date_li').text(base.getText('下单日期', langType));
        $('.wajl-en_zt').text(base.getText('状态', langType));
        $('.wajl-en_cz').text(base.getText('操作', langType));
        if(langType == 'EN'){
            $('title').text('orders records-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('订单记录-FUNMVP区块链技术应用实验平台');
        addListener();
        GeneralCtr.getDictList({
            "parentKey": "accept_order_status"
        }).then((data) => {
            data.forEach(item => {
                statusList[item.dkey] = item.dvalue;
            })
            getCTSFn(j_config);
        });
    }

    function getCTSFn(j_config) {
        getCTSData(j_config).then(data => {
            userCTSList = data.list;
            let ctsHtml = '';
            userCTSList.forEach(item => {
                let pHtml = '';
                if (item.type == 0) {
                    switch (item.status) {
                        case '0':
                            pHtml = `<p>
                                <span>${base.getText('标记付款', langType)}</span>
                                <span>${base.getText('取消订单', langType)}</span>
                                <span class="goHref" data-href="../wallet/wallet-det.html?code=${item.code}">${base.getText('详情', langType)}</span>
                                </p>`;
                            break;
                        default:
                            pHtml = `<p>
                                <span class="goHref" data-href="../wallet/wallet-det.html?code=${item.code}">${base.getText('详情', langType)}</span>
                            </p>`;
                    }
                }
                if (item.type == 1) {
                    switch (item.status) {
                        case '0':
                            pHtml = `<p>
                                <span>${base.getText('取消订单', langType)}</span>
                                <span class="goHref" data-href="../wallet/wallet-det.html?code=${item.code}">${base.getText('详情', langType)}</span>
                                </p>`;
                            break;
                        default:
                            pHtml = `<p>
                                <span class="goHref" data-href="../wallet/wallet-det.html?code=${item.code}">${base.getText('详情', langType)}</span>
                            </p>`;
                    }
                }

                ctsHtml += `<li>
                        <p class="${item.type == 0 ? 'd-mr' : 'd-mc'}">${typeList[item.type]}</p>
                        <p>${item.tradeCurrency}</p>
                        <p>${(Math.floor(item.tradeAmount * 100) / 100).toFixed(2)}</p>
                        <p class="date_num">${base.formatMoney(`${item.count}`, '', 'FMVP')}</p>
                        <p class="date_p">${base.formateDatetime(item.createDatetime)}</p>
                        <p>${statusList[item.status]}</p>
                        <div class="cz-type" data-code="${item.code}">
                        ${pHtml}
                        </div>
                    </li>`
            });

            $('.x-order_warp ul').html(ctsHtml);
            j_config.start == 1 && initPagination(data);
            addListener();
            base.hideLoadingSpin();

        }, base.hideLoadingSpin)
    }

    // 初始化交易记录分页器
    function initPagination(data) {
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: j_config.limit,
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
            callback: function (_this) {
                if (_this.getCurrent() != j_config.start) {
                    base.showLoadingSpin();
                    j_config.start = _this.getCurrent();
                    getCTSFn(j_config);
                }
            }
        });
    }

    //查询我的承兑商信息
    function getCTSData(j_config) {
        return Ajax.get('625287', j_config);
    }


    function addListener() {
        $('.cz-type span').off('click').click(function () {
            let selTxt = $(this).text();
            let code = $(this).parents('.cz-type').data('code');
            let config = {
                userId: base.getUserId(),
                code
            };
            switch (selTxt) {
                case base.getText('标记付款', langType):
                    TradeCtr.bjPlayfo(config).then(() => {
                        location.reload();
                    });
                    break;
                case base.getText('取消订单', langType):
                    TradeCtr.qxOrder(config).then(() => {
                        location.reload();
                    });
                    break;
            }
        })
    }
});