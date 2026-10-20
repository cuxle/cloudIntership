# 模课

一门互动课，用来学大模型应用开发：消息、提示词、接口调用、结构化输出、检索增强和工具调用。

实验在浏览器或手机应用里完成，不需要 API 密钥，也不需要联网。第 4 节的请求在应用内用同一套检查跑一遍；接上真正的模型时，那段调用要放在你自己的服务端。

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://127.0.0.1:3847](http://127.0.0.1:3847)。

## 手机安装包

调试版 APK 可以用 Android Studio 或本机的 Android SDK 重新打出来：

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

安装包在 `android/app/build/outputs/apk/debug/app-debug.apk`。手机需要允许安装未知来源的应用。这是调试签名，适合自己学习，不是上架应用商店的正式包。

进度存在这台浏览器的 localStorage 里。小测三题全对，这一节才算过关。

## 八节

1. 模型在应用里做什么
2. 消息数组
3. 提示词
4. 一次真正的调用（`src/app/api/chat/route.ts`）
5. 结构化输出
6. 检索
7. 工具调用
8. 成本、评测和日志

检索实验用的是字面重合和少量查询改写，不是向量数据库。工具循环用的是看得见的规则路由器。两处都是为了把结构拆开，接上真实模型时，周围的请求形状不变。
