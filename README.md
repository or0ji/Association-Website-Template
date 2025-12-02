# 山西省电力工程企业协会官网 (SXPEEA)

一个基于 Next.js 14 + FastAPI + PostgreSQL 的完整全栈协会官网解决方案。

## 🏗️ 项目架构

```
sxpeea-official/
├── apps/
│   ├── website/          # 前台官网 (Next.js 14 App Router)
│   ├── admin/            # 管理后台 (Next.js 14 + shadcn/ui)
│   └── api/              # 后端服务 (FastAPI + SQLAlchemy + PostgreSQL)
├── docker/
│   ├── api.Dockerfile
│   ├── website.Dockerfile
│   └── admin.Dockerfile
├── volumes/
│   ├── uploads/          # 图片上传持久化
│   └── postgres/         # 数据库数据
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

## 🚀 快速开始

### 前置条件

- Node.js >= 18
- pnpm >= 8
- Python >= 3.11
- PostgreSQL 15+
- Docker & Docker Compose (用于生产部署)

### 本地开发

#### 1. 克隆项目并安装依赖

```bash
cd sxpeea-official

# 安装前端依赖
pnpm install

# 安装后端依赖
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. 配置数据库

确保 PostgreSQL 运行中，创建数据库：

```sql
CREATE DATABASE sxpeea;
```

在 `apps/api/` 目录创建 `.env` 文件：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sxpeea
SECRET_KEY=your-super-secret-key-change-in-production
UPLOAD_DIR=./uploads
```

#### 3. 初始化数据库并填充种子数据

```bash
cd apps/api
python seed.py
```

这将创建：
- 管理员账号：`admin` / `123456`
- 完整的菜单结构
- 测试文章、分类、轮播图等

#### 4. 启动开发服务器

**方式一：分别启动**

```bash
# 终端1 - 启动后端 API
cd apps/api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 终端2 - 启动前台官网
cd apps/website
pnpm dev

# 终端3 - 启动管理后台
cd apps/admin
pnpm dev
```

**方式二：使用 Turborepo**

```bash
# 启动前端（需要先单独启动后端）
pnpm dev
```

#### 5. 访问地址

- 前台官网：http://localhost:3000
- 管理后台：http://localhost:3001
- API 文档：http://localhost:8000/docs

---

## 🐳 Docker 部署

### 一键启动所有服务

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 初始化数据

首次启动后，进入 API 容器执行种子数据：

```bash
docker exec -it sxpeea-api python seed.py
```

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| website | 3000 | 前台官网 |
| admin | 3001 | 管理后台 |
| api | 8000 | 后端 API |
| postgres | 5432 | 数据库 |

---

## ☁️ Vercel 部署

### 前台官网 (apps/website)

1. Fork 本仓库
2. 在 Vercel 创建新项目
3. 选择仓库，设置：
   - Root Directory: `apps/website`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
4. 添加环境变量：
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```
5. 部署

### 管理后台 (apps/admin)

同上，Root Directory 改为 `apps/admin`

### 后端 API

推荐部署到：
- Railway
- Render
- 自建 VPS + Docker

---

## 📦 核心功能

### 前台功能
- ✅ 响应式设计，完美适配移动端
- ✅ 动态菜单导航（后台可配置）
- ✅ 首页轮播图
- ✅ 新闻列表/详情
- ✅ 单页富文本展示
- ✅ 文章分页
- ✅ 上一篇/下一篇导航
- ✅ SEO 友好

### 后台功能
- ✅ JWT 登录认证
- ✅ 菜单管理（支持二级菜单）
- ✅ 分类管理
- ✅ 文章管理（富文本编辑器）
- ✅ 轮播图管理
- ✅ 网站设置
- ✅ 图片上传

### 菜单类型
1. **单页富文本** - 如协会简介、联系我们
2. **文章分类** - 如新闻中心、通知公告

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui (仅后台)
- **富文本**: Tiptap
- **状态管理**: React Context

### 后端
- **框架**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **数据库**: PostgreSQL
- **认证**: JWT (python-jose)
- **密码**: bcrypt (passlib)

### 部署
- **容器化**: Docker
- **编排**: Docker Compose
- **Monorepo**: Turborepo + pnpm

---

## 📁 API 接口

### 公开接口
```
GET  /api/menus/tree          # 菜单树
GET  /api/pages/{slug}        # 单页内容
GET  /api/categories/{slug}   # 分类文章列表
GET  /api/articles/{id}       # 文章详情
GET  /api/articles/latest     # 最新文章
GET  /api/banners             # 轮播图
GET  /api/settings            # 网站设置
```

### 后台接口 (需JWT)
```
POST /api/auth/login          # 登录
GET  /api/auth/me             # 当前用户

# CRUD 接口
/api/admin/menus
/api/admin/categories
/api/admin/articles
/api/admin/banners
/api/admin/settings
/api/admin/upload             # 图片上传
/api/admin/stats              # 统计数据
```

---

## 🔧 环境变量

### 后端 (apps/api/.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key
UPLOAD_DIR=./uploads
```

### 前端 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📝 数据库结构

| 表名 | 说明 |
|------|------|
| users | 管理员 |
| menus | 菜单（含单页内容） |
| categories | 文章分类 |
| articles | 文章 |
| banners | 轮播图 |
| settings | 网站设置 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 👥 联系方式

- 网站：www.sxpeea.cn
- 邮箱：contact@sxpeea.cn

