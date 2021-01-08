'use strict';

const coupons = [
	{
		"name": "饿了么红包",
		"icon": "/static/coupon/ele.png",
		"bannerPic": "/static/coupon/ele_banner.png",
		"url": "https://s.click.ele.me/qx45rsu",
		"type": 1,
		"tabId": 1,
		"minapp": {
			"appid": "wxece3a9a4c82f58c9",
			"path": "pages/sharePid/web/index?scene=https://s.click.ele.me/qx45rsu"
		}
	},
	{
		"name": "美团外卖红包",
		"icon": "/static/coupon/meituan.png",
		"bannerPic": "/static/coupon/meituan_banner.png",
		"url": "https://act.meituan.com/clover/page/adunioncps/share_coupon_new?utmSource=56020&utmMedium=3D52DEF4438AE63F0FBF09E13E5B1B8E&promotionId=20172&activity=OwMkGzn6oK",
		"type": 1,
		"tabId": 2,
		"minapp": {
			"appid": "wxde8ac0a21135c07d",
			"path": "/index/pages/h5/h5?lch=mhqIykekFEV63u81zLSTaQViQ&noshare=1&f_userId=0&f_openId=0&f_token=1&weburl=https%3A%2F%2Fact.meituan.com%2Fclover%2Fpage%2Fadunioncps%2Fshare_coupon_new%3FutmSource%3D56020%26utmMedium%3D3D52DEF4438AE63F0FBF09E13E5B1B8E%26promotionId%3D20172%26activity%3DOwMkGzn6oK"
		}
	},
	{
		"name": "抖音视频去水印",
		"icon": "/static/coupon/douyin.png",
		"bannerPic": "/static/coupon/douyin_banner.jpg",
		"url": "",
		"type": 3,
		"tabId": 0,
		"minapp": {
			"appid": "wxfb0e84a3b0778a62",
			"path": "/pages/index/index"
		}
	}
]


exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	//返回数据给客户端
	return coupons
};