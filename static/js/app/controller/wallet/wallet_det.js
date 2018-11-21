define([
    'app/controller/base',
    'pagination',
    'app/util/ajax',
    'app/controller/Top',
    'app/controller/foo'
], function(base, pagination, Ajax,Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let code = base.getUrlParam('code');
    let userCTSList = {};

    let typeList = {
        '0': base.getText('买入', langType),
        '1': base.getText('卖出', langType)
    }

    let zfType = {};

    let statusList = {
        '0': base.getText('待支付', langType),
        '1': base.getText('待确认', langType),
        '2': base.getText('已完成', langType),
        '3': base.getText('已取消', langType),
        '4': base.getText('平台已取消', langType)
    }

    $('.tradeRecord-wrap-title').text(base.getText('订单记录', langType));
    $('.wadet-en_dd').text(base.getText('订单信息', langType));
    $('.wadet-en_lx').text(base.getText('类型', langType) + ':');
    $('.wadet-en_bsl').text(base.getText('币数量', langType) + ':');
    $('.wadet-en_ddh').text(base.getText('订单号', langType) + ':');
    $('.wadet-en_ze').text(base.getText('订单总额', langType));
    $('.wadet-en_ssf').text(base.getText('手续费', langType) + ':');
    $('.wadet-en_zt').text(base.getText('状态', langType) + ':');
    $('.wadet-en_sj').text(base.getText('下单时间', langType) + ':');
    $('.wadet-en_sk').text(base.getText('收款信息', langType));
    $('.wadet-en_skr').text(base.getText('收款人', langType) + ':');
    $('.wadet-en_skfs').text(base.getText('收款方式', langType) + ':');
    $('.wadet-en_zh').text(base.getText('账号', langType) + ':');
    $('.wadet-en_khh').text(base.getText('开户行', langType) + ':');

    if(langType == 'EN'){
        $('title').text('orders records-FUNMVP blockchain technology application experimental platform');
    }
    $('title').text('订单记录-FUNMVP区块链技术应用实验平台');

    getBankData().then(data => {
        data.forEach(item => {
            zfType[item.bankCode] = item.bankName;
        })
        getCTS();
    })

    function getCTS() {
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
            $('.x-num').text(base.formatMoney(`${userCTSList.count}`, '', 'FMVP'));
            $('.o-code').text(userCTSList.code);
            $('.o-all').text((Math.floor(userCTSList.tradeAmount * 100) / 100).toFixed(2));
            $('.o-status').text(statusList[userCTSList.status]);
            $('.o-date').text(base.formateDatetime(userCTSList.createDatetime));
            $('.o-money').text(userCTSList.tradeCurrency);
            $('.o-fee').text(base.formatMoney(`${userCTSList.fee}`, '', 'FMVP'));

            let realName = userCTSList.user.nickname;
            // 类型 买入
            if(userCTSList.type === '0') {
                realName = 'otc商家';
            }
            $('.u-name').text(realName);
            $('.u-kcode').text(userCTSList.receiveCardNo);
            $('.u-khu').text(userCTSList.receiveInfo);
            $('.u-type').text(zfType[userCTSList.receiveType]);
            if(userCTSList.receiveType === 'alipay'){
                $('.l-khu').addClass('hidden');
            }
        })
    }

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
        return Ajax.get('625272', config);
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
                case base.getText('我已完成付款', langType):
                    bjPlayfo(config).then(() => {
                        location.reload();
                    });
                    break;
                case base.getText('取消交易', langType):
                    qxOrder(config).then(() => {
                        location.reload();
                    });
                    break;
            }
        })
    }
});