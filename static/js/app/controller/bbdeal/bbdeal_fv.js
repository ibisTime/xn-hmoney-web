define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'pagination',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Ajax, GeneralCtr, pagination, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let fvData = 0;
    let jyDataList = [];

    init();

    function init() {
        if(langType == 'EN'){
            $('title').text('fee rate-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('费率-FUNMVP区块链技术应用实验平台');
        getBazaarData().then(data => {
            jyDataList = data.list;
            let fvHtml = '';
            jyDataList.forEach(item => {
                fvHtml += `<tr>
                    <td>${item.symbol} / ${item.toSymbol}</td>
                    <td>${fvData}%</td>
                    <td>${fvData}%</td>
                </tr>`
            });
            $('.bb-table tbody').html(fvHtml);
        })

        GeneralCtr.getSysConfigType('simu_order_rule').then(data => {
            fvData = parseFloat(data.simu_order_fee_rate) * 100;
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)

    }

    // 市场（交易对）
    function getBazaarData() {
        return Ajax.post("650100", {
            start: '1',
            limit: '10'
        }, true);
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
            callback: function(_this) {
                if (_this.getCurrent() != hisConfig.start) {
                    base.showLoadingSpin();
                    hisConfig.start = _this.getCurrent();
                    getHistory(hisConfig);
                }
            }
        });
    }


    function addLister() {

    }
})