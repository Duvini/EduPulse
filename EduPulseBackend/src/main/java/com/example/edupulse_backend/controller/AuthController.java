package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.dto.LoginDTO;
import com.example.edupulse_backend.dto.RegisterDTO;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ResponseDto> register(@RequestBody RegisterDTO registerDTO) {
        log.info("Registration request received for username: {}", registerDTO.getUsername());
        ResponseDto response = authService.register(registerDTO);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDto> login(@RequestBody LoginDTO loginDTO) {
        log.info("Login request received for username: {}", loginDTO.getUsername());
        ResponseDto response = authService.login(loginDTO);
        
        if (response.isError()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<ResponseDto> getAllUsers() {
        log.info("Request to get all users");
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ResponseDto> getUserById(@PathVariable String id) {
        log.info("Request to get user with ID: {}", id);
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ResponseDto> updateUser(@PathVariable String id, @RequestBody RegisterDTO registerDTO) {
        log.info("Request to update user with ID: {}", id);
        ResponseDto response = authService.updateUser(id, registerDTO);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ResponseDto> deleteUser(@PathVariable String id) {
        log.info("Request to delete user with ID: {}", id);
        ResponseDto response = authService.deleteUser(id);
        
        if (response.isError()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<ResponseDto> validateToken(@RequestHeader("Authorization") String authHeader) {
        log.info("Token validation request received");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDto response = authService.validateToken(token);
        
        if (response.isError()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/profile-picture")
    public ResponseEntity<ResponseDto> updateProfilePicture(
            @PathVariable String id,
            @RequestParam("profilePicture") MultipartFile file) {
        log.info("Request to update profile picture for user with ID: {}", id);
        ResponseDto response = authService.updateProfilePicture(id, file);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/search")
    public ResponseEntity<ResponseDto> searchUsers(@RequestParam String username) {
        log.info("Search request received for username pattern: {}", username);
        ResponseDto response = authService.searchUsers(username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-password")
    public ResponseEntity<ResponseDto> verifyPassword(@RequestBody Map<String, String> credentials) {
        log.info("Password verification request received");
        ResponseDto response = authService.verifyPassword(credentials.get("password"));
        return ResponseEntity.ok(response);
    }
}