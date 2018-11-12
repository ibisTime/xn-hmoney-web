define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'pagination',
    'app/interface/AccountCtr',
    'app/controller/Top',
    'app/controller/foo'
], function (base, Ajax, GeneralCtr, pagination, AccountCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let hisConfig = {
        userId: base.getUserId(),
        start: '1',
        limit: '10'
    };

    let userHistoryData = []; //用户历史委托数据
    let userMxData = []; // 用户明细
    let statusValueList = {}; // 状态

    init();

    function init() {
        $('.tradeRecord-wrap-title').text(base.getText('币币交易订单', langType));
        $('.sel-sp').text(base.getText('历史委托', langType));
        $('.bbo-en_sj').text(base.getText('时间', langType));
        $('.bbo-en_yjd').text(base.getText('交易对', langType));
        $('.bbo-en_fx').text(base.getText('方向', langType));
        $('.bbo-en_wt').text(base.getText('委托价', langType));
        $('.bbo-en_zt').text(base.getText('状态', langType));
        $('.bbo-en_cz').text(base.getText('操作', langType));
        if(langType == 'EN'){
            $('.bbo-en_wtl').html(`amount(<i class="s-pr">BTC</i>)`);
            $('.bbo-en_ze').html(`total amount(<i class="tos-pr">BTC</i>)`);
            $('.bbo-en_ycj').html(`executed quantity(<i class="s-pr">FMVP</i>)`);
            $('.bbo-en_wcj').html(`unexecuted quantity(<i class="s-pr">FMVP</i>)`);
            $('.bbo-en_ycje').html(`executed amount(<i class="tos-pr">BTC</i>)`);
            $('.bbo-en_cjjj').html(`average price(<i class="tos-pr"></i>)`);
            $('.bbOrder-wrap .bborder-p').css('line-height', '1.5');
            $('title').text('Exchange orders-FUNMVP blockchain technology application experimental platform');
        }else{
            $('.bbo-en_wtl').html(`委托量(<i class="s-pr">BTC</i>)`);
            $('.bbo-en_ze').html(`总额(<i class="tos-pr">BTC</i>)`);
            $('.bbo-en_ycj').html(`已成交量(<i class="s-pr">FMVP</i>)`);
            $('.bbo-en_wcj').html(`未成交量(<i class="s-pr">FMVP</i>)`);
            $('.bbo-en_ycje').html(`已成交额(<i class="tos-pr">BTC</i>)`);
            $('.bbo-en_cjjj').html(`成交均价(<i class="tos-pr"></i>)`);
            $('title').text('币币交易订单-FUNMVP区块链技术应用实验平台');
        }
        // 判断是否登录
        if (!base.isLogin()) {
            base.goLogin();
            return false;
        } else {
            //状态
            GeneralCtr.getDictList({"parentKey": "simu_order_status"}).then((data) => {
                data.forEach(function (item) {
                    statusValueList[item.dkey] = item.dvalue
                })
                getHistory(hisConfig);
            })
        }

    }

    function getHistory(hisConfig) {
        getMyHistoryData(hisConfig, true).then(data => {
            userHistoryData = data.list;
            if (userHistoryData.length == 0) {
                $('.no-data').removeClass('hidden');
                return;
            }
            $('.tos-pr').text(userHistoryData[0].toSymbol);
            $('.s-pr').text(userHistoryData[0].symbol);
            let hisToryHtml = '';
            //(item.totalCount - item.tradedCount).toFixed(2)
            userHistoryData.forEach(item => {
                let isMarketBuy = item.direction == 0 && item.type == 0;
                let isMarketSell = item.direction == 1 && item.type == 0;
                hisToryHtml += `<li>
                            <div class="list-l">
                            <span>${base.formatDate(item.createDatetime)}</span>
                            <span>${item.symbol}/${item.toSymbol}</span>
                            <span class="${item.direction == 0 ? 'or-mr' : 'or-mc'}">${item.direction == 0 ? base.getText('买入', langType) : base.getText('卖出', langType)}</span>
                            <span>${item.type == 0 ? base.getText('市价', langType) : base.formatMoney(`${item.price}`, '', item.toSymbol)}</span>
                            <span>${isMarketBuy ? '-' : base.formatMoney(`${item.totalCount}`, '', item.symbol)}</span>
                            <span>${isMarketSell ? '-' : base.formatMoney(`${item.totalAmount}`, '', item.toSymbol)}</span>
                            <span>${base.formatMoney(`${item.tradedCount}`, '', item.symbol)}</span>
                            <span>${isMarketBuy ? '-' : base.formatMoney(`${item.totalCount - item.tradedCount}`, '', item.symbol)}</span>
                            <span>${base.formatMoney(`${item.tradedAmount}`, '', item.toSymbol)}</span>
                           <span>${item.avgPrice ? base.formatMoney(`${item.avgPrice}`, '', item.toSymbol) : '-'}</span>
                            <span>${statusValueList[item.status]}</span>
                            <span>
                                <button data-code="${item.code}" data-status="${item.status}" class="his-detail ${item.status == 4 ? 'dis-btn' : ''}">${base.getText('详情', langType)}</button>
                            </span>
                            </div>
                            <ul class="det-l">
                            </ul>
                        </li>`
            });
            $('.bborder-ul').html(hisToryHtml);
            hisConfig.start == 1 && initPagination(data);
            addLister();
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }


    // 初始化交易记录分页器
    function initPagination(data) {
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: hisConfig.limit,
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
                if (_this.getCurrent() != hisConfig.start) {
                    base.showLoadingSpin();
                    hisConfig.start = _this.getCurrent();
                    getHistory(hisConfig);
                }
            }
        });
    }

    // 分页查询我的历史委托单
    function getMyHistoryData(config) {
        return Ajax.post('650059', config);
    }

    function getMyDetailData(code) {
        return Ajax.post('650057', {
            orderCode: code,
            userId: base.getUserId(),
            start: '1',
            limit: '10'
        })
    }

    function addLister() {
        $('.his-detail').off('click').click(function () {
            let code = $(this).attr('data-code');
            let status = $(this).attr('data-status');
            getMyDetailData(code).then(data => {
                userMxData = data.list;
                let userMxHtml = `<div>
                    <span>${base.getText('时间', langType)}</span>
                    <span>${base.getText('价格', langType)}(<i>${userMxData[0].toSymbol}</i>)</span>
                    <span>${base.getText('数量', langType)}(<i>${userMxData[0].symbol}</i>)</span>
                    <span>${base.getText('成交额', langType)}(<i>${userMxData[0].toSymbol}</i>)</span>
                    <span>${base.getText('手续费', langType)}(<i>${userMxData[0].direction == 0 ? userMxData[0].symbol : userMxData[0].toSymbol}</i>)</span>
                </div>`;
                userMxData.forEach(item => {
                    userMxHtml += `<li>
                        <div>
                            <span>${base.formateDatetime(item.createDatetime)}</span>
                            <span>${base.formatMoney(`${item.tradedPrice}`, '', item.toSymbol)}</span>
                            <span>${base.formatMoney(`${item.tradedCount}`, '', item.symbol)}</span>
                            <span>${base.formatMoney(`${item.tradedAmount}`, '', item.toSymbol)}</span>
                            <span>${base.formatMoney(`${item.tradedFee}`, '', item.direction == 0 ? item.symbol : item.toSymbol)}</span>
                        </div>
                    </li>`
                })
                if (status != 4) {
                    $(this).parent().parent().next().html(userMxHtml).slideToggle(300);
                }
            })
        })
    }
})