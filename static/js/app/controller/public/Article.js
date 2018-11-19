define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Ajax, GeneralCtr, Top, Foo) {
    var key = base.getUrlParam('key') || '1';
    let langType = localStorage.getItem('langType') || 'ZH';

    init();

    function init() {
        base.showLoadingSpin();
        if(langType == 'EN'){
            $('title').text('FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('FUNMVP区块链技术应用实验平台');
        $(".aboutUs").html(base.getText('关于我们'));
        $(".introduce").html(base.getText('平台介绍'));
        $(".contact").html(base.getText('联系我们'));
        $(".notice").html(base.getText('公告'));
        $(".terms").html(base.getText('条款说明'));
        $(".agreement").html(base.getText('用户协议'));
        $(".privacy").html(base.getText('隐私条款'));
        $(".legal").html(base.getText('法律声明'));
        $(".rate").html(base.getText('费率说明'));

        let setKey = key % 4 == 0 ? key - 4 : key % 4;
       let wLi = $('.article-left li').eq(setKey);
        wLi.addClass('sel-li');
        $('.hmoney-tit').text(wLi.text());
        selContent(key);
        addListener();
    }

    function getSysConfig(ckey) {
        return GeneralCtr.getSysConfig(ckey).then((data) => {
            base.hideLoadingSpin();
            $("#content").html(data.cvalue);
        }, base.hideLoadingSpin)
    }

    // 系统公告
    function notice() {
        return Ajax.post('805305', {
            start: '1',
            limit: '10',
            status: '1'
        });
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
                $("#content").html('');
                notice().then(data => {
                    let ggHtml = '';
                    data.list.forEach(item => {
                        ggHtml += `
                            <li>
                                <h5 style="font-size: 16px;font-weight: 400;">${item.content}</h5>
                                <p style="text-align: right; padding-right: 20px; font-size: 13px;">${base.formateDatetime(item.createDatetime)}</p>
                            </li>
                        `
                        $("#content").html(ggHtml);
                    })
                });
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
                $("#content").html('');
                getSysConfig('raw_note');
                break;
            case '8':
                $("#content").html('');
                getSysConfig('fee_note');
                break;
        }
    }

    function addListener() {
        $('.article-left li.article-item').click(function(e){
            let toKey = $(this).attr('data-key');
            base.gohref(base.changeURLArg(location.href, "key", toKey));
        })
    }
});