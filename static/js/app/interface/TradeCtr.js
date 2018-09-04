define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询广告
         * @param config: {start, limit, maxPrice, minPrice, payType, tradeType(0买、1卖),coin}
         */
        getPageAdvertise(config,refresh) {
            return Ajax.get("625228", config, refresh);
        },
        /**
         * 分页查询广告 带userId,status
         * @param config: {start, limit, maxPrice, minPrice,payType,tradeType(0买、1卖),userId,status,coin}
         */
        getPageAdvertiseUser(config,refresh) {
            return Ajax.get("625227",config, refresh);
        },
        //用户昵称查询广告
        getListAdvertiseNickname(nickName,refresh) {
            return Ajax.get("625229", {nickName}, refresh);
        },
        /**
         * 发布/编辑广告
         * @param adsCode
         */
        submitAdvertise(config,refresh) {
            return Ajax.get("625220",{
            	userId: base.getUserId(),
                ...config
            }, true);
        },
        //下架广告
        downAdvertise(adsCode) {
            return Ajax.get("625224",{
            	userId: base.getUserId(),
                adsCode
            }, true);
        },
        // 获取广告详情
        getAdvertiseDetail(adsCode) {
            return Ajax.get("625226", {
            	adsCode
            });
        },
        // 获取广告价格
        getAdvertisePrice(coin) {
            return Ajax.get("625292", {
            	coin
            });
        },
        // 获取广告详情
        getAdvertiseDetail(adsCode) {
            return Ajax.get("625226", {
            	adsCode
            });
        },
        /**
         * 购买ETH
         * @param config{adsCode,count,tradeAmount,tradePrice}
         */
        buyETH(config) {
            return Ajax.get("625240", {
            	buyUser: base.getUserId(),
            	...config
            });
        },
        /**
         * 出售ETH
         * @param config{adsCode,count,tradeAmount,tradePrice}
         */
        sellETH(config) {
            return Ajax.get("625241", {
            	sellUser: base.getUserId(),
            	...config
            });
        },
        // 购买开始聊天，提交交易订单
        chatOrderBuy(adsCode){
        	return Ajax.get("625247", {
            	buyUser: base.getUserId(),
            	adsCode
            });
        },
        //出售开始聊天，提交交易订单
        chatOrderSell(adsCode){
        	return Ajax.get("625248", {
            	sellUser: base.getUserId(),
            	adsCode
            });
        },
        /**
         * 分页查询我的订单
         * @param config: {start, limit, statusList,tradeCoin}
         */
        getPageOrder(config,refresh) {
            return Ajax.get("625250",{
            	belongUser: base.getUserId(),
            	...config
            }, refresh);
        },
        //获取订单详情
        getOrderDetail(code) {
            return Ajax.get("625251",{
            	code
            }, true);
        },
        //訂單-取消交易
        cancelOrder(code) {
            return Ajax.get("625242",{
            	updater: base.getUserId(),
            	code
            });
        },
        //訂單-標記打款
        payOrder(code) {
            return Ajax.get("625243",{
            	updater: base.getUserId(),
            	code
            });
        },
        //訂單-释放以太币
        releaseOrder(code) {
            return Ajax.get("625244",{
            	updater: base.getUserId(),
            	code
            });
        },
        //訂單-评价
        commentOrder(code,comment) {
            return Ajax.get("625245",{
            	updater: base.getUserId(),
            	code,
            	comment
            });
        },
        /**
         * 申請仲裁
         * @param config{code,reason}
         */
        arbitrationlOrder(config) {
            return Ajax.get("625246",{
            	applyUser: base.getUserId(),
            	...config
            });
        },
        
        
    };
})


