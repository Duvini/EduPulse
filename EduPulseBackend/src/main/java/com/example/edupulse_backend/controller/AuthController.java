package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.dto.AuthResponseDTO;
import com.example.edupulse_backend.dto.LoginDTO;
import com.example.edupulse_backend.dto.RegisterDTO;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ Register User
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterDTO registerDTO) {
        User user = authService.register(registerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    // ✅ Login
    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    // ✅ Get All Users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return authService.getAllUsers();
    }

    // ✅ Get User by ID (MongoDB uses String IDs)
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable String id) {
        return authService.getUserById(id);
    }

    // ✅ Update User
    @PutMapping("/userupdate/{id}")
    public User updateUser(@PathVariable String id, @RequestBody RegisterDTO registerDTO) {
        return authService.updateUser(id, registerDTO);
    }

    // ✅ Delete User
    @DeleteMapping("/usersdelete/{id}")
    public void deleteUser(@PathVariable String id) {
        authService.deleteUser(id);
    }
}
