define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询广告
         * @param config: {start, limit, maxPrice, minPrice, payType, tradeType(0买、1卖),coin}
         */
        getPageAdvertise(config, refresh) {
            return Ajax.get("625227", config, refresh); // new 625227 old 625228
        },
        /**
         * 分页查询广告 带userId,status
         * @param config: {start, limit, maxPrice, minPrice,payType,tradeType(0买、1卖),userId,status,coin}
         */
        getPageAdvertiseUser(config, refresh) {
            config.coin = '';
            return Ajax.post("625225", config, refresh);
        },
        getUserPageAdvertiseUser(config, refresh) {
            return Ajax.get("625228", config, refresh);
        },
        //用户昵称查询广告
        getListAdvertiseNickname(nickName, refresh) {
            return Ajax.get("625228", { nickName }, refresh);
        },
        /**
         * 发布/编辑广告
         * @param adsCode
         */
        submitAdvertise(config, refresh) {
            if (config.publishType == '3') {
                return Ajax.get("625221", {
                    operator: base.getUserId(),
                    userId: base.getUserId(),
                    ...config
                }, true);
            }
            return Ajax.get("625220", {
                operator: base.getUserId(),
                userId: base.getUserId(),
                ...config
            }, true);
        },
        //下架广告
        downAdvertise(adsCode) {
            return Ajax.get("625224", {
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
        getAdvertisePrice(coin, ctype) {
            let referCurrency = ctype || 'CNY';
            return Ajax.get("650102", {
                symbol: coin,
                referCurrency: referCurrency
            });
        },
        // 数字货币折合
        getNumberMoney(symbol, referCurrency){
            return Ajax.get('650102', {
                symbol,
                referCurrency
            })
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
        chatOrderBuy(adsCode) {
            return Ajax.get("625247", {
                buyUser: base.getUserId(),
                adsCode
            });
        },
        //出售开始聊天，提交交易订单
        chatOrderSell(adsCode) {
            return Ajax.get("625248", {
                sellUser: base.getUserId(),
                adsCode
            });
        },
        /**
         * 分页查询我的订单
         * @param config: {start, limit, statusList,tradeCoin}
         */
        getPageOrder(config, refresh) {
            return Ajax.get("625250", {
                belongUser: base.getUserId(),
                ...config
            }, refresh);
        },
        //获取订单详情
        getOrderDetail(code) {
            return Ajax.get("625251", {
                code
            }, true);
        },
        //訂單-取消交易
        cancelOrder(code) {
            return Ajax.get("625242", {
                updater: base.getUserId(),
                code
            });
        },
        //訂單-標記打款
        payOrder(code) {
            return Ajax.get("625243", {
                updater: base.getUserId(),
                code
            });
        },
        //訂單-解冻以太币
        releaseOrder(code) {
            return Ajax.get("625244", {
                updater: base.getUserId(),
                code
            });
        },
        //訂單-评价
        commentOrder(code, comment, content) {
            return Ajax.get("625245", {
                updater: base.getUserId(),
                code,
                starLevel: comment,
                content
            });
        },
        //个人-评价
        userEvaluate(config) {
            return Ajax.get("628279", config);
        },
        /**
         * 申請仲裁
         * @param config{code,reason}
         */
        arbitrationlOrder(config) {
            return Ajax.get("625246", {
                applyUser: base.getUserId(),
                ...config
            });
        },
        // 标记付款
        bjPlayfo(config) {
            return Ajax.get('625273', config);
        },
        // 取消订单
        qxOrder(config) {
            return Ajax.get('625272', config);
        },
        // 获取交易对
        getTradePair() {
            return Ajax.post("650100", {
                start: '1',
                limit: '10'
            }, true);
        }

    };
})