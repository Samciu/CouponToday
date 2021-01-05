### 更新日志 12.26

新增订阅功能

修改 cloudfunctions-aliyun/common/utils/index.js 中的 appid和secret参数，上传代码到云服务器即可


### 更新日志 11-30
新增uniCloud云开发，小程序数据可通过api更改。
（如只需要数据写死在前端，可切换到静态数据分支 [no-api](https://github.com/zwpro/coupons/tree/no-api)）

# 美团饿了吗CPS红包，别人领红包下单，你拿推广佣金
<img src="https://raw.githubusercontent.com/zwpro/coupons/master/static/demo.png" width="300"/>



### 使用方法

源码为uniapp项目，需下载hbuilder导入项目打包，可编译成h5或小程序(跳转地址为小程序路径)

[在线文档](http://lianghua.wxthe.com/docs/)


### 常见问题
1. 如何获取美团饿了吗的推广链接

美团联盟：https://union.meituan.com/

饿了么、双十一：https://pub.alimama.com/

​	2.如何打包成小程序

编译成小程序的话，需要配置coupons里小程序路径

比如跳转饿了么小程序：

```
minapp: {
    appid: 'wxece3a9a4c82f58c9',
    path: 'pages/sharePid/web/index?scene=https://s.click.ele.me/wR9ecuu'
}
```

已上线案例：

<img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107150908.jpg" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107150917.png" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107150923.jpg" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107150932.jpg" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107150944.jpg" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107150950.jpg" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107163539.jpg" width="200"/><img src="https://raw.githubusercontent.com/zwpro/coupons/master/examples/微信图片_20201107163546.jpg" width="200"/>



如有线上案例或疑问，请提issue
