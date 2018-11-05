define([
  'app/controller/base',
  'app/interface/GeneralCtr'
], function (base, GeneralCtr) {
  let langType = localStorage.getItem('langType') || 'ZH';
  let srcList = {};

  getFooData();

  function init() {
    if(langType == 'EN'){
      $('.contact-txt').css('width', '39%');
    }
    addListener();
  }

  // 获取Q社群
  function getFooData() {
    return GeneralCtr.getBanner({
      location: 'community'
    }).then((data) => {
      let qHtml = '';
      if (data.length === 0) {
        $('.foot-text').addClass('hidden');
      } else {
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
      base.showMsg(msg || base.getText('加载失败', langType));
    });
  }
  // function getAboutUs() {
  //   return GeneralCtr.getSysConfig('service').then(data => {
  //     // console.log('us', data);
  //   })
  // }

  function addListener() {
    $('.help').click(function () {
      window.open(HELPCONTENT);
    });

    $('.contact-info-wrap .contact-info').mouseenter(function () {
      let text = $(this).children('.foo-tip').children('.foo-qq').children('.fname').text();
      let src = srcList[text];
      $('#qrcodeF').children('img').prop('src', base.getAvatar(src));
    })
  }
})
