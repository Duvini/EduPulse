package com.example.edupulse_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "file.storage")
public class FileStorageConfig {
    private String base;
    private String imageFolder;
    private String videoFolder;
}