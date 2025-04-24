package com.example.edupulse_backend.dto;

import com.example.edupulse_backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor  // Lombok will generate a constructor with all fields (token, user)
@NoArgsConstructor   // Lombok will also generate a no-argument constructor (useful for deserialization)
public class AuthResponseDTO {
    private String token;  // The authentication token
    private User user;     // The user details

    // No need to define constructors manually, Lombok will do that for you
}
