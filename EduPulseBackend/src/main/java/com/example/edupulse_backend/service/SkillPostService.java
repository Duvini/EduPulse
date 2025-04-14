package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.repository.SkillPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillPostService {

    @Autowired
    private SkillPostRepository repository;

    public SkillPost save(SkillPost post) {
        return repository.save(post);
    }

    public List<SkillPost> getAll() {
        return repository.findAll();
    }

    public Optional<SkillPost> getById(String id) {
        return repository.findById(id);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }

    public SkillPost update(String id, SkillPost updated) {
        updated.setId(id);
        return repository.save(updated);
    }
}
