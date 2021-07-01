
# 今日神券

美团饿了吗CPS小程序项目，别人领红包下单，你拿推广佣金

### 介绍

源码为 uni-app + uniCloud 项目，需下载hbuilder导入项目打包，可编译成微信小程序(跳转地址为小程序路径)

master 分支是新版UI前端代码，依赖管理后台数据，需要先部署[管理后台](https://ext.dcloud.net.cn/plugin?id=4324)，部署到 uniCloud 后，可以永久免费使用。参考文章：

- [《外卖CPS小程序2.0！带管理后台，可过审核》](https://mp.weixin.qq.com/s/YvTKaEcrNguYsDo8rea7LQ)

### 使用方法

#### 一、部署管理后台
1. 打开[管理后台项目](https://ext.dcloud.net.cn/plugin?id=4324)，将插件导入HBuilderX（强烈建议使用优秀且免费的阿里云）
2. 右键点击 uniCloud 关联云服务空间
3. 右键点击 db_init.json 初始化数据库
4. 右键上传 cloudfunctions 下的所有云函数
5. 在HBuilderX顶部菜单点击 发行 -> 上传网站到服务器
6. 在弹出的对话框中选中将编译后的资源部署到云服务空间。
7. 点击上传，等待项目编译部署上传
8. 添加跨域配置，在uniCloud后台操作，将 `前端网页托管` -> `参数配置` 中的 `默认域名` 添加到 `跨域配置`
9. 使用该默认域名地址即可访问管理后台，创建管理员

- 注意: uniCloud 选择上传所有云函数和上传选择所有schema的时候有可能失败，根据提示在cloudfunctions目录或database目录重新上传单个云函数模块和schema即可

#### 二、部署小程序前端
1. 下载或者 clone 本前端项目，导入到 HBuilderX
2. 根目录右键创建uniCloud云开发环境，右键uniCloud目录关联到与管理后台同一个服务空间
3. 在小程序开发管理中配置服务器request合法域名：https://api.bspapp.com、https://apis.map.qq.com
4. 在HBuilderX顶部菜单点击发行 -> 发行到微信小程序（注意鼠标先选中这个前端项目，不要选中后台项目哦）
5. 上传版本并提交审核

- 注意：manifest.json 中微信小程序权限配置 `位置接口` 需要勾选上

#### 三、高级教程（订阅消息配置）
1. 修改 `cloudfunctions/common/utils/index.js` 所有配置信息，修改 `cloudfunctions/common/uni-id/config.json` 里 weixin 属性的 appid 和appsecret
2. 右键上传部署所有云函数及公共模块
3. 在 unicloud 后台，函数列表中找到send函数，查看详情，根据[文档](https://uniapp.dcloud.io/uniCloud/trigger)编辑触发定时器

- 注意：需要更新插件到1.0.9以上版本
- 注意：不配置订阅消息功能不影响正常使用，前台将默认显示为 `添加小程序`
### 交流

如有疑问，可以提issue，或者加我微信： samciu
