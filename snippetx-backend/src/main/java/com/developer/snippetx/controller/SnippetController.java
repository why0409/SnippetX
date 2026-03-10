package com.developer.snippetx.controller;

import com.developer.snippetx.common.Result;
import com.developer.snippetx.common.UserContext;
import com.developer.snippetx.entity.Snippet;
import com.developer.snippetx.exception.BusinessException;
import com.developer.snippetx.service.SnippetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 * 代码片段表 前端控制器
 * </p>
 *
 * @author y
 * @since 2026-03-10
 */
@RestController
@RequestMapping("/snippet")
@RequiredArgsConstructor
public class SnippetController {

    private final SnippetService snippetService;

    /**
     * 分页查询代码片段 (仅限当前用户)
     */
    @GetMapping("/page")
    public Result<com.baomidou.mybatisplus.extension.plugins.pagination.Page<Snippet>> page(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String category) {
        
        Long userId = UserContext.getUserId();
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<Snippet> page = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(current, size);
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Snippet> wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        // 强制限定为当前用户
        wrapper.eq(Snippet::getUserId, userId);
        
        // 分类过滤
        wrapper.eq(category != null, Snippet::getCategory, category);
        
        // 搜索逻辑
        wrapper.and(keyword != null, w -> 
            w.like(Snippet::getTitle, keyword).or().like(Snippet::getDescription, keyword)
        );
        
        // 语言过滤
        wrapper.eq(language != null, Snippet::getLanguage, language);
        
        // 优先按置顶排序，再按创建时间倒序
        wrapper.orderByDesc(Snippet::getIsPinned);
        wrapper.orderByDesc(Snippet::getCreatedAt);
        
        return Result.success(snippetService.page(page, wrapper));
    }

    /**
     * 获取个人片段列表 (需登录)
     */
    @GetMapping("/my")
    public Result<List<Snippet>> my(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException("请先登录");
        }
        return Result.success(snippetService.lambdaQuery()
                .eq(Snippet::getUserId, userId)
                .eq(category != null, Snippet::getCategory, category)
                .and(keyword != null, w -> 
                    w.like(Snippet::getTitle, keyword).or().like(Snippet::getDescription, keyword)
                )
                .orderByDesc(Snippet::getIsPinned)
                .orderByDesc(Snippet::getCreatedAt)
                .list());
    }

    /**
     * 获取社区公开片段 (无需登录)
     */
    @GetMapping("/community")
    public Result<List<Snippet>> community(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String language) {
        return Result.success(snippetService.lambdaQuery()
                .eq(Snippet::getIsPublic, true)
                .eq(language != null, Snippet::getLanguage, language)
                .and(keyword != null, w -> 
                    w.like(Snippet::getTitle, keyword).or().like(Snippet::getDescription, keyword)
                )
                .orderByDesc(Snippet::getCreatedAt)
                .list());
    }

    /**
     * 获取代码片段列表 (兼容旧版逻辑)
     */
    @GetMapping("/list")
    public Result<List<Snippet>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        Long userId = UserContext.getUserId();
        if (userId != null) {
            return my(category, keyword);
        } else {
            return community(keyword, null);
        }
    }

    /**
     * 更新代码片段
     */
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody Snippet snippet) {
        Snippet old = snippetService.getById(id);
        if (old == null || !old.getUserId().equals(UserContext.getUserId())) {
            throw new BusinessException("片段不存在或无权修改");
        }
        snippet.setId(id);
        snippet.setUserId(UserContext.getUserId()); // 确保不会被篡改所有者
        return Result.success(snippetService.updateById(snippet));
    }

    /**
     * 获取当前用户的所有分类标签
     */
    @GetMapping("/categories")
    public Result<List<String>> getCategories() {
        Long userId = UserContext.getUserId();
        if (userId == null) return Result.success(List.of());
        
        List<Snippet> list = snippetService.lambdaQuery()
                .eq(Snippet::getUserId, userId)
                .isNotNull(Snippet::getCategory)
                .select(Snippet::getCategory)
                .list();
        
        List<String> categories = list.stream()
                .map(Snippet::getCategory)
                .filter(c -> c != null && !c.isEmpty())
                .distinct()
                .sorted()
                .toList();
        
        return Result.success(categories);
    }

    /**
     * 切换置顶状态
     */
    @PutMapping("/{id}/toggle-pin")
    public Result<Boolean> togglePin(@PathVariable Long id) {
        Snippet snippet = snippetService.getById(id);
        if (snippet == null || !snippet.getUserId().equals(UserContext.getUserId())) {
            throw new BusinessException("片段不存在或无权操作");
        }
        snippet.setIsPinned(snippet.getIsPinned() == null ? true : !snippet.getIsPinned());
        return Result.success(snippetService.updateById(snippet));
    }

    /**
     * 根据 ID 获取代码片段 (带越权校验)
     */
    @GetMapping("/{id}")
    public Result<Snippet> getById(@PathVariable Long id) {
        Snippet snippet = snippetService.getById(id);
        if (snippet != null && !snippet.getUserId().equals(UserContext.getUserId())) {
            throw new BusinessException("无权查看该片段");
        }
        return Result.success(snippet);
    }

    /**
     * 新增代码片段 (自动绑定当前用户)
     */
    @PostMapping
    public Result<Boolean> save(@RequestBody Snippet snippet) {
        snippet.setUserId(UserContext.getUserId());
        return Result.success(snippetService.save(snippet));
    }

    /**
     * 删除代码片段 (带越权校验)
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> remove(@PathVariable Long id) {
        Snippet snippet = snippetService.getById(id);
        if (snippet == null) {
            return Result.success(true);
        }
        if (!snippet.getUserId().equals(UserContext.getUserId())) {
            throw new BusinessException("无权删除该片段");
        }
        return Result.success(snippetService.removeById(id));
    }
}
