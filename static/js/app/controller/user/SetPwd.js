define([
    'app/controller/base',
	'app/module/validate',
	'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate,smsCaptcha, UserCtr, Top, Foo) {
	let langType = localStorage.getItem('langType') || 'ZH';
	if(!base.isLogin()){
		base.goLogin(1)
	}else{
		$("#left-wrap .security").addClass("on")
    	init();
	}

    function init() {
        $('.left-title').text(base.getText('用户中心'));
        $('.en_yhzl').text(base.getText('用户资料'));
        $('.uleft_en').text(base.getText('基本信息'));
        $('.identity').text(base.getText('身份验证'));
        $('.security').text(base.getText('安全设置'));
    	$('.position').text(base.getText('当前位置', langType) + '：');
        $('.pwd-en_yh').text(base.getText('用户中心', langType) + '>');
        $('.pwd-en_aq').text(base.getText('安全设置', langType) + '>');
        $('.pwd-en_dl').text(base.getText('登录密码', langType));
        $('.title').text(base.getText('登录密码', langType));
        $('#subBtn').text(base.getText('确定', langType));
        $('#oldLoginPwd').attr('placeholder', base.getText('请输入原密码', langType));
        $('#newLoginPwd').attr('placeholder', base.getText('请输入6-16位的新密码', langType));
        $('#renewLoginPwd').attr('placeholder', base.getText('请再次输入新密码', langType));
        if(langType == 'EN'){
            $('title').text('Login password-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('登录密码-FUNMVP区块链技术应用实验平台');
        base.hideLoadingSpin();
        addListener();
    }

    //重置密码
    function changePwd(oldLoginPwd, newLoginPwd){
    	return UserCtr.changePwd(oldLoginPwd, newLoginPwd).then(()=>{
			base.hideLoadingSpin()
			base.showMsg(base.getText('设置成功', langType))
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
