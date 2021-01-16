'use strict';

const coupons = [
	{
		name: "饿了么红包天天领 ①",
		desc: "最高优惠66，每天可领",
		icon: "/static/ele.jpg",
		bannerPic: "/static/coupon/ele_banner.png",
		url: "https://s.click.ele.me/qx45rsu",
		type: 1,
		tabId: 1,
		minapp: {
			appid: "wxece3a9a4c82f58c9",
			path:
				"pages/sharePid/web/index?scene=https://s.click.ele.me/qx45rsu",
		},
	},
	{
		name: "饿了么红包天天领 ②",
		desc: "幸运红包，可叠加领取",
		icon: "/static/ele.jpg",
		bannerPic: "/static/coupon/ele_banner.png",
		url: "https://s.click.ele.me/qx45rsu",
		type: 1,
		tabId: 1,
		minapp: {
			appid: "wxece3a9a4c82f58c9",
			path:
				"ele-recommend-price/pages/guest/index?inviterId=3991aa5&chInfo=ch_app_chsub_Wechat",
		},
	},
	{
		name: "美团外卖红包天天领 ①",
		desc: "最高优惠56元，天天可领",
		icon: "/static/meituan.jpg",
		bannerPic: "/static/coupon/meituan_banner.png",
		url:
			"https://act12.meituan.com/clover/page/adunioncps/share_coupon_new?utmSource=56020&utmMedium=3D52DEF4438AE63F0FBF09E13E5B1B8E&promotionId=20172&activity=OwMkGzn6oK",
		type: 1,
		tabId: 2,
		minapp: {
			appid: "wxde8ac0a21135c07d",
			path:
				"/index/pages/h5/h5?lch=mhqIykekFEV63u81zLSTaQViQ&noshare=1&f_userId=0&f_openId=0&f_token=1&weburl=https%3A%2F%2Fact12.meituan.com%2Fclover%2Fpage%2Fadunioncps%2Fshare_coupon_new%3FutmSource%3D56020%26utmMedium%3D3D52DEF4438AE63F0FBF09E13E5B1B8E%26promotionId%3D20172%26activity%3DOwMkGzn6oK",
		},
	},
	{
		name: "美团外卖新人红包 ②",
		desc: "幸运红包，可叠加领取",
		icon: "/static/meituan.jpg",
		button: "领取",
		bannerPic: "/static/coupon/meituan_banner.png",
		url: "",
		type: 3,
		tabId: 0,
		minapp: {
			appid: "wx2c348cf579062e56",
			path: "outer_packages/r2xinvite/coupon/coupon?mt_share_id=kjvrruv4udv4&inviteCode=NnOIp-QOs8SiYF1dcSlL5r8phPrCf6qkH7evMyjIoup2NXxNCLYcBbd3bqpv2X2I86OXO-OOfQTuJfvg2wezgVcFqzqYzK9GVmwJhZeY-LHlbinTsmA6k1w4r_ZEu1KHWtkI8fCaKQxoo0VusrklP0ghFQP2xUPyVB27QkFS6ZA",
		},
	},
	// {
	// 	name: "携程酒店",
	// 	desc: "抽奖免费住五星酒店",
	// 	icon: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-k3gpzmwscp2i85a06d/b71e5e00-5746-11eb-b997-9918a5dda011.jpg",
	// 	button: "抽奖",
	// 	bannerPic: "/static/coupon/meituan_banner.png",
	// 	url: "",
	// 	type: 3,
	// 	tabId: 0,
	// 	minapp: {
	// 		appid: "wx0e6ed4f51db9d078",
	// 		path: "pages/hotel/inquire/index?jumpurl=%2Fpages%2Fhotel%2Fcomponents%2Fwebview%2Fwebview%3Fdata%3D%7B%22url%22%3A%22https%253A%252F%252Fm.ctrip.com%252Fwebapp%252Fhotelevents%252Fm%252Fliebianchoujianglaohuji202010%253FparentID%253D18cdf35eb759917bd72a161adf645c9e%2526wemp%253D1%22%7D&mktshare=eyJhbGxpYW5yojIklWZjNjM1MjgsInNpZCI6MTEwNTA4NCwib3VpZCI6Im1pbmkxMDA1Iiwic291cmNlaWQiOjU1NTU1NTQ2LCJmcm9tYWxsaWFuY2VpZCI6MCwiZnJvbXNpZCI6MCwiZnJvbW91aWQiOiIiLCJmcm9tc291cmNlaWQiOjAsImZyb21vcGVuaWQiOiJiNjFiM2QxOC04NjgwLTQ3Y2YtYmRlOC01YzIwMjRmMzRmN2UifQ()()LU&allianceid=263528&sid=1105084&ouid=mini1005&sourceid=55555546",
	// 	},
	// }
]

exports.main = async (event, context) => {
	//event为客户端上传的参数
	
	//返回数据给客户端
	return {
		coupons,
		banners: [
			// {
			// 	img: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-k3gpzmwscp2i85a06d/1b9d25e0-54f0-11eb-bdc1-8bd33eb6adaa.png",
			// 	url: "https://mp.weixin.qq.com/s/5AhplF9auBcnFpb_4T3xaA",
			// }
		]
	}
};
