define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base,GeneralCtr, Top, Foo) {
	
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
