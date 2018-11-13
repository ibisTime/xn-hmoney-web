define([
    'app/controller/base',
	'app/module/validate',
	'app/module/smsCaptcha',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate,smsCaptcha, UserCtr, Top, Foo) {
	let langType = localStorage.getItem('langType') || 'ZH';
	var type = base.getUrlParam("type");//设置类型： 0,设置  1，修改
	var isWallet = !!base.getUrlParam("isWallet");//钱包点击跳转过来

	if(!base.isLogin()){
		base.goLogin()
	}else{
		$("#left-wrap .security").addClass("on")
    	init();
	}

    function init() {
		base.showLoadingSpin();
		$('.tr-en_dq').text(base.getText('当前位置', langType));
		$('.tr-en_zx').text(base.getText('用户中心', langType));
		$('.tr-en_sz').text(base.getText('安全设置', langType));
		$('.tr-en_zj').text(base.getText('交易密码', langType));
		$('#getVerification').text(base.getText('获取验证码', langType));
		$('#subBtn').text(base.getText('确定', langType));
		$('#mobile').attr('placeholder', base.getText('请输入手机号', langType));
		$('#tradePwd').attr('placeholder', base.getText('请输入交易密码', langType));
		$('#smsCaptcha').attr('placeholder', base.getText('验证码', langType));

		if(langType == 'EN'){
			$('title').text('capital password-FUNMVP blockchain technology application experimental platform');
		}
		$('title').text('交易密码-FUNMVP区块链技术应用实验平台');

        if(base.getUserMobile()) {
            $("#mobile").val(base.getUserMobile());
            $("#mobile").siblings('.item-icon').addClass('icon-phone');
        } else {
            $("#mobile").val(base.getUserEmail());
            $("#mobile").siblings('.item-icon').addClass('icon-email');
        }
        addListener();
	}

    //设置交易密码
    function setTradePwd(tradePwd, smsCaptcha){
    	return UserCtr.setTradePwd(tradePwd, smsCaptcha).then(()=>{
			base.hideLoadingSpin()
			base.showMsg(base.getText('设置成功', langType));
			setTimeout(function(){
				base.gohrefReplace("../user/security.html")
			},800)
		},base.hideLoadingSpin)
    }

    //重设交易密码
    function changeTradePwd(tradePwd, smsCaptcha){
    	return UserCtr.changeTradePwd(tradePwd, smsCaptcha).then(()=>{
			base.hideLoadingSpin()
			base.showMsg(base.getText('修改成功', langType));
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
		// let reg = /^[a-z0-9._%-]+@([a-z0-9-]+\.)+[a-z]{2,4}$/;
		_formWrapper.validate({
			'rules': {
				"mobile": {
					required: true
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
