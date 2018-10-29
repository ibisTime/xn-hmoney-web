define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/AccountCtr',
    'app/interface/UserCtr',
    'app/interface/BaseCtr',
    'app/module/tencentCloudLogin'
], function (base, GeneralCtr, AccountCtr, UserCtr, BaseCtr, TencentCloudLogin) {

    //请求币种
    BaseCtr.getCoinList().then(function (data) {
        var coinList = {};
        for (var i in data) {
            coinList[data[i].symbol] = {
                'id': data[i].id,
                'coin': data[i].symbol,
                'unit': '1e' + data[i].unit,
                'name': data[i].cname,
                'type': data[i].type,
                'withdrawFeeString': data[i].withdrawFeeString
            }
        }
        sessionStorage.setItem("coinList", JSON.stringify(coinList))
        init();
    }, function () {
        init();
    })


    // 初始化页面
    function init() {
        base.showLoadingSpin();
        getCoinList();
        $("#footTeTui").html(FOOT_TETUI)
        $("#footEmail").html(FOOT_EMAIL)
        if (base.isLogin()) {
            $("#head-user-wrap .nickname").text(sessionStorage.getItem("nickname"))
            $("#head-user-wrap").removeClass("hidden");
            $.when(
                getAccount(), // 正式
                //getBanner() // 测试
            )
        } else {
            $("#head-button-wrap").removeClass("hidden");
            $.when(
                //getBanner()
            )
        }

        addListener();
    }

    //根据config配置设置 头部币种下拉
    function getCoinList() {
        var coinList = base.getCoinList();
        var coinListKey = Object.keys(coinList);
        var buyListHtml = '';
        var sellListHtml = '';
        var advListHtml = '';

        for (var i = 0; i < coinListKey.length; i++) {
            var tmpl = coinList[coinListKey[i]]
            buyListHtml += `<li class="goHref" data-href="../trade/buy-list.html?coin=${tmpl.coin.toLowerCase()}&mod=gm">${tmpl.coin}</li>`;
            sellListHtml += `<li class="goHref" data-href="../trade/sell-list.html?coin=${tmpl.coin.toLowerCase()}&mod=cs">${tmpl.coin}</li>`;
            advListHtml += `<li class="goHref" data-href="../trade/advertise.html?coin=${tmpl.coin.toLowerCase()}&mod=gg">${tmpl.coin}</li>`;
        }

        //购买
        $(".head-nav-wrap .buy .down-wrap ul").html(buyListHtml);
        //购买
        $(".head-nav-wrap .sell .down-wrap ul").html(sellListHtml);
        //购买
        $(".head-nav-wrap .advertise .down-wrap ul").html(advListHtml);
    }

    // 获取banner
    function getBanner() {
        return GeneralCtr.getBanner({}).then((data) => {
            data.forEach((item) => {
                if (item.location === 'web_download') {
                    $('#downImg').attr("src", base.getPic(item.pic, "?imageMogr2/auto-orient/thumbnail/!280x280r"));
                } else if (item.location === 'web_qq') {
                    $('#qqImg').attr("src", base.getPic(item.pic, "?imageMogr2/auto-orient/thumbnail/!280x280r"));
                } else if (item.location === 'web_weibo') {
                    $('#wbImg').attr("src", base.getPic(item.pic, "?imageMogr2/auto-orient/thumbnail/!280x280r"));
                } else if (item.location === 'web_wechat') {
                    $('#wxImg').attr("src", base.getPic(item.pic, "?imageMogr2/auto-orient/thumbnail/!280x280r"));
                } else if (item.location === 'web_trade') {
                    $('#tradeBanner').css("background-image", "url('" + base.getPic(item.pic, "?imageMogr2/auto-orient/thumbnail/!1200x90r") + "')");
                }
            })
        }, (msg) => {
            base.showMsg(msg || "加载失败");
        });
    }

    //我的账户
    function getAccount() {
        return AccountCtr.getAccount().then((data) => {
            var htmlAccount = '';
            var html = '';
            data.forEach(function (item, i) {

                if (i < 3) {
                    //判断币种是否发布
                    if (base.getCoinCoin(item.currency)) {
                        htmlAccount += `<p class="kk">${item.currency}：<samp>${base.formatMoney(`${item.amount}`,'',item.currency)}</samp></p>`;

                        html += `<div class="list ${item.currency.toLocaleLowerCase()}">
                            <p>${item.currency}</p>
                            <p class="amount">${base.formatMoneySubtract(`${item.amount}`,`${item.frozenAmount}`,item.currency)}</p>
                            <p class="frozenAmountString">${base.formatMoney(`${item.frozenAmount}`,'',item.currency)}</p>
                        </div>`;
                    }
                }
            })
            if (data.length >= 3) {
                htmlAccount += `<p class="more">查看更多</p>`;
                html += `<div class="list more">查看更多</div>`;
            }
            $("#head-user-wrap .wallet .wallet-account-wrap").html(htmlAccount);
            $("#head-user-wrap .wallet .wallet-account-mx .listWrap").html(html)
        })
    }

    function addListener() {

        $("#headLogout").click(function () {
            base.logout()
        })
        $(".am-modal-mask").on('click', function () {
            $(this).parent(".dialog").addClass("hidden")
        })

        $("#head .advertise .goHref").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref)
            }
        })

        $("#head .head-nav-wrap .advertise .goHref").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref)
            }
        })

        $("#head .head-nav-wrap .invitation").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref)
            }
        })

        $("#head .head-nav-wrap .store").off("click").click(function () {
            var thishref = $(this).attr("data-href");
            base.gohref(thishref)
        })

        $("#head .trade .goHref").off("click").click(function () {
            // var thishref = $(this).attr("data-href");
            // if ($(this).text() == '币币交易') {
            //     base.gohref(thishref);
            //     return false;
            // }
            // if (!base.isLogin()) {
            //     base.goLogin();
            //     return false;
            // } else {
            //     base.gohref(thishref)
            // }
        })

        $("body").on('click','.isTradePwdFlag', function () {
            var _this = $(this);

            UserCtr.getUser().then((data) => {
                if (data.tradepwdFlag) {
                    base.gohref(_this.attr("data-href"))
                } else if (!data.tradepwdFlag) {
                    base.showMsg("请先设置资金密码")
                    setTimeout(function () {
                        base.gohref("../user/setTradePwd.html?type=1")
                    }, 1800)
                } 
            }, base.hideLoadingSpin)
        })

        //中英文切换

        let langType = localStorage.getItem('langType') || 'zh';
        if(langType == 'en'){
            base.showLoadingSpin();
            $('.lang_select option.l-en').attr('selected', true);
            changeLanguageFn($(document));
        }else{
            base.hideLoadingSpin();
        }

        $('.lang_select').change(function(){
            switch($(this).val()){
                case 'zh': localStorage.clear('langType');break;
                case 'en': localStorage.setItem('langType', 'en');break;
            }
            location.reload();
        })
    }

    // langPackage 配置文件

    let langPackage = LANGUAGE;

    function changeLanguageFn(nodeObj){
        if (nodeObj.children().length > 0){
            nodeObj.children().each(function(){
                changeLanguageFn($(this));
                FindChsAndReplaceIt($(this), nodeObj.children());
            });
        } else {
            FindChsAndReplaceIt(nodeObj);
            base.hideLoadingSpin();
        }

        function FindChsAndReplaceIt(nodeObj, key){
            var pat = new RegExp("[\u4e00-\u9fa5]+","g");
            if ((nodeObj.text() || nodeObj.val() || nodeObj.attr("title")) 
                && (pat.exec(nodeObj.text()) || pat.exec(nodeObj.val()) || pat.exec(nodeObj.attr("title")))){
                var str = "";
                if (nodeObj.text()){
                    str = nodeObj.text();
                    ReplaceValue(str, nodeObj, "text", key);
                }
                if (nodeObj.val()){
                    str = nodeObj.val();
                    ReplaceValue(str, nodeObj, "val", key);
                }
                if (nodeObj.attr("title")){
                    str = nodeObj.attr("title");
                    ReplaceValue(str, nodeObj, "title", key);
                }
            }else{
                base.hideLoadingSpin();
            }
        } 

        function ReplaceValue(str, nodeObj, attrType, key){
            var arr;
            var pat = new RegExp("[\u4e00-\u9fa5]+","g");
            while((arr = pat.exec(str)) != null){
              if (langPackage[arr[0]]){
                  if(arr[0] == '多重保障资产安全' || arr[0] == '双向交易' || arr[0] == '快速方便'){
                      console.log(arr[0], nodeObj, key);
                  }
                  str = str.replace(arr[0], langPackage[arr[0]]['EN']);
                  if (attrType == "text"){
                    nodeObj.text(str);
                  }
                  else if (attrType == "val"){
                    nodeObj.val(str);
                  }
                  else if (attrType == "title"){
                    nodeObj.attr("title", str);
                  }
              }
            }
            base.hideLoadingSpin();
        }
    }

});