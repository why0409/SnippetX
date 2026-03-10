package com.developer.snippetx.service.impl;

import com.developer.snippetx.entity.Snippet;
import com.developer.snippetx.mapper.SnippetMapper;
import com.developer.snippetx.service.SnippetService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 代码片段表 服务实现类
 * </p>
 *
 * @author y
 * @since 2026-03-10
 */
@Service
public class SnippetServiceImpl extends ServiceImpl<SnippetMapper, Snippet> implements SnippetService {

}
