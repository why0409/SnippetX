package com.developer.snippetx.common;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类 - 生产环境增强版
 */
@Component
public class JwtUtils {

    // 生产环境必须通过环境变量注入一个长且随机的字符串 (建议至少32位)
    @Value("${snippetx.jwt.secret:defaultSecretKeyForSnippetXMustBeLongEnough}")
    private String secret;

    private SecretKey secretKey;

    // Token 过期时间: 7天
    private static final long EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000L;

    @PostConstruct
    public void init() {
        // 将配置的字符串转为 SecretKey
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 Token
     */
    public String generateToken(Long userId, String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 解析 Token
     */
    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
