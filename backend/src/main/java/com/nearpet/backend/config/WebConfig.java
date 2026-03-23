package com.nearpet.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String uploadDirectory;
    private final String[] frontendBaseUrlPatterns;

    public WebConfig(
            @Value("${app.storage.upload-dir:data/uploads}") String uploadDirectory,
            @Value("${app.frontend-base-url-patterns:http://localhost:3000,http://127.0.0.1:3000}") String frontendBaseUrlPatterns
    ) {
        this.uploadDirectory = uploadDirectory;
        this.frontendBaseUrlPatterns = Arrays.stream(frontendBaseUrlPatterns.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(frontendBaseUrlPatterns)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .maxAge(3600);

        registry.addMapping("/uploads/**")
                .allowedOriginPatterns(frontendBaseUrlPatterns)
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = Path.of(uploadDirectory).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }
}
