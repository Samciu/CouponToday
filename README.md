
# 今日神券

美团饿了吗CPS小程序项目，别人领红包下单，你拿推广佣金

### DEMO

<img src="./examples/code.jpg" width="250" />


### 介绍

源码为 uni-app + uniCloud 项目，需下载hbuilder导入项目打包，可编译成微信小程序(跳转地址为小程序路径)

master 分支是新版UI前端代码，依赖管理后台数据，需要先部署[管理后台](https://ext.dcloud.net.cn/plugin?id=4324)，部署完成后，可以永久免费使用。参考文章：

- [《外卖CPS小程序2.0！带管理后台，可过审核》](https://mp.weixin.qq.com/s?__biz=MjM5MjUyNjA2Mg==&mid=2454816396&idx=1&sn=c8a649dec81b1172b6d1c721c37d6fb2&chksm=b101dd0d8676541b6a427f8823ffbbe2eade0f24cb4340c2314fd26e18ced8e1fe8ef33091f0&token=1963651323&lang=zh_CN#rd)

### 使用方法

#### 一、部署管理后台
1. 打开[管理后台项目](https://ext.dcloud.net.cn/plugin?id=4324)，将插件导入HBuilderX
2. 在 manifest.json 中重新获取appid
3. 右键点击 uniCloud 关联云服务空间
4. 右键点击 db_init.json 初始化数据库
5. 右键上传 cloudfunctions/common 下的所有公用模块
6. 右键上传 cloudfunctions 下的所有云函数
7. 在HBuilderX顶部菜单点击 发行 -> 上传网站到服务器
8. 在弹出的对话框中选中将编译后的资源部署到云服务空间。
9. 点击上传，等待项目编译部署上传即可
10. 查看uniCloud后台前端网页托管 -> 参数配置 中的 默认域名，使用该域名地址即可访问管理后台。

- 注意: 需要绑定安全域名，在uniCloud后台操作，将 前端网页托管 -> 参数配置 中的 默认域名 添加到 跨域配置

#### 二、部署小程序前端
1. 根目录右键创建uniCloud云开发环境，右键uniCloud目录关联到与管理后台同一个服务空间
2. 在HBuilderX顶部菜单点击发行 -> 发行到微信小程序
3. 上传版本并审核即可

- 注意：手机预览、调试、发行小程序需在小程序后台配置域名白名单，在小程序开发管理中配置request合法域名为：https://api.bspapp.com

### 交流

如有疑问，可以提issue，或者加我微信： samciu
