package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Admin;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.repository.AdminRepository;
import com.example.edupulse_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Admin Registration
    @PostMapping("/register")
    public ResponseEntity<String> registerAdmin(@RequestBody Admin admin) {
        adminRepository.save(admin);
        return ResponseEntity.ok("Admin registered successfully");
    }

    // ✅ Get All Users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // ✅ Delete User (MongoDB uses String IDs)
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
