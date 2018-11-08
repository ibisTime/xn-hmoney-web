define([
    'app/util/ajax'
], function(Ajax) {
    return {
        //获取游戏地址
        gramUrl() {
            return Ajax.get("600101", {}, true)
        },
        // 获取游戏余额
        gramMoney() {
            return Ajax.get("600104", {}, true);
        },
        // 充币
        rechargeGram(config) {
            return Ajax.get("600105", config);
        },
    };
})