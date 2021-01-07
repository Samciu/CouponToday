'use strict';
const uniID = require('uni-id')
const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		const res = await uniID.code2SessionWeixin({
			code: event.code
		})
		const result = await db.collection('messages').add({
			touser: res.openid, // 订阅者的openid
			page: 'pages/index/index', // 订阅消息卡片点击后会打开小程序的哪个页面
			templateId: event.templateId, // 订阅消息模板ID
			done: false, // 消息发送状态设置为 false
			// data: event.data, // 订阅消息的数据
		});
		return result
	} catch (e) {
		return e
	}
};
