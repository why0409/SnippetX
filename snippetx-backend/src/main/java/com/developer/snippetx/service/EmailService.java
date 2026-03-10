package com.developer.snippetx.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;
    
    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;
    
    private static final String CODE_PREFIX = "auth:code:";
    private static final String LOCK_PREFIX = "auth:lock:";

    /**
     * 发送 6 位数字验证码并存入 Redis (5分钟有效)，且增加 60s 频率限制
     */
    public void sendVerificationCode(String email) {
        String lockKey = LOCK_PREFIX + email;
        
        // 1. 频率检查：如果 60s 锁还存在，说明发送过于频繁
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            throw new com.developer.snippetx.exception.BusinessException("发信太快了，请稍后再试");
        }

        String code = String.format("%06d", new Random().nextInt(999999));
        
        // 2. 存入验证码 (5min) 和 频率锁 (60s)
        redisTemplate.opsForValue().set(CODE_PREFIX + email, code, 5, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(lockKey, "locked", 60, TimeUnit.SECONDS);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail); 
        message.setTo(email);
        message.setSubject("SnippetX - 验证码确认");
        message.setText("您的验证码是: " + code + "，请在 5 分钟内完成操作。");

        mailSender.send(message);
    }

    /**
     * 校验验证码
     */
    public boolean verifyCode(String email, String code) {
        String key = CODE_PREFIX + email;
        String cachedCode = redisTemplate.opsForValue().get(key);
        
        if (cachedCode != null && cachedCode.equals(code)) {
            redisTemplate.delete(key); 
            redisTemplate.delete(LOCK_PREFIX + email); // 验证成功后连同频率锁一起删掉，方便用户下次重发
            return true;
        }
        return false;
    }
}
