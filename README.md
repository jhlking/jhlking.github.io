# jhlking.github.io · 个人主页与博客

### Personal Homepage & Blog (GitHub Pages)

> 个人 GitHub Pages 站点：静态博客主页，并托管多个前端小项目。
> *Personal GitHub Pages site: a static blog homepage hosting several frontend mini-projects.*

---

## 项目概述 · Overview

**中文**

这是 `jhlking` 的 GitHub Pages 个人站点，线上地址为 <https://jhlking.github.io>。仓库根目录是一个基于 Hexo 风格生成的静态博客主页（`index.html`、`css/`、`js/`），同时以子目录形式托管了多个独立的前端小项目，例如 `accident-analyzer`（React + TypeScript 的事故损失估算工具）。这些子项目可通过形如 `https://jhlking.github.io/<子目录>/` 的地址直接访问。
另外，鹈鹕骑车小游戏也部署在本站点的子路径下（见 pelican-riding 仓库）。

**English**

This is the GitHub Pages personal site of `jhlking`, available at <https://jhlking.github.io>. The repository root is a Hexo-style generated static blog homepage (`index.html`, `css/`, `js/`), and it also hosts several independent frontend mini-projects in subdirectories — for example `accident-analyzer`, a React + TypeScript tool for estimating accident damage. Each sub-project is accessible via URLs like `https://jhlking.github.io/<subdir>/`.

---

## 技术栈 · Tech Stack

| 部分 Part | 技术 Technology | 说明 Description |
| --- | --- | --- |
| 博客主页 Blog | HTML / CSS / JS（Hexo 生成） | 静态博客 Static blog |
| 托管 Hosting | GitHub Pages | 免费静态托管 Free static hosting |
| 子项目 Sub-project | React 18 + TypeScript + Vite | accident-analyzer |
| 状态管理 State | Zustand | 轻量状态管理 Lightweight state |
| 动画 Animation | Framer Motion | UI 动效 UI motion |
| 样式 Styling | Tailwind CSS 3 | 原子化样式 Utility CSS |
| 路由 Routing | React Router 7 | 页面导航 Navigation |
| 代码检查 Lint | ESLint 9, typescript-eslint | 代码规范 Code quality |

---

## 子项目 · Sub-projects

- **accident-analyzer**：上传事故图片并估算车辆损伤与维修成本的工具（React + TS + Zustand）
- **hello-world**：静态页面示例 Static page demo
- **pelican-riding**（独立仓库）：鹈鹕骑车小游戏，部署于本站子路径

---

## 本地预览 · Local Preview

静态站点可直接使用任意静态服务器预览：

```bash
# Python 3
python -m http.server 8000

# 然后访问 / Then visit
# http://localhost:8000/
```

> 注意：仓库名 `jhlking.github.io` 是 GitHub Pages 用户主页的**强制命名格式，不可修改**。
> *Note: the repository name `jhlking.github.io` is a required format for GitHub Pages user sites and must not be changed.*
