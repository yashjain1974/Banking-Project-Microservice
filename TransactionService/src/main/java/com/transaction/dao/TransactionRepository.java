package com.transaction.dao;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.transaction.model.Transaction;
import com.transaction.model.TransactionStatus;
import com.transaction.model.TransactionType;

@Repository // Marks this interface as a Spring Data JPA repository component
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    // JpaRepository provides standard CRUD operations: save, findById, findAll, delete, etc.

    // You can define custom query methods here. Spring Data JPA will implement them automatically
    // based on method naming conventions.

    /**
     * Finds all transactions associated with a specific 'from' account ID.
     * @param fromAccountId The ID of the account initiating the transaction.
     * @return A list of Transaction entities.
     */
    List<Transaction> findByFromAccountId(String fromAccountId);

    /**
     * Finds all transactions associated with a specific 'to' account ID.
     * This is particularly useful for deposit or transfer transactions where an account receives funds.
     * @param toAccountId The ID of the account receiving the transaction.
     * @return A list of Transaction entities.
     */
    List<Transaction> findByToAccountId(String toAccountId);

    /**
     * Finds all transactions involving a specific account, either as the sender or receiver.
     * Note: For more complex queries involving OR conditions, you might consider using
     * JPQL/HQL with @Query annotation if the method naming convention becomes too long or unclear.
     * @param accountId The account ID that could be either 'fromAccountId' or 'toAccountId'.
     * @return A list of Transaction entities.
     */
    List<Transaction> findByFromAccountIdOrToAccountId(String accountId, String accountId2);

    /**
     * Finds transactions by type and status.
     * @param type The type of transaction (e.g., DEPOSIT, WITHDRAW, TRANSFER).
     * @param status The status of the transaction (e.g., SUCCESS, FAILED, PENDING).
     * @return A list of Transaction entities.
     */
    List<Transaction> findByTypeAndStatus(TransactionType type, TransactionStatus status);

    // You can add more custom query methods as needed for your business logic.
}
