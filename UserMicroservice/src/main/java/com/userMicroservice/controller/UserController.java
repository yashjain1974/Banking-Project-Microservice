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

import com.userMicroservice.dto.UserCreationRequest;
import com.userMicroservice.dto.UserResponse;
import com.userMicroservice.dto.UserUpdateRequest;
import com.userMicroservice.exceptions.UserNotFoundException;
import com.userMicroservice.service.UserService;

import jakarta.validation.Valid; // For input validation

@RestController // Marks this class as a REST controller
@RequestMapping("/auth") // Base path for all endpoints in this controller, as per doc
public class UserController {

    private final UserService userService;

    @Autowired // Injects the UserService implementation
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Handles POST /auth/register requests.
     * Creates a new user profile. This endpoint is typically used for initial user profile creation
     * after a user has registered in Keycloak. The userId should ideally come from Keycloak.
     *
     * @param request The UserCreationRequest DTO.
     * @return ResponseEntity with the created UserResponse and HTTP status 201 (Created).
     * @throws com.bank.user.exception.UserCreationException if user creation fails.
     */
    @PostMapping("/register")
    @PreAuthorize("permitAll()") // Allow unauthenticated access for registration (or configure Keycloak flow)
    // In a real Keycloak integration, registration might happen directly through Keycloak's forms,
    // and this endpoint would be for syncing/creating the profile in your DB after Keycloak registration.
    // Or, if your app handles registration, it would then call Keycloak's admin API to create the user there.
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserCreationRequest request) {
        UserResponse user = userService.createUserProfile(request);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    /**
     * Handles GET /auth/user/{id} requests.
     * Retrieves a user profile by their ID. This endpoint is crucial for other microservices
     * (like Account Service) to retrieve user details.
     *
     * @param userId The ID of the user.
     * @return ResponseEntity with the UserResponse DTO and HTTP status 200 (OK),
     * or 404 (Not Found) if the user does not exist.
     * @throws UserNotFoundException if the user is not found.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()") // Only authenticated users can access
    // You might add more granular roles here, e.g., hasRole('ADMIN') or (hasRole('CUSTOMER') and #userId == authentication.principal.subject)
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        Optional<UserResponse> user = userService.getUserProfileById(userId);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));
    }

    /**
     * Handles PUT /auth/user/{id} requests.
     * Updates an existing user profile.
     *
     * @param userId The ID of the user whose profile is to be updated.
     * @param request The UserUpdateRequest DTO.
     * @return ResponseEntity with the updated UserResponse DTO and HTTP status 200 (OK).
     * @throws UserNotFoundException if the user is not found.
     * @throws com.bank.user.exception.UserProfileUpdateException if the update fails.
     */
    @PutMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated() and #userId == authentication.principal.subject or hasRole('ADMIN')")
    // Allows users to update their own profile OR an ADMIN to update any profile.
    public ResponseEntity<UserResponse> updateUser(@PathVariable String userId,
                                                   @Valid @RequestBody UserUpdateRequest request) {
        UserResponse updatedUser = userService.updateUserProfile(userId, request);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    /**
     * Handles DELETE /auth/user/{id} requests.
     * Deletes a user profile. This operation should typically be restricted to ADMINs
     * and should also trigger deletion in Keycloak if the user is fully removed.
     *
     * @param userId The ID of the user profile to delete.
     * @return ResponseEntity with HTTP status 204 (No Content) upon successful deletion.
     * @throws UserNotFoundException if the user is not found.
     * @throws com.bank.user.exception.UserProcessingException if the deletion fails.
     */
    @DeleteMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMINs can delete users
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUserProfile(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Handles GET /auth/profile requests.
     * Retrieves the profile of the currently authenticated user.
     * The userId is extracted directly from the JWT.
     *
     * @param authentication Spring Security's Authentication object containing JWT details.
     * @return ResponseEntity with the UserResponse DTO and HTTP status 200 (OK).
     * @throws UserNotFoundException if the user profile linked to the JWT ID is not found in the database.
     */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Only authenticated users can access their own profile
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        // The 'sub' (subject) claim in the JWT is typically the userId from Keycloak
        String userId = authentication.getName(); // Corrected to use authentication.getName()
        Optional<UserResponse> user = userService.getUserProfileById(userId);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseThrow(() -> new UserNotFoundException("User profile not found for authenticated ID: " + userId));
    }

    /**
     * Handles GET /auth/users requests.
     * Retrieves all user profiles. This endpoint is typically for administrative purposes.
     *
     * @return ResponseEntity with a list of all UserResponse DTOs and HTTP status 200 (OK).
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMINs can view all users
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUserProfiles();
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
}