# 🚀 SnippetX 全栈项目开发与部署手册

SnippetX 是一款专为开发者设计的跨端代码片段管理器，支持 AI 智能分析、多套拟物化主题、极致搜索体验以及严密的账户安全体系。

---

## 🏗 1. 技术架构 (Technical Stack)

### 🔙 后端 (snippetx-backend)
- **核心框架**: Java 17 / Spring Boot 3.4.x
- **持久层**: MyBatis-Plus (3.5.7+) + MySQL 8.0
- **缓存/限流**: Redis
- **安全认证**: Spring Security + JWT (jjwt)
- **邮件服务**: 阿里云邮件推送 (DirectMail)
- **部署**: Docker + Docker Compose

### 🔜 前端 (snippetx-web)
- **核心框架**: Next.js 15 (App Router) / React 19
- **样式方案**: Tailwind CSS 4.0
- **动效/图标**: Framer Motion / Lucide React
- **代码高亮**: React Syntax Highlighter (Prism)
- **包管理**: pnpm
- **部署**: Vercel (Serverless)

---

## ✨ 2. 核心功能 (Key Features)

1.  **🧠 AI 智能辅助**：接入 DeepSeek/Groq，支持代码语言自动识别、一键功能总结、深度逻辑拆解及改进建议。
2.  **🎨 视觉盛宴**：内置“现代化深色”、“锤子拟物化”、“经典 iOS 6”三套主题，支持实时切换。
3.  **🔍 极致搜索**：前端内存过滤 + 后端防抖搜索双引擎，支持标题、描述及代码内容的高亮显示。
4.  **🔐 安全体系**：
    *   注册/找回密码需邮箱验证码确认。
    *   AI 接口具备 JWT 身份校验及 Redis 频率限制（每分钟 3 次）。
    *   侧边栏支持手动拖拽调宽及一键折叠。

---

## 🛠 3. 本地开发指南 (Local Development)

### 1. 启动中间件
确保本地 Docker 环境已运行，在根目录执行：
```bash
docker start snippetx-redis
```

### 2. 后端启动
1.  在 IDEA 中导入 `snippetx-backend`。
2.  修改 `src/main/resources/application-dev.yml` 中的 MySQL 密码。
3.  运行 `SnippetXApplication`。默认端口：`9999`。

### 3. 前端启动
1.  配置环境变量：在 `snippetx-web` 目录下创建 `.env.local` 并填入 `AI_API_KEY`。
2.  安装并运行：
```bash
cd snippetx-web
pnpm install
pnpm dev
```
访问：`http://localhost:3000`。

---

## 🚢 4. 生产环境部署 (Production Deployment)

### 🛰 前端：部署至 Vercel (推荐)
1.  **推送代码**：将代码推送到 GitHub 仓库。
2.  **新建项目**：在 Vercel 导入仓库，Root Directory 选择 `snippetx-web`。
3.  **配置环境变量**：
    *   `NEXT_PUBLIC_API_URL`: 你的后端公网域名（如 `https://api.yourdomain.com`）。
    *   `AI_API_KEY`: 生产环境使用的 AI Key。
    *   `AI_BASE_URL`: `https://api.deepseek.com` 或其他。
4.  **一键发布**：点击 Deploy 即可。

### 🐳 后端：云服务器 Docker 部署
1.  **拉取源码**：在服务器执行 `git clone`。
2.  **配置环境**：编辑根目录下的 `docker-compose.yml`。
    *   修改 `DB_PASS`、`MAIL_PASS`、`SNIPPETX_JWT_SECRET` 为真实强密码。
3.  **一键启动**：
```bash
docker-compose up -d
```
*Docker 会自动执行 `db/init.sql` 进行初始化建表。*

---

## 🛡 5. 安全与维护 (Security & Maintenance)

1.  **CORS 限制**：部署后，请前往 `SecurityConfig.java` 将 `allowedOrigins` 中的域名改为你 Vercel 提供的真实前端域名。
2.  **密钥管理**：严禁将包含真实密码的 `application-dev.yml` 或 `.env.local` 提交至公共仓库。
3.  **监控**：可以通过 `docker logs -f snippetx-api` 实时查看生产环境后端运行日志。
