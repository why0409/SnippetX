# SnippetX 全栈项目 - AI 助手全局上下文指南

## 1. 项目概述 (Project Overview)
- **项目名称:** SnippetX
- **项目定位:** 面向开发者的跨端代码片段与 API 管理器（包含服务端与移动/桌面端）。
- **工程结构:**
  - `/snippetx-backend`: 服务端工程 (Java / Spring Boot)
  - `/snippetx-ios`: 移动/桌面端工程 (Swift / SwiftUI)
- **核心功能:** 代码片段多端同步、语法高亮、快捷键复制、标签分类管理。

## 2. 服务端开发规范 (Backend - Java)
- **核心栈:** Java 17+, Spring Boot 3.x
- **持久层:** 优先使用 **MyBatis-Plus** (3.5+)。优先使用 `LambdaQueryWrapper`，严禁使用 JPA 或原生 Hibernate 写法。
- **数据库兼容性约束:** - 开发环境为 **MySQL 8.0**。
- **架构分层:**
  - `controller`: 仅处理 HTTP 路由和参数校验，统一返回 `Result<T>` 格式。
  - `service` / `service.impl`: 核心业务逻辑。
  - `mapper`: MyBatis-Plus 接口与 XML。
  - `entity` / `dto`: 数据模型，全量使用 Lombok 注解 (`@Data`, `@Builder` 等)。
- **统一响应格式:**
  ```json
  {
    "code": 200,
    "message": "success",
    "data": { ... }
  }