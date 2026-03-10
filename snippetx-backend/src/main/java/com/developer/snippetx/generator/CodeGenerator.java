package com.developer.snippetx.generator;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.rules.DbColumnType;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

import java.sql.Types;
import java.util.Collections;

public class CodeGenerator {

    public static void main(String[] args) {

        // 1. 数据库连接配置 (请确保这里的密码与你本地 MySQL 的密码一致)
        String url = "jdbc:mysql://127.0.0.1:3306/snippetx?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true";
        String username = "root";
        String password = "123456"; // 替换为你的本地密码

        // 获取项目根目录，确保代码生成在正确的 src/main/java 下
        String projectPath = System.getProperty("user.dir");

        FastAutoGenerator.create(url, username, password)
                // 2. 全局配置
                .globalConfig(builder -> {
                    builder.author("y") // 设置作者
                            .disableOpenDir() // 生成后是否自动打开目录
                            .outputDir(projectPath + "/src/main/java"); // 指定输出目录
                })

                // 3. 包配置
                .packageConfig(builder -> {
                    builder.parent("com.developer.snippetx") // 设置父包名
                            .entity("entity")
                            .mapper("mapper")
                            .service("service")
                            .serviceImpl("service.impl")
                            .controller("controller")
                            // 默认把 XML 放在 mapper 目录下，我们让它生成在 resources 里
                            .pathInfo(Collections.singletonMap(OutputFile.xml,
                                    projectPath + "/src/main/resources/mapper"));
                })

                // 4. 策略配置 (核心)
                .strategyConfig(builder -> {
                    builder.addInclude("user", "snippet") // 设置需要生成的表名

                            // 实体类策略配置
                            .entityBuilder()
                            .enableLombok() // 开启 Lombok 自动生成 @Data 等注解
                            .enableTableFieldAnnotation() // 开启字段注解

                            // Mapper 策略配置
                            .mapperBuilder()
                            .enableBaseResultMap() // 开启 BaseResultMap (方便 XML 里写复杂 SQL)
                            .enableBaseColumnList() // 开启通用查询映射结果

                            // Service 策略配置
                            .serviceBuilder()
                            .formatServiceFileName("%sService") // 格式化 service 接口名称 (去掉默认的 I 前缀)

                            // Controller 策略配置
                            .controllerBuilder()
                            .enableRestStyle(); // 开启 @RestController 风格
                })

                // 5. 模板引擎配置
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();
    }
}