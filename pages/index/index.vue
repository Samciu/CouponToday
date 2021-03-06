<template>
  <view class="take-out">
    <!-- <nav-bar compid="{{$compid__214}}"></nav-bar> -->
    <view class="banner">
      <view class="bg">
        <view class="up-space"></view>
        <view class="down-space"></view>
      </view>
      <view class="hover">
        <swiper
          :autoplay="true"
          :circular="true"
          class="swiper"
          indicatorActiveColor="#fff"
          indicatorColor="#ccc"
          :indicatorDots="true"
        >
          <swiper-item class="swiper-item" v-for="(banner, i) in banners" :key="i" @click="handleClickBanner(banner)">
            <image
              class="img"
              mode="widthFix"
              :src="banner.pic"
            ></image>
          </swiper-item>
        </swiper>
      </view>
    </view>
    <view class="icon-btns">
      <button @click="subscribe" class="item">
        <image
          class="icon"
          mode="widthFix"
          src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-k3gpzmwscp2i85a06d/ccc7ae90-57ce-11eb-b997-9918a5dda011.png"
        ></image>
        <text class="label">提醒我点餐</text>
      </button>
      <button
        class="item"
        openType="share"
        :wxif="loginStatus && agent.agentId"
      >
        <image
          class="icon"
          mode="widthFix"
          src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-k3gpzmwscp2i85a06d/cf7ae7b0-57ce-11eb-b997-9918a5dda011.png"
        ></image>
        <text class="label">分享给好友</text>
      </button>
      <!-- <button
        bindgetuserinfo="getUserInfo"
        class="item"
        openType="getUserInfo"
        :wxif="loginStatus && !agent.agentId"
      >
        <image
          class="icon"
          mode="widthFix"
          src="https://mpstatic.qingting123.com/img/icon/wechat.png"
        ></image>
        <text class="label">分享给好友</text>
      </button>
      <button bindtap="anonymousFunc0" class="item" :wxif="!loginStatus">
        <image
          class="icon"
          mode="widthFix"
          src="https://mpstatic.qingting123.com/img/icon/wechat.png"
        ></image>
        <text class="label">分享给好友</text>
      </button> -->
    </view>
    <view class="list">
      <view
        @click="openDialog(i)"
        class="item animated fadeIn"
        v-for="(item, i) in couponList"
        :key="i"
      >
        <view class="left">
          <image
            class="label ele"
            mode="widthFix"
            :src="item.labelPic"
          ></image>
          <image class="mark ele" mode="heightFix" :src="item.markPic"></image>
          <view class="content">
            <view class="title">{{ item.name }}</view>
            <view class="info">
              <text class="price">{{ item.price }}</text>
              <text class="unit">元</text>
              <text class="tip">{{ item.desc }}</text>
            </view>
          </view>
        </view>
        <view class="right">
          <view :class="'btn ' + item.buttonColor">{{ item.button }}</view>
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
    openDialog(i) {
      console.log(this.couponList[i]);
      uni.navigateToMiniProgram({
        appId: this.couponList[i].minapp.appid,
        path: this.couponList[i].minapp.path,
      });
    },
    async getHome() {
      uni.showLoading({ title: "召唤神券中..." });
      const data = await uniCloud.callFunction({ name: "home" });
      this.couponList = data.result.coupons;
      this.banners = data.result.banners;
	  if (data.result.close) {
		  uni.switchTab({
		      url: '/pages/eatwhat/eatwhat'
		  });
		  uni.hideTabBar()
	  }
      uni.hideLoading();
    },
    handleClickBanner(banner) {
      console.log(banner)
      const { type, appId, path, url } = banner;
      if (type == "miniapp") {
        uni.navigateToMiniProgram({
          appId,
          path,
        });
      } else {
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
        });
      }
    },
  },
  onShareAppMessage(res) {
    return {
      title: "震惊！小伙点外卖竟然花了1分钱",
      path: "/pages/index/index",
      imageUrl:
        "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-k3gpzmwscp2i85a06d/f95fbd20-57cf-11eb-bdc1-8bd33eb6adaa.jpg",
    };
  },
};
</script>

<style lang="scss">
.take-out {
  padding-bottom: 100rpx;
}

.take-out .lxy-nav-bar__center {
  font-weight: 700;
  letter-spacing: 1rpx;
}

.take-out .banner {
  position: relative;
  background-color: #fff;
}

.take-out .banner .bg {
  height: 100%;
  position: absolute;
  width: 100%;
}

.take-out .banner .bg .up-space {
  height: 55%;
  background-color: #ea3855;
}

.take-out .banner .bg .down-space {
  height: 40rpx;
  background-color: #ea3855;
  border-bottom-left-radius: 50%;
  border-bottom-right-radius: 50%;
}

.take-out .banner .hover {
  top: 0;
  right: 0;
  left: 0;
  padding: 20rpx 0 0;
}

