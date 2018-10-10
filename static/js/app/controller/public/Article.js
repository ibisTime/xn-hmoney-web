define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    var key = base.getUrlParam('key') || '1';

    init();

    function init() {
        base.showLoadingSpin();
        let wLi = $('.article-left li').eq(key);
        wLi.addClass('sel-li');
        $('.hmoney-tit').text(wLi.text());
        selContent(key);
        addListener();
    }

    function getSysConfig(ckey) {
        return GeneralCtr.getSysConfig(ckey).then((data) => {
            $("#content").html(data.cvalue);
        }, base.hideLoadingSpin)
    }

    function selContent(key){
        switch(key){
            case '1': 
                getSysConfig('about_us');
                break;
            case '2': 
                getSysConfig('service');
                break;
            case '3': 
                getSysConfig('privacy');
                break;
            case '5': 
                getSysConfig('privacy');
                break;
            case '6': 
                getSysConfig('privacy');
                break;
            case '7': 
                getSysConfig('privacy');
                break;
            case '8': 
                getSysConfig('privacy');
                break;
        }
    }

    function addListener() {
        $('.article-left li').click(function(e){
            let target = e.target;
            $(this).addClass('sel-li').siblings('li').not($('.art-tit')).removeClass('sel-li');
            $('.hmoney-tit').text($(this).text());
            selContent($(this).index().toString());
        })
    }
});