package com.developer.snippetx.controller;

import com.developer.snippetx.common.Result;
import com.developer.snippetx.entity.User;
import com.developer.snippetx.dto.UserLoginDTO;
import com.developer.snippetx.dto.UserRegisterDTO;
import com.developer.snippetx.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 * 用户表 前端控制器
 * </p>
 *
 * @author y
 * @since 2026-03-10
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 注册
     */
    @PostMapping("/register")
    public Result<String> register(@RequestBody UserRegisterDTO registerDTO) {
        userService.register(registerDTO);
        return Result.success("注册成功");
    }

    /**
     * 登录
     */
    @PostMapping("/login")
    public Result<String> login(@RequestBody UserLoginDTO loginDTO) {
        return Result.success(userService.login(loginDTO));
    }

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/me")
    public Result<User> getMe() {
        return Result.success(userService.getById(com.developer.snippetx.common.UserContext.getUserId()));
    }

    /**
     * 获取所有用户
     */
    @GetMapping("/list")
    public Result<List<User>> list() {
        return Result.success(userService.list());
    }

    /**
     * 根据 ID 获取用户
     */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    /**
     * 新增用户
     */
    @PostMapping
    public Result<Boolean> save(@RequestBody User user) {
        return Result.success(userService.save(user));
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> remove(@PathVariable Long id) {
        return Result.success(userService.removeById(id));
    }
}
