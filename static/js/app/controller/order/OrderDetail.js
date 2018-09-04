define([
	'app/controller/base',
	'app/module/validate',
	'app/interface/GeneralCtr',
	'app/interface/UserCtr',
	'app/interface/TradeCtr'
], function(base, Validate, GeneralCtr, UserCtr, TradeCtr) {
	var code = base.getUrlParam("code");
	var loginInfo = {};
	var userId = base.getUserId();
	const selType = webim.SESSION_TYPE.GROUP;
	const subType = webim.GROUP_MSG_SUB_TYPE.COMMON;
	const groupId = code;
	const groupName = 'groupName';
	const reqMsgCount = 10;
	var selSess;
	var getPrePageGroupHistroyMsgInfoMap = {};
	var emotionFlag = false;
	var tradePhoto = '';
	var tradePhotoMy = '';
	var userName = '', myName='';
	var payType = {};
	var firstLoad = false;
	var newMsgHtml = '<div id="newMsgWrap" class="newMsg-wrap goHref" data-href="../order/order-list.html">您有未读消息</div>';
	var tradeType ;
	var adsCode ;
	var tradeCoin = '';//交易币种
	
	init();

	function init() {
		base.showLoadingSpin();
        GeneralCtr.getDictList({"parentKey":"pay_type"}).then((data)=>{
            data.forEach(function(item){
            	payType[item.dkey] = item.dvalue;
        	});
	        getOrderDetail();
	    },base.hideLoadingSpin);

		addListener();
	}

	function getTencunLogin() {
		return GeneralCtr.getTencunLogin().then((data) => {
			loginInfo = {
				identifier: userId,
				userSig: data.sign,
				sdkAppID: data.txAppCode,
				appIDAt3rd: data.txAppCode,
				accountType: data.accountType
			};
			login();
		})
	}
	function getOrderDetail() {
		return TradeCtr.getOrderDetail(code).then((data) => {
			adsCode = data.adsCode
			//待支付
			if(data.status == '0'||data.status == '1') {
				$("#invalidDatetime samp").html("訂單將在託管中保持至<i>" + base.formatDate(data.invalidDatetime, "hh:mm:ss") + "</i>，逾期未支付交易將自動取消")
				$("#invalidDatetime").removeClass("hidden")
				$("#statusInfo").addClass("hidden")
			}
			$("#statusInfo samp").html(data.remark)
			$("#tradePrice").html(data.tradePrice);
			tradeCoin = data.tradeCoin?data.tradeCoin:'ETH';
			$("#countString").html(base.formatMoney(data.countString,'',tradeCoin)+'&nbsp;'+tradeCoin);
			
			$("#tradeAmount").html(data.tradeAmount);
			$("#orderCode").html(data.code.substring(data.code.length - 8));
			$("#payType").html(payType[data.payType]);
			$("#leaveMessage").html(data.leaveMessage);

			//卖家/买家信息
			$(".btn-wrap .am-button").addClass("hidden");
			//当前用户为买家，显示卖家信息
			if(data.buyUser == base.getUserId()) {
				tradeType = '0';
				var user = data.sellUserInfo;
				var myInfo = data.buyUserInfo;
				$("#user").html("賣家信息")
				
				//待支付
	    		if(data.status=="0"){
	    			$(".payBtn").removeClass("hidden");
	    			$(".cancelBtn").removeClass("hidden");
	    			
				}else if(data.status=="2"){
					if(data.bsComment!="0"&&data.bsComment!="2"){
						
	    				$(".commentBtn").removeClass("hidden");
					}
				}
				
				//当前用户为卖家，显示买家信息
			} else {
				tradeType = '1';
				var user = data.buyUserInfo;
				var myInfo = data.sellUserInfo;
				$("#user").html("買家信息")
				
				//待支付
	    		if(data.status=="1"){
	    			$(".releaseBtn").removeClass("hidden");
				}else if(data.status=="2"){
					if(data.sbComment!="0"&&data.sbComment!="2"){
	    			$(".commentBtn").removeClass("hidden");
					}
				}
			}
			
			//操作按鈕
	    	//已支付，待释放
			if(data.status=="1"){
    			$(".arbitrationBtn").removeClass("hidden");
    		
			}
			//待下单
			if(data.status=="-1"){
				
				$("title").html("廣告詳情-倍可盈");
				$(".orderDetail-info .info-wrap").addClass("hidden");
				if(tradeType=='0'){
					
					$(".orderDetail-info .title").html('<i class="icon icon-order"></i>購買訂單')
					$(".goBuyDetailBtn").removeClass("hidden");
				}else if(tradeType=='1'){
					$(".orderDetail-info .title").html('<i class="icon icon-order"></i>出售訂單')
					$(".goSellDetailBtn").removeClass("hidden");
				}
    			
    			getAdvertiseDetail();
			}else{
				$("title").html("訂單詳情-倍可盈")
			}
			
			userName = user.nickname;
			myName = myInfo.nickname;
			if(user.photo) {
				tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin='+tradeCoin+'&userId='+user.userId+'"   style="background-image:url(\''+base.getAvatar(user.photo)+'\')"></div>'
			} else {
				var tmpl = user.nickname.substring(0, 1).toUpperCase();
				tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin='+tradeCoin+'&userId='+user.userId+'" ><div class="noPhoto">'+tmpl+'</div></div>'
			}
			if(myInfo.photo) {
				tradePhotoMy = '<div class="photo" style="background-image:url(\''+base.getAvatar(myInfo.photo)+'\')"></div>'
			} else {
				var tmpl = myInfo.nickname.substring(0, 1).toUpperCase();
				tradePhotoMy = '<div class="photo"><div class="noPhoto">'+tmpl+'</div></div>'
			}
			
			$("#photoWrap").html(tradePhoto)
			$("#nickname").html(user.nickname)
			
			if(!firstLoad){
				getTencunLogin();
				firstLoad = true;
			}
			
			$("#mobile").html(user.mobile != "" && user.mobile ? '已驗證' : '未驗證')
			$("#email").html(user.email != "" && user.email ? '已驗證' : '未驗證')
			$("#identity").html(user.realname != "" && user.realName ? '已驗證' : '未驗證')
			$("#createDatetime").html(base.formateDatetime(user.createDatetime))

			base.hideLoadingSpin();
		}, base.hideLoadingSpin)
	}
	
	//获取详情
    function getAdvertiseDetail(){
    	return TradeCtr.getAdvertiseDetail(adsCode).then((data)=>{
    		var limit = data.minTrade+'-'+data.maxTrade;
			$("#truePrice").html(Math.floor(data.truePrice*100)/100+'&nbsp;CNY/'+tradeCoin)
    		$("#limit").html(limit);
    		$(".info-wrap1").removeClass("hidden")
    	},base.hideLoadingSpin)
    }

	function login() {
		let listeners = {
			'onConnNotify': onConnNotify,
			'onMsgNotify': onMsgNotify,
			'jsonpCallback': jsonpCallback //IE9(含)以下浏览器用到的jsonp回调函数，
		};
		let options = {
			'isAccessFormalEnv': true,
			'isLogOn': false
		};
		webim.login(loginInfo, listeners, options, function(resp) {
			// 获取历史消息;
			getLastGroupHistoryMsgs(function(msgList) {
				getHistoryMsgCallback(msgList);

				var msgflow = document.getElementById("msgflow");
				var bindScrollHistoryEvent = {
					init: function() {
						msgflow.onscroll = function() {
							if(msgflow.scrollTop == 0) {
								msgflow.scrollTop = 10;
								getPrePageGroupHistoryMsgs();
							}
						}
					},
					reset: function() {
						msgflow.onscroll = null;
					}
				};
				bindScrollHistoryEvent.init();
				getMyGroup();
			}, function(err) {
				alert(err.ErrorInfo);
			});

		}, function() {
//			console.log('login err');
			// self.setTententLogined(false);
		});
	}
	//获取我的群组
	function getMyGroup(){
		
	    var options = {
	        'Member_Account': loginInfo.identifier,
	        //'GroupType':'',
	        'GroupBaseInfoFilter': [
	        ],
	        'SelfInfoFilter': [
	            'UnreadMsgNum'
	        ]
	    };
	    webim.getJoinedGroupListHigh(
	            options,
	            function (resp) {
	                if (!resp.GroupIdList || resp.GroupIdList.length == 0) {
	                    return;
	                }
	                var unreadMsgFlag = false;
	                for (var i = 0; i < resp.GroupIdList.length; i++) {
	                    var unreadMsgNum = resp.GroupIdList[i].SelfInfo.UnreadMsgNum;
	                    
	                    if(unreadMsgNum>1){
	                    	unreadMsgFlag = true
	                    }
	                }
	                if(unreadMsgFlag){
		            	if(!$("#newMsgWrap").length){
							$("body").append(newMsgHtml)
						}
						if(!$("#newMsgWrap").hasClass("on")){
							$("#newMsgWrap").addClass('on')
						}
		            }
	            },
	            function (err) {
	                alert(err.ErrorInfo);
	            }
	    );
	}

	//表情初始化 
	function showEmotionDialog() {
		if(emotionFlag) {
			$('#wl_faces_box').css({
				"display": "block"
			});
			return;
		}
		emotionFlag = true;

		for(var index in webim.Emotions) {
			var emotions = $('<img>').attr({
				"id": webim.Emotions[index][0],
				"src": webim.Emotions[index][1],
				"style": "cursor:pointer;"
			}).click(function() {
				selectEmotionImg(this);
			});
			$('<li>').append(emotions).appendTo($('#emotionUL'));
		}
		$('#wl_faces_box').css({
			"display": "block"
		});
	};

	function selectEmotionImg(selImg) {
		var txt = document.getElementById("msgedit");
		txt.value = txt.value + selImg.id;
		txt.focus();
	};

	//IE9(含)以下浏览器用到的jsonp回调函数
	function jsonpCallback(rspData) {
		webim.setJsonpLastRspData(rspData);
	}

	function onConnNotify(resp) {
		var info;
		switch(resp.ErrorCode) {
			case webim.CONNECTION_STATUS.ON:
				webim.Log.warn('建立连接成功: ' + resp.ErrorInfo);
				break;
			case webim.CONNECTION_STATUS.OFF:
				info = '连接已断开，无法收到新消息，请检查下你的网络是否正常: ' + resp.ErrorInfo;
				webim.Log.warn(info);
				break;
			case webim.CONNECTION_STATUS.RECONNECT:
				info = '连接状态恢复正常: ' + resp.ErrorInfo;
				webim.Log.warn(info);
				break;
			default:
				webim.Log.error('未知连接状态: =' + resp.ErrorInfo);
				break;
		}
	}

	function onMsgNotify(newMsgList) {
		var sess, newMsg;
		//获取所有聊天会话
		var sessMap = webim.MsgStore.sessMap();

		for(var j in newMsgList) { //遍历新消息
			newMsg = newMsgList[j];
			if(!selSess) { // 没有聊天对象
				selSess = newMsg.getSession();
			}
			if(newMsg.getSession().id() == groupId) { //为当前聊天对象的消息
				//在聊天窗体中新增一条消息
//				console.warn(newMsg);
				addMsg(newMsg,'',1);
			}
		}
		
		//消息已读上报，以及设置会话自动已读标记
		webim.setAutoRead(selSess, true, true);
		var otherNew = false;
		for (var i in sessMap) {
	        sess = sessMap[i];
	        if (groupId != sess.id()) {//更新其他聊天对象的未读消息数
	        	if(sess.unread()>=1){
	        		otherNew = true;
//		            updateSessDiv(sess.type(), sess.id(), sess.unread());
				}
	        }else{
	        	console.log(sess);
	        }
	    }
        if(otherNew){
        	if(!$("#newMsgWrap").length){
				$("body").append(newMsgHtml)
			}
			if(!$("#newMsgWrap").hasClass("on")){
				$("#newMsgWrap").addClass('on')
			}
        }
		
	}

	//读取群组基本资料-高级接口
	function getGroupInfo(group_id, cbOK, cbErr) {
		var options = {
			'GroupIdList': [
				group_id
			],
			'GroupBaseInfoFilter': [
				'Type',
				'Name',
				'Introduction',
				'Notification',
				'FaceUrl',
				'CreateTime',
				'Owner_Account',
				'LastInfoTime',
				'LastMsgTime',
				'NextMsgSeq',
				'MemberNum',
				'MaxMemberNum',
				'ApplyJoinOption',
				'ShutUpAllMember'
			],
			'MemberInfoFilter': [
				'Account',
				'Role',
				'JoinTime',
				'LastSendMsgTime',
				'ShutUpUntil'
			]
		};
		webim.getGroupInfo(
			options,
			function(resp) {
				if(resp.GroupInfo[0].ShutUpAllMember == 'On') {
					alert('该群组已开启全局禁言');
				}
				if(cbOK) {
					cbOK(resp);
				}
			},
			function(err) {
				alert(err.ErrorInfo);
			}
		);
	};
	//获取最新的群历史消息,用于切换群组聊天时，重新拉取群组的聊天消息
	function getLastGroupHistoryMsgs(cbOk) {
		getGroupInfo(groupId, function(resp) {
			//拉取最新的群历史消息
			var options = {
				'GroupId': groupId,
				'ReqMsgSeq': resp.GroupInfo[0].NextMsgSeq - 1,
				'ReqMsgNumber': reqMsgCount
			};
			if(options.ReqMsgSeq == null || options.ReqMsgSeq == undefined || options.ReqMsgSeq <= 0) {
				webim.Log.warn("该群还没有历史消息:options=" + JSON.stringify(options));
				return;
			}
			selSess = null;
			webim.MsgStore.delSessByTypeId(selType, groupId);
			webim.syncGroupMsgs(
				options,
				function(msgList) {
//					console.log(msgList)
					if(msgList.length == 0) {
						webim.Log.warn("该群没有历史消息了:options=" + JSON.stringify(options));
						return;
					}
					var msgSeq = msgList[0].seq - 1;
					getPrePageGroupHistroyMsgInfoMap[groupId] = {
						"ReqMsgSeq": msgSeq
					};
					//清空聊天界面
					// document.getElementsByClassName("msgflow")[0].innerHTML = "";
					cbOk && cbOk(msgList);
				},
				function(err) {
					alert(err.ErrorInfo);
				}
			);
		});
	}
	//向上翻页，获取更早的群历史消息
	function getPrePageGroupHistoryMsgs(cbOk) {
		var tempInfo = getPrePageGroupHistroyMsgInfoMap[groupId]; //获取下一次拉取的群消息seq
		var reqMsgSeq;
		if(tempInfo) {
			reqMsgSeq = tempInfo.ReqMsgSeq;
			if(reqMsgSeq <= 0) {
				webim.Log.warn('该群没有历史消息可拉取了');
				return;
			}
		} else {
			webim.Log.error('获取下一次拉取的群消息seq为空');
			return;
		}
		var options = {
			'GroupId': groupId,
			'ReqMsgSeq': reqMsgSeq,
			'ReqMsgNumber': reqMsgCount
		};

		webim.syncGroupMsgs(
			options,
			function(msgList) {
				if(msgList.length == 0) {
					webim.Log.warn("该群没有历史消息了:options=" + JSON.stringify(options));
					return;
				}
				var msgSeq = msgList[0].seq - 1;
				getPrePageGroupHistroyMsgInfoMap[groupId] = {
					"ReqMsgSeq": msgSeq
				};

				if(cbOk) {
					cbOk(msgList);
				} else {
					getHistoryMsgCallback(msgList, true);
				}
			},
			function(err) {
				alert(err.ErrorInfo);
			}
		);
	};
	//获取历史消息(c2c或者group)成功回调函数
	//msgList 为消息数组，结构为[Msg]
	function getHistoryMsgCallback(msgList, prepage) {
		var msg;
		prepage = prepage || false;

		//如果是加载前几页的消息，消息体需要prepend，所以先倒排一下
		if(prepage) {
			msgList.reverse();
		}
//		console.log('History', msgList);
		for(var j in msgList) { //遍历新消息
			msg = msgList[j];
			if(msg.getSession().id() == groupId) { //为当前聊天对象的消息
				selSess = msg.getSession();
				//在聊天窗体中新增一条消息
				addMsg(msg, prepage);
			}
		}
		//消息已读上报，并将当前会话的消息设置成自动已读
		webim.setAutoRead(selSess, true, true);
	}

	function onSendMsg(msgContent, suc) {
		let msgLen = webim.Tool.getStrBytes(msgContent);
		let maxLen = webim.MSG_MAX_LENGTH.GROUP;
		if(msgLen > maxLen) {
			base.showMsg('消息长度超出限制(最多' + Math.round(maxLen / 3) + '汉字)');
			return;
		}
		handleMsgSend(msgContent, suc);
	}

	function handleMsgSend(msgContent, suc) {
		var sess = webim.MsgStore.sessByTypeId(webim.SESSION_TYPE.GROUP, groupId);
		if(!sess) {
			sess = new webim.Session(selType, groupId, groupName, '' /*, groupPhoto*/ , Math.round(new Date().getTime() / 1000));
		}
		let random = Math.round(Math.random() * 4294967296); // 消息随机数，用于去重
		let msgTime = Math.round(new Date().getTime() / 1000); // 消息时间戳
		let msg = new webim.Msg(sess, true, -1, random, msgTime, userId, subType, 'nickname' /*, this.user.nickname*/ );
		let textObj, faceObj, tmsg, emotionIndex, emotion, restMsgIndex;
		// 解析文本和表情
		let expr = /\[[^[\]]{1,3}\]/mg;
		let emotions = msgContent.match(expr);
		if(!emotions || emotions.length < 1) {
			textObj = new webim.Msg.Elem.Text(msgContent);
			msg.addText(textObj);
		} else {
			for(let i = 0; i < emotions.length; i++) {
				tmsg = msgContent.substring(0, msgContent.indexOf(emotions[i]));
				if(tmsg) {
					textObj = new webim.Msg.Elem.Text(tmsg);
					msg.addText(textObj);
				}
				emotionIndex = webim.EmotionDataIndexs[emotions[i]];
				emotion = webim.Emotions[emotionIndex];
				if(emotion) {
					faceObj = new webim.Msg.Elem.Face(emotionIndex, emotions[i]);
					msg.addFace(faceObj);
				} else {
					textObj = new webim.Msg.Elem.Text(emotions[i]);
					msg.addText(textObj);
				}
				restMsgIndex = msgContent.indexOf(emotions[i]) + emotions[i].length;
				msgContent = msgContent.substring(restMsgIndex);
			}
			if(msgContent) {
				textObj = new webim.Msg.Elem.Text(msgContent);
				msg.addText(textObj);
			}
		}
		webim.sendMsg(msg, () => {
			webim.Tool.setCookie("tmpmsg_" + groupId, '', 0);
			$('#msgedit').val('')
		}, () => {
			base.showMsg('消息发送失败，请重新发送');
		});
	}

	//聊天页面增加一条消息
	function addMsg(msg, prepend, isNew) {
		var isSelfSend, fromAccount, fromAccountNick, fromAccountImage, sessType, subType;
		//获取会话类型，目前只支持群聊
		//webim.SESSION_TYPE.GROUP-群聊，
		//webim.SESSION_TYPE.C2C-私聊，
		sessType = msg.getSession().type();

		isSelfSend = msg.getIsSend(); // 消息是否为自己发的
		fromAccount = msg.getFromAccount();
		if(!fromAccount) {
			return;
		}
		fromAccountNick = msg.getFromAccountNick() || fromAccount;
		fromAccountImage = msg.fromAccountHeadurl || '';
		if(fromAccount == 'admin') {
			fromAccountNick = '系统消息';
		}
		var onemsg = document.createElement("div");

		onemsg.className = "onemsg";
		var msghead = document.createElement("div");
		var msgbody = document.createElement("div");
		var msgPre = document.createElement("div");
		msghead.className = "msghead";
		msgbody.className = "msgbody";
		msgPre.className = "msgcon";

		//解析消息

		//获取消息子类型
		//会话类型为群聊时，子类型为：webim.GROUP_MSG_SUB_TYPE
		//会话类型为私聊时，子类型为：webim.C2C_MSG_SUB_TYPE
		var adminMsg = ''
		subType = msg.getSubType();

		switch(subType) {
			case webim.GROUP_MSG_SUB_TYPE.COMMON: //群普通消息
				var tmpl = convertMsgtoHtml(msg);
				if(tmpl.sta) {
					return;
				}
				if(fromAccount != 'admin'){
					msgPre.innerHTML = tmpl.html;
				}else{
					adminMsg = tmpl.html
				}
				break;
		}
		
		//系統消息 //昵称  消息时间
		if(fromAccount == 'admin'){
			msghead.innerHTML =  adminMsg + '<samp>('+webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime()))+")</samp>";
			onemsg.setAttribute('class','onemsg admin')
		
		//对方消息
		}else if(fromAccount!=base.getUserId()){
			msghead.innerHTML = "<div class='photoWrap'>"+tradePhoto+"</div><div class='nameWrap'><samp class='name'>" + webim.Tool.formatText2Html(userName) + "</samp><samp>" + webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime()))+'</samp></div>';
			onemsg.setAttribute('class','onemsg user')
		
		//我的消息
		}else{
			msghead.innerHTML = "<div class='photoWrap'>"+tradePhotoMy+"</div><div class='nameWrap'><samp class='name'>" +  webim.Tool.formatText2Html(myName) + "</samp><samp>" + webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime()))+'</samp></div>';
			onemsg.setAttribute('class','onemsg my')
		}
		
		if(fromAccount != 'admin'){
			msgbody.appendChild(msgPre);
		}

		onemsg.appendChild(msghead);
		onemsg.appendChild(msgbody);
		
		if(fromAccount == 'admin') {
			if(isNew){
				setTimeout(function(){
					getOrderDetail();
				},100)
			}
		}
		//消息列表
		var msgflow = document.getElementById("msgflow");
		if(prepend) {
			//300ms后,等待图片加载完，滚动条自动滚动到底部
			msgflow.insertBefore(onemsg, msgflow.firstChild);
			if(msgflow.scrollTop == 0) {
				setTimeout(function() {
					msgflow.scrollTop = 0;
				}, 300);
			}
		} else {
			msgflow.appendChild(onemsg);
			//300ms后,等待图片加载完，滚动条自动滚动到底部
			setTimeout(function() {
				msgflow.scrollTop = msgflow.scrollHeight;
			}, 300);
		}

	}
	//把消息转换成Html
	function convertMsgtoHtml(msg) {
		var html = "",
			elems, elem, type, content;
		elems = msg.getElems(); //获取消息包含的元素数组
		var count = elems.length;
		var sta = 0;
		for(var i = 0; i < count; i++) {
			elem = elems[i];
			type = elem.getType(); //获取元素类型
			content = elem.getContent(); //获取元素对象
			switch(type) {
				case webim.MSG_ELEMENT_TYPE.TEXT:
					var eleHtml = convertTextMsgToHtml(content);
					//转义，防XSS
					html += webim.Tool.formatText2Html(eleHtml);
					break;
				case webim.MSG_ELEMENT_TYPE.CUSTOM:
					sta = 1;
					break;
				case webim.MSG_ELEMENT_TYPE.FACE:
					html += convertFaceMsgToHtml(content);
					break;
				case webim.MSG_ELEMENT_TYPE.IMAGE:
					if(i <= count - 2) {
						var customMsgElem = elems[i + 1]; // 获取保存图片名称的自定义消息elem
						var imgName = customMsgElem.getContent().getData(); // 业务可以自定义保存字段，demo中采用data字段保存图片文件名
						html += convertImageMsgToHtml(content, imgName);
						i++; //下标向后移一位
					} else {
						html += convertImageMsgToHtml(content);
					}
					break;
				default:
					webim.Log.error('未知消息元素类型: elemType=' + type);
					break;
			}
		}
		return {
			html,
			sta
		};
	}

	//解析文本消息元素
	function convertTextMsgToHtml(content) {
		return content.getText();
	}
	//解析表情消息元素
	function convertFaceMsgToHtml(content) {
		var faceUrl = null;
		var data = content.getData();
		var index = webim.EmotionDataIndexs[data];

		var emotion = webim.Emotions[index];
		if(emotion && emotion[1]) {
			faceUrl = emotion[1];
		}
		if(faceUrl) {
			return "<img src='" + faceUrl + "'/>";
		} else {
			return data;
		}
	}
	//解析图片消息元素
	function convertImageMsgToHtml(content, imageName) {
		var smallImage = content.getImage(webim.IMAGE_TYPE.SMALL); // 小图
		var bigImage = content.getImage(webim.IMAGE_TYPE.LARGE); // 大图
		var oriImage = content.getImage(webim.IMAGE_TYPE.ORIGIN); // 原图
		if(!bigImage) {
			bigImage = smallImage;
		}
		if(!oriImage) {
			oriImage = smallImage;
		}
		return "<img name='" + imageName + "' src='" + smallImage.getUrl() + "#" + bigImage.getUrl() + "#" + oriImage.getUrl() + "' style='cursor: pointer;' id='" + content.getImageId() + "' bigImgUrl='" + bigImage.getUrl() + "' />";
	}

	// picUpload
	//选择图片触发事件
	function fileOnChange(uploadFile) {
		if(!window.File || !window.FileList || !window.FileReader) {
			alert("您的浏览器不支持File Api");
			return;
		}
		var file = uploadFile.files[0];
		var fileSize = file.size;
		//先检查图片类型和大小
		if(!checkPic(uploadFile, fileSize)) {
			return;
		}
		//预览图片
		var reader = new FileReader();
		var preDiv = document.getElementById('previewPicDiv');
		reader.onload = (function(file) {
			return function(e) {
				preDiv.innerHTML = '';
				var span = document.createElement('span');
				span.innerHTML = '<img class="img-responsive" src="' + this.result + '" alt="' + file.name + '" />';
				//span.innerHTML = '<img class="img-thumbnail" src="' + this.result + '" alt="' + file.name + '" />';
				preDiv.insertBefore(span, null);
			};
		})(file);
		//预览图片
		reader.readAsDataURL(file);
	}

	//上传图片进度条回调函数
	//loadedSize-已上传字节数
	//totalSize-图片总字节数
	function onProgressCallBack(loadedSize, totalSize) {
		var progress = document.getElementById('upd_progress'); //上传图片进度条
		progress.value = (loadedSize / totalSize) * 100;
	}

	//上传图片
	function uploadPic() {
		var uploadFiles = document.getElementById('upd_pic');
		var file = uploadFiles.files[0];
		var businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
		//封装上传图片请求
		var opt = {
			'file': file, //图片对象
			'onProgressCallBack': onProgressCallBack, //上传图片进度条回调函数
			//'abortButton': document.getElementById('upd_abort'), //停止上传图片按钮
			'To_Account': groupId, //接收者
			'businessType': businessType //业务类型
		};
		//上传图片
		webim.uploadPic(opt,
			function(resp) {
				//上传成功发送图片
				sendPic(resp, file.name);
				$('#upload_pic_dialog').hide();
			},
			function(err) {
				alert(err.ErrorInfo);
			}
		);
	}
	//发送图片消息
	function sendPic(images, imgName) {
		if(!groupId) {
			alert("您还没有好友，暂不能聊天");
			return;
		}
		var sess = webim.MsgStore.sessByTypeId(webim.SESSION_TYPE.GROUP, groupId);
		if(!sess) {
			sess = new webim.Session(selType, groupId, groupName, '' /*, groupPhoto*/ , Math.round(new Date().getTime() / 1000));
		}
		var msg = new webim.Msg(sess, true, -1, -1, -1, userId, 0, 'nickname');
		var images_obj = new webim.Msg.Elem.Images(images.File_UUID);
		for(var i in images.URL_INFO) {
			var img = images.URL_INFO[i];
			var newImg;
			var type;
			switch(img.PIC_TYPE) {
				case 1: //原图
					type = 1; //原图
					break;
				case 2: //小图（缩略图）
					type = 3; //小图
					break;
				case 4: //大图
					type = 2; //大图
					break;
			}
			newImg = new webim.Msg.Elem.Images.Image(type, img.PIC_Size, img.PIC_Width, img.PIC_Height, img.DownUrl);
			images_obj.addImage(newImg);
		}
		msg.addImage(images_obj);
		//调用发送图片消息接口
		webim.sendMsg(msg, function(resp) {
			// if (selType == webim.SESSION_TYPE.C2C) {//私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
			//   addMsg(msg);
			// }
		}, function(err) {
			alert(err.ErrorInfo);
		});
	}
	//上传图片(用于低版本IE)
	function uploadPicLowIE() {
		var uploadFile = $('#updli_file')[0];
		var file = uploadFile.files[0];
		var fileSize = file.size;
		//先检查图片类型和大小
		if(!checkPic(uploadFile, fileSize)) {
			return;
		}
		var businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
		//封装上传图片请求
		var opt = {
			'formId': 'updli_form', //上传图片表单id
			'fileId': 'updli_file', //file控件id
			'To_Account': groupId, //接收者
			'businessType': businessType //图片的使用业务类型
		};
		webim.submitUploadFileForm(opt,
			function(resp) {
				$('#upload_pic_low_ie_dialog').hide();
				//发送图片
				sendPic(resp);
			},
			function(err) {
				$('#upload_pic_low_ie_dialog').hide();
				alert(err.ErrorInfo);
			}
		);
	}
	//检查文件类型和大小
	function checkPic(obj, fileSize) {
		var picExts = 'jpg|jpeg|png|bmp|gif|webp';
		var photoExt = obj.value.substr(obj.value.lastIndexOf(".") + 1).toLowerCase(); //获得文件后缀名
		var pos = picExts.indexOf(photoExt);
		if(pos < 0) {
			alert("您选中的文件不是图片，请重新选择");
			return false;
		}
		fileSize = Math.round(fileSize / 1024 * 100) / 100; //单位为KB
		if(fileSize > 30 * 1024) {
			alert("您选择的图片大小超过限制(最大为30M)，请重新选择");
			return false;
		}
		return true;
	}
	//单击图片事件
	function imageClick(imgObj) {
		var imgUrls = imgObj.src;
		var imgUrlArr = imgUrls.split("#"); //字符分割
		var smallImgUrl = imgUrlArr[0]; //小图
		var bigImgUrl = imgUrlArr[1]; //大图
		var oriImgUrl = imgUrlArr[2]; //原图
		var bigPicDiv = document.getElementById('bigPicDiv');
		bigPicDiv.innerHTML = '';
		var span = document.createElement('span');
		span.innerHTML = '<img class="img-thumbnail" src="' + bigImgUrl + '" />';
		bigPicDiv.insertBefore(span, null);
		$('#click_pic_dialog').show();
	}
	//弹出发图对话框
	function selectPicClick() {
		// 判断浏览器版本
		if(webim.BROWSER_INFO.type == 'ie' && parseInt(webim.BROWSER_INFO.ver) <= 9) {
			$('#updli_form')[0].reset();
			$('#upload_pic_low_ie_dialog').show();
		} else {
			$('#upd_form')[0].reset();
			var preDiv = document.getElementById('previewPicDiv');
			preDiv.innerHTML = '';
			var progress = document.getElementById('upd_progress'); //上传图片进度条
			progress.value = 0;
			$('#upload_pic_dialog').show();
		}
	}

	function addListener() {

		//立即下单点击
		$(".orderDetail-middle .title .item").click(function() {
			var _this = $(this)
			if(!_this.hasClass("on")) {
				_this.addClass("on").siblings(".item").removeClass("on");
				$(".orderDetail-middle .content-wrap .wrap").eq(_this.index())
					.removeClass("hidden").siblings(".wrap").addClass("hidden");
			}
		})
		//--聊天 star--
		$('#send').on('click', function() {
			if($('#msgedit').val()!=""&&$('#msgedit').val()){
				onSendMsg($('#msgedit').val());
			}
		});
//	    $(document).keyup(function(event){
//			if(event.keyCode==13){
//				$('#send').click();
//				$('#msgedit').blur()
//			}
//		}); 
		
		$('#group').on('click', function() {
			createGroup();
		});
		// 图片上传 star
		$('#openPic').on('click', selectPicClick);
		$('#upd_pic').on('change', function() {
			fileOnChange(this);
		});
		$('#upd_send').on('click', function(){
			if($('#upd_pic').val()!=""&&$('#upd_pic').val()){
				uploadPic();
			}
		});
		$('#upd_close').on('click', function() {
			$('#upload_pic_dialog').hide();
		});
		$('#upload_pic_dialog .close').on('click', function() {
			$('#upload_pic_dialog').hide();
		});
		
		// ie<=9
		$('#updli_send').on('click', function() {
			if($('#updli_file').val()!=""&&$('#updli_file').val()){
				uploadPicLowIE();
			}
		});
		$('#updli_close').on('click', function() {
			$('#upload_pic_low_ie_dialog').hide();
		});
		$('#upload_pic_low_ie_dialog .close').on('click', function() {
			$('#upload_pic_low_ie_dialog').hide();
		});
		
		$('#msgflow').on('click', 'img', function() {
			imageClick(this);
		});
		$('#click_pic_dialog_close').on('click', function() {
			$('#click_pic_dialog').hide();
		})
		$('#click_pic_dialog .close').on('click', function() {
			$('#click_pic_dialog').hide();
		});
		
		//表情
		$('#msgImg').on('click', function() {
			if($(this).hasClass("on")){
				$(".emotionUL-wrap").addClass("hidden");
				$(this).removeClass("on")
			}else{
				$(".emotionUL-wrap").removeClass("hidden");
				$(this).addClass("on")
				showEmotionDialog();
			}
		})
		//--end--
		
		//評價
        $("#commentDialog .comment-Wrap .item").click(function(){
        	$(this).addClass("on").siblings(".item").removeClass("on")
        })
        
        //取消订单按钮 点击
        $(".cancelBtn").on("click", function(){
        	base.confirm("確認取消交易？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.cancelOrder(code).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        		},base.hideLoadingSpin)
        	},base.emptyFun)
        })
        
        //標記打款按钮 点击
        $(".payBtn").on("click", function(){
        	base.confirm("確認標記打款？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.payOrder(code).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        		},base.hideLoadingSpin)
        	},base.emptyFun)
        })
        
        //申請仲裁按钮 点击
        $(".arbitrationBtn").on("click", function(){
        	
        	$("#arbitrationDialog").removeClass("hidden")
        	
        })
        
        //彈窗-放棄
        $("#arbitrationDialog .closeBtn").click(function(){
        	$("#arbitrationDialog").addClass("hidden");
        	$("#form-wrapper .textarea-item").val("")
        })
        
        var _formWrapper = $("#form-wrapper");
    	_formWrapper.validate({
    		'rules': {
    			'reason':{
    				required: true
    			},
    		}
    	})
        
        //彈窗-申請仲裁
        $("#arbitrationDialog .subBtn").click(function(){
        	var params = _formWrapper.serializeObject()
        	base.showLoadingSpin()
    		TradeCtr.arbitrationlOrder({
    			code: code,
    			reason: params.reason
    		}).then(()=>{
    			base.hideLoadingSpin();
    			
    			base.showMsg("操作成功");
    			$("#arbitrationDialog").addClass("hidden");
    			$("#form-wrapper .textarea-item").val("")
    		},base.hideLoadingSpin)
        })
        
        //交易評價按钮 点击
        $(".commentBtn").on("click", function(){
        	var orderCode = $(this).attr("data-ocode");
        	$("#commentDialog .subBtn").attr("data-ocode",orderCode)
        	$("#commentDialog").removeClass("hidden")
        })
        
        //释放货币按钮 点击
        $(".releaseBtn").on("click", function(){
        	base.confirm("確認释放货币？").then(()=>{
        		base.showLoadingSpin()
        		TradeCtr.releaseOrder(code).then(()=>{
        			base.hideLoadingSpin();
        			
        			base.showMsg("操作成功");
        		},base.hideLoadingSpin)
        	},base.emptyFun)
        })
        
        $("#commentDialog .comment-Wrap .item").click(function(){
        	$(this).addClass("on").siblings(".item").removeClass("on")
        })
        
        $("#commentDialog .subBtn").click(function(){
        	var orderCode= $(this).attr("data-ocode");
        	var comment = $("#commentDialog .comment-Wrap .item.on").attr("data-value");
        	
        	base.showLoadingSpin();
        	TradeCtr.commentOrder(code,comment).then(()=>{
    			base.hideLoadingSpin();
    			base.showMsg("操作成功");
    			$("#commentDialog").addClass("hidden");
	            $("#commentDialog .comment-Wrap .item").eq(0).addClass("on").siblings(".item").removeClass("on")
    		},base.hideLoadingSpin)
        })
		
		//购买 点击
        $(".goBuyDetailBtn").on("click", function(){
    		base.gohref("../trade/buy-detail.html?code="+adsCode)
        	
        })
        //出售 点击
        $(".goSellDetailBtn").on("click", function(){
    		base.gohref("../trade/sell-detail.html?code="+adsCode)
        })
	}
});