package com.userMicroservice.service;

import java.util.List;
import java.util.Optional;

import com.userMicroservice.dto.UserCreationRequest;
import com.userMicroservice.dto.UserResponse;
import com.userMicroservice.dto.UserUpdateRequest;
import com.userMicroservice.exceptions.UserCreationException;
import com.userMicroservice.exceptions.UserNotFoundException;
import com.userMicroservice.exceptions.UserProcessingException;
import com.userMicroservice.exceptions.UserProfileUpdateException;

/**
 * Interface for the User Service, defining the core business operations
 * related to managing user profiles.
 */
public interface UserService {

    /**
     * Creates a new user profile. This is typically called after a user
     * successfully registers in Keycloak, to store additional profile data.
     * @param request The UserCreationRequest DTO.
     * @return The created UserResponse DTO.
     * @throws UserCreationException if user creation fails (e.g., duplicate username/email, Keycloak ID already exists).
     */
    UserResponse createUserProfile(UserCreationRequest request);

    /**
     * Retrieves a user profile by their unique user ID (Keycloak's 'sub' claim).
     * @param userId The ID of the user.
     * @return An Optional containing the UserResponse DTO if found, or empty otherwise.
     */
    Optional<UserResponse> getUserProfileById(String userId);

    /**
     * Retrieves a user profile by their username.
     * @param username The username of the user.
     * @return An Optional containing the UserResponse DTO if found, or empty otherwise.
     */
    Optional<UserResponse> getUserProfileByUsername(String username);

    /**
     * Retrieves a user profile by their email.
     * @param email The email of the user.
     * @return An Optional containing the UserResponse DTO if found, or empty otherwise.
     */
    Optional<UserResponse> getUserProfileByEmail(String email);

    /**
     * Updates an existing user profile.
     * @param userId The ID of the user whose profile is to be updated.
     * @param request The UserUpdateRequest DTO containing the fields to update.
     * @return The updated UserResponse DTO.
     * @throws UserNotFoundException if the user profile is not found.
     * @throws UserProfileUpdateException if the update fails (e.g., duplicate email/username).
     */
    UserResponse updateUserProfile(String userId, UserUpdateRequest request);

    /**
     * Deletes a user profile. This should typically be synchronized with Keycloak.
     * @param userId The ID of the user profile to delete.
     * @throws UserNotFoundException if the user profile is not found.
     * @throws UserProcessingException if the deletion fails.
     */
    void deleteUserProfile(String userId);

    /**
     * Retrieves all user profiles.
     * @return A list of all UserResponse DTOs.
     */
    List<UserResponse> getAllUserProfiles();
}