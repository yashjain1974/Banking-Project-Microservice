package com.userMicroservice.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.security.core.Authentication; // To get authenticated user details
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.userMicroservice.dto.KycStatusUpdateRequest;
import com.userMicroservice.dto.UserCreationRequest;
import com.userMicroservice.dto.UserResponse;
import com.userMicroservice.dto.UserUpdateRequest;
import com.userMicroservice.exceptions.UserNotFoundException;
import com.userMicroservice.service.UserService;

import jakarta.validation.Valid; // For input validation

@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Handles POST /auth/register requests.
     */
    @PostMapping("/register")
    @PreAuthorize("permitAll()")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserCreationRequest request) {
        UserResponse user = userService.createUserProfile(request);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    /**
     * Handles GET /auth/user/{id} requests.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        Optional<UserResponse> user = userService.getUserProfileById(userId);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));
    }

    /**
     * Handles PUT /auth/user/{id} requests.
     */
    @PutMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated() and #userId == authentication.principal.subject or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String userId,
                                                   @Valid @RequestBody UserUpdateRequest request) {
        UserResponse updatedUser = userService.updateUserProfile(userId, request);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    /**
     * Handles PUT /auth/user/{userId}/kyc-status requests.
     * Allows an ADMIN to update a user's KYC status (e.g., PENDING to VERIFIED/REJECTED).
     * @param userId The ID of the user.
     * @param request The KycStatusUpdateRequest DTO.
     * @return ResponseEntity with the updated UserResponse DTO and HTTP status 200 (OK).
     */
    @PutMapping("/user/{userId}/kyc-status") // <--- NEW ENDPOINT
    @PreAuthorize("hasRole('ADMIN')") // Only ADMINs can update KYC status
    public ResponseEntity<UserResponse> updateKycStatus(@PathVariable String userId,
                                                        @Valid @RequestBody KycStatusUpdateRequest request) {
        UserResponse updatedUser = userService.updateKycStatus(userId, request);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    /**
     * Handles DELETE /auth/user/{id} requests.
     */
    @DeleteMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUserProfile(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Handles GET /auth/profile requests.
     */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String userId = authentication.getName();
        Optional<UserResponse> user = userService.getUserProfileById(userId);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseThrow(() -> new UserNotFoundException("User profile not found for authenticated ID: " + userId));
    }

    /**
     * Handles GET /auth/users requests.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUserProfiles();
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
}
