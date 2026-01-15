package com.issa.javahmz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // ← This enables scheduled tasks (for 3-year cleanup)
public class JavahmzApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavahmzApplication.class, args);
    }
}