define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base,GeneralCtr) {
	
	init();
    
    function init() {
    	
        setTimeout(function(){
        	base.hideLoadingSpin();
        },100)
        
        addListener();
    }
    
    function addListener() {
    }
});
