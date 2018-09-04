define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 获取账户
        getAccount() {
            return Ajax.get("802503", {
                userId: base.getUserId()
            }, true);
        },
        /**
         * 分页查询流水
         * @param config: {start, limit, accountNumber, bizType,kind}
         */
        getPageFlow(config,refresh) {
            return Ajax.get("802524", {
            	...config
            }, refresh);
        },
        /**
         * 充值
         * @param config: {amount, openId}
         */
        recharge(config) {
            return Ajax.post("802710", {
                applyUser: base.getUserId(),
                channelType: 35,
                ...config
            });
        },
        /**
         * 取现
         * @param config: {accountNumber,amount,applyUser,applyNote,tradePwd,googleCaptcha}
         */
        withDraw(config) {
            return Ajax.post("802750", {
                applyUser: base.getUserId(),
                ...config
            });
        },
        /**
         * 分页查询地址
         * @param config: {address,limit,start,statusList,type,userId,currency}
         */
        getPageCoinAddress(config,refresh) {
            return Ajax.post("802175", {
                userId: base.getUserId(),
                type:'Y',
                statusList: ['0','1'],
                ...config
            },refresh);
        },
        /**
         * 新增地址
         * @param config: {address,googleCaptcha,isCerti,label,smsCaptcha,tradePwd,currency}
         */
        addCoinAddress(config) {
            return Ajax.post("802170", {
                userId: base.getUserId(),
                ...config
            },true);
        },
        //弃用地址
		deleteCoinAddress(code) {
            return Ajax.post("802171", {
                code
            },true);
        },
    };
})
