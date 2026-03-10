# SnippetX 全栈项目 - AI 助手全局上下文指南

## 1. 项目概述 (Project Overview)
- **项目名称:** SnippetX
- **项目定位:** 面向开发者的跨端代码片段与 API 管理器。
- **工程结构:**
  - `/snippetx-backend`: 服务端工程 (Java 17 / Spring Boot 3.4)
  - `/snippetx-web`: Web 前端工程 (Next.js 15 / React 19 / TypeScript)
- **核心功能:** 代码片段多端同步、语法高亮、搜索过滤、置顶管理、标签分类。

## 2. 服务端开发规范 (Backend - Java)
- **核心栈:** Java 17, Spring Boot 3.4.x, Maven
- **持久层:** MyBatis-Plus (3.5.7+)。优先使用 `LambdaQueryWrapper`。
- **安全认证:** Spring Security + JWT (jjwt 0.11.5)。
- **架构分层:**
  - `controller`: 处理路由与校验，统一返回 `Result<T>`。
  - `service`: 业务逻辑实现。
  - `mapper`: MyBatis-Plus 接口。
  - `common`: 包含 `UserContext`（ThreadLocal 用户信息）。
- **CORS:** 已开启全局跨域支持。

## 3. Web 前端开发规范 (Frontend - Next.js)
- **核心栈:** Next.js (App Router), React 19, Tailwind CSS, pnpm
- **包管理:** 强制使用 **pnpm**。
- **UI 风格:** 年轻化、深色模式、毛玻璃效果 (Backdrop Blur)、渐变色设计。
- **组件库:** Lucide React (图标), Framer Motion (动画), React Syntax Highlighter (代码高亮)。
- **状态管理:** 优先使用 `useState` 与 `useEffect` 配合 `localStorage` 处理认证。

## 4. 数据库规范 (Database)
- **环境:** MySQL 8.0
- **核心表:**
  - `user`: 存储用户信息（密码采用 BCrypt 哈希）。
  - `snippet`: 存储代码片段（包含 `is_pinned`, `category`, `is_public` 等字段）。

## 5. 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

## 6. 开发工作流
- **运行后端:** `cd snippetx-backend && mvn spring-boot:run`
- **运行前端:** `cd snippetx-web && pnpm dev` (访问 http://localhost:3000)
- **提交规范:** 采用语义化提交 (feat, fix, chore, etc.)
