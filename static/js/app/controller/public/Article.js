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
                $("#content").html('');
                getSysConfig('about_us');
                break;
            case '2': 
                $("#content").html('');
                getSysConfig('service');
                break;
            case '3': 
                // getSysConfig('privacy');
                $("#content").html('暂无公告');
                break;
            case '5': 
                $("#content").html('');
                getSysConfig('reg_protocol');
                break;
            case '6': 
                $("#content").html('');
                getSysConfig('privacy');
                break;
            case '7': 
                // getSysConfig('privacy');
                $("#content").html('暂无申明');
                break;
            case '8': 
                // getSysConfig('privacy');
                $("#content").html('暂无说明');
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