define([
    'app/controller/base',
    'pagination',
    'app/interface/UserCtr'
], function(base, pagination, UserCtr) {
	var type = base.getUrlParam("type");// 0: 你屏蔽的人，1:你信任的人，2:信任你的人
	var config={
	        start: 1,
	        limit: 10,
		};
	
	if(!base.isLogin()){
		base.goLogin()
	}else{
    	init();
	}
    
    function init() {
    	base.showLoadingSpin();
    	
		//你屏蔽的人
		if(type=='2'){
			$("title").text("信任您的人-倍可盈")
			$("#left-wrap .trustYou").addClass("on");
            config.type = type
            getPageTrust(config);
		//你信任的人
		}else if(type=='1'){
			$("title").text("您信任的人-倍可盈")
			$("#left-wrap .youTrust").addClass("on")
			config.type = type
			getPageTrust(config);
		//信任你的人
		}else if(type=='0'){
			$("title").text("您屏蔽的人-倍可盈")
			$("#left-wrap .youDefriend").addClass("on")
			config.type = type
			getPageTrust(config);
		}
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
                    getPageTrust(config);
                }
            }
        });
    }
    
    //分页获取关系
    function getPageTrust(params){
        return UserCtr.getPageTrust(params,true).then((data)=>{
            var lists = data.list;
    		if(data.list.length){
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
    			$("#content").html(html)
            	config.start == 1 && initPagination(data);
            }else{
            	$("#content").html("<tr><td class='tc'>暂无数据</td></tr>")
    			$("#pagination").addClass("hidden");
            }
            base.hideLoadingSpin();
    	},base.hideLoadingSpin)
    }
    
    function buildHtml(item){
    	var photoHtml = ""
    	if(item.toUserInfo.photo){
    		photoHtml = `<div class="photo goHref" style="background-image:url('${base.getAvatar(item.toUserInfo.photo)}')" data-href="./user-detail.html?userId=${item.toUserInfo.userId}"></div>`
		}else{
			var tmpl = item.toUserInfo.nickname.substring(0,1).toUpperCase();
			photoHtml = `<div class="photo"><div class="noPhoto goHref" data-href="./user-detail.html?userId=${item.toUserInfo.userId}">${tmpl}</div></div>`
		}
    	
    	return `<tr>
					<td>
						<div class="photoWrap">${photoHtml}</div>
					</td>
					<td><div class="txt1">${item.toUserInfo.nickname}</div></td>
					<td>
						<div class="txt2"><p>${item.toUserInfo.userStatistics.jiaoYiCount}</p><samp>交易次數</samp></div>
					</td>
					<td>
						<div class="txt2"><p>${item.toUserInfo.userStatistics.beiXinRenCount}</p><samp>信任人數</samp></div>
					</td>
					<td>
						<div class="txt2"><p>${base.getPercentum(item.toUserInfo.userStatistics.beiHaoPingCount,item.toUserInfo.userStatistics.beiPingJiaCount)}</p><samp>好評率</samp></div>
					</td>
				</tr>`;
//					<td>
//						<div class="txt2"><p>${item.toUserInfo.userStatistics.jiaoYiCount}</p><samp>歷史成交</samp></div>
//					</td>
//					<td class="jiaoYiCount">
//						<div class="txt1 tr">跟TA交易過<samp>0</samp>次</div>
//					</td>
    }
    
    function addListener() {
    }
});
