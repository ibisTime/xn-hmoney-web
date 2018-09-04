define([
    'app/controller/base',
    'pagination',
    'app/interface/TradeCtr',
], function(base, pagination, TradeCtr) {
	var coin = base.getUrlParam("coin") || 'BTC'; // 币种
	//币种
	var config={
        start: 1,
        limit:10,
        tradeType: 0,
        coin: coin.toUpperCase()
	};
	var bizTypeList = {
            "0": "支付宝",
            "1": "微信",
            "2": "银行卡转账"
    	};
	
	init();
    
    function init() {
    	base.showLoadingSpin();
    	getCoinList();
    	$(".head-nav-wrap .sell").addClass("active");
    	$("#coin-top ul li."+coin.toLowerCase()).addClass("on");
    	getPageAdvertise();
        addListener();
    }
     //根据config配置设置 币种列表
    function getCoinList(){
    	var coinList = base.getCoinList();
    	var coinListKey = Object.keys(coinList);
    	var listHtml = '';
    	
    	for(var i=0 ; i< coinListKey.length ; i++){
    		var tmpl = coinList[coinListKey[i]]
    		listHtml+=`<li class="${tmpl.coin.toLowerCase()}" data-coin="${tmpl.coin}">${tmpl.name}(${tmpl.coin})</li>`;
    	}
    	$("#coin-top ul").html(listHtml);
    }
    
    // 初始化交易记录分页器
    function initPagination(data){
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: config.limit,
            jump: true,
            coping: true,
            prevContent: '<img src="/static/images/arrow---left.png" />',
            nextContent: '<img src="/static/images/arrow---right.png" />',
            keepShowPN: true,
            totalData: data.totalCount,
            jumpIptCls: 'pagination-ipt',
            jumpBtnCls: 'pagination-btn',
            jumpBtn: '确定',
            isHide: true,
            callback: function(_this){
                if(_this.getCurrent() != config.start){
    				base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getPageAdvertise(config);
                }
            }
        });
    }
    
    //分页查询我的账户流水
    function getPageAdvertise(){
    	return TradeCtr.getPageAdvertise(config, true).then((data)=>{
    		var lists = data.list;
    		if(data.list.length){
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
    			$("#content").html(html);
    			$(".trade-list-wrap .no-data").addClass("hidden")
    			
    			$("#content .operation .goHref").off("click").click(function(){
		    		if(!base.isLogin()){
			    		base.goLogin();
			    		return false;
			    	}else{
			    		var thishref = $(this).attr("data-href");
						base.gohref(thishref)
			    	}
		    	})
    			
		    	$("#content .photoWrap").off("click").click(function(){
		    		if(!base.isLogin()){
			    		base.goLogin();
			    		return false;
			    	}else{
			    		var thishref = $(this).attr("data-href");
						base.gohref(thishref)
			    	}
		    	})
            }else{
            	config.start == 1 && $("#content").empty()
    			config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
    	},base.hideLoadingSpin)
    }
    
    function buildHtml(item){
    	var photoHtml = ""
    	if(item.user.photo){
    		photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(item.user.photo)}')"></div>`
		}else{
			var tmpl = item.user.nickname.substring(0,1).toUpperCase();
			photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
		}
		
		var loginStatus ='';
		var time = base.calculateDays(item.user.lastLogin, new Date())
		if(time <= 10){
			loginStatus= 'green'
		}else if(time <= 30){
			loginStatus= 'yellow'
		}else{
			loginStatus = 'gray'
		}
		var operationHtml = '';
    	
		if(item.userId == base.getUserId()){
			operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/advertise.html?code=${item.code}&coin=${item.tradeCoin}">編輯</div>`;
		}else{
			operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/sell-detail.html?code=${item.code}&coin=${item.tradeCoin}">出售${item.tradeCoin}</div>`;
		}
		
    	return `<tr>
					<td class="nickname">
						<div class="photoWrap fl goHref" data-href="../user/user-detail.html?coin=${item.tradeCoin}&userId=${item.userId}">
							${photoHtml}
							<div class="dot ${loginStatus}"></div>
						</div>
						<samp class="name">${item.user.nickname}</samp>
					</td>
					<td class="credit">
						<samp>交易<i>${item.user.userStatistics.jiaoYiCount}</i></samp> · <samp>好評度<i>${base.getPercentum(item.user.userStatistics.beiHaoPingCount,item.user.userStatistics.beiPingJiaCount)}</i></samp> · <samp>信任<i>${item.user.userStatistics.beiXinRenCount}</i></samp>
					</td>
					<td class="payType">${bizTypeList[item.payType]}</td>
					<td class="limit">${item.minTrade}-${item.maxTrade}CNY</td>
					<td class="price">${item.truePrice.toFixed(2)}CNY</td>
					<td class="operation">
						${operationHtml}
					</td>
				</tr>`
    }
    
    //用户昵称查询广告
    function getListAdvertiseNickname(nickName){
    	return TradeCtr.getListAdvertiseNickname(nickName, true).then((data)=>{
    		var lists = data;
    		if(lists.length){
                var html = "";
                lists.forEach((item, i) => {
                	if(item.tradeType == '0'){
                		html += buildHtml(item);
                	}
                });
    			$("#content").html(html);
    			$(".trade-list-wrap .no-data").addClass("hidden")
    			
    			$("#content .operation .goHref").off("click").click(function(){
		    		if(!base.isLogin()){
			    		base.goLogin();
			    		return false;
			    	}else{
			    		var thishref = $(this).attr("data-href");
						base.gohref(thishref)
			    	}
		    	})
		    	$("#content .photoWrap").off("click").click(function(){
		    		if(!base.isLogin()){
			    		base.goLogin();
			    		return false;
			    	}else{
			    		var thishref = $(this).attr("data-href");
						base.gohref(thishref)
			    	}
		    	})
            }else{
            	$("#content").empty()
    			$(".trade-list-wrap .no-data").removeClass("hidden")
            }
            base.hideLoadingSpin();
    	},base.hideLoadingSpin)
    	
    }
    
    function addListener() {
    	$("#searchTypeWrap .select-ul li").click(function(){
    		var _this = $(this);
    		var _thisType= $(this).attr("data-type")
    		
    		if($("#searchTypeWrap .show-wrap").attr("data-type")!=_thisType){
    			$("#searchTypeWrap .show-wrap").attr("data-type",_thisType);
    			$("#searchTypeWrap .show-wrap samp").text(_this.text());
    			$("#searchConWrap ."+_thisType).removeClass("hidden").siblings().addClass("hidden")
    		}
    	})
    	
    	$("#searchBtn").click(function(){
    		var _searchType= $("#searchTypeWrap .show-wrap").attr("data-type")
    		//搜广告
    		if(_searchType=="adver"){
    			
    			if($("#searchConWrap .minPrice").val()){
    				config.minPrice = $("#searchConWrap .minPrice").val();
    			}else{
    				delete config.minPrice;
    			}
    			if($("#searchConWrap .maxPrice").val()){
    				config.maxPrice = $("#searchConWrap .maxPrice").val();
    			}else{
    				delete config.maxPrice;
    			}
    			if($("#searchConWrap .payType").val()){
    				config.payType = $("#searchConWrap .payType").val();
    			}else{
    				delete config.payType
    			}
    			config.start=1;
    			base.showLoadingSpin();
    			
    			getPageAdvertise();
    		//搜用户
    		}else if(_searchType=="user"){
    			if($("#searchConWrap .nickname").val()!=""){
    				base.showLoadingSpin()
    				getListAdvertiseNickname($("#searchConWrap .nickname").val())
    			}
    		}
    	})
    	
    	//币种点击
    	$("#coin-top ul li").click(function(){
    		base.gohrefReplace("../trade/sell-list.html?coin="+$(this).attr("data-coin").toUpperCase())
    	})
    }
});
