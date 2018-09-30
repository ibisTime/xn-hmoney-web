define([
    'app/controller/base',
    'pagination',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/util/ajax'
], function (base, pagination, Validate, smsCaptcha, AccountCtr, GeneralCtr, UserCtr, TradeCtr, Ajax) {
    var userAccountNum = base.getUrlParam('account'); // 用户编号
    var withdrawFee = 0; // 取现手续费
    let fvData = 0;
    var currency = base.getUrlParam("c") || 'BTC'; //币种
    currency = currency.toUpperCase() // 转换大写

    let href = location.href;
    let arrHref = href.split('.')[0].split('/');
    let ismx = arrHref[arrHref.length - 1];

    let moneyHS = 0;
    let zfType = {}; // 支付方式

    let moneyXZ = {};

    var config = {
            start: 1,
            limit: 10,
        },
        configAddress = {
            start: 1,
            limit: 10,
            currency: currency
        },
        accountNumber;

    var bizTypeList = {
            "0": "",
            "1": "charge",
            "2": "withdraw",
            "3": "ccorder_buy",
            "4": "ccorder_sell",
            "5": "ccorder_fee",
            "6": "withdraw_fee",
            "7": "award_reg",
            "8": "",
        },
        bizTypeValueList = {};

    var addAddressWrapperRules = {
            "label": {
                required: true,
            },
            "address": {
                required: true,
            },
            "smsCaptcha": {
                required: true,
                sms: true
            },
            "tradePwd": {},
            "googleCaptcha": {}
        },
        sendOutWrapperRules = {
            "accountNumber": {
                required: true,
            },
            "amount": {
                required: true,
                amountEth: true,
            },
            "tradePwd": {
                required: true,
            },
            "payCardNo": {
                required: true
            },
            "applyNote": {},
            "googleCaptcha": {}
        };

    if (!base.isLogin()) {
        base.goLogin()
    } else {
        init();
    }

    function init() {
        base.showLoadingSpin();
        $("#addWAddressMobile").val(base.getUserMobile());
        //$(".currency").text(currency);  测试
        getCoinList();
        // X币转换
        // 数字货币转换
        if(!userAccountNum){
            getNumberMoney('X', 'CNY').then(data => {
                moneyHS = parseFloat(data);
            });
        }
        getBankData().then(data => {
            data.forEach(item => {
                zfType[item.bankName] = item.bankCode
            })
        });
        //总资产
        UserCtr.userAllMoneyX('CNY').then(data => {
            console.log('总资产', data);
            $('.u-bb').text(data.symbol);
            $('.u-money').text(data.currency);
        })

        if (base.getGoogleAuthFlag() == "true" && base.getGoogleAuthFlag()) {
            $(".googleAuthFlag").removeClass("hidden");
            addAddressWrapperRules["googleCaptcha"] = {
                required: true,
                sms: true
            }
            sendOutWrapperRules["googleCaptcha"] = {
                required: true,
                sms: true
            }
        }

        $.when(
            GeneralCtr.getDictList({
                "parentKey": "jour_biz_type_user"
            }),
        ).then((data1, data2) => {

            data1.forEach(function (item) {
                bizTypeValueList[item.dkey] = item.dvalue
            })
            withdrawFee = base.formatMoney(base.getCoinWithdrawFee(currency), '', currency);

            $("#withdrawFee").val(withdrawFee + currency);
            getAccount();

        }, getAccount)
        addListener();
    }

    //根据config配置设置 币种列表
    function getCoinList() {
        var coinList = base.getCoinList();
        var coinListKey = Object.keys(coinList);
        var listHtml = '';

        for (var i = 0; i < coinListKey.length; i++) {
            var tmpl = coinList[coinListKey[i]]
            listHtml += `<li class="${tmpl.coin.toLowerCase()}" data-c='${tmpl.coin.toLowerCase()}'>${tmpl.name}(${tmpl.coin})</li>`;
        }

        $("#wallet-top ul").html(listHtml);

        $("#wallet-top ul").find('.' + currency.toLocaleLowerCase()).addClass("on")

        $("#wallet-top ul").on("click", "li", function () {
            var c = $(this).attr("data-c");

            base.gohrefReplace("./wallet.html?c=" + c)
        })
    }

    function qhMoneyType(pType, m_type, isw) { //m_cyn
        let toType = '';
        GeneralCtr.getSysConfigType('accept_rule').then(data => {
            moneyXZ = data;
            moneyXZ.min_cny = parseFloat(moneyXZ.accept_order_min_cny_amount);
            moneyXZ.max_cny = parseFloat(moneyXZ.accept_order_max_cny_amount);
            moneyXZ.min_usd = parseFloat(moneyXZ.accept_order_min_usd_amount);
            moneyXZ.max_usd = parseFloat(moneyXZ.accept_order_max_usd_amount);
            if (isw == '0') {
                if (m_type == 'CNY') {
                    $('.con-toBuy .x-p_money').text('USD');
                    $('.con-toBuy .m_cyn').text('USD');
                } else {
                    $('.con-toBuy .x-p_money').text('CNY');
                    $('.con-toBuy .m_cyn').text('CNY');
                }
            }
            if (isw == '1') {
                if (m_type == 'CNY') {
                    $('.con-toSell .x-p_money').text('USD');
                    $('.con-toSell .m_cyn').text('USD');
                } else {
                    $('.con-toSell .x-p_money').text('CNY');
                    $('.con-toSell .m_cyn').text('CNY');
                }
            }
            toType = $(pType + ' .x-p_money').eq(0).text();
            getNumberMoney('X', toType).then(data => {
                moneyHS = parseFloat(data);
                if(!isw){
                    $('.x-mon').text((Math.floor(moneyHS * 100) / 100).toFixed(2));
                }else{
                    $(pType + ' .x-mon').text((Math.floor(moneyHS * 100) / 100).toFixed(2));
                }
            });
            if (toType == 'CNY') {
                $('.b-m_type').text('￥');
                $(pType + ' .min-money').text(data.accept_order_min_cny_amount);
                $(pType + ' .max-money').text(data.accept_order_max_cny_amount);
                $(pType + ' .x-p_money').text('CNY');
            } else {
                $('.s-m_type').text('$');
                $(pType + ' .min-money').text(data.accept_order_min_usd_amount);
                $(pType + ' .max-money').text(data.accept_order_max_usd_amount);
                $(pType + ' .x-p_money').text('USD');
            }
        })
    }


    //我的账户
    function getAccount() {
        return AccountCtr.getAccount().then((data) => {
            // if (data.accountList) {
            //     data.accountList.forEach(function(item) {
            //         if (item.currency == currency) {
            //             $(".wallet-account-wrap .amount").text(base.formatMoneySubtract(item.amountString, item.frozenAmountString, currency));
            //             $(".wallet-account-wrap .frozenAmountString").text(base.formatMoney(item.frozenAmountString, '', currency));
            //             $(".wallet-account-wrap .amountString").text(base.formatMoney(item.amountString, '', currency));
            //             config.accountNumber = item.accountNumber;
            //             accountNumber = item.accountNumber;
            //             $("#myCoinAddress").text(item.coinAddress);
            //             var qrcode = new QRCode('qrcode', item.coinAddress);
            //             qrcode.makeCode(item.coinAddress);
            //             $("#sendOut-form .amount").attr("placeholder", "发送数量，本次最多可发送" + base.formatMoneySubtract(item.amountString, item.frozenAmountString, currency) + currency)
            //             sendOutWrapperRules["amount"] = {
            //                 max: base.formatMoneySubtract(item.amountString, item.frozenAmountString, currency)
            //             }
            //         }


            //     })
            // }
            config.accountNumber = userAccountNum;
            let ulElement = '';
            let erWm = [];
            data.forEach((item, i) => {
                ulElement += buildHtml(item, i);
                erWm.push(item.address);
            });
            $('.tr-ul').html(ulElement);

            // 手续费
            GeneralCtr.getSysConfigType('simu_order_rule').then(data => {
                fvData = parseFloat(data.simu_order_fee_rate) * 100;
                $('.sxf').text(fvData)
            })
            //涨幅
            getZfData().then(data => {
                console.log('涨幅：', data);
                $('.x-bf_r').text(data.list[0].exchangeRate + '%');
            })
            if(!userAccountNum){
                qhMoneyType('.con-toBuy', 'CNY');
            }
            let zfTypeHtml = '';
            // zfType[item.zfType[item.bankName] = item.bankCode] = item.bankCode
            getBankData().then(data => {
                data.forEach(item => {
                    zfTypeHtml += `<option value="${item.bankName}">${item.bankName}</option>`
                });
                $('#zf_select').html(zfTypeHtml);
            });
            if (ismx != 'wallet-mx') {
                setTimeout(() => {
                    erWm.forEach((item, i) => {
                        var qrcode = new QRCode(`qrcode${i}`, item);
                        qrcode.makeCode(item);
                    })
                }, 10)
            }
            if (userAccountNum) {
                getPageFlow(config);
            }
            addListener();
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }
    let tuBuyHtml = `
            <div class="con-toBuy bb-box" style="display: none;">
                <h5 class="x-tit">去购买</h5>
                <div class="buy-box">
                    <div class="buy-head">
                        <p class="x-h_p1">X / <span class="x-p_money">CNY</span></p>
                        <p class="x-h_p2"><img src="/static/images/切换X.png" class="fr"/></p>
                        <p class="x-h_p3">单价：<span class="b-m_type"></span> <span class="x-mon"></span> <span class="x-bf_r"><i>-</i> 3.5%</span></p>
                    </div>
                    <div class="buy-con">
                        <div class="b-c_h buy-c">
                            <p class="sel-p">金额</p>
                            <p>数量</p>
                            <div class="b-c_d">单笔限制：<span class="min-money">100</span> - <span class="max-money">5000</span> <span class="x-p_money"></span></div>
                        </div>
                        <div class="b-c_put">
                            <input type="text">
                            <p>请输入购买金额</p>
                            <span class="m_bb x-p_money">CNY</span>
                        </div>
                        <div class="b-c_yue">
                            <p>≈ <span class="x_num">0.0000</span> <span class="m_cyn">X</span><span class="fr">手续费：<span class="sxf">2</span> %</span>
                            </p>
                        </div>
                        <div class="b-c_fs">
                            <p>付款方式</p>
                            <div>
                                <span><img src="" alt=""></span>
                                <select name="zf-type" id="zf_select">
                                
                                </select>
                                <span><img src="/static/images/下拉黑.png" alt=""></span>
                            </div>
                        </div>
                        <div class="b-c_foo">
                            <button>买入</button>
                        </div>
                    </div>
                </div>
            </div>`

    let tuSellHtml = `
            <div class="con-toSell bb-box" style="display: none;">
                <h5 class="x-tit">去出售</h5>
                <div class="buy-box">
                    <div class="buy-head">
                        <p class="x-h_p1">X / <span class="x-p_money">CNY</span></p>
                        <p class="x-h_p2"><img src="/static/images/切换X.png" class="fr"/></p>
                        <p class="x-h_p3">单价：<span class="s-m_type"></span> <span class="x-mon"></span> <span class="x-bf_r"><i>-</i> 3.5%</span></p>
                    </div>
                    <div class="buy-con">
                        <div class="b-c_h sell-c">
                            <p class="sel-p">金额</p>
                            <p>数量</p>
                            <div class="b-c_d">单笔限制：<span class="min-money">100</span> - <span class="max-money">5000</span> <span class="x-p_money">CNY</span></div>
                        </div>
                        <div class="b-c_put">
                            <input type="text">
                            <p>请输入卖出金额</p>
                            <span class="m_bb x-p_money">CNY</span>
                        </div>
                        <div class="b-c_yue">
                            <p>≈ <span class="x_num">0.0000</span><span class="m_cyn">X</span> <span class="fr">手续费：<span class="sxf">2</span> %</span>
                            </p>
                        </div>
                        <div class="b-c_fs">
                            <p>付款方式</p>
                            <div>
                                <span><img src="" alt=""></span>
                                <select name="zf-type" id="zf_select">
                                            <option value="支付宝">支付宝</option>
                                            <option value="银行卡">银行卡</option>
                                        </select>
                                <span></span>
                            </div>
                        </div>
                        <div class="back-type">
                            <input type="text" placeholder="请输入账号或卡号" />
                        </div>
                        <div class="b-c_foo">
                            <button>卖出</button>
                        </div>
                    </div>
                </div>
            </div>`

    function buildHtml(item, i) {
        let kyAmount = base.formatMoney(`${item.amount - item.frozenAmount}`, '', item.currency);
        let frozenAmount = base.formatMoney(`${item.frozenAmount}`, '', item.currency);
        let DHtml = `
                <li>
                <ul class="tr-mx">
                    <li>${item.currency}</li>
                    <li>${kyAmount}</li>
                    <li>${frozenAmount}</li>
                    <li>
                        <p class="cz-btns">
                            <span>充币</span>
                            <span>提币</span>
                            <span class="${item.currency == 'X' ? 'to-buy' : 'none'}">去购买</span>
                            <span class="${item.currency == 'X' ? 'to-sell' : 'none'}">去出售</span>
                        </p>
                        <p class="jy-btns">
                            <span class="goHref"  data-href="./wallet-mx.html?account=${item.accountNumber}">交易明细</span>
                            <span class="goHref" data-href="${item.currency == 'X' ? '../wallet/wallet-jilu.html' : '../trade/buy-list.html?type=sell&mod=gm'}">${item.currency == 'X' ? '订单记录' : '去交易'}</span>
                        </p>
                    </li>
                </ul>
                ${item.currency == 'X' ? tuBuyHtml : ''}
                ${item.currency == 'X' ? tuSellHtml : ''}
                <div class="con-box bb-box" style="display: none;">
                    <div class="contant-mx">
                        <h3>充币</h3>
                        <div class="address-Wrap receive-wrap ">
                            <div class="address">接收地址：<samp id="myCoinAddress">${item.address}</samp>
                                <div class="icon icon-qrcode">
                                    <div id="qrcode${i}" class="qrcode"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="contant-ts">
                        <h5>温馨提示</h5>
                        <ul class="ts-ul">
                            <li> ${item.currency} 地址只能充值 ${item.currency} 资产，任何充入 ${item.currency} 地址的非 ${item.currency} 资产将不可找回。</li>
                            <li> 使用${item.currency}地址充值需要 2 个网络确认才能到账。</li>
                            <li> 最低存入金额为 0.0025 ${item.currency}，我们不会处理少于该金额的 ${item.currency} 存入请求。</li>
                            <li> 在平台内相互转账是实时到账且免费的。</li>
                        </ul>
                    </div>
                </div>
                <div class="con-tb bb-box" style="display: none;">
                    <div class="sendOut-form-wrap">
                        <h4>提币</h4>
                        <form class="form-wrapper form-wrapper-38 wp100" id="sendOut-form${i}">
                            <div class="form-item-wrap">
                                <p class="label">提现地址</p>
                                <div class="form-item mr20 k_b">
                                    <input type="text" class="input-item payCardNo" name="payCardNo" placeholder="请输入提现地址" />
                                </div>
                            </div>
                            <div class="form-item-wrap">
                                <samp class="label">提现数量</samp>
                                <div class="form-item k_b">
                                    <input type="text" class="input-item amount" name="amount" placeholder="请输入提现数量" />
                                </div>
                            </div>
                            <div class="form-item-wrap" id="withdrawFee-wrap${i}">
                                <samp class="label">手续费</samp>
                                <div class="form-item k_b">
                                    <input type="text" class="input-item withdrawFee" id="withdrawFee${i}" value="0" disabled="disabled" />
                                </div>
                            </div>
                            <div class="form-item-wrap tradePwdWrap">
                                <samp class="label">支付密码</samp>
                                <div class="form-item k_b mr20">
                                    <input type="password" class="input-item" name="tradePwd" placeholder="请输入支付密码" />
                                </div>
                                <div class="findPwd fl goHref" data-href="../user/setTradePwd.html?type=1&isWallet=1">忘记密码？</div>
                            </div>
                            <div class="form-item-wrap hidden googleAuthFlag">
                                <samp class="label">谷歌验证码</samp>
                                <div class="form-item k_b mr20">
                                    <input type="password" class="input-item" name="googleCaptcha" placeholder="请输入谷歌验证码" />
                                </div>
                            </div>
                            <div class="form-item-wrap">
                                <samp class="label">备注</samp>
                                <div class="form-item k_b">
                                    <input type="text" class="input-item" name="applyNote" placeholder="请输入提现备注" />
                                </div>
                            </div>
                            <div class="form-btn-item">
                                <div data-accountNumber="${item.accountNumber}"></div>
                                <div class="am-button am-button-red subBtn">确定提现</div>
                            </div>
                        </form>
                    </div>
                    <div class="contant-ts" style="padding-top: 30px;">
                        <h5>温馨提示</h5>
                        <ul class="ts-ul">
                            <li> ${item.currency} 地址只能充值 ${item.currency} 资产，任何充入 ${item.currency} 地址的非 ${item.currency} 资产将不可找回。</li>
                            <li> 使用${item.currency}地址充值需要 2 个网络确认才能到账。</li>
                            <li> 最低存入金额为 0.0025 ${item.currency}，我们不会处理少于该金额的 ${item.currency} 存入请求。</li>
                            <li> 在平台内相互转账是实时到账且免费的。</li>
                        </ul>
                    </div>
                </div>
            </li>`
        return DHtml;
    }

    function getNumberMoney(symbol, refer){
        return TradeCtr.getNumberMoney(symbol, refer);
    }

    // 初始化交易记录分页器
    function initPaginationFlow(data) {
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: config.limit,
            jump: true,
            coping: true,
            prevContent: '<img src="/static/images/arrow---left.png" />',
            nextContent: '<img src="/static/images/arrow---right.png" />',
            keepShowPN: true,
            totalData: data.totalCount,
            jumpIptCls: 'pagination-ipt',
            jumpBtnCls: 'pagination-btn',
            jumpBtn: '确定',
            isHide: true,
            callback: function (_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getPageFlow(config);
                }
            }
        });
    }

    //分页查询我的账户流水
    function getPageFlow(params) {
        return AccountCtr.getPageFlow(params, true).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtmlFlow(item);
                });
                $(".tradeRecord-list-wrap .list-wrap").html(html)
                $(".tradeRecord-list-wrap .no-data").addClass("hidden");
            } else {
                config.start == 1 && $(".tradeRecord-list-wrap .list-wrap").empty()
                config.start == 1 && $(".tradeRecord-list-wrap .no-data").removeClass("hidden");
            }

            config.start == 1 && initPaginationFlow(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtmlFlow(item) {
        return `<div class="list-item">
					<div>${base.formateDatetime(item.createDatetime)}</div>
					<div>${bizTypeValueList[item.bizType]}</div>
					<div>${base.formatMoney(item.transAmountString,'',item.currency)}</div>
					<div>${item.bizNote}</div>
				</div>`
    }

    //分页查询地址
    function getPageCoinAddress() {
        return AccountCtr.getPageCoinAddress(configAddress, true).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtmlAddress(item, i);
                });
                $("#wAddressDialog .list").html(html)
            } else {
                configAddress.start == 1 && $("#wAddressDialog .list").empty()
                configAddress.start == 1 && $("#wAddressDialog .list").html("<div class='tc ptb30 fs13'>暂无地址</div>")
            }
            configAddress.start == 1 && initPaginationAddress(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtmlAddress(item, i) {
        var statusHtml = ''
        if (item.status == '0') {
            statusHtml = '未认证'
        } else if (item.status == '1') {
            statusHtml = '已认证'
        }
        return `<li data-address="${item.address}" data-status="${item.status}" class="${i=='0'?'on':''} b_e_t">
    				<div class="txt wp100">
						<p>标签: ${item.label}</p>
						<p>${item.address}(${statusHtml})</p>
					</div>
    				<i class="icon deleteBtn" data-code="${item.code}"></i>
    			</li>`
    }

    // 初始化地址分页器
    function initPaginationAddress(data) {
        $("#paginationAddress .pagination").pagination({
            pageCount: data.totalPage,
            showData: configAddress.limit,
            jump: true,
            coping: true,
            prevContent: '<img src="/static/images/arrow---left.png" />',
            nextContent: '<img src="/static/images/arrow---right.png" />',
            keepShowPN: true,
            totalData: data.totalCount,
            jumpIptCls: 'pagination-ipt',
            jumpBtnCls: 'pagination-btn',
            jumpBtn: '确定',
            isHide: true,
            callback: function (_this) {
                if (_this.getCurrent() != configAddress.start) {
                    base.showLoadingSpin();
                    configAddress.start = _this.getCurrent();
                    getPageCoinAddress();
                }
            }
        });
    }

    //添加地址
    function addCoinAddress(params) {
        return AccountCtr.addCoinAddress(params).then((data) => {
            base.hideLoadingSpin();
            base.showMsg("操作成功");
            setTimeout(function () {
                $("#addWAddressDialog").addClass("hidden");
                document.getElementById("addAddress-form").reset();
                $("#addWAddressDialog .setSecurityAccount .icon-switch").addClass("on")
                base.showLoadingSpin();
                configAddress.start = 1;
                getPageCoinAddress()
            }, 800)
        }, base.hideLoadingSpin)
    }

    //提现 / 发送
    function withDraw(params) {
        return AccountCtr.withDraw(params).then((data) => {
            base.hideLoadingSpin();
            base.showMsg("操作成功");
            $("#addWAddressDialog").addClass("hidden")
            base.showLoadingSpin();
            config.start = 1;
            getAccount();
            $("#withdrawFee").val(withdrawFee + currency)
        }, function () {
            base.hideLoadingSpin();
        })
    }

    //弃用地址
    function deleteCoinAddress(code) {
        return AccountCtr.deleteCoinAddress(code).then((data) => {
            base.hideLoadingSpin();
            base.showMsg("操作成功");
            setTimeout(function () {
                base.showLoadingSpin();
                configAddress.start = 1;
                getPageCoinAddress()
            }, 800)
        }, base.hideLoadingSpin)
    }

    // 获取银行渠道
    function getBankData() {
        return Ajax.post('802116', {
            status: '1'
        })
    }

    //获取币换人民币价格

    function getAdvertisePrice(coin, ctype) {
        let refCurrency = ctype || 'CNY';
        return Ajax.get("625292", {
            coin,
            refCurrency
        });
    }

    // 获取涨幅
    function getZfData(){
        return Ajax.post("650100", {
            start: '1',
            limit: '10',
            symbol: 'X',
            toSymbol: 'BTC'
        }, true);
    }

    // 购买X币
    function buyX(config) {
        return Ajax.post('625270', config);
    }

    // 出售X币
    function sellX(config) {
        return Ajax.post('625271', config);
    }

    function addListener() {
        var _addAddressWrapper = $("#addAddress-form");
        _addAddressWrapper.validate({
            'rules': addAddressWrapperRules,
            onkeyup: false
        });

        var _sendOutWrapper = $("#sendOut-form");
        _sendOutWrapper.validate({
            'rules': sendOutWrapperRules,
            onkeyup: false
        });

        //接受/发送点击
        $(".trList .subBtn").off('click').click(function () {
            //提币/发送 需要验证是否有资金密码 和实名
            let params = {};
            let formData = $(this).parents('form').serializeArray();
            formData.forEach(item => {
                params[item.name] = item.value;
            })
            params.applyUser = base.getUserId();
            params.payCardInfo = $(this).parents('.con-tb').siblings('.tr-mx').children('li').eq(0).text();
            params.accountNumber = $(this).prev().attr('data-accountNumber');
            params.amount = base.formatMoneyParse(params.amount, '', params.payCardInfo);
            console.log(params.payCardInfo);
            withDraw(params).then(data => {
                console.log(data);
                $(this).parents('form').reset();
            })
        })

        //交易记录 类型点击
        $(".tradeRecord-top ul li").click(function () {
            // if(!$(this).hasClass("on")){
            var index = $(this).index();
            $(this).addClass("on").siblings("li").removeClass("on");

            base.showLoadingSpin();
            config.bizType = bizTypeList[index];
            config.start = 1;
            if (index == '8') {
                config.type = '1';
            } else {
                delete config.type;
            }
            getPageFlow(config);
            // }
        })

        //选择地址弹窗
        $("#wAddressDialog .am-modal-body ul").on("click", "li .txt", function () {
            var _this = $(this).parent("li");
            if (!_this.hasClass("on")) {
                _this.addClass("on").siblings("li").removeClass("on");
            }
        })

        //选择地址-删除点击
        $("#wAddressDialog .am-modal-body ul").on("click", "li .deleteBtn", function () {
            var addressCode = $(this).attr("data-code");
            base.confirm("確定刪除此地址？").then(() => {
                base.showLoadingSpin();
                deleteCoinAddress(addressCode)
            }, base.emptyFun)

        })

        // 新增地址弹窗
        $("#addWAddressDialog .setSecurityAccount .icon-switch").click(function () {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
                $("#addWAddressDialog .tradePwdFlag").addClass("hidden");
                addAddressWrapperRules["tradePwd"] = {};
                _addAddressWrapper.validate({
                    'rules': addAddressWrapperRules,
                    onkeyup: false
                });
            } else {
                $(this).addClass("on");
                $("#addWAddressDialog .tradePwdFlag").removeClass("hidden")
                addAddressWrapperRules["tradePwd"] = {
                    required: true,
                };
                _addAddressWrapper.validate({
                    'rules': addAddressWrapperRules,
                    onkeyup: false
                });
            }
        })

        $(".dialog .closeBtn").click(function () {
            $(this).parents(".dialog").addClass("hidden")
        })

        //管理地址點擊
        $("#sendOut-form .addressBtn").click(function () {
            base.showLoadingSpin();
            $("#wAddressDialog .list").empty()
            configAddress.start = 1;
            getPageCoinAddress().then(() => {
                $("#wAddressDialog").removeClass("hidden")
            })

        })

        //管理地址彈窗-新增地址點擊
        $("#wAddressDialog .addBtn").click(function () {
            smsCaptcha.init({
                bizType: "625203",
                id: "getVerification",
                mobile: "addWAddressMobile",
                errorFn: function () {}
            });
            $("#addWAddressDialog").removeClass("hidden")
        })

        //添加地址弹窗-确定点击
        $("#addWAddressDialog .subBtn").click(function () {
            if (_addAddressWrapper.valid()) {
                base.showLoadingSpin();
                var params = _addAddressWrapper.serializeObject();
                if ($("#addWAddressDialog .setSecurityAccount .icon-switch").hasClass("on")) {
                    params.isCerti = "1"
                } else {
                    params.isCerti = "0"
                }
                params.currency = currency
                addCoinAddress(params)
            }

        })

        //管理地址弹窗-确定点击
        $("#wAddressDialog .subBtn").click(function () {
            var address = $("#wAddressDialog .am-modal-body ul li.on").attr("data-address");
            var status = $("#wAddressDialog .am-modal-body ul li.on").attr("data-status");

            if (status == '1') {
                $("#sendOut-form .tradePwdWrap").addClass("hidden")
            } else if (status == '0') {

                $("#sendOut-form .tradePwdWrap").removeClass("hidden")
            }
            $("#sendOut-form .payCardNo").val(address);
            $("#wAddressDialog").addClass("hidden")
        })


        // 充币、提币操作
        $('.tr-ul').off('click').click(function (e) {
            let target = e.target;
            if ($(target).text() == '充币') {
                $('.bb-box').hide(200);
                if ($(target).attr('class') == 'sel-sp') {
                    $(target).parents('.tr-mx').siblings('.con-box').hide(200);
                    $(target).removeClass('sel-sp');
                } else {
                    $('.cz-btns span').removeClass('sel-sp');
                    $(target).addClass('sel-sp').siblings().removeClass('sel-sp');
                    $(target).parents('.tr-mx').siblings('.con-box').show(200).siblings('.con-tb').hide(200);
                }
                return;
            }
            UserCtr.getUser(true).then((data) => {
                if ($(target).text() == '提币') {
                    if (data.tradepwdFlag && data.realName) {
                        $('.bb-box').hide(200);
                        if ($(target).attr('class') == 'sel-sp') {
                            $(target).parents('.tr-mx').siblings('.con-tb').hide(200);
                            $(target).removeClass('sel-sp');
                        } else {
                            $('.cz-btns span').removeClass('sel-sp');
                            $(target).addClass('sel-sp').siblings().removeClass('sel-sp');
                            $(target).parents('.tr-mx').siblings('.con-tb').show(200).siblings('.con-box').hide(200);
                        }
                    } else if (!data.tradepwdFlag) {
                        base.showMsg("请先设置资金密码")
                        setTimeout(function() {
                            base.gohref("../user/setTradePwd.html?type=0")
                        }, 1800)
                    } else if (!data.realName) {
                        base.showMsg("请先进行身份验证")
                        setTimeout(function() {
                            base.gohref("../user/identity.html")
                        }, 1800)
                    }
                }
            }, base.hideLoadingSpin);
        })

        // 切换交易货币类型
        $('.con-toBuy .x-h_p2 img').click(function () {
            let m_type = $(this).parent().prev().children('.x-p_money').text();
            qhMoneyType('.con-toBuy', m_type, '0');
        })

        $('.con-toSell .x-h_p2 img').click(function () {
            let m_type = $(this).parent().prev().children('.x-p_money').text();
            qhMoneyType('.con-toSell', m_type, '1');
        })

        let isSell = true;

        // 去购买操作
        $('.to-buy').off('click').click(function () {
            $('.b-c_h p').eq(0).addClass('sel-p').siblings().removeClass('sel-p');
            $('.b-c_put input').val('');
            isSell = false;
            if ($(this).hasClass('sel-sp')) {
                $('.con-toBuy').hide();
                $(this).removeClass('sel-sp');
            } else {
                $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
                $('.bb-box').hide();
                $('.con-toBuy').show(200);
            }
        })

        // 去出售操作
        $('.to-sell').off('click').click(function () {
            $('.b-c_h p').eq(0).addClass('sel-p').siblings().removeClass('sel-p');
            $('.b-c_put input').val('');
            isSell = true;
            $('.b-c_put p').text('请输入卖出金额');
            if ($(this).hasClass('sel-sp')) {
                $('.con-toSell').hide();
                $(this).removeClass('sel-sp');
            } else {
                $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
                $('.bb-box').hide();
                $('.con-toSell').show(200);
            }
        })

        //切换方式
        $('.b-c_h p').off('click').click(function () {
            $(this).addClass('sel-p').siblings('p').removeClass('sel-p');
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            if (isSell) {
                if ($(this).text() == '金额') {
                    $('.b-c_put p').text('请输入卖出金额');
                    $('.m_bb').text('CNY');
                    $('.m_cyn').text('X');
                } else {
                    $('.b-c_put p').text('请输入卖出数量');
                    $('.m_bb').text('X');
                    $('.m_cyn').text('CNY');
                }
            } else {
                if ($(this).text() == '金额') {
                    $('.b-c_put p').text('请输入购买金额');
                    $('.m_bb').text('CNY');
                    $('.m_cyn').text('X');
                } else {
                    $('.b-c_put p').text('请输入购买数量');
                    $('.m_bb').text('X');
                    $('.m_cyn').text('CNY');
                }
            }
        })

        let inpTxt = '';

        $('.b-c_put input').focus(function () {
            inpTxt = $(this).next('p').text();
            $(this).next().text('');
        })
        $('.b-c_put input').blur(function () {
            if ($(this).val() == '') {
                $(this).next().text(inpTxt);
            }
        })

        $('.b-c_put input').keyup(function () {
            let rmb = '';
            let setW = $(this).parent().prev().children('.sel-p').text();
            if (setW == '金额') {
                rmb = parseFloat($(this).val()) / moneyHS;
            } else {
                rmb = parseFloat($(this).val()) * moneyHS;
            }
            rmb = (Math.floor(rmb * 1000) / 1000).toFixed(3);
            if (isNaN(rmb)) {
                rmb = '0.00';
            }
            $('.x_num').text(rmb);
        })

        // 点击下订单
        $('.b-c_foo button').off('click').click(function () {
            let receiveType = $("#zf_select").find("option:selected").val();
            let p_money = $('.con-toBuy .x-p_money').eq(0).text(); //判断货币类型
            //买入
            if ($(this).text() == '买入' && $('.buy-c .sel-p').text() == '金额') {
                let allMoney = parseFloat($('.con-toBuy .b-c_put input').val().trim());
                let m_count = base.formatMoneyParse($('.con-toBuy .x_num').text().trim(), '', 'X');
                changeBuyMoney(p_money, allMoney, m_count);
            }


            if ($(this).text() == '买入' && $('.con-toBuy .sel-p').text() == '数量') {
                let allMoney = $('.con-toBuy .x_num').text().trim();
                let m_count = base.formatMoneyParse($('.con-toBuy .b-c_put input').val().trim(), '', 'X');
                changeBuyMoney(p_money, allMoney, m_count);
            }

            function changeBuyMoney(p_money, allMoney, m_count) {
                
                if (p_money == 'CNY') {
                    if (moneyXZ.min < allMoney && allMoney < moneyXZ.max_cny) {
                        let buyConfig = {
                            tradeCurrency: 'CNY',
                            tradePrice: moneyHS,
                            userId: base.getUserId(),
                            count: m_count,
                            receiveType: zfType[receiveType],
                            tradeAmount: allMoney
                        }
                        buyX(buyConfig).then(() => {
                            showMsg();
                        });
                    } else {
                        showMsg('输入金额不在限额之内，请重新输入！');
                    }
                }
                if (p_money == 'USD') {
                    if (moneyXZ.min_usd < allMoney && allMoney < moneyXZ.max_usd) {
                        let buyConfig = {
                            tradeCurrency: 'USD',
                            tradePrice: moneyHS,
                            userId: base.getUserId(),
                            count: m_count,
                            receiveType: zfType[receiveType],
                            tradeAmount: allMoney
                        }
                        buyX(buyConfig).then(() => {
                            showMsg();
                        });
                    } else {
                        showMsg('输入金额不在限额之内，请重新输入！');
                    }
                }
            }

            //卖出
            if ($(this).text() == '卖出') { //back-type
                let p_money = $('.con-toSell .x-p_money').eq(0).text(); //判断货币类型
                if ($('.sell-c .sel-p').text() == '金额') {
                    let allMoney = $('.con-toSell .b-c_put input').val().trim();
                    let m_count = base.formatMoneyParse($('.con-toSell .x_num').text().trim(), '', 'X');
                    let m_receiveCardNo = $('.back-type input').val().trim();
                    changeSellMoney(p_money, allMoney, m_count, m_receiveCardNo);
                }

                if ($('.sell-c .sel-p').text() == '数量') {
                    let allMoney = $('.con-toSell .x_num').text().trim();
                    let m_count = base.formatMoneyParse($('.con-toSell .b-c_put input').val().trim(), '', 'X');
                    let m_receiveCardNo = $('.back-type input').val().trim();
                    changeSellMoney(p_money, allMoney, m_count, m_receiveCardNo);
                }


                function changeSellMoney(p_money, allMoney, m_count, m_receiveCardNo) {
                    if (p_money == 'CNY') {
                        if (moneyXZ.min_cny < allMoney && allMoney < moneyXZ.max_cny) {
                            let sellConfig = {
                                userId: base.getUserId(),
                                tradeCurrency: 'X',
                                tradePrice: moneyHS,
                                count: m_count,
                                receiveCardNo: m_receiveCardNo,
                                receiveType: zfType[receiveType],
                                tradeAmount: allMoney
                            }
                            sellX(sellConfig).then(() => {
                                showMsg();
                            })
                        } else {
                            showMsg('输入金额不在限额之内，请重新输入！');
                        }
                    }
                    if (p_money == 'USD') {
                        if (moneyXZ.min_usd < allMoney && allMoney < moneyXZ.max_usd) {
                            let sellConfig = {
                                userId: base.getUserId(),
                                tradeCurrency: 'X',
                                tradePrice: moneyHS,
                                count: m_count,
                                receiveCardNo: m_receiveCardNo,
                                receiveType: zfType[receiveType],
                                tradeAmount: allMoney
                            }
                            sellX(sellConfig).then(() => {
                                showMsg();
                            })
                        } else {
                            showMsg('输入金额不在限额之内，请重新输入！');
                        }
                    }
                }
            }
        })

        function showMsg(txt) {
            let text = txt || '订单提交成功'
            $('.b-c_put input').val('');
            $('.x_num').text('0.000');
            $('.back-type input').val('');
            base.showMsg(text);
        }

        // 发送-确定
        $("#sendOut-form .subBtn").click(function () {
            if (_sendOutWrapper.valid()) {
                base.showLoadingSpin();
                var params = _sendOutWrapper.serializeObject();
                params.amount = base.formatMoneyParse(params.amount, '', currency);
                params.accountNumber = accountNumber;
                params.payCardInfo = currency
                withDraw(params)
            }
        })

    }
});