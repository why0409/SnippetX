package com.developer.snippetx.dto;

import lombok.Data;

/**
 * 用户登录请求 DTO
 */
@Data
public class UserLoginDTO {
    private String username;
    private String password;
}
