define([
    'app/controller/base',
    'pagination',
    'app/util/ajax'
], function(base, pagination, Ajax) {

    let code = base.getUrlParam('code');
    let userCTSList = {};

    let typeList = {
        '0': '买入',
        '1': '卖出'
    }

    let zfType = {};

    let statusList = {
        '0': '待支付',
        '1': '待确认',
        '2': '已完成',
        '3': '已取消',
        '4': '平台已取消'
    }

    getBankData().then(data => {
        data.forEach(item => {
            zfType[item.bankCode] = item.bankName;
        })
    })

    getCTSData().then(data => {
        userCTSList = data;
        if (userCTSList.status == 0 || userCTSList.status == 1) {
            $('.cz-btn').removeClass('none');
        }
        if (userCTSList.status == 0) {
            $('.qx').removeClass('none');
        }
        if (userCTSList.status == 0 && userCTSList.type == 0) {
            $('.qr').removeClass('none');
        }
        $('.o-type').text(typeList[userCTSList.type]);
        $('.x-num').text(base.formatMoney(`${userCTSList.count}`, '', 'X'));
        $('.o-code').text(userCTSList.code);
        $('.o-all').text(userCTSList.tradeAmount);
        $('.o-status').text(statusList[userCTSList.status]);
        $('.o-date').text(base.formateDatetime(userCTSList.createDatetime));
        $('.o-money').text(userCTSList.tradeCurrency)

        $('.u-name').text(userCTSList.bankcard.realName);
        $('.u-kcode').text(userCTSList.receiveCardNo);
        $('.u-bank').text(userCTSList.receiveBank);
        $('.u-khu').text(userCTSList.receiveInfo);
        $('.u-type').text(zfType[userCTSList.receiveType]);
    })

    //查询我的承兑商信息
    function getCTSData() {
        return Ajax.get('625286', {
            userId: base.getUserId(),
            start: '1',
            limit: '10',
            code
        })
    }

    // 获取银行渠道
    function getBankData() {
        return Ajax.post('802116', {
            status: '1'
        })
    }

    // 标记付款
    function bjPlayfo(config) {
        return Ajax.get('625273', config);
    }

    // 取消订单
    function qxOrder(config) {
        return Ajax.get('625272', config)
    }

    addListener();

    function addListener() {
        $('.cz-btn button').off('click').click(function() {
            let selTxt = $(this).text();
            let config = {
                userId: base.getUserId(),
                code
            };
            switch (selTxt) {
                case '我已完成付款':
                    bjPlayfo(config).then(() => {
                        location.reload();
                    });
                    break;
                case '取消交易':
                    qxOrder(config).then(() => {
                        location.reload();
                    });
                    break;
            }
        })
    }
});