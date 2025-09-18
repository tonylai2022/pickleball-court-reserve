# TRK 匹克球场预订 - Web 演示版

这是用于 GitHub Pages 分享的独立 Web 版本（静态站点）。无需后端，仅模拟支付流程，便于跨平台快速体验核心预订流程。

## 功能
- 选择日期与时段（08:00-22:00）
- 预订摘要与金额计算（¥120/小时，当前按 1 小时计）
- 微信支付模拟（弹窗确认）
- 成功页预订编号、详情、复制、分享、下载日历事件（.ics）
- 关于/条款/隐私页面

## 本地预览
直接双击打开 `web-app/index.html` 即可在浏览器查看。

## 发布到 GitHub Pages
1. 新建 GitHub 仓库，将整个项目提交。建议把 `web-app/` 目录内容作为 Pages 根。
2. 方案 A（推荐）：把 `web-app` 内所有文件移动到仓库根（index.html 在根目录）。
   - 仓库设置 -> Pages -> 构建来源选择 `Deploy from a branch`，分支选择 `main`，路径选 `/ (root)`。
3. 方案 B：保留在 `web-app/` 子目录。
   - 仓库设置 -> Pages -> 构建来源选择 `Deploy from a branch`，分支 `main`，路径选 `/docs`。
   - 将 `web-app/` 重命名为 `docs/`，或把 `web-app/*` 拷贝到 `docs/`。
   - 访问地址为 `https://<你的用户名>.github.io/<仓库名>/`。
4. 若使用子目录，404.html 已包含基础 SPA 路由重定向。

## 自定义
- 价格：修改 `web-app/js/app.js` 中 `pricePerHour`。
- 球场名称/地址/电话：`web-app/js/app.js` state.booking 字段。
- 主题色：`web-app/css/style.css` 的 `:root` 变量。

## 注意
- 本 Web 版本为演示用途，不进行真实支付。
- 若需真实支付，请使用小程序版本并接入服务端统一下单与 wx.requestPayment。