.take-out .banner .hover .swiper {
  height: 238rpx;
}

.take-out .banner .hover .swiper .swiper-item {
  padding: 0 25rpx;
  box-sizing: border-box;
  height: 238rpx;
}

.take-out .banner .hover .swiper .swiper-item .img {
  display: block;
  width: 700rpx;
  height: 238rpx;
  border-radius: 40rpx;
}

.take-out .icon-btns,
.take-out .icon-btns .item {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  background-color: #fff;
}

.take-out .icon-btns {
  padding: 35rpx 25rpx;
}

.take-out .icon-btns .item {
  flex: 1;
  -ms-flex-pack: center;
  justify-content: center;
  border-radius: 0;
}

.take-out .icon-btns .item:first-child {
  border-right: 2rpx dashed #c4c4c4;
}

.take-out .icon-btns .item::after {
  border: 0;
}

.take-out .icon-btns .item .icon {
  width: 60rpx;
  height: 60rpx;
}

.take-out .icon-btns .item .label {
  font-size: 30rpx;
  margin-left: 18rpx;
}

.take-out .list,
.take-out .list .item {
  display: -ms-flexbox;
  display: flex;
}

.take-out .list {
  flex-direction: column;
  padding: 0 25rpx;
  margin-top: 28rpx;
}

.take-out .list .item {
  flex-wrap: nowrap;
  border-radius: 28rpx;
  margin-bottom: 20rpx;
  -ms-flex-align: center;
  align-items: center;
  overflow: hidden;
  height: 180rpx;
}

.take-out .list .item .left {
  width: 72%;
  height: 180rpx;
  position: relative;
  background-color: #fff;
}

.take-out .list .item .left::after,
.take-out .list .item .left::before {
  content: "";
  position: absolute;
  right: -12rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: #f3f3f3;
}

.take-out .list .item .left::before {
  top: -12rpx;
}

.take-out .list .item .left::after {
  bottom: -12rpx;
}

.take-out .list .item .left .label {
  position: absolute;
  top: 0;
  left: 0;
}

.take-out .list .item .left .label.ele {
  width: 106rpx;
  height: 106rpx;
}

.take-out .list .item .left .label.mt {
  width: 107rpx;
  height: 107rpx;
}

.take-out .list .item .left .mark {
  position: absolute;
  bottom: 0;
  left: 0;
}

.take-out .list .item .left .mark.ele {
  height: 68rpx;
}

.take-out .list .item .left .mark.mt {
  width: 119rpx;
}

.take-out .list .item .left .content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 180rpx;
  z-index: 1;
  display: -ms-flexbox;
  display: flex;
  flex-direction: column;
  -ms-flex-pack: center;
  justify-content: center;
  padding-left: 84rpx;
}

.take-out .list .item .left .content .title,
.take-out .list .item .right {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
}

.take-out .list .item .left .content .title {
  font-weight: 600;
  font-size: 30rpx;
}

.take-out .list .item .left .content .title .corner {
  width: 5rpx;
  height: 7rpx;
  margin: 0 7rpx;
  position: relative;
}

.take-out .list .item .left .content .title .corner.left-top {
  top: -10rpx;
}

.take-out .list .item .left .content .title .corner.right-bottom {
  top: 10rpx;
}

.take-out .list .item .left .content .title .new {
  width: 71rpx;
  height: 30rpx;
  margin-left: 2rpx;
  position: relative;
  top: -11rpx;
}

.take-out .list .item .left .content .info {
  font-size: 26rpx;
}

.take-out .list .item .left .content .info .price {
  color: #ff304d;
  font-size: 52rpx;
  font-weight: 700;
  position: relative;
  top: 4rpx;
  margin-right: 6rpx;
  font-family: PingFang SC;
}

.take-out .list .item .left .content .info .unit {
  color: #ff304d;
  margin-right: 6rpx;
}

.take-out .list .item .left .content .info .tip {
  background-color: #ffebe3;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  color: #aa1e3b;
}

.take-out .list .item .right {
  width: 28%;
  height: 180rpx;
  position: relative;
  background-color: #fff;
  border-left: 4rpx dashed #eee;
  -ms-flex-pack: center;
  justify-content: center;
}

.take-out .list .item .right::after,
.take-out .list .item .right::before {
  content: "";
  position: absolute;
  left: -12rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: #f3f3f3;
}

.take-out .list .item .right::before {
  top: -12rpx;
}

.take-out .list .item .right::after {
  bottom: -12rpx;
}

.take-out .list .item .right .btn {
  width: 80%;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  text-align: center;
}

.take-out .list .item .right .btn.red {
  background-color: #ff5b73;
  color: #fff;
}

.take-out .list .item .right .btn.yellow {
  background-color: #fcd530;
  color: #666;
}
</style>
