define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/AccountCtr',
    'app/interface/UserCtr',
    'app/interface/BaseCtr',
    'app/module/tencentCloudLogin'
], function(base, GeneralCtr, AccountCtr, UserCtr, BaseCtr, TencentCloudLogin) {
	
	//请求币种
	BaseCtr.getCoinList().then(function(data){
		var coinList = {};
		for(var i in data){
			coinList[data[i].symbol]={
				'coin':data[i].symbol,
				'unit':'1e'+data[i].unit,
				'name':data[i].cname,
				'type':data[i].type,
				'withdrawFeeString':data[i].withdrawFeeString
			}
		}
		sessionStorage.setItem("coinList",JSON.stringify(coinList))
		init();
	},function(){
		init();
	})
    
    
    // 初始化页面
    function init() {
			
		getCoinList();
		
    	$("#footTeTui").html(FOOT_TETUI)
		$("#footEmail").html(FOOT_EMAIL)
    	if(base.isLogin()){
    		$("#head-user-wrap .nickname").text(sessionStorage.getItem("nickname"))
    		$("#head-user-wrap").removeClass("hidden");
    		$.when(
    			getAccount(),
    			getBanner()
    		)
    	}else{
    		$("#head-button-wrap").removeClass("hidden");
    		$.when(
    			getBanner()
    		)
    	}
    	
    	addListener();
    }
    
    //根据config配置设置 头部币种下拉
    function getCoinList(){
    	var coinList = base.getCoinList();
    	var coinListKey = Object.keys(coinList);
    	var buyListHtml = '';
    	var sellListHtml = '';
    	var advListHtml = '';
    	
    	for(var i=0 ; i< coinListKey.length ; i++){
    		var tmpl = coinList[coinListKey[i]]
    		buyListHtml+=`<li class="goHref" data-href="../trade/buy-list.html?coin=${tmpl.coin.toLowerCase()}">${tmpl.coin}</li>`;
    		sellListHtml += `<li class="goHref" data-href="../trade/sell-list.html?coin=${tmpl.coin.toLowerCase()}">${tmpl.coin}</li>`;
    		advListHtml += `<li class="goHref" data-href="../trade/advertise.html?coin=${tmpl.coin.toLowerCase()}">${tmpl.coin}</li>`;
    	}
    	
    	//购买
    	$(".head-nav-wrap .buy .down-wrap ul").html(buyListHtml);
    	//购买
    	$(".head-nav-wrap .sell .down-wrap ul").html(sellListHtml);
    	//购买
    	$(".head-nav-wrap .advertise .down-wrap ul").html(advListHtml);
    }
    
    // 获取banner
    function getBanner(){
        return GeneralCtr.getBanner({}).then((data) => {
        	data.forEach((item) => {
        		if (item.location === 'web_download') {
	            	$('#downImg').attr("src",base.getPic(item.pic,"?imageMogr2/auto-orient/thumbnail/!280x280r"));
	        	} else if (item.location === 'web_qq') {
	            	$('#qqImg').attr("src",base.getPic(item.pic,"?imageMogr2/auto-orient/thumbnail/!280x280r"));
	        	} else if (item.location === 'web_weibo') {
	            	$('#wbImg').attr("src",base.getPic(item.pic,"?imageMogr2/auto-orient/thumbnail/!280x280r"));
	        	} else if (item.location === 'web_wechat') {
	            	$('#wxImg').attr("src",base.getPic(item.pic,"?imageMogr2/auto-orient/thumbnail/!280x280r"));
	        	} else if (item.location === 'web_trade') {
	            	$('#tradeBanner').css("background-image","url('"+base.getPic(item.pic,"?imageMogr2/auto-orient/thumbnail/!1200x90r")+"')");
	        	}
        	})
        }, (msg) => {
            base.showMsg(msg || "加载失败");
        });
    }
    
    //我的账户
    function getAccount(){
    	return AccountCtr.getAccount().then((data)=>{
    		var htmlAccount = '';
    		var html = '';
    		data.accountList.forEach(function(item, i){
    			
    			if(i<3){
    				//判断币种是否发布
	    			if(base.getCoinCoin(item.currency)){
	    				htmlAccount +=`<p>${item.currency}：<samp>${base.formatMoney(item.amountString,'',item.currency)}</samp></p>`;
	    			
		    			html += `<div class="list ${item.currency.toLocaleLowerCase()}">
							<p>${item.currency}</p>
							<p class="amount">${base.formatMoneySubtract(item.amountString,item.frozenAmountString,item.currency)}</p>
							<p class="frozenAmountString">${base.formatMoney(item.frozenAmountString,'',item.currency)}</p>
						</div>`;
	    			}
    			}
    		})
    		if(data.accountList.length>=3){
    				htmlAccount +=`<p class="more">查看更多</p>`;
	    			html += `<div class="list more">查看更多</div>`;
    			}
    		$("#head-user-wrap .wallet .wallet-account-wrap").html(htmlAccount);
    		$("#head-user-wrap .wallet .wallet-account-mx .listWrap").html(html)
    	},base.hideLoadingSpin)
    }
    
    function addListener(){
    	
    	$("#headLogout").click(function(){
    		base.logout()
    	})
    	$(".am-modal-mask").click(function(){
    		$(this).parent(".dialog").addClass("hidden")
    	})
    	
    	$("#head .head-nav-wrap .advertise .goHref").off("click").click(function(){
    		if(!base.isLogin()){
	    		base.goLogin();
	    		return false;
	    	}else{
	    		var thishref = $(this).attr("data-href");
				base.gohref(thishref)
	    	}
    	})
    	
    	$("#head .head-nav-wrap .invitation").off("click").click(function(){
    		if(!base.isLogin()){
	    		base.goLogin();
	    		return false;
	    	}else{
	    		var thishref = $(this).attr("data-href");
				base.gohref(thishref)
	    	}
    	})
    	
    	$("#head-user-wrap .isTradePwdFlag").click(function(){
    		var _this = $(this);
    		
    		UserCtr.getUser().then((data)=>{
    			if(data.tradepwdFlag&&data.realName){
    				base.gohref(_this.attr("data-href"))
    			}else if(!data.tradepwdFlag){
    				base.showMsg("請先設置資金密碼")
    				setTimeout(function(){
    					base.gohref("../user/setTradePwd.html?type=1")
    				},1800)
    			}else if(!data.realName){
    				base.showMsg("請先进行身份验证")
    				setTimeout(function(){
    					base.gohref("../user/identity.html")
    				},1800)
    			}
    		},base.hideLoadingSpin)
    	})
    }
});
