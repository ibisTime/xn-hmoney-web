define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 七牛获取上传图片凭证
        getQiniuToken(fromCurrency, toCurrency) {
            return Ajax.get("630091");
        },
        // 发送短信
        sendCaptcha(bizType, mobile, sendCode) {
            var param = {
                bizType,
                sendCode
            }
            if (sendCode == '630093') {
                param.email = mobile
            } else {
                param.mobile = mobile
            }
            return Ajax.post(sendCode, param);
        },
        // 获取转化汇率
        getTransRate(fromCurrency, toCurrency) {
            return Ajax.get("002051", {
                fromCurrency,
                toCurrency
            });
        },
        /**
         * 分页查询系统公告
         * @param config {start, limit}
         */
        getPageSysNotice(config, refresh) {
            return Ajax.get("804040", {
                "pushType": 41,
                "toKind": 'C',
                "channelType": 4,
                "status": 1,
                "fromSystemCode": SYSTEM_CODE,
                ...config
            }, refresh);
        },
        // 查询数据字典列表
        getDictList(config, code) {
            return Ajax.get(code || "630036", config);
        },
        // 根据key查询系统参数
        getSysConfig(ckey, refresh) {
            return Ajax.get("630047", { ckey }, refresh);
        },
        // 根据type查询系统参数
        getSysConfigType(type, refresh) {
            return Ajax.get("630048", { type }, refresh);
        },
        // 分页查询系统参数
        getPageSysConfig(config, refresh) {
            return Ajax.get("630045", {
                start: 1,
                limit: 100,
                orderColumn: 'id',
                orderDir: 'asc',
                ...config
            }, refresh);
        },
        // 查询banner列表(前端导航)
        getBanner(config, btype) {
            return Ajax.get("630506", {
                type: '2',
                ...config
            }, true);
        },
        //获取腾讯云
        getTencunLogin() {
            return Ajax.get("805087", {
                userId: base.getUserId()
            });
        }
    };
})