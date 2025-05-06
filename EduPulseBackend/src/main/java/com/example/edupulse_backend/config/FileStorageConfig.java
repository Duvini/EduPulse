package com.example.edupulse_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.nio.file.Paths;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "file.storage")
public class FileStorageConfig {
    // Use absolute path to the uploads directory in the project root
    private String base = Paths.get(System.getProperty("user.dir")).getParent().toString() + "/uploads/";
    private String imageFolder = "images/";
    private String videoFolder = "videos/";
    
    public String getAbsoluteBasePath() {
        return base;
    }
}