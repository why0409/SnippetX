package com.developer.snippetx.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 代码片段表
 * </p>
 *
 * @author y
 * @since 2026-03-10
 */
@Getter
@Setter
@TableName("snippet")
public class Snippet implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 所属用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 片段标题
     */
    @TableField("title")
    private String title;

    /**
     * 代码具体内容
     */
    @TableField("content")
    private String content;

    /**
     * 编程语言(如 java, python, swift)
     */
    @TableField("language")
    private String language;

    /**
     * 简短描述/备注
     */
    @TableField("description")
    private String description;

    /**
     * 是否公开分享(0-私有, 1-公开)
     */
    @TableField("is_public")
    private Boolean isPublic;

    /**
     * 是否置顶
     */
    @TableField("is_pinned")
    private Boolean isPinned;

    /**
     * 分类标签
     */
    @TableField("category")
    private String category;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
