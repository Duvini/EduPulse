package com.example.edupulse_backend.security;

import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.oauth2.redirectUri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil,
                                              @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
//        log.info("OAuth2 login successful for user: {}", oauthUser.getAttribute("email"));

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String providerId = oauthUser.getAttribute("sub");
        String pictureUrl = oauthUser.getAttribute("picture");

        // Find or create the user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    // Create username from email (before @)
                    String username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 8);
                    newUser.setUsername(username);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProvider("google");
                    newUser.setProviderId(providerId);
                    // Set a random secure password for OAuth2 users
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    
                    // If user already exists with this username, generate a new one
                    while (userRepository.existsByUsername(newUser.getUsername())) {
                        username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 8);
                        newUser.setUsername(username);
                    }
                    
                    log.info("Creating new user from OAuth2 login: {}", email);
                    return userRepository.save(newUser);
                });

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        // Clear the authentication attributes in the session
        request.getSession().invalidate();

        // Build the redirect URL with user info and token
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .queryParam("userId", user.getId())
                .queryParam("username", user.getUsername())
                .queryParam("email", user.getEmail())
                .queryParam("name", user.getName())
                .build().toUriString();

        log.info("Redirecting to: {}", targetUrl);
        response.sendRedirect(targetUrl);
    }
}