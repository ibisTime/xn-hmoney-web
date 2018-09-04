define([
    'app/controller/base',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr',
    'app/interface/TradeCtr',
    'pagination',
], function(base, AccountCtr,GeneralCtr,TradeCtr, pagination) {
	var type = base.getUrlParam("type") || "sell";// buy: 购买，sell:出售
	var coin = base.getUrlParam("coin") || 'BTC'; // 币种
	var adsStatusValueList = {}; // 廣告狀態
	var config={
	    start:1,
        limit:10,
        tradeType: 1,
        statusList: [0],
        userId:base.getUserId(),
        coin: coin.toUpperCase()
    }
	init();

    function init() {
        base.showLoadingSpin();
        getCoinList();
    	if(type=='buy'){
			$("#left-wrap .buy-nav-item ."+coin.toLowerCase()).addClass("on");
			config.tradeType = 0;
    	}else if(type=='sell'){
			$("#left-wrap .sell-nav-item ."+coin.toLowerCase()).addClass("on")
    	}

        GeneralCtr.getDictList({"parentKey":"ads_status"}).then((data)=>{
            data.forEach(function(item){
                adsStatusValueList[item.dkey] = item.dvalue;
            });
            getPageAdvertise();
    	},base.hideLoadingSpin);
        addListener();
    }
	
    //根据config配置设置 币种列表
    function getCoinList(){
    	var coinList = base.getCoinList();
    	var coinListKey = Object.keys(coinList);
    	var buylistHtml = '';
    	var selllistHtml = '';
    	
    	for(var i=0 ; i< coinListKey.length ; i++){
    		var tmpl = coinList[coinListKey[i]]
    		buylistHtml+=`<div class="nav-item goHref buy ${tmpl.coin.toLowerCase()}" data-href="../user/advertise.html?type=buy&coin=${tmpl.coin.toLowerCase()}">${tmpl.coin}</div>`;
    		selllistHtml+=`<div class="nav-item goHref sell ${tmpl.coin.toLowerCase()}" data-href="../user/advertise.html?type=sell&coin=${tmpl.coin.toLowerCase()}">${tmpl.coin}</div>`;
    	}
    	
    	$("#left-wrap .buy-nav-item").html(buylistHtml);
    	$("#left-wrap .sell-nav-item").html(selllistHtml);
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

	// 获取广告列表
    function getPageAdvertise(refresh) {
        return TradeCtr.getPageAdvertiseUser(config,refresh).then((data)=>{
        	var lists = data.list;
    		if(data.list.length){
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
    			$("#content").html(html);
    			$(".trade-list-wrap .no-data").addClass("hidden")
            }else{
            	config.start == 1 && $("#content").empty()
    			config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        },base.hideLoadingSpin);

    }


    function buildHtml(item){
    	var operationHtml = ''
    	
    	//待发布
        if(config.statusList == null || config.statusList.length == 1) {
        	operationHtml = `<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=${item.code}&coin=${item.tradeCoin}">發佈</div>
        					<div class="am-button publish goHref" data-href="../trade/advertise.html?code=${item.code}&coin=${item.tradeCoin}">查看</div>`
        
        //已发布 
        }else{
        	//已上架
	        if(item.status=="1"){
	        	operationHtml = `<div class="am-button am-button-red mr20 doDownBtn" data-code="${item.code}">下架</div>`
	    	}
	        if(type=='buy'){
				operationHtml+=`<div class="am-button goHref" data-href="../trade/buy-detail.html?code=${item.code}&isD=1">查看详情</div>`
	    	}else if(type=='sell'){
				operationHtml+=`<div class="am-button goHref" data-href="../trade/sell-detail.html?code=${item.code}&isD=1">查看详情</div>`
	    	}
        }
    	
        return `<tr>
				<td class="price">${Math.floor(item.truePrice*100)/100}</td>
				<td class="price">${(item.premiumRate * 100).toFixed(2) + "%"}</td>
				<td class="createDatetime">${base.formateDatetime(item.createDatetime)}</td>
				<td class="status tc">${adsStatusValueList[item.status]}</td>
				<td class="operation">
					${operationHtml}
				</td>
			</tr>`

    }

    function addListener() {
        $(".titleStatus li").click(function(){
        	var _this = $(this)
        	_this.addClass("on").siblings('li').removeClass("on");
        	if(_this.hasClass("wait")){
        		config.statusList = ['0'];
        	}else if(_this.hasClass('already')){
        		config.statusList = ['1','2','3'];
        	}
        	config.start = 1;
        	base.showLoadingSpin();
        	getPageAdvertise(true);
        })
		
		$("#content").on("click", ".doDownBtn", function(){
			var adsCode = $(this).attr("data-code");
        	base.confirm("確認下架此廣告？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.downAdvertise(adsCode).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        			setTimeout(function(){
			            base.showLoadingSpin();
			            config.start = 1;
			            getPageAdvertise(true)
        			},1500)
        		},base.hideLoadingSpin)
        	},base.emptyFun)
		})
    }
});
