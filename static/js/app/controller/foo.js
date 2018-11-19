define([
  'app/controller/base',
  'app/interface/GeneralCtr'
], function (base, GeneralCtr) {
  let langType = localStorage.getItem('langType') || 'ZH';
  let srcList = {};

  getFooData();

  function init() {
    $('.foo-en_gj').text(base.getText('工具', langType));
    $('.en-help').text(base.getText('帮助中心', langType));
    $('.foo-en_pt').text(base.getText('平台介绍', langType));
    $('.foo-en_lx').text(base.getText('联系我们', langType));
    $('.foo-en_gg').text(base.getText('公告', langType));
    $('.foo-en_tk').text(base.getText('条款说明', langType));
    $('.foo-en_yhxy').text(base.getText('用户协议', langType));
    $('.foo-en_ystk').text(base.getText('隐私条款', langType));
    $('.foo-en_flsm').text(base.getText('法律声明', langType));
    $('.foo-en_fvsm').text(base.getText('费率说明', langType));

    if(langType === 'EN'){
      $('.contact-txt').css('width', '39%');
      $('.foo-en_buy').text('Buy FMVP');
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
      $('.foot-text').removeClass('hidden');
      $('.contact-info-wrap').removeClass('hidden');
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
