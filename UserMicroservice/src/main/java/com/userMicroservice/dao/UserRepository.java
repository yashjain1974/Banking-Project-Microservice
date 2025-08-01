package com.userMicroservice.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.userMicroservice.model.KycStatus;
import com.userMicroservice.model.User;
import com.userMicroservice.model.UserRole;

@Repository // Marks this interface as a Spring Data JPA repository component
public interface UserRepository extends JpaRepository<User, String> {
    // JpaRepository provides standard CRUD operations: save, findById, findAll, delete, etc.
    // The 'String' parameter specifies the type of the primary key (userId is String)

    /**
     * Finds a user by their unique username.
     * @param username The username of the user.
     * @return An Optional containing the User if found, or empty otherwise.
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds a user by their unique email address.
     * @param email The email address of the user.
     * @return An Optional containing the User if found, or empty otherwise.
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds all users with a specific role.
     * @param role The role of the users (e.g., CUSTOMER, ADMIN).
     * @return A list of User entities.
     */
    List<User> findByRole(UserRole role);

    /**
     * Finds users by their KYC status.
     * @param kycStatus The KYC status (e.g., PENDING, VERIFIED, REJECTED).
     * @return A list of User entities.
     */
    List<User> findByKycStatus(KycStatus kycStatus);

    /**
     * Finds a user by their phone number.
     * @param phoneNumber The phone number of the user.
     * @return An Optional containing the User if found, or empty otherwise.
     */
    Optional<User> findByPhoneNumber(String phoneNumber);

    // You can add more custom query methods as needed for your User Microservice's logic.
}

