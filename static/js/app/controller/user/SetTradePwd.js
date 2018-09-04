define([
    'app/controller/base',
	'app/module/validate',
	'app/module/smsCaptcha',
    'app/interface/UserCtr'
], function(base, Validate,smsCaptcha, UserCtr) {
	var type = base.getUrlParam("type");//设置类型： 0,设置  1，修改 
	var isWallet = !!base.getUrlParam("isWallet");//钱包点击跳转过来
	
	if(!base.isLogin()){
		base.goLogin()
	}else{
		$("#left-wrap .security").addClass("on")
    	init();
	}
    
    function init() {
    	$("#mobile").val(base.getUserMobile())
    	
        base.hideLoadingSpin();
        addListener();
    }
    
    //设置资金密码
    function setTradePwd(tradePwd, smsCaptcha){
    	return UserCtr.setTradePwd(tradePwd, smsCaptcha).then(()=>{
			base.hideLoadingSpin()
			base.showMsg("设置成功")
			setTimeout(function(){
				base.gohrefReplace("../user/security.html")
			},800)
		},base.hideLoadingSpin)
    }
    
    //重设资金密码
    function changeTradePwd(tradePwd, smsCaptcha){
    	return UserCtr.changeTradePwd(tradePwd, smsCaptcha).then(()=>{
			base.hideLoadingSpin()
			base.showMsg("修改成功")
			setTimeout(function(){
				if(isWallet){
					base.gohrefReplace("../wallet/wallet-eth.html?isWithdraw=1")
				}else{
					base.gohrefReplace("../user/security.html")
				}
			},800)
		},base.hideLoadingSpin)
    }
    
    
    function addListener() {
    	var _formWrapper = $("#form-wrapper");
	    _formWrapper.validate({
	    	'rules': {
	        	"mobile": {
	        		required: true,
	        		mobile: true
	        	},
	        	"smsCaptcha": {
	        		required: true,
	        		sms: true
	        	},
	        	"tradePwd": {
	        		required: true,
	        		tradePwdLength: true,
	        	},
	    	},
	    	onkeyup: false
	    });
    	smsCaptcha.init({
			checkInfo: function() {
				return $("#mobile").valid();
			},
			bizType: type=='1'?"805067":"805066",
			id: "getVerification",
			mobile: "mobile",
			errorFn: function(){
			}
		});
		$("#subBtn").click(function(){
    		if(_formWrapper.valid()){
	    		base.showLoadingSpin();
	    		var params=_formWrapper.serializeObject()
	    		if(type=='0'){
	    			setTradePwd(params.tradePwd,params.smsCaptcha)
	    		}else if(type=='1'){
	    			changeTradePwd(params.tradePwd,params.smsCaptcha)
	    			
	    		}
	    		
	    	}
	    })
    }
});
