define([
    'app/controller/base',
    'app/interface/UserCtr'
], function(base, UserCtr) {
	
	if(!base.isLogin()){
		base.goLogin()
	}else{
		$("#left-wrap .identity").addClass("on")
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
    		
    		if(data.realName){
    			$("#form-wrapper").setForm(data);
    			$("#alreadyIdentity").removeClass("hidden")
    		}else{
    			$("#goAppIdentity").removeClass("hidden")
    		}
    		
        	base.hideLoadingSpin();
    	},base.hideLoadingSpin)
    }
    
    function addListener() {
    }
});
