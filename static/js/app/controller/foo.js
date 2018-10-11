define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/util/ajax'
], function(base, GeneralCtr, Ajax) {
    let srcList = {};
    init();
    getFooData();
    getAboutUs();
    // 获取Q社群
    function getFooData(){
        return GeneralCtr.getBanner({
            location: 'community'
        }).then((data) => {
            let qHtml = '';
            if(data.length === 0){
                $('.foot-text').addClass('hidden');
            }else{
                $('#qrcodeF').children('img').prop('src', base.getAvatar(data[0].pic));
            }
            data.forEach(item => {
                srcList[item.name] = item.pic;
                qHtml += `
                <div class="contact-info">
                    <div class="foo-tip">
                        <img src="${item.type === 'qq' ? '/static/images/qq.png' : '/static/images/weixin.png'}">
                        <div class="foo-qq"><span class="fname">${item.name}</span>：<span class="foo-url">${item.url}</span></div>
                    </div>
                </div>
                `
            })
            $('.contact-info-wrap').html(qHtml);
            init();
        }, (msg) => {
            base.showMsg(msg || "加载失败");
        });
    }

    function getAboutUs(){
        return GeneralCtr.getSysConfig('service').then(data => {
            console.log('us', data);
        })
    }

    function init(){
        addListener();
    }

    function addListener(){
        $('.help').click(function(){
            location.href = HELPCONTENT;
        });
        
        $('.contact-info-wrap .contact-info').mouseenter(function(){
            let text = $(this).children('.foo-tip').children('.foo-qq').children('.fname').text();
            let src = srcList[text];
            $('#qrcodeF').children('img').prop('src', base.getAvatar(src));
        })
    }
})
