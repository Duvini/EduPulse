package com.example.edupulse_backend.service;

import com.example.edupulse_backend.dto.AuthResponseDTO;
import com.example.edupulse_backend.dto.LoginDTO;
import com.example.edupulse_backend.dto.RegisterDTO;
import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.Media;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final MediaBlobService mediaBlobService;

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
        if (registerDTO.getUsername() != null && !registerDTO.getUsername().equals(existingUser.getUsername()) && 
                userRepository.existsByUsername(registerDTO.getUsername())) {
            return new ResponseDto(true, "Username is already taken!");
        }
        
        // Check if email is being changed and already exists
        if (registerDTO.getEmail() != null && !registerDTO.getEmail().equals(existingUser.getEmail()) && 
                userRepository.existsByEmail(registerDTO.getEmail())) {
            return new ResponseDto(true, "Email is already in use!");
        }

        // Update basic info if provided
        if (registerDTO.getUsername() != null) existingUser.setUsername(registerDTO.getUsername());
        if (registerDTO.getEmail() != null) existingUser.setEmail(registerDTO.getEmail());
        if (registerDTO.getName() != null) existingUser.setName(registerDTO.getName());
        
        // Handle password change if requested
        if (registerDTO.getCurrentPassword() != null && registerDTO.getPassword() != null) {
            // Verify current password
            if (!passwordEncoder.matches(registerDTO.getCurrentPassword(), existingUser.getPassword())) {
                return new ResponseDto(true, "Current password is incorrect");
            }
            
            // Update to new password
            existingUser.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        }
        
        existingUser.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(existingUser);
        return new ResponseDto(false, updatedUser);
    }

    public ResponseDto deleteUser(String id) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ResponseDto(true, "Not authenticated");
            }

            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if the user is trying to delete their own account
            if (!currentUser.getId().equals(id)) {
                return new ResponseDto(true, "You can only delete your own account");
            }

            userRepository.deleteById(id);
            return new ResponseDto(false, "User deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return new ResponseDto(true, "Error deleting user: " + e.getMessage());
        }
    }

    public ResponseDto validateToken(String token) {
        try {
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                return new ResponseDto(false, user);
            }
            return new ResponseDto(true, "Invalid token");
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return new ResponseDto(true, "Token validation failed");
        }
    }

    public ResponseDto updateProfilePicture(String id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return new ResponseDto(true, "Profile picture file is required");
        }

        try {
            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Store profile picture in MongoDB as BLOB
            Media media = mediaBlobService.updateMedia(file, "profile", id, "image");

            // Update user profile picture reference to point to the media ID
            String profilePictureId = media.getId();
            existingUser.setProfilePicture("blob:" + profilePictureId);
            existingUser.setUpdatedAt(LocalDateTime.now());

            User updatedUser = userRepository.save(existingUser);
            return new ResponseDto(false, updatedUser);
        } catch (ResourceNotFoundException e) {
            log.error("User not found: {}", e.getMessage());
            return new ResponseDto(true, e.getMessage());
        } catch (IOException e) {
            log.error("Failed to save profile picture: {}", e.getMessage());
            return new ResponseDto(true, "Failed to save profile picture");
        }
    }

    public ResponseDto searchUsers(String username) {
        log.info("Searching for users with username pattern: {}", username);
        try {
            List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(username.toLowerCase()) ||
                              user.getName().toLowerCase().contains(username.toLowerCase()))
                .collect(Collectors.toList());
            return new ResponseDto(false, users);
        } catch (Exception e) {
            log.error("Error searching users: {}", e.getMessage());
            return new ResponseDto(true, "Error searching users");
        }
    }

    public ResponseDto verifyPassword(String password) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ResponseDto(true, "Not authenticated");
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Verify password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return new ResponseDto(true, "Incorrect password");
            }

            return new ResponseDto(false, "Password verified");
        } catch (Exception e) {
            log.error("Error verifying password: {}", e.getMessage());
            return new ResponseDto(true, "Error verifying password");
        }
    }
}