package com.example.edupulse_backend.service;

import com.example.edupulse_backend.dto.AuthResponseDTO;
import com.example.edupulse_backend.dto.LoginDTO;
import com.example.edupulse_backend.dto.RegisterDTO;
import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public ResponseDto register(RegisterDTO registerDTO) {
        log.info("Registering new user: {}", registerDTO.getUsername());
        
        // Check if username is already taken
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            log.warn("Username {} is already taken", registerDTO.getUsername());
            return new ResponseDto(true, "Username is already taken!");
        }
        
        // Check if email is already in use
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            log.warn("Email {} is already in use", registerDTO.getEmail());
            return new ResponseDto(true, "Email is already in use!");
        }

        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setName(registerDTO.getName());
        user.setProvider("local"); // Set provider as local for regular registrations
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", registerDTO.getUsername());
        
        // Generate token for the newly registered user
        String token = jwtUtil.generateToken(user.getUsername());
        
        // Return authentication response with token and user details
        AuthResponseDTO authResponse = new AuthResponseDTO(token, savedUser);
        return new ResponseDto(false, authResponse);
    }

    public ResponseDto login(LoginDTO loginDTO) {
        log.info("Attempting login for user: {}", loginDTO.getUsername());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByUsername(loginDTO.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + loginDTO.getUsername()));
            
            String token = jwtUtil.generateToken(user.getUsername());
            log.info("Login successful for user: {}", loginDTO.getUsername());
            
            AuthResponseDTO authResponse = new AuthResponseDTO(token, user);
            return new ResponseDto(false, authResponse);
        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {}", loginDTO.getUsername());
            return new ResponseDto(true, "Invalid username or password");
        }
    }

    public ResponseDto getAllUsers() {
        List<User> users = userRepository.findAll();
        return new ResponseDto(false, users);
    }

    public ResponseDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return new ResponseDto(false, user);
    }

    public ResponseDto updateUser(String id, RegisterDTO registerDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        // Check if username is being changed and already exists
        if (!existingUser.getUsername().equals(registerDTO.getUsername()) && 
                userRepository.existsByUsername(registerDTO.getUsername())) {
            return new ResponseDto(true, "Username is already taken!");
        }
        
        // Check if email is being changed and already exists
        if (!existingUser.getEmail().equals(registerDTO.getEmail()) && 
                userRepository.existsByEmail(registerDTO.getEmail())) {
            return new ResponseDto(true, "Email is already in use!");
        }

        existingUser.setUsername(registerDTO.getUsername());
        existingUser.setEmail(registerDTO.getEmail());
        existingUser.setName(registerDTO.getName());
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        // Only update password if one is provided
        if (registerDTO.getPassword() != null && !registerDTO.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        }
        
        User updatedUser = userRepository.save(existingUser);
        return new ResponseDto(false, updatedUser);
    }

    public ResponseDto deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            return new ResponseDto(true, "User not found with ID: " + id);
        }
        
        userRepository.deleteById(id);
        return new ResponseDto(false, "User deleted successfully");
    }
}