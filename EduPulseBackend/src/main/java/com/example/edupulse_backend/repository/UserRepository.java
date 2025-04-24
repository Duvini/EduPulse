package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
