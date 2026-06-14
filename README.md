# 视图生成器

面向电商领域的 AI 商品视觉内容生成工具。上传商品图片，利用 AI 自动生成多角度展示图，在无限画布上自由编辑排版，一键生成商品展示视频。

## 功能

- **AI 多角度生图** — 基于商品描述，生成正面/侧面/背面/顶视/细节 5 个角度
- **无限画布编辑** — Fabric.js 画布，自由拖拽排列图片、添加文字、切换背景
- **商品视频生成** — 选择多张图片作为关键帧，AI 生成环绕展示视频，支持自定义过渡描述
- **标注连线** — 画布上从商品图引出标注线 + 文字说明，电商详情页风格
- **本地项目** — localStorage 持久化，无需登录，项目可导出 JSON

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/hh2079/product-image-generator.git
cd product-image-generator

# 安装依赖
npm install && cd client && npm install && cd ../server && npm install
cd ..

# 启动开发服务
npm run dev
```

打开 `http://localhost:5173`

## 使用

1. 点击右上角 **API Key**，输入你的 Agnes AI Key（从 [apihub.agnes-ai.com](https://apihub.agnes-ai.com) 获取）
2. 输入商品描述（如「白色平板鞋」），上传商品主图
3. 选择角度 → 点生成，AI 生成多角度图
4. 从左侧素材库拖拽图片到画布，自由排列
5. 生成 2 张以上图片后，点「生成商品视频」，设置过渡描述

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18 + TypeScript + Fabric.js 6 + Zustand + Vite |
| 后端 | Express + TypeScript |
| AI | Agnes AI（图片 v2.0 / 视频 v2.0） |

## 项目结构

```
├── client/           # React 前端
│   └── src/
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Sidebar/        # 上传/生成/素材库
│       │   ├── Canvas/         # Fabric.js 无限画布
│       │   └── Toolbar/        # 工具/背景/视频
│       ├── store/              # Zustand 状态管理
│       └── services/           # API 调用
├── server/           # Express 后端
│   └── src/
│       ├── routes/             # API 路由
│       └── services/           # Agnes AI 代理
└── docs/             # 设计文档和实现计划
```

## License

MIT
