define([
    'app/controller/base',
    'app/interface/UserCtr'
], function(base, UserCtr) {
	
	if(!base.isLogin()){
		base.goLogin()
	}else{
		$("#left-wrap .security").addClass("on")
    	init();
	}
    
    function init() {
    	base.showLoadingSpin();
    	getUser();
        addListener();
    }
    
    //获取用户详情
    function getUser(){
    	return UserCtr.getUser().then((data)=>{
    		if(data.tradepwdFlag){
    			$(".setTradPwd .edit").removeClass("hidden")
    		}else{
    			$(".setTradPwd .set").removeClass("hidden")
    		}
    		
    		if(data.email){
    			$(".setEmail .edit").removeClass("hidden")
    		}else{
    			$(".setEmail .set").removeClass("hidden")
    		}
    		
    		if(data.googleAuthFlag){
    			$(".setGoogle .close").removeClass("hidden")
    		}else{
    			$(".setGoogle .open").removeClass("hidden")
    		}
    		
        base.hideLoadingSpin();
    	},base.hideLoadingSpin)
    }
    
    function addListener() {
    }
});
