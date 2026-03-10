package com.developer.snippetx.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.developer.snippetx.common.JwtUtils;
import com.developer.snippetx.dto.UserLoginDTO;
import com.developer.snippetx.dto.UserRegisterDTO;
import com.developer.snippetx.entity.User;
import com.developer.snippetx.exception.BusinessException;
import com.developer.snippetx.mapper.UserMapper;
import com.developer.snippetx.service.UserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 用户表 服务实现类
 * </p>
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public void register(UserRegisterDTO registerDTO) {
        // 1. 检查用户名是否存在
        long count = count(new LambdaQueryWrapper<User>().eq(User::getUsername, registerDTO.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }

        // 2. 密码加密并保存
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPasswordHash(passwordEncoder.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        save(user);
    }

    @Override
    public String login(UserLoginDTO loginDTO) {
        // 1. 查询用户
        User user = getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, loginDTO.getUsername()));
        if (user == null || !passwordEncoder.matches(loginDTO.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 2. 生成 Token
        return jwtUtils.generateToken(user.getId(), user.getUsername());
    }
}
