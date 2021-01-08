
# 今日神券

美团饿了吗CPS小程序项目，别人领红包下单，你拿推广佣金

### DEMO

<img src="./examples/code.jpg" width="250" />


### 使用方法

源码为 uni-app + uniCloud 项目，需下载hbuilder导入项目打包，可编译成微信小程序(跳转地址为小程序路径)


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




如有疑问，请提issue
