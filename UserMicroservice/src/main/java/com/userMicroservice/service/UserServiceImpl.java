package com.userMicroservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.userMicroservice.dao.UserRepository;
import com.userMicroservice.dto.UserCreationRequest;
import com.userMicroservice.dto.UserResponse;
import com.userMicroservice.dto.UserUpdateRequest;
import com.userMicroservice.exceptions.UserCreationException;
import com.userMicroservice.exceptions.UserNotFoundException;
import com.userMicroservice.exceptions.UserProcessingException;
import com.userMicroservice.exceptions.UserProfileUpdateException;
import com.userMicroservice.model.User;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Creates a new user profile.
     * @param request The UserCreationRequest DTO.
     * @return The created UserResponse DTO.
     * @throws UserCreationException if user creation fails (e.g., duplicate username/email).
     */
    @Override
    @Transactional
    public UserResponse createUserProfile(UserCreationRequest request) {
        // Basic validation for uniqueness before saving
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserCreationException("User with username '" + request.getUsername() + "' already exists.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserCreationException("User with email '" + request.getEmail() + "' already exists.");
        }
        if (request.getUserId() != null && userRepository.findById(request.getUserId()).isPresent()) {
             throw new UserCreationException("User with ID '" + request.getUserId() + "' already exists.");
        }

        User user = new User();
        // If userId is not provided in request, you might generate it here (e.g., UUID)
        // or ensure it's always provided by the caller (e.g., Keycloak sync process).
        // For this implementation, we'll assume it's either provided or handled by the caller.
        user.setUserId(request.getUserId() != null ? request.getUserId() : UUID.randomUUID().toString()); // Example fallback
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setCreatedAt(LocalDateTime.now());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setKycStatus(request.getKycStatus());

        try {
            user = userRepository.save(user);
            return mapToUserResponse(user);
        } catch (DataIntegrityViolationException e) {
            throw new UserCreationException("Failed to create user profile due to data integrity violation (e.g., duplicate entry).", e);
        } catch (Exception e) {
            throw new UserProcessingException("Failed to create user profile unexpectedly: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves a user profile by their unique user ID.
     * @param userId The ID of the user.
     * @return An Optional containing the UserResponse DTO if found, or empty otherwise.
     */
    @Override
    public Optional<UserResponse> getUserProfileById(String userId) {
        return userRepository.findById(userId)
                             .map(this::mapToUserResponse);
    }

    /**
     * Retrieves a user profile by their username.
     * @param username The username of the user.
     * @return An Optional containing the UserResponse DTO if found, or empty otherwise.
     */
    @Override
    public Optional<UserResponse> getUserProfileByUsername(String username) {
        return userRepository.findByUsername(username)
                             .map(this::mapToUserResponse);
    }

    /**
     * Retrieves a user profile by their email.
     * @param email The email of the user.
     * @return An Optional containing the UserResponse DTO if found, or empty otherwise.
     */
    @Override
    public Optional<UserResponse> getUserProfileByEmail(String email) {
        return userRepository.findByEmail(email)
                             .map(this::mapToUserResponse);
    }

    /**
     * Updates an existing user profile.
     * @param userId The ID of the user whose profile is to be updated.
     * @param request The UserUpdateRequest DTO containing the fields to update.
     * @return The updated UserResponse DTO.
     * @throws UserNotFoundException if the user profile is not found.
     * @throws UserProfileUpdateException if the update fails (e.g., duplicate email/username).
     */
    @Override
    @Transactional
    public UserResponse updateUserProfile(String userId, UserUpdateRequest request) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));

        // Apply updates only if fields are provided in the request
        Optional.ofNullable(request.getUsername()).ifPresent(username -> {
            if (userRepository.findByUsername(username).isPresent() && !existingUser.getUsername().equals(username)) {
                throw new UserProfileUpdateException("Username '" + username + "' is already taken.");
            }
            existingUser.setUsername(username);
        });
        Optional.ofNullable(request.getEmail()).ifPresent(email -> {
            if (userRepository.findByEmail(email).isPresent() && !existingUser.getEmail().equals(email)) {
                throw new UserProfileUpdateException("Email '" + email + "' is already in use.");
            }
            existingUser.setEmail(email);
        });
        Optional.ofNullable(request.getRole()).ifPresent(existingUser::setRole);
        Optional.ofNullable(request.getFirstName()).ifPresent(existingUser::setFirstName);
        Optional.ofNullable(request.getLastName()).ifPresent(existingUser::setLastName);
        Optional.ofNullable(request.getDateOfBirth()).ifPresent(existingUser::setDateOfBirth);
        Optional.ofNullable(request.getAddress()).ifPresent(existingUser::setAddress);
        Optional.ofNullable(request.getPhoneNumber()).ifPresent(existingUser::setPhoneNumber);
        Optional.ofNullable(request.getKycStatus()).ifPresent(existingUser::setKycStatus);

        try {
            User updatedUser = userRepository.save(existingUser);
            return mapToUserResponse(updatedUser);
        } catch (DataIntegrityViolationException e) {
            throw new UserProfileUpdateException("Failed to update user profile due to data integrity violation.", e);
        } catch (Exception e) {
            throw new UserProcessingException("Failed to update user profile unexpectedly: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a user profile.
     * @param userId The ID of the user profile to delete.
     * @throws UserNotFoundException if the user profile is not found.
     * @throws UserProcessingException if the deletion fails.
     */
    @Override
    @Transactional
    public void deleteUserProfile(String userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));
        try {
            userRepository.delete(existingUser);
        } catch (Exception e) {
            throw new UserProcessingException("Failed to delete user profile with ID: " + userId, e);
        }
    }

    /**
     * Retrieves all user profiles.
     * @return A list of all UserResponse DTOs.
     */
    @Override
    public List<UserResponse> getAllUserProfiles() {
        return userRepository.findAll()
                             .stream()
                             .map(this::mapToUserResponse)
                             .collect(Collectors.toList());
    }

    /**
     * Helper method to map User entity to UserResponse DTO.
     * @param user The User entity.
     * @return The UserResponse DTO.
     */
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getAddress(),
                user.getPhoneNumber(),
                user.getKycStatus()
        );
    }
}
