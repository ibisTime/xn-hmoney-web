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
            data.forEach(item => {
                qHtml += `
                <div class="contact-info">
                    <div class="foo-tip">
                        <img src="${base.getAvatar(item.pic)}">
                        <div class="foo-qq">${item.name}：${item.url}</div>
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
        $('.help').click(function(){
            location.href = HELPCONTENT;
        })
    }
})
