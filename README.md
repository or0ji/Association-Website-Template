# 协会官网通用模板 (Association Website Template)

一个开箱即用的**协会/组织官网全栈解决方案**，基于 Next.js 14 + FastAPI + PostgreSQL 构建。内置 AI 智能客服功能，支持完全后台可配置的动态菜单和内容管理。

> 🎯 **示例场景**：山西省电力工程企业协会官网（仅作演示，可快速替换为任意协会/组织）

[![GitHub](https://img.shields.io/github/stars/HeZhYang/Association-Website-Template?style=social)](https://github.com/HeZhYang/Association-Website-Template)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎬 演示视频

### 📺 基本功能展示

展示前台官网、管理后台的核心功能和操作流程。

https://github.com/HeZhYang/Association-Website-Template/raw/main/docs/videos/基本使用展示.mp4

> 👆 点击上方链接播放，或 [下载视频](docs/videos/基本使用展示.mp4)

---

### 🤖 AI 智能客服演示

展示集成扣子 (Coze) 平台的 AI 客服对话功能。

https://github.com/HeZhYang/Association-Website-Template/raw/main/docs/videos/chatbot.mp4

> 👆 点击上方链接播放，或 [下载视频](docs/videos/chatbot.mp4)

---

## ✨ 核心特性

### 🎨 前台官网
- **动态导航菜单** - 一级/二级菜单完全后台可配置，零硬编码
- **两种内容类型** - 单页富文本 + 文章列表，覆盖所有协会场景
- **首页轮播图** - 支持多图轮播、自定义链接
- **响应式设计** - 完美适配 PC、平板、手机
- **SEO 友好** - 服务端渲染，搜索引擎优化

### 🤖 AI 智能客服（可选）
- **右下角悬浮助手** - 点击展开聊天窗口
- **流式响应** - 实时打字机效果，体验流畅
- **扣子平台集成** - 支持国内版 Coze API
- **后端代理** - Token 安全，不暴露在前端

### 🛠 管理后台
- **菜单管理** - 可视化配置导航结构（支持无限层级）
- **内容管理** - 富文本编辑器，支持图片上传
- **文章管理** - 分类、置顶、发布状态、封面图
- **轮播图管理** - 拖拽排序、一键启用/禁用
- **网站设置** - 站点名称、联系方式、备案信息

### 🏗 技术架构
- **Monorepo 架构** - Turborepo + pnpm，统一管理
- **前后端分离** - Next.js 14 (App Router) + FastAPI
- **Docker 支持** - 一键部署，生产就绪
- **类型安全** - TypeScript + Pydantic

---

## 📁 项目结构

```
association-website/
├── apps/
│   ├── website/          # 前台官网 (Next.js 14)
│   ├── admin/            # 管理后台 (Next.js 14 + shadcn/ui)
│   └── api/              # 后端服务 (FastAPI + PostgreSQL)
├── docker/
│   ├── api.Dockerfile
│   ├── website.Dockerfile
│   └── admin.Dockerfile
├── volumes/              # Docker 持久化数据
├── docker-compose.yml
└── README.md
```

---

## 🎯 功能详解

### 1. 动态菜单系统

所有导航完全通过后台配置，支持两种类型：

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| **单页富文本** | 直接展示富文本内容 | 协会简介、章程、联系我们 |
| **文章分类** | 展示文章列表 | 新闻中心、通知公告、政策法规 |

**路由规则：**
- 单页：`/page/[slug]` → 如 `/page/about-intro`
- 列表：`/category/[slug]` → 如 `/category/news`
- 详情：`/article/[id]` → 如 `/article/123`

### 2. 文章管理

- ✅ 富文本编辑（Tiptap）
- ✅ 封面图上传
- ✅ 摘要提取
- ✅ 分类管理
- ✅ 置顶功能
- ✅ 发布/草稿状态
- ✅ 上一篇/下一篇导航
- ✅ 浏览量统计

### 3. AI 智能客服

基于扣子 (Coze) 平台，实现智能问答：

```
用户: 入会条件是什么？
AI: 根据协会章程，入会需要满足以下条件：
    1. 在本省依法注册的相关企业
    2. 认同协会章程...
```

**特点：**
- 流式响应，实时显示
- 支持上下文对话
- 可配置欢迎语
- 后端代理保护 Token

### 4. 数据库设计

极简 6 表设计，覆盖所有业务：

| 表名 | 说明 |
|------|------|
| `users` | 管理员账号 |
| `menus` | 菜单配置（含单页内容） |
| `categories` | 文章分类 |
| `articles` | 文章内容 |
| `banners` | 轮播图 |
| `settings` | 网站设置 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.9
- PostgreSQL >= 15
- pnpm >= 8

### 方式一：本地开发

#### 1. 克隆项目

```bash
git clone <repository-url>
cd association-website
```

#### 2. 安装依赖

```bash
# 前端依赖
pnpm install

# 后端依赖
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. 配置数据库

启动 PostgreSQL（可使用 Docker）：

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_DB=association \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 4. 配置环境变量

```bash
cd apps/api
cp .env.example .env
# 编辑 .env 填入配置
```

`.env` 配置项：

```env
# 必填
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/association
SECRET_KEY=your-secret-key

# 可选 - AI 客服
COZE_BOT_ID=your-bot-id
COZE_API_TOKEN=your-api-token
```

#### 5. 初始化数据

```bash
cd apps/api
source venv/bin/activate
python seed.py
```

这将创建：
- 管理员账号：`admin` / `123456`
- 示例菜单结构
- 示例文章和分类

#### 6. 启动服务

```bash
# 终端 1 - 后端
cd apps/api && uvicorn main:app --reload --port 8000

# 终端 2 - 前台
cd apps/website && pnpm dev

# 终端 3 - 后台
cd apps/admin && pnpm dev
```

#### 7. 访问

| 服务 | 地址 |
|------|------|
| 前台官网 | http://localhost:3000 |
| 管理后台 | http://localhost:3001 |
| API 文档 | http://localhost:8000/docs |

---

### 方式二：Docker 部署

#### 一键启动

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 初始化数据（首次）
docker exec -it sxpeea-api python seed.py

# 查看日志
docker-compose logs -f
```

#### 服务端口

| 服务 | 端口 |
|------|------|
| 前台官网 | 3000 |
| 管理后台 | 3001 |
| 后端 API | 8000 |
| PostgreSQL | 5432 |

---

### 方式三：云平台部署

#### Vercel（前端）

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 设置 Root Directory：
   - 前台：`apps/website`
   - 后台：`apps/admin`
4. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

#### Railway / Render（后端）

1. 创建 PostgreSQL 实例
2. 部署 `apps/api` 目录
3. 配置环境变量

---

## 🔧 自定义配置

### 修改协会信息

1. 登录管理后台
2. 进入「网站设置」
3. 修改协会名称、联系方式、备案号等

### 配置菜单结构

1. 进入「菜单管理」
2. 添加一级菜单
3. 为每个一级菜单添加二级菜单
4. 选择类型：单页富文本 或 文章分类

### 启用 AI 客服

1. 访问 [扣子平台](https://www.coze.cn)
2. 创建智能体，配置知识库
3. 获取 Bot ID 和 API Token
4. 在 `.env` 中配置：
   ```env
   COZE_BOT_ID=your-bot-id
   COZE_API_TOKEN=your-api-token
   ```
5. 重启后端服务

### 自定义样式

前台样式文件：`apps/website/app/globals.css`

主题色变量：
```css
:root {
  --primary: #1a5fc9;      /* 主色 */
  --primary-dark: #154a9e;  /* 深色 */
  --primary-light: #2d7ae0; /* 浅色 */
}
```

---

## 📡 API 接口

### 公开接口

```
GET  /api/menus/tree          # 菜单树
GET  /api/pages/{slug}        # 单页内容
GET  /api/categories/{slug}   # 分类文章列表
GET  /api/articles/{id}       # 文章详情
GET  /api/articles/latest     # 最新文章
GET  /api/banners             # 轮播图
GET  /api/settings            # 网站设置
POST /api/chat/stream         # AI 对话（流式）
```

### 后台接口（需 JWT 认证）

```
POST /api/auth/login          # 登录
GET  /api/auth/me             # 当前用户

# CRUD 接口
/api/admin/menus
/api/admin/categories
/api/admin/articles
/api/admin/banners
/api/admin/settings
/api/admin/upload
```

---

## 🛡 安全建议

1. **修改默认密码** - 首次部署后立即修改 admin 密码
2. **配置 SECRET_KEY** - 使用随机字符串，不要使用默认值
3. **HTTPS** - 生产环境务必启用 HTTPS
4. **CORS** - 生产环境配置具体的允许来源
5. **Token 保护** - AI 客服 Token 只在后端使用

---

## 📦 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| UI 组件 | Tailwind CSS, shadcn/ui |
| 富文本 | Tiptap |
| 后端框架 | FastAPI |
| ORM | SQLAlchemy 2.0 |
| 数据库 | PostgreSQL |
| 认证 | JWT |
| AI | Coze API |
| 部署 | Docker, Docker Compose |
| 包管理 | pnpm, Turborepo |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 💬 联系

如有问题，请提交 Issue 或联系维护者。
