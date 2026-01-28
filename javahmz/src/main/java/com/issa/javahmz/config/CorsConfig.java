package com.issa.javahmz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",                             // Vite local dev
                    "http://localhost:3000",                             // React default if used
                    "https://www.webjoburg.online",                      // Your real live domain
                    "https://school-management-system-*.vercel.app"      // Vercel previews (wildcard pattern OK here)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)  // Keep this if you use cookies/sessions
                .maxAge(3600);
    }
}

