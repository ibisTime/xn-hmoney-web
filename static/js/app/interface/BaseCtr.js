define([
    'app/util/ajax'
], function(Ajax) {
    return {
		//更新登录时间
    	updateLoginTime(){
    		return Ajax.get("805083", {
				userId: sessionStorage.getItem("userId")
			}, true)
    	},
    	// 获取已发布币种列表
        getCoinList() {
            return Ajax.get("802267", {
            	status:'0'
            }, true);
        },
    };
})
