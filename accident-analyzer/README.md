# 🚗 车辆事故智能分析工具

基于 Web 的车辆事故损伤分析工具，支持图片上传、损伤标注、赔偿估算和行动指南。

## 🌐 在线访问

**GitHub Pages**: https://jhlking.github.io/accident-analyzer/

或者访问主站: https://jhlking.github.io

## ✨ 功能特性

- 📷 **图片上传分析** - 支持拖拽上传多张事故照片
- 🎨 **损伤区域标注** - 4种损伤类型（刮擦/凹陷/破裂/变形）
- 📐 **面积自动计算** - 基于像素统计估算实际面积
- 💰 **赔偿估算** - 根据损伤类型和面积计算维修费用
- 📋 **行动指南** - 个性化事故处理流程指导
- 📍 **周边服务查询** - 查找附近维修厂、保险公司
- 📱 **响应式设计** - 手机和电脑都能完美使用

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/jhlking/accident-analyzer.git
cd accident-analyzer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📁 部署说明

本仓库已配置 GitHub Pages，从 `gh-pages` 分支部署。

如需重新构建部署：

```bash
# 构建生产版本
npm run build

# 将 dist 目录内容部署到 GitHub Pages
```

## 🎯 使用流程

1. 打开网页，上传事故现场照片
2. 选择损伤类型，使用画笔标注损伤区域
3. 系统自动计算损伤面积和维修费用
4. 查看个性化的事故处理指南
5. 查询周边维修服务或报警处理

## 📄 许可证

MIT License

## 👤 作者

- GitHub: [@jhlking](https://github.com/jhlking)
