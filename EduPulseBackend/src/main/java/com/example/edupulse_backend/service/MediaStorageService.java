package com.example.edupulse_backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaStorageService {
    List<String> saveMediaFiles(MultipartFile[] files);
}
