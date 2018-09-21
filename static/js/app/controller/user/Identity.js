define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'app/module/qiniu',
    'app/interface/UserCtr'
], function(base, Ajax, GeneralCtr, QiniuUpdata, UserCtr) {

    let CerStatusList = {
        '0': '待审核',
        '1': '认证通过',
        '2': '认证不通过'
    }

    let imageSrcZ = '',
        imageSrcF = '';

    let userConfig = {
        applyUser: base.getUserId(),
        country: 'cn'
    }

    var sf_photoFile = [{
        '0': 'sf_photoFile1',
        '1': 'sf_photoFile-wrap1',
        '2': 'sf_subBtn'
    }, {
        '0': 'sf_photoFile2',
        '1': 'sf_photoFile-wrap2',
        '2': 'sf_subBtn'
    }, {
        '0': 'hz_photoFile1',
        '1': 'hz_photoFile-wrap1',
        '2': 'hz_subBtn'
    }, {
        '0': 'hz_photoFile2',
        '1': 'hz_photoFile-wrap2',
        '2': 'hz_subBtn'
    }, {
        '0': 'jz_photoFile1',
        '1': 'jz_photoFile-wrap1',
        '2': 'jz_subBtn'
    }, {
        '0': 'jz_photoFile2',
        '1': 'jz_photoFile-wrap2',
        '2': 'jz_subBtn'
    }]

    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .identity").addClass("on")
        init();
    }

    function init() {
        base.showLoadingSpin();
        $.when(
            getUser(),
            getQiniuToken(sf_photoFile)
            // getQiniuToken('', '', ''),
            // getQiniuToken('', '', ''),
            // getQiniuToken('', '', ''),
            // getQiniuToken('', '', ''),
            // getQiniuToken('', '', 'jz_subBtn'),
            // getQiniuToken('', '', 'jz_subBtn')
        )
        getUserCerRecords().then(data => {
            if (data.list.length == 0) {
                return false;
            }
        });
        addListener();
    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {

            if (data.realName) {
                $("#form-wrapper").setForm(data);
                $("#alreadyIdentity").removeClass("hidden")
            } else {
                $("#goAppIdentity").removeClass("hidden")
            }

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    // 分页查用户认证记录
    function getUserCerRecords() {
        return Ajax.post('805165', {
            limit: '10',
            start: '1',
            applyUser: base.getUserId()
        })
    }

    //加载七牛token
    function getQiniuToken(sf_photoFile) {
        return GeneralCtr.getQiniuToken().then((data) => {
            var token = data.uploadToken;
            base.showLoadingSpin();
            sf_photoFile.forEach(item => {
                QiniuUpdata.uploadInit({
                    btnId: item[0],
                    containerId: item[1],
                    starBtnId: item[2],
                    token: token
                })
            })

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }


    // 进行身份验证
    function userSFVerify(config) {
        return Ajax.post(' 805160', config);
    }


    function addListener() {
        // 展开、收起
        $('.yz_p').off('click').click(function() {
            if ($(this).children('span').text() == '收起') {
                $(this).parent().next().hide(200);
                $(this).children('span').text('展开');
                $(this).children('i').css('background-image', 'url(/static/images/展开.png)');
            } else {
                $('.form-detail').hide(200);
                $('.yz_p').children('span').text('展开');
                $('.yz_p').children('i').css('background-image', 'url(/static/images/展开.png)');
                $(this).parent().next().show(200);
                $(this).children('span').text('收起');
                $(this).children('i').css('background-image', 'url(/static/images/收起.png)');
            }
        })

        // 显示图片
        function showImg(that, isZf) {
            if ($(that).attr("data-src") != "") {
                if (isZf) {
                    imageSrcZ = $(that).attr("data-src");
                } else {
                    imageSrcF = $(that).attr("data-src");
                }
                let imgSrc = $(that).attr("data-src");
                $(that).next().css({ "background-image": "url('" + base.getPic(imgSrc) + "')" })
            }
        }

        //选择身份证图片
        //正
        $("#sf_photoFile1").bind('change', function() {
                showImg(this, true);
            })
            //反
        $("#sf_photoFile2").bind('change', function() {
            showImg(this, false);
        })

        //选择护照图片
        //正
        $('#hz_photoFile1').bind('change', function() {
                showImg(this, true);
            })
            //反
        $("#hz_photoFile2").bind('change', function() {
            showImg(this, false);
        })

        //选择驾照图片
        //正
        $('#jz_photoFile1').bind('change', function() {
                showImg(this, true);
            })
            //反
        $("#jz_photoFile2").bind('change', function() {
            showImg(this, false);
        })


        //身份验证
        $('#sf_subBtn').off('click').click(function() {
            userConfig.idFace = imageSrcZ;
            userConfig.idOppo = imageSrcF;
            userConfig.idKind = '1';
            userConfig.idNo = $('#idNo').val().trim();
            userConfig.realName = $('#realName').val().trim();
            userSFVerify(userConfig).then(data => {
                console.log(data);
            })
        })

        //护照认证
        $('#hz_subBtn').off('click').click(function() {
            userConfig.idFace = imageSrcZ;
            userConfig.idOppo = imageSrcF;
            userConfig.idKind = '2';
            userConfig.idNo = $('#hz_code').val().trim();
            userConfig.realName = $('#hz_name').val().trim();
            userSFVerify(userConfig).then(data => {
                console.log(data);
            })
        })

        //驾照认证
        $('#jz_subBtn').off('click').click(function() {
            userConfig.idFace = imageSrcZ;
            userConfig.idOppo = imageSrcF;
            userConfig.idKind = '3';
            userConfig.idNo = $('#jz_code').val().trim();
            userConfig.realName = $('#jz_name').val().trim();
            userSFVerify(userConfig).then(data => {
                console.log(data);
            })
        })
    }
});