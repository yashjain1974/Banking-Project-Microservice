package com.accountMicroservice.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.accountMicroservice.model.Account;
import com.accountMicroservice.model.AccountStatus;

@Repository // Marks this interface as a Spring Data JPA repository component
public interface AccountRepository extends JpaRepository<Account, String> {
    // JpaRepository provides standard CRUD operations: save, findById, findAll, delete, etc.
    // The 'String' parameter specifies the type of the primary key (accountId is String)

    /**
     * Finds an account by its unique account number.
     * @param accountNumber The unique account number.
     * @return An Optional containing the Account if found, or empty otherwise.
     */
    Optional<Account> findByAccountNumber(String accountNumber);

    /**
     * Finds all accounts associated with a specific user ID.
     * @param userId The ID of the user.
     * @return A list of Account entities.
     */
    List<Account> findByUserId(String userId);

    /**
     * Finds an account by user ID and account ID.
     * @param userId The ID of the user.
     * @param accountId The ID of the account.
     * @return An Optional containing the Account if found, or empty otherwise.
     */
    Optional<Account> findByUserIdAndAccountId(String userId, String accountId);

    /**
     * Finds accounts by their status (e.g., ACTIVE, CLOSED).
     * @param status The status of the account.
     * @return A list of Account entities.
     */
    List<Account> findByStatus(AccountStatus status);

    // You can add more custom query methods as needed for your business logic.
}
