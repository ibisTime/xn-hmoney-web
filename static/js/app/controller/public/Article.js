define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base,GeneralCtr) {
	var key = base.getUrlParam("key");
	
	init();
    
    function init() {
    	base.showLoadingSpin();
    	getSysConfig();
        addListener();
    }
    
    function getSysConfig(){
    	return GeneralCtr.getSysConfig(key).then((data)=>{
    		$("title").html(data.remark+"-倍可盈");
    		$("#content").html(data.cvalue);
    		base.hideLoadingSpin();
		},base.hideLoadingSpin)
    }
    
    function addListener() {
    }
});
