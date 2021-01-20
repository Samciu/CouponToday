
# 今日神券

美团饿了吗CPS小程序项目，别人领红包下单，你拿推广佣金

### DEMO

<img src="./examples/code.jpg" width="250" />


### 使用方法

源码为 uni-app + uniCloud 项目，需下载hbuilder导入项目打包，可编译成微信小程序(跳转地址为小程序路径)

master 分支的优惠券列表数据在云函数上，[no-api](https://github.com/Samciu/CouponToday/tree/no-api) 分支的优惠券列表数据写在前端本地

[《0成本睡后收入！从0教你搭建一个会自己赚钱的外卖CPS小程序》](https://mp.weixin.qq.com/s?__biz=MjM5MjUyNjA2Mg==&mid=2454816396&idx=1&sn=c8a649dec81b1172b6d1c721c37d6fb2&chksm=b101dd0d8676541b6a427f8823ffbbe2eade0f24cb4340c2314fd26e18ced8e1fe8ef33091f0&token=1963651323&lang=zh_CN#rd)
### 常见问题

1、 如何获取美团饿了吗的推广链接

美团联盟：https://union.meituan.com/

饿了么、双十一：https://pub.alimama.com/

2、 如何打包成小程序

编译成小程序的话，需要配置coupons里小程序路径

比如跳转饿了么小程序：

```
minapp: {
    appid: 'wxece3a9a4c82f58c9',
    path: 'pages/sharePid/web/index?scene=https://s.click.ele.me/qx45rsu'
}
```







### 感谢

感谢 https://github.com/zwpro/coupons 提供的代码

本仓库代码在此基础上做了优化
- 优化了云函数的调用方法，不需要额外云函数URL化
- 重写优化了订阅消息的代码逻辑，减少额外openid请求，提高网络性能

### 交流

如有疑问，可以提issue，或者加我微信： dasamciu
