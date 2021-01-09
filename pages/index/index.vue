<template>
  <view class="container">
    <image v-if="templateId" class="subscribe" @click="subscribe()" src="../../static/banner.jpg">
    <view class="coupon" ref="coupon">
      <view
        class="item"
        v-for="(v, i) in couponList"
        @click="toCoupon(i)"
        :key="i"
      >
        <view class="top">
          <view class="left">
            <view class="content">
              <image :src="v.icon" class="icon" mode="widthFix" />
              <view class="name">{{ v.name }}</view>
            </view>
            <view class="text" v-if="v.type == 1">天天可领</view>
            <view class="text" v-else-if="v.type == 2">限时秒杀</view>
          </view>
          <view class="right">免费领取</view>
        </view>
        <view class="bottom">
          <image :src="v.bannerPic" mode="widthFix" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      couponList: [],
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
    const messages = [
      {
        title: "美团饿了么大额红包，每日可领！",
        path: "/pages/index/index",
      },
      {
        title: "吃了这么多年外卖，你知道这个秘密吗？",
        path: "/pages/index/index",
      },
      {
        title: "这样点外卖，一年省下一个亿",
        path: "/pages/index/index",
      },
      {
        title: "点外卖前先领券，吃霸王餐",
        path: "/pages/index/index",
      },
      {
        title: "美团饿了么内部优惠券，手慢无",
        path: "/pages/index/index",
      },
      {
        title: "点外卖不用优惠券，你就out了",
        path: "/pages/index/index",
      },
      {
        title: "外卖不为人知的秘密，点这解密",
        path: "/pages/index/index",
      },
      {
        title: "震惊！小伙点外卖竟然花了1分钱",
        path: "/pages/index/index",
      },
      {
        title: "从这点外卖，你也可以吃霸王餐",
        path: "/pages/index/index",
      },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },
};
</script>

<style lang="scss">
page {
  background-color: #f8f8f8;
}

.container {
  font-size: 14px;
  line-height: 24px;
  position: relative;

  .subscribe {
    width: 100%;
    height: 240rpx;
  }

  .tab {
    position: fixed;
    top: var(--window-top);
    left: 0;
    z-index: 9999;
  }

  .coupon {
    // padding-top: 200rpx;
    padding-bottom: 10rpx;

    .item {
      background-color: #ffffff;
      margin: 30rpx;
      border-radius: 10rpx;
      padding: 0 30rpx 30rpx 30rpx;

      .top {
        height: 116rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .left {
          height: 116rpx;
          width: 400rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .content {
            width: 100%;
          }

          .icon {
            display: inline-block;
            vertical-align: bottom;
            width: 52rpx;
            height: auto;
          }

          .name {
            text-align: left;
            display: inline-block;
            vertical-align: bottom;
            font-size: 34rpx;
            color: #000;
            line-height: 50rpx;
            font-weight: bold;
            margin-left: 15rpx;
          }

          .text {
            width: 150rpx;
            height: 38rpx;
            line-height: 38rpx;
            text-align: center;
            font-size: 24rpx;
            color: #61300e;
            background: linear-gradient(90deg, #f9db8d, #f8d98a);
            border-radius: 6rpx;
          }
        }

        .right {
          width: 170rpx;
          height: 60rpx;
          border-radius: 30rpx;
          background: linear-gradient(90deg, #ec6f43, #ea4a36);
          color: #fff;
          font-size: 28rpx;
          line-height: 60rpx;
          text-align: center;
        }
      }

      .bottom {
        height: auto;
        width: 100%;

        image {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 20rpx;
        }
      }
    }
  }
}
</style>
