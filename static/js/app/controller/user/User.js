define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/interface/GeneralCtr',
    'app/module/qiniu',
    'app/controller/Top',
    'app/controller/foo'
], function(base, UserCtr, GeneralCtr, QiniuUpdata, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    if (!base.isLogin()) {
        base.goLogin();
        return;
    }

    init();

    function init() {
        base.showLoadingSpin();

        $('.user-en_tx').text(base.getText('更换头像', langType));
        $('.user-en_sf').text(base.getText('身份验证', langType) + '：');
        $('.user-en_em').text(base.getText('电子邮件', langType) + '：');
        $('.user-en_sj').text(base.getText('手机号码', langType) + '：');
        $('.user-en_zc').text(base.getText('注册时间', langType) + '：');
        $('.user-en_lj').text(base.getText('累计交易次数', langType) + '：');

        if(langType == 'EN'){
            $('.u-en').removeClass('none');
            $('title').text('user center-FUNMVP blockchain technology application experimental platform');
        }else{
            $('.u-zh').removeClass('none');
            $('title').text('用户中心-FUNMVP区块链技术应用实验平台');
        }
        $("#left-wrap .user").addClass("on")
        if ($("#head-user-wrap").hasClass("hidden")) {
            $("#head-user-wrap").removeClass("hidden")
        }

        addListener();
        $.when(
            getUser(),
            getQiniuToken()
        )
    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {

            if (data.photo) {
                $("#photo").css({ "background-image": "url('" + base.getAvatar(data.photo) + "')" })
            } else {
                var tmpl = data.nickname ? data.nickname.substring(0, 1).toUpperCase() : '';
                var photoHtml = `<div class="noPhoto">${tmpl}</div>`
                $("#photo").html(photoHtml)
            }

            $("#nickname").text(data.nickname)
            $("#createDatetime").html(base.formateDatetime(data.createDatetime))
            if (data.userStatistics) {
                $("#beiXinRenCount").text(data.userStatistics.beiXinRenCount);
                $("#beiXinRenCount1").text(data.userStatistics.beiXinRenCount);
                $("#jiaoYiCount").text(data.userStatistics.jiaoYiCount);
                $("#beiHaoPingCount").text(data.userStatistics.beiHaoPingCount);
                $("#beiHaoPingCount1").text(data.userStatistics.beiHaoPingCount);
            }

            if (data.email) {
                $("#email").text(data.email)
            } else {
                $("#email").text(base.getText('未绑定', langType)).addClass("no").click(function() {
                    base.gohref("./setEmail.html");
                });
            }
            if (data.mobile) {
                $("#mobile").text(data.mobile)
            } else {
                $("#mobile").text(base.getText('未绑定', langType)).addClass("no").click(function() {
                    base.gohref("./setPhone.html");
                });
            }
            if (data.idNo) {
                $("#idNo").text(base.getText('已验证', langType))
            } else {
                $("#idNo").text(base.getText('未验证', langType)).addClass("no").click(function() {
                    base.gohref("./identity.html");
                });
            }


            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    //加载七牛token
    function getQiniuToken() {
        return GeneralCtr.getQiniuToken().then((data) => {
            var token = data.uploadToken;

            base.showLoadingSpin();
            QiniuUpdata.uploadInit({
                btnId: 'photoFile',
                containerId: 'photoFile-wrap',
                starBtnId: 'subBtn',
                token: token
            })

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function changePhoto() {
        return UserCtr.changePhoto($("#editPhotoDialog .img-wrap .photoWrapSquare .photo").attr("data-src")).then((data) => {
            base.hideLoadingSpin();
            $("#editPhotoDialog").addClass("hidden")
            base.showMsg(base.getText('修改成功', langType));
            setTimeout(function() {
                location.reload(true);
            }, 800)
        }, base.hideLoadingSpin)
    }

    function addListener() {

        $("#editPhoto").click(function() {
            $("#editPhotoDialog").removeClass("hidden")
        })
        $("#editPhotoDialog .cancelBtn").click(function() {
            $("#editPhotoDialog").addClass("hidden");
            $("#editPhotoDialog .img-wrap .photoWrapSquare .photo").attr("data-src", "")
            $("#editPhotoDialog .img-wrap").addClass("hidden")
        })

        //选择图片
        $("#photoFile").bind('change', function() {
            if ($(this).attr("data-src") != "") {
                var src = $(this).attr("data-src");
                $("#editPhotoDialog .img-wrap").removeClass("hidden")
                $("#editPhotoDialog .img-wrap .photo").css({ "background-image": "url('" + base.getPic(src) + "')" })
                $("#editPhotoDialog .img-wrap .photo").attr("data-src", src)
            }

        })

        //提交按钮
        $("#subBtn").click(function() {
            var src = $("#editPhotoDialog .img-wrap .photoWrapSquare .photo").attr("data-src")
            if (src == "" || !src) {
                base.showMsg(base.getText('请选择图片', langType));
                return;
            }
            base.showLoadingSpin();
            changePhoto();
        })
    }
});