package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.service.SkillPostService;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/skillposts")
@CrossOrigin
public class SkillPostController {

    @Autowired
    private SkillPostService service;

    private final String uploadDir = "uploads/";

    @PostMapping
    public SkillPost createPost(@RequestParam String userName,
                                @RequestParam String profilePhotoUrl,
                                @RequestParam String description,
                                @RequestParam List<String> tags,
                                @RequestParam("mediaFiles") MultipartFile[] files) throws Exception {

        if (files.length > 3)
            throw new RuntimeException("Only up to 3 media files allowed.");

        List<String> mediaPaths = new ArrayList<>();
        for (MultipartFile file : files) {
            String ext = FilenameUtils.getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "." + ext;
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            mediaPaths.add("/" + path.toString());
        }

        SkillPost post = new SkillPost();
        post.setUserName(userName);
        post.setProfilePhotoUrl(profilePhotoUrl);
        post.setDescription(description);
        post.setTags(tags);
        post.setMediaUrls(mediaPaths);

        return service.save(post);
    }

    @GetMapping
    public List<SkillPost> getAllPosts() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public SkillPost updatePost(@PathVariable String id, @RequestBody SkillPost post) {
        return service.update(id, post);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable String id) {
        service.delete(id);
    }
}
