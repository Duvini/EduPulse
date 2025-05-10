package com.example.edupulse_backend.validation;

import com.example.edupulse_backend.dto.LoginDTO;
import com.example.edupulse_backend.dto.RegisterDTO;
import com.example.edupulse_backend.exception.ValidationException;

public class AuthRequestValidator {
    
    public static void validateLoginRequest(LoginDTO loginDTO) {
        if (loginDTO == null) {
            throw new ValidationException("Request body cannot be empty");
        }
        
        if (loginDTO.getUsername() == null || loginDTO.getUsername().trim().isEmpty()) {
            throw new ValidationException("Username is required");
        }
        
        if (loginDTO.getPassword() == null || loginDTO.getPassword().trim().isEmpty()) {
            throw new ValidationException("Password is required");
        }
    }
    
    public static void validateRegisterRequest(RegisterDTO registerDTO) {
        if (registerDTO == null) {
            throw new ValidationException("Request body cannot be empty");
        }
        
        if (registerDTO.getUsername() == null || registerDTO.getUsername().trim().isEmpty()) {
            throw new ValidationException("Username is required");
        }
        
        if (registerDTO.getPassword() == null || registerDTO.getPassword().trim().isEmpty()) {
            throw new ValidationException("Password is required");
        }
        
        if (registerDTO.getEmail() == null || registerDTO.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }
        
        if (!isValidEmail(registerDTO.getEmail())) {
            throw new ValidationException("Invalid email format");
        }
        
        if (registerDTO.getName() == null || registerDTO.getName().trim().isEmpty()) {
            throw new ValidationException("Name is required");
        }
    }
    
    private static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email.matches(emailRegex);
    }
}
