package com.developer.snippetx.service;

import com.developer.snippetx.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;

import com.developer.snippetx.dto.UserLoginDTO;
import com.developer.snippetx.dto.UserRegisterDTO;

/**
 * <p>
 * 用户表 服务类
 * </p>
 *
 * @author y
 * @since 2026-03-10
 */
public interface UserService extends IService<User> {

    /**
     * 用户注册
     */
    void register(UserRegisterDTO registerDTO);

    /**
     * 用户登录，返回 Token
     */
    String login(UserLoginDTO loginDTO);

}
