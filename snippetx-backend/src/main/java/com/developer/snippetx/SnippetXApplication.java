package com.developer.snippetx;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.developer.snippetx.mapper")
public class SnippetXApplication {

	public static void main(String[] args) {
		SpringApplication.run(SnippetXApplication.class, args);
	}

}
