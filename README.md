````markdown
# 贪吃蛇（Pages 部署示例）

这是一个用纯 HTML/CSS/JS（Canvas）实现的贪吃蛇小游戏示例，适合直接部署到 GitHub Pages 或任何静态站点。

功能
- Canvas 绘制
- 键盘（方向键 / WASD）控制
- 移动速度可调（滑块）
- 支持触摸滑动（移动端）
- 分数显示与重置

部署到 GitHub Pages（两种常用方式）

方式一：使用 docs/ 目录（推荐）
1. 在你的仓库根目录创建 `docs/` 文件夹，把 `index.html`、`styles.css`、`snake.js` 放进去。
2. 提交并推送到 GitHub。
3. 到仓库 Settings -> Pages，选择 Branch: `main`（或 `master`）和 Folder: `/docs`，保存。
4. 等待几分钟，页面将可用，URL 类似 `https://<用户名>.github.io/<仓库名>/`

方式二：用 gh-pages 分支
1. 安装并使用 `gh-pages`（如 Node 环境）或手动创建 `gh-pages` 分支并将静态文件放在该分支。
2. 在仓库 Settings -> Pages 选择 `gh-pages` 分支作为发布来源。

本地预览
直接在本地打开 `index.html` 即可（无需服务器）。若遇到跨域或模块问题，可用简单静态服务器：
- Python 3: `python -m http.server 8000`
- 或使用 VS Code Live Server 等扩展

扩展 / Next steps
- 想要把游戏做成 React / Next.js 页，请回复我，我会给出 pages/snake.jsx 的实现（适配 Next.js）。
- 想增加排行榜（本地存储或后端）也可以告诉我，我会提供实现建议和示例代码。

祝你部署顺利，玩得开心！
````
