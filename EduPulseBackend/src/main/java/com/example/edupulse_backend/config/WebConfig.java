package com.example.edupulse_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FileStorageConfig fileStorageConfig;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Use absolute path from FileStorageConfig
        String absoluteBasePath = fileStorageConfig.getAbsoluteBasePath();
        String imagesPath = absoluteBasePath + fileStorageConfig.getImageFolder();
        String videosPath = absoluteBasePath + fileStorageConfig.getVideoFolder();
        String profilePicsPath = absoluteBasePath + "profile-pictures/";
        
        // Log the paths being used
        System.out.println("Base upload path: file:" + absoluteBasePath);
        System.out.println("Images path: file:" + imagesPath);
        System.out.println("Videos path: file:" + videosPath);
        
        // Configure main uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absoluteBasePath);
        
        // Explicitly configure profile pictures directory
        registry.addResourceHandler("/uploads/profile-pictures/**")
                .addResourceLocations("file:" + profilePicsPath);
        
        // Explicitly configure images directory
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:" + imagesPath);
        
        // Explicitly configure videos directory
        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations("file:" + videosPath);
                
        // Add support for root-level image access (backward compatibility)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + imagesPath);
        
        // Add support for root-level video access (backward compatibility)
        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + videosPath);
    }
}