define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/util/ajax'
], function(base, GeneralCtr, Ajax) {
    init();
    getFooData();
    getAboutUs();
    // 获取Q社群
    function getFooData(){
        return GeneralCtr.getBanner({
            location: 'community',
            type: '6'
        }).then((data) => {
            let qHtml = '';
            if(data.length === 0){
                $('.foot-text').addClass('hidden');
            }else{
                var qrcode = new QRCode('qrcodeF', data[0].url);
                qrcode.makeCode(data[0].url);
            }
            data.forEach(item => {
                qHtml += `
                <div class="contact-info">
                    <div class="foo-tip">
                        <img src="${base.getAvatar(item.pic)}">
                        <div class="foo-qq">${item.name}：<span class="foo-url">${item.url}</span></div>
                    </div>
                </div>
                `
            })
            $('.contact-info-wrap').html(qHtml);
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
            $('#qrcodeF').addClass('hidden').empty();
            let qUrl = $('.foo-url').text();
            var qrcode = new QRCode('qrcodeF', qUrl);
            qrcode.makeCode(qUrl);
            setTimeout(() => {
                $('#qrcodeF').removeClass('hidden');
            }, 100);
        })
    }
})
