-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `snippetx` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `snippetx`;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '哈希后的密码',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 代码片段表
CREATE TABLE IF NOT EXISTS `snippet` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
  `title` VARCHAR(255) NOT NULL COMMENT '片段标题',
  `content` TEXT NOT NULL COMMENT '代码具体内容',
  `language` VARCHAR(50) NOT NULL COMMENT '编程语言',
  `description` TEXT COMMENT '简短描述/备注',
  `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开',
  `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '分类标签',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代码片段表';
