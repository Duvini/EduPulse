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


public interface AuthService {

    ResponseDto register(RegisterDTO registerDTO);

    ResponseDto login(LoginDTO loginDTO);

    ResponseDto getAllUsers();

    ResponseDto getUserById(String id);

    ResponseDto updateUser(String id, RegisterDTO registerDTO);

    ResponseDto deleteUser(String id);

    ResponseDto validateToken(String token);

    ResponseDto updateProfilePicture(String id, MultipartFile file);

    ResponseDto searchUsers(String username);

    ResponseDto verifyPassword(String password);
}