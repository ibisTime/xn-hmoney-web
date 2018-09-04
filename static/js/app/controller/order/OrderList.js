define([
    'app/controller/base',
    'pagination',
	'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/module/tencentCloudLogin/orderList'
], function(base, pagination, Validate, GeneralCtr, UserCtr, TradeCtr, TencentCloudLogin) {
	var statusList={
    	"inProgress":["-1","0","1","5"],
    	"end":["2","3","4"]
    },
    	typeList={
    	"buy":"購買",
    	"sell":"出售",
    },
    	statusValueList={};
	var config={
	    start:1,
        limit:10,
        statusList: statusList["inProgress"]
    };
    var unreadMsgList = {};
    var isUnreadList=false,isOrderList=false;
	init();
    
    function init() {
    	base.showLoadingSpin();
    	TencentCloudLogin.goLogin(function(list){
    		unreadMsgList = list;
    		isUnreadList = true;
    		addUnreadMsgNum();
    	})
    	GeneralCtr.getDictList({"parentKey":"trade_order_status"}).then((data)=>{
    		
    		data.forEach(function(item){
    			statusValueList[item.dkey] = item.dvalue
    		})
    		getPageOrder();
    	},base.hideLoadingSpin)
		
        addListener();
    }
    // 初始化分页器
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
                    getPageOrder(config);
                }
            }
        });
    }
    
    //分页查询订单
    function getPageOrder(refresh){
    	return TradeCtr.getPageOrder(config,refresh).then((data)=>{
            var lists = data.list;
    		if(data.list.length){
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
    			$("#content").html(html);
    			isOrderList = true;
    			addUnreadMsgNum()
    			
    			$(".trade-list-wrap .no-data").addClass("hidden")
            }else{
            	config.start == 1 && $("#content").empty()
    			config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
        	config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
    	},base.hideLoadingSpin)
    }
    
    function buildHtml(item){
    	//头像
    	var photoHtml = "";
    	//操作按钮
		var operationHtml = '';
		//未读消息
		var unreadHtml = '';
		//交易数量
		var quantity = '';
		//类型
		var type = '';
		
		//当前用户为买家
    	if(item.buyUser==base.getUserId()){
    		var user = item.sellUserInfo;
    		
    		type = 'sell';
    		//待支付
    		if(item.status=="0"){
				operationHtml=`<div class="am-button am-button-red payBtn" data-ocode="${item.code}">標記付款</div>
								<div class="am-button am-button-gray ml5 cancelBtn" data-ocode="${item.code}">取消交易</div>`;
			}else if(item.status=="2"){
				if(item.bsComment!="0"&&item.bsComment!="2"){
					operationHtml=`<div class="am-button am-button-red commentBtn"  data-ocode="${item.code}">交易評價</div>`
				}
			}
    	//当前用户为卖家
    	}else{
    		var user = item.buyUserInfo;
    		
    		type = 'buy';
    		//待支付
    		if(item.status=="1"){
				operationHtml=`<div class="am-button am-button-red releaseBtn mr10" data-ocode="${item.code}">释放货币</div>`;
			}else if(item.status=="2"){
				if(item.sbComment!="0"&&item.sbComment!="2"){
					operationHtml=`<div class="am-button am-button-red commentBtn"  data-ocode="${item.code}">交易評價</div>`
				}
			}
    	}
    	
    	//操作按鈕
    	//已支付，待释放
		if(item.status=="1"){
			operationHtml+=`<div class="am-button arbitrationBtn"  data-ocode="${item.code}">申请仲裁</div>`
		}
    	
    	if(user.photo){
    		photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(user.photo)}')"></div>`
		}else{
			var tmpl = user.nickname.substring(0,1).toUpperCase();
			photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
		}
		
		if(item.status!="-1"){
			quantity = base.formatMoney(item.countString,'',item.tradeCoin)+item.tradeCoin
		}
		
    	return `<tr data-code="${item.code}">
					<td class="nickname">
						<div class="photoWrap fl goHref" data-href="../user/user-detail.html?coin=${item.tradeCoin?item.tradeCoin:'ETH'}&userId=${user.userId}" >
							${photoHtml}
						</div>
						<samp class="name">${user.nickname}</samp>
					</td>
					<td class="code">${item.code.substring(item.code.length-8)}</td>
					<td class="type">${typeList[type]}${item.tradeCoin?item.tradeCoin:'ETH'}</td>
					<td class="amount">${item.status!="-1"?item.tradeAmount+'CNY':''}</td>
					<td class="quantity">${quantity}</td>
					<td class="createDatetime">${base.formateDatetime(item.createDatetime)}</td>
					<td class="status">${item.status=="-1"?'交谈中,'+statusValueList[item.status]:statusValueList[item.status]}</td>
					<td class="operation">
						${operationHtml}
					</td>
					<td class="goDetail">
						<samp class="unread goHref fl" data-href="../order/order-detail.html?code=${item.code}"></samp>
						<i class="icon icon-detail goHref fl"  data-href="../order/order-detail.html?code=${item.code}"></i>
					</td>
				</tr>`;
    }
    
    //添加未读消息数
    function addUnreadMsgNum(){
    	if(isUnreadList&&isOrderList){
    		$("#content tr").each(function(){
    			var _this = $(this)
    			var oCode = _this.attr("data-code")
				if(unreadMsgList[oCode]&&unreadMsgList[oCode]!='0'){
					if(unreadMsgList[oCode]>=100){
						_this.find(".unread").html('(99+)')
					}else{
						_this.find(".unread").html('('+unreadMsgList[oCode]+')')
					}
				}
			})
    	}
    }

    function addListener() {
        // 进行中，已结束 点击
        $('.titleStatus.over-hide li').click(function () {
            var _this = $(this)
            _this.addClass("on").siblings('li').removeClass("on");
            config.statusList = statusList[_this.attr("data-status")];
            config.start = 1;
            base.showLoadingSpin();
            getPageOrder(true)
        })
        
        //取消订单按钮 点击
        $("#content").on("click", ".operation .cancelBtn", function(){
        	var orderCode = $(this).attr("data-ocode");
        	base.confirm("確認取消交易？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.cancelOrder(orderCode).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        			setTimeout(function(){
			            base.showLoadingSpin();
			            getPageOrder(true)
        			},1500)
        		},base.hideLoadingSpin)
        	},base.emptyFun)
        })
        
        //標記打款按钮 点击
        $("#content").on("click", ".operation .payBtn", function(){
        	var orderCode = $(this).attr("data-ocode");
        	base.confirm("確認標記打款？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.payOrder(orderCode).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        			setTimeout(function(){
			            base.showLoadingSpin();
			            getPageOrder(true)
        			},1500)
        		},base.hideLoadingSpin)
        	},base.emptyFun)
        })
        
        //申請仲裁按钮 点击
        $("#content").on("click", ".operation .arbitrationBtn", function(){
        	var orderCode = $(this).attr("data-ocode");
        	
        	$("#arbitrationDialog .subBtn").attr("data-ocode", orderCode);
        	$("#arbitrationDialog").removeClass("hidden")
        	
        })
        
        //彈窗-放棄
        $("#arbitrationDialog .closeBtn").click(function(){
        	$("#arbitrationDialog").addClass("hidden");
        	$("#form-wrapper .textarea-item").val("")
        })
        
        var _formWrapper = $("#form-wrapper");
    	_formWrapper.validate({
    		'rules': {
    			'reason':{
    				required: true
    			},
    		}
    	})
        
        //彈窗-申請仲裁
        $("#arbitrationDialog .subBtn").click(function(){
        	var orderCode = $(this).attr("data-ocode");
        	var params = _formWrapper.serializeObject()
        	base.showLoadingSpin()
    		TradeCtr.arbitrationlOrder({
    			code: orderCode,
    			reason: params.reason
    		}).then(()=>{
    			base.hideLoadingSpin();
    			
    			base.showMsg("操作成功");
    			$("#arbitrationDialog").addClass("hidden");
    			setTimeout(function(){
		            base.showLoadingSpin();
        			$("#form-wrapper .textarea-item").val("")
		            getPageOrder(true)
    			},1500)
    		},base.hideLoadingSpin)
        })
        
        //交易評價按钮 点击
        $("#content").on("click", ".operation .commentBtn", function(){
        	var orderCode = $(this).attr("data-ocode");
        	$("#commentDialog .subBtn").attr("data-ocode",orderCode)
        	$("#commentDialog").removeClass("hidden")
        })
        
        //释放货币按钮 点击
        $("#content").on("click", ".operation .releaseBtn", function(){
        	var orderCode = $(this).attr("data-ocode");
        	base.confirm("確認释放货币？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.releaseOrder(orderCode).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        			setTimeout(function(){
			            base.showLoadingSpin();
			            getPageOrder(true)
        			},1500)
        		},base.hideLoadingSpin)
        	},base.emptyFun)
        })
        
        //評價
        $("#commentDialog .comment-Wrap .item").click(function(){
        	$(this).addClass("on").siblings(".item").removeClass("on")
        })
        
        $("#commentDialog .subBtn").click(function(){
        	var orderCode= $(this).attr("data-ocode");
        	var comment = $("#commentDialog .comment-Wrap .item.on").attr("data-value");
        	
        	base.showLoadingSpin();
        	TradeCtr.commentOrder(orderCode,comment).then(()=>{
    			base.hideLoadingSpin();
    			base.showMsg("操作成功");
    			$("#commentDialog").addClass("hidden");
    			setTimeout(function(){
		            base.showLoadingSpin();
		            $("#commentDialog .comment-Wrap .item").eq(0).addClass("on").siblings(".item").removeClass("on")
		            getPageOrder(true)
    			},1500)
    		},base.hideLoadingSpin)
        })
        
    }
});
