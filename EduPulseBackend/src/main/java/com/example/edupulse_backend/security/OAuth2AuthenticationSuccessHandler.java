package com.example.edupulse_backend.security;

import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    private final String FRONTEND_URL = "http://localhost:5173";

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

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String providerId = oauthUser.getAttribute("sub");

        User user = userRepository.findByProviderAndProviderId("google", providerId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(email);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProvider("google");
                    newUser.setProviderId(providerId);
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    return userRepository.save(newUser);
                });

        String token = jwtUtil.generateToken(user.getUsername());

        request.getSession().invalidate();

        String redirectUrl = FRONTEND_URL + "/oauth2/callback" +
                "?token=" + token +
                "&userId=" + user.getId() +
                "&username=" + user.getUsername() +
                "&email=" + user.getEmail() +
                "&name=" + user.getName();

        response.sendRedirect(redirectUrl);
    }
}
