<template>
  <view class="container">
    <image v-if="templateId" class="subscribe" @click="subscribe()" src="../../static/banner.jpg">
	<view class="share">
		<button open-type="share">分享给好友</button>
	</view>
    <view class="coupon" ref="coupon">
      <view class="item" v-for="(v, i) in couponList" @click="toCoupon(i)" :key="i">
        <image :src="v.icon" class="icon" mode="widthFix" />
		<view class="content">
			<view class="name">{{ v.name }}</view>
			<view class="text" v-if="v.desc">{{ v.desc }}</view>
            <view class="text" v-else>限时秒杀</view>
		</view>
		<view class="btn" v-if="v.button">{{ v.button }}</view>
		<view class="btn" v-else>领取</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      couponList: [
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
          name: "美团外卖红包",
          desc: "最高优惠56元，天天可领",
          icon: "/static/meituan.jpg",
          bannerPic: "/static/coupon/meituan_banner.png",
          url:
            "https://act.meituan.com/clover/page/adunioncps/share_coupon_new?utmSource=56020&utmMedium=3D52DEF4438AE63F0FBF09E13E5B1B8E&promotionId=20172&activity=OwMkGzn6oK",
          type: 1,
          tabId: 2,
          minapp: {
            appid: "wxde8ac0a21135c07d",
            path:
              "/index/pages/h5/h5?lch=mhqIykekFEV63u81zLSTaQViQ&noshare=1&f_userId=0&f_openId=0&f_token=1&weburl=https%3A%2F%2Fact.meituan.com%2Fclover%2Fpage%2Fadunioncps%2Fshare_coupon_new%3FutmSource%3D56020%26utmMedium%3D3D52DEF4438AE63F0FBF09E13E5B1B8E%26promotionId%3D20172%26activity%3DOwMkGzn6oK",
          },
        },
        {
          name: "抖音视频去水印",
          desc: "免费使用，无广告",
          icon: "/static/coupon/douyin.png",
          button: "使用",
          bannerPic: "/static/coupon/douyin_banner.jpg",
          url: "",
          type: 3,
          tabId: 0,
          minapp: {
            appid: "wxfb0e84a3b0778a62",
            path: "/pages/index/index",
          },
        },
      ],
      templateId: getApp().globalData.templateId,
    };
  },
  onLoad(e) {
    // this.getHome();
  },
  methods: {
    async subscribe() {
      // 1、发起申请订阅权限界面
      const templateId = this.templateId;
      const [error, res] = await uni.requestSubscribeMessage({
        tmplIds: [templateId],
      });
      if (
        error ||
        res.errMsg != "requestSubscribeMessage:ok" ||
        res[templateId] != "accept"
      )
        return;

      // 2、调用云函数记录用户openid
      uni.showLoading({ title: "订阅中..." });
      const [loginError, loginRes] = await uni.login();
      const data = await uniCloud.callFunction({
        name: "subscribe",
        data: { templateId, code: loginRes.code },
      });
      uni.hideLoading();
      uni.showToast({ title: "订阅成功", icon: "success", duration: 2000 });
    },
    toCoupon(i) {
      console.log(this.couponList[i]);
      //h5
      //#ifdef H5
      window.location.href = this.couponList[i].url;
      //#endif
      //微信小程序
      //#ifdef MP-WEIXIN
      if (this.couponList[i].minapp) {
        wx.navigateToMiniProgram({
          appId: this.couponList[i].minapp.appid,
          path: this.couponList[i].minapp.path,
          success(res) {
            // 打开成功
          },
        });
      }
      //#endif
    },
    async getHome() {
      uni.showLoading({ title: "优惠加载中..." });
      const data = await uniCloud.callFunction({ name: "coupons" });
      this.couponList = data.result;
      uni.hideLoading();
    },
  },
  onShareAppMessage(res) {
    return {
      title: "震惊！小伙点外卖竟然花了1分钱",
      path: "/pages/index/index",
      imageUrl: "/static/share.jpg",
    };
  },
};
</script>

<style lang="scss">
page {
  background-color: #ffa800;
}

.container {
  font-size: 28rpx;

  .subscribe {
    width: 100%;
    height: 240rpx;
  }

  .share {
    position: fixed;
    text-align: center;
    bottom: 100rpx;
    left: 50%;
    transform: translate3d(-50%, 0, 0);

    button {
      background: linear-gradient(-180deg, #ffe75e, #ffd040);
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
      color: #d2471a;
      font-size: 38rpx;
	  font-weight: 700;
      padding: 0 80rpx;
      border-radius: 60rpx;
    }
  }

  .coupon {
    padding-bottom: 10rpx;

    .item {
      background-color: #ffffff;
      margin: 30rpx;
      border-radius: 10rpx;
      padding: 30rpx 20rpx;
      display: flex;
      align-items: center;

      .icon {
        margin-right: 20rpx;
        width: 100rpx;
      }

      .content {
        flex: 1;
      }

      .name {
        font-size: 36rpx;
      }

      .text {
        padding-top: 18rpx;
        color: #666;
      }

      .btn {
        margin-left: 8rpx;
        padding: 6rpx 20rpx;
        color: #d2471a;
        border: 1px solid #d2471a;
        border-radius: 10rpx;
        font-size: 32rpx;
		font-weight: 700;
      }
    }
  }
}
</style>
