define([
    'app/controller/base',
	'app/module/validate',
	'app/module/smsCaptcha',
    'app/interface/UserCtr'
], function(base, Validate,smsCaptcha, UserCtr) {
	
	if(!base.isLogin()){
		base.goLogin(1)
	}else{
		$("#left-wrap .security").addClass("on")
    	init();
	}
    
    function init() {
    	
        base.hideLoadingSpin();
        addListener();
    }
    
    //重置密码
    function changePwd(oldLoginPwd, newLoginPwd){
    	return UserCtr.changePwd(oldLoginPwd, newLoginPwd).then(()=>{
			base.hideLoadingSpin()
			base.showMsg("设置成功")
			setTimeout(function(){
				base.logout()
			},800)
		},base.hideLoadingSpin)
    }
    
    function addListener() {
    	var _formWrapper = $("#form-wrapper");
	    _formWrapper.validate({
	    	'rules': {
	        	"oldLoginPwd": {
	        		required: true,
	        		minlength: 6,
	        	},
	        	"newLoginPwd": {
	        		required: true,
	        		minlength: 6,
	        	},
	        	"renewLoginPwd": {
	        		required: true,
	        		equalTo: "#newLoginPwd",
	        	},
	    	},
	    	onkeyup: false
	    });
		$("#subBtn").click(function(){
    		if(_formWrapper.valid()){
	    		base.showLoadingSpin();
	    		var params=_formWrapper.serializeObject()
	    		
    			changePwd(params.oldLoginPwd,params.newLoginPwd)
	    	}
	    })
    }
});
