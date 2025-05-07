package com.example.edupulse_backend.config;

import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;
import java.util.Optional;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Configure more restrictively in production
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract JWT token from headers
                    String token = accessor.getFirstNativeHeader("Authorization");
                    log.debug("Processing WebSocket connection with auth token");
                    
                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                        
                        try {
                            if (jwtUtil.validateToken(token)) {
                                String username = jwtUtil.extractUsername(token);
                                
                                // Find user in database to verify and get roles
                                Optional<User> userOpt = userRepository.findByUsername(username);
                                if (userOpt.isPresent()) {
                                    User user = userOpt.get();
                                    
                                    // Create authentication object
                                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                                    );
                                    
                                    // Set authentication
                                    SecurityContextHolder.getContext().setAuthentication(auth);
                                    accessor.setUser(auth);
                                    
                                    // Store user ID in session for disconnect handling
                                    accessor.getSessionAttributes().put("USER_ID", user.getId());
                                    
                                    log.debug("WebSocket authenticated for user: {}", username);
                                } else {
                                    log.warn("User not found for WebSocket authentication: {}", username);
                                }
                            } else {
                                log.warn("Invalid token for WebSocket authentication");
                            }
                        } catch (Exception e) {
                            log.error("Error authenticating WebSocket connection: {}", e.getMessage());
                        }
                    } else {
                        log.debug("No authorization token provided for WebSocket connection");
                    }
                } else if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    // Log subscription destinations for debugging
                    log.debug("User subscribing to: {}", accessor.getDestination());
                } else if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                    // Log disconnections
                    String userId = accessor.getSessionAttributes() != null ? 
                                   (String) accessor.getSessionAttributes().get("USER_ID") : null;
                    log.debug("User disconnecting from WebSocket: {}", userId);
                }
                
                return message;
            }
        });
    }
}