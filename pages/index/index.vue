<template>
  <view class="container">
    <image v-if="templateId" class="subscribe" @click="subscribe()" src="../../static/banner.jpg">
	<view class="share">
		<button open-type="share">分享给好友</button>
	</view>
	<view class="banners" v-if="banners.length" @click="handleClickBanner()">
		<image :src="banners[0].img" class="banner" mode="widthFix"></image>
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
      couponList: [],
      banners: [],
      templateId: getApp().globalData.templateId,
    };
  },
  onLoad(e) {
    this.getHome();
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
    async toCoupon(i) {
      console.log(this.couponList[i]);
      //h5
      //#ifdef H5
      window.location.href = this.couponList[i].url;
      //#endif
      //微信小程序
      //#ifdef MP-WEIXIN
      if (this.couponList[i].minapp) {
        const [error, res] = await uni.navigateToMiniProgram({
          appId: this.couponList[i].minapp.appid,
          path: this.couponList[i].minapp.path,
        });
        if (error) return;
      }
      //#endif
    },
    async getHome() {
      uni.showLoading({ title: "召唤神券中..." });
      const data = await uniCloud.callFunction({ name: "home" });
      this.couponList = data.result.coupons;
      this.banners = data.result.banners;
      uni.hideLoading();
    },
    handleClickBanner() {
      const key = JSON.stringify(this.banners);
      uni.navigateTo({
        url: `/pages/webview/webview?key=${key}`,
      });
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
	display: block;
    width: 100%;
    height: 240rpx;
  }

  .banners {
	  margin: 30rpx 20rpx 0;

	  .banner {
		  display: block;
		  width: 100%;
		  height: auto;
	  }
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
      animation: scaleBig 2s infinite;
    }
  }

  .coupon {
    padding-bottom: 10rpx;

    .item {
      background-color: #ffffff;
      margin: 30rpx 20rpx;
      border-radius: 10rpx;
      padding: 30rpx 20rpx;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);

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
@keyframes scaleBig {
  from {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
  }
}
</style>
