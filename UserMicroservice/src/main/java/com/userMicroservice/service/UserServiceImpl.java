package com.userMicroservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Keycloak Admin Client imports
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate; // Import KafkaTemplate
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.userMicroservice.dao.UserRepository;
import com.userMicroservice.dto.KycStatusUpdateRequest;
import com.userMicroservice.dto.UserCreationRequest;
import com.userMicroservice.dto.UserResponse;
import com.userMicroservice.dto.UserUpdateRequest;
import com.userMicroservice.event.KycStatusUpdatedEvent;
import com.userMicroservice.exceptions.UserCreationException;
import com.userMicroservice.exceptions.UserNotFoundException;
import com.userMicroservice.exceptions.UserProcessingException;
import com.userMicroservice.exceptions.UserProfileUpdateException;
import com.userMicroservice.model.KycStatus;
import com.userMicroservice.model.User;
import com.userMicroservice.model.UserRole;

import jakarta.ws.rs.core.Response;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final Keycloak keycloakAdminClient;
    private final KafkaTemplate<String, KycStatusUpdatedEvent> kafkaTemplate; // Inject KafkaTemplate

    @Autowired
    public UserServiceImpl(UserRepository userRepository, Keycloak keycloakAdminClient, KafkaTemplate<String, KycStatusUpdatedEvent> kafkaTemplate) { // Add KafkaTemplate
        this.userRepository = userRepository;
        this.keycloakAdminClient = keycloakAdminClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Creates a new user profile.
     */
    @Override
    @Transactional
    public UserResponse createUserProfile(UserCreationRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserCreationException("User with username '" + request.getUsername() + "' already exists.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserCreationException("User with email '" + request.getEmail() + "' already exists.");
        }

        UserRepresentation keycloakUser = new UserRepresentation();
        keycloakUser.setUsername(request.getUsername());
        keycloakUser.setEmail(request.getEmail());
        keycloakUser.setFirstName(request.getFirstName());
        keycloakUser.setLastName(request.getLastName());
        keycloakUser.setEnabled(true);
        keycloakUser.setEmailVerified(true);

        CredentialRepresentation passwordCred = new CredentialRepresentation();
        passwordCred.setTemporary(false);
        passwordCred.setType(CredentialRepresentation.PASSWORD);
        passwordCred.setValue(request.getPassword());
        keycloakUser.setCredentials(java.util.Collections.singletonList(passwordCred));

        RealmResource realmResource = keycloakAdminClient.realm("bank-realm");
        UsersResource usersResource = realmResource.users();

        try {
            Response response = usersResource.create(keycloakUser);

            if (response.getStatus() == 201) {
                String keycloakUserId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
                System.out.println("User created in Keycloak with ID: " + keycloakUserId);

                String roleName = request.getRole().name();
                try {
                    RoleRepresentation roleToAdd = realmResource.roles().get(roleName).toRepresentation();
                    if (roleToAdd != null) {
                        realmResource.users().get(keycloakUserId).roles().realmLevel()
                            .add(java.util.Collections.singletonList(roleToAdd));
                        System.out.println("SUCCESS: Assigned realm role '" + roleName + "' to user " + keycloakUserId + " in Keycloak.");
                    } else {
                        System.err.println("WARNING: Realm role '" + roleName + "' not found in Keycloak. Cannot assign.");
                    }
                } catch (Exception roleError) {
                    System.err.println("ERROR: Failed to assign realm role '" + roleName + "' in Keycloak for user " + keycloakUserId + ": " + roleError.getMessage());
                    roleError.printStackTrace();
                }

                User user = new User();
                user.setUserId(keycloakUserId);
                user.setUsername(request.getUsername());
                user.setEmail(request.getEmail());
                user.setRole(request.getRole());
                user.setCreatedAt(LocalDateTime.now());
                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setDateOfBirth(request.getDateOfBirth());
                user.setAddress(request.getAddress());
                user.setPhoneNumber(request.getPhoneNumber());
                user.setKycStatus(KycStatus.PENDING);

                user = userRepository.save(user);

                // Publish KYC status updated event (for initial PENDING status)
                publishKycStatusUpdatedEvent(
                    user.getUserId(),
                    user.getUsername(),
                    user.getEmail(),
                    null, // Old status is null for new creation
                    user.getKycStatus().name(),
                    "User registered and KYC status set to PENDING."
                );

                return mapToUserResponse(user);

            } else if (response.getStatus() == 409) {
                throw new UserCreationException("User with this username or email already exists in Keycloak.");
            } else {
                throw new UserCreationException("Failed to create user in Keycloak. Status: " + response.getStatus() + ", Reason: " + response.readEntity(String.class));
            }
        } catch (DataIntegrityViolationException e) {
            throw new UserCreationException("Failed to create user profile due to data integrity violation (e.g., duplicate entry in local DB).", e);
        } catch (Exception e) {
            throw new UserProcessingException("Failed to create user profile unexpectedly: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves a user profile by their unique user ID.
     */
    @Override
    public Optional<UserResponse> getUserProfileById(String userId) {
        return userRepository.findById(userId)
                             .map(this::mapToUserResponse);
    }

    /**
     * Retrieves a user profile by their username.
     */
    @Override
    public Optional<UserResponse> getUserProfileByUsername(String username) {
        return userRepository.findByUsername(username)
                             .map(this::mapToUserResponse);
    }

    /**
     * Retrieves a user profile by their email.
     */
    @Override
    public Optional<UserResponse> getUserProfileByEmail(String email) {
        return userRepository.findByEmail(email)
                             .map(this::mapToUserResponse);
    }

    /**
     * Updates an existing user profile.
     */
    @Override
    @Transactional
    public UserResponse updateUserProfile(String userId, UserUpdateRequest request) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));

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
            // Optional: Update user in Keycloak if username/email/role changed
            return mapToUserResponse(updatedUser);
        } catch (DataIntegrityViolationException e) {
            throw new UserProfileUpdateException("Failed to update user profile due to data integrity violation.", e);
        } catch (Exception e) {
            throw new UserProcessingException("Failed to update user profile unexpectedly: " + e.getMessage(), e);
        }
    }

    /**
     * Updates a user's KYC status.
     * This method is called by the Admin Dashboard.
     * @param userId The ID of the user.
     * @param request The KycStatusUpdateRequest DTO.
     * @return The updated UserResponse DTO.
     * @throws UserNotFoundException if the user profile is not found.
     * @throws UserProfileUpdateException if the update fails.
     */
    @Override
    @Transactional
    public UserResponse updateKycStatus(String userId, KycStatusUpdateRequest request) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));

        // Store old status for the event
        String oldKycStatus = existingUser.getKycStatus().name();

        // Validate state transitions if necessary (e.g., cannot go from REJECTED to PENDING)
        if (existingUser.getKycStatus() == KycStatus.REJECTED && request.getKycStatus() == KycStatus.PENDING) {
            throw new UserProfileUpdateException("Cannot change KYC status from REJECTED to PENDING.");
        }

        existingUser.setKycStatus(request.getKycStatus());

        try {
            User updatedUser = userRepository.save(existingUser);

            // Crucially: If KYC becomes VERIFIED, ensure user has the CUSTOMER role in Keycloak
            if (request.getKycStatus() == KycStatus.VERIFIED) {
                try {
                    RealmResource realmResource = keycloakAdminClient.realm("bank-realm");
                    RoleRepresentation customerRole = realmResource.roles().get(UserRole.CUSTOMER.name()).toRepresentation();
                    if (customerRole != null) {
                        // Add CUSTOMER role (if not already present)
                        realmResource.users().get(userId).roles().realmLevel()
                            .add(java.util.Collections.singletonList(customerRole));
                        System.out.println("SUCCESS: Assigned CUSTOMER role to user " + userId + " in Keycloak due to KYC verification.");
                    } else {
                        System.err.println("WARNING: CUSTOMER role not found in Keycloak. Cannot assign after KYC verification.");
                    }
                } catch (Exception roleError) {
                    System.err.println("ERROR: Failed to assign CUSTOMER role in Keycloak for user " + userId + " after KYC verification: " + roleError.getMessage());
                    roleError.printStackTrace();
                }
            } else if (request.getKycStatus() == KycStatus.REJECTED) {
                // Optional: Remove CUSTOMER role or assign a "REJECTED_CUSTOMER" role in Keycloak
                // if they previously had CUSTOMER role and are now rejected.
            }

            // Publish KYC status updated event
            publishKycStatusUpdatedEvent(
                updatedUser.getUserId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                oldKycStatus,
                updatedUser.getKycStatus().name(),
                "User KYC status changed from " + oldKycStatus + " to " + updatedUser.getKycStatus().name() + "."
            );

            return mapToUserResponse(updatedUser);
        } catch (DataIntegrityViolationException e) {
            throw new UserProfileUpdateException("Failed to update user KYC status due to data integrity violation.", e);
        } catch (Exception e) {
            throw new UserProcessingException("Failed to update user KYC status unexpectedly: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a user profile.
     */
    @Override
    @Transactional
    public void deleteUserProfile(String userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User profile not found with ID: " + userId));
        try {
            userRepository.delete(existingUser);
            // Optional: Delete user from Keycloak as well
        } catch (Exception e) {
            throw new UserProcessingException("Failed to delete user profile with ID: " + userId, e);
        }
    }

    /**
     * Retrieves all user profiles.
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

    /**
     * Helper method to publish KycStatusUpdatedEvent to Kafka.
     */
    private void publishKycStatusUpdatedEvent(String userId, String username, String email, String oldKycStatus, String newKycStatus, String message) {
        KycStatusUpdatedEvent event = new KycStatusUpdatedEvent(
            userId,
            username,
            email,
            oldKycStatus,
            newKycStatus,
            LocalDateTime.now(),
            message
        );
        try {
            kafkaTemplate.send("kyc-status-events", event); // 'kyc-status-events' is the Kafka topic name
            System.out.println("Published KYC status updated event to Kafka: User " + userId + ", Status: " + newKycStatus);
        } catch (Exception e) {
            System.err.println("Failed to publish KYC status updated event to Kafka for user " + userId + ": " + e.getMessage());
        }
    }
}