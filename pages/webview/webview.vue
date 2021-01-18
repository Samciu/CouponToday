<template>
  <view v-if="url">
    <web-view :src="url"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: "",
    };
  },
  onLoad: function (option) {
    const { key } = option;
    if (key) {
      const banners = JSON.parse(key);
      this.url = banners[0].url;
    }
  },
};
</script>

<style lang="scss">
</style>
