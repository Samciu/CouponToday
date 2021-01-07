'use strict';
const utils = require('utils');
const openapi = require('mp-cloud-openapi')
const openapiWeixin = openapi.initWeixin({
	appId: utils.APPID,
	secret: utils.SECREAT
})

exports.main = async (event, context) => {
	const db = uniCloud.database();
	try {
		// 从云开发数据库中查询等待发送的消息列表
		const messages = await db.collection('messages').where({ done: false }).get();
		const { accessToken, expiresIn } = await openapiWeixin.auth.getAccessToken()

		// 多次订阅去重，只发送一次
		const messageList = messages.data.filter((item, index, arr) => {
			// 正在处理的元素在数组中的索引，是元素在原来数组中的第一个索引，就把它塞进新数组
			return index == arr.findIndex(element => element.touser == item.touser)
		})

		console.log(JSON.stringify(messageList))

		// 循环消息列表
		const sendPromises = messageList.map(async message => {
			try {
				// 发送订阅消息
				const result = await openapiWeixin.subscribeMessage.send({
					touser: message.touser,
					page: message.page,
					data: {
						thing1: {
							value: "快来领外卖红包啰！",
						},
						thing4: {
							value: "领巨额外卖红包，省出一套房～",
						},
						thing5: {
							value: "您有一条活动需要参加，请查看",
						}
					},
					templateId: message.templateId,
					accessToken
				});

				console.log(result)
				if (result.errCode != 0) return; // 发送失败

				// 发送成功后将消息的状态改为已发送
				// return db.collection('messages').doc(message._id).update({ done: true });
			} catch (e) {
				return e;
			}
		});

		return Promise.all(sendPromises);

	} catch (err) {
		console.log(err);
	}
};