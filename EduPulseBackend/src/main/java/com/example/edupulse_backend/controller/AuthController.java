package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.dto.AuthResponseDTO;
import com.example.edupulse_backend.dto.LoginDTO;
import com.example.edupulse_backend.dto.RegisterDTO;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;


import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ Register User
    @PostMapping("/register")
    public ResponseEntity<EntityModel<User>> register(@RequestBody RegisterDTO registerDTO) {
        User user = authService.register(registerDTO);

        EntityModel<User> userResource = EntityModel.of(user,
            linkTo(methodOn(AuthController.class).getUserById(user.getId())).withSelfRel(),
            linkTo(methodOn(AuthController.class).getAllUsers()).withRel("all-users")
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(userResource);
    }

    // ✅ Login
    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    // ✅ Get All Users
    @GetMapping("/users")
    public CollectionModel<EntityModel<User>> getAllUsers() {
        List<User> users = authService.getAllUsers();

        List<EntityModel<User>> userResources = users.stream()
            .map(user -> EntityModel.of(user,
                linkTo(methodOn(AuthController.class).getUserById(user.getId())).withSelfRel()
            ))
            .toList();

        return CollectionModel.of(userResources,
            linkTo(methodOn(AuthController.class).getAllUsers()).withSelfRel()
        );
    }

    // ✅ Get User by ID
    @GetMapping("/users/{id}")
    public EntityModel<User> getUserById(@PathVariable String id) {
        User user = authService.getUserById(id);

        return EntityModel.of(user,
            linkTo(methodOn(AuthController.class).getUserById(id)).withSelfRel(),
            linkTo(methodOn(AuthController.class).getAllUsers()).withRel("all-users")
        );
    }

    // ✅ Update User
    @PutMapping("/userupdate/{id}")
    public EntityModel<User> updateUser(@PathVariable String id, @RequestBody RegisterDTO registerDTO) {
        User updatedUser = authService.updateUser(id, registerDTO);

        return EntityModel.of(updatedUser,
            linkTo(methodOn(AuthController.class).getUserById(id)).withSelfRel(),
            linkTo(methodOn(AuthController.class).getAllUsers()).withRel("all-users")
        );
    }

    // ✅ Delete User
    @DeleteMapping("/usersdelete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
