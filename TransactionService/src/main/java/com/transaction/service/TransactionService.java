package com.transaction.service;

import java.util.List;
import java.util.Optional;

import com.transaction.dto.DepositRequest;
import com.transaction.dto.TransferRequest;
import com.transaction.dto.WithdrawRequest;
import com.transaction.exceptions.AccountNotFoundException;
import com.transaction.exceptions.InsufficientFundsException;
import com.transaction.exceptions.InvalidTransactionException;
import com.transaction.exceptions.TransactionProcessingException;
import com.transaction.model.Transaction;

public interface TransactionService {

    /**
     * Processes a deposit transaction.
     * @param request The DepositRequest containing account ID and amount.
     * @return The created Transaction entity.
     * @throws AccountNotFoundException if the target account does not exist.
     * @throws TransactionProcessingException if the deposit fails due to other reasons.
     */
    Transaction deposit(DepositRequest request);

    /**
     * Processes a withdrawal transaction.
     * @param request The WithdrawRequest containing account ID and amount.
     * @return The created Transaction entity.
     * @throws AccountNotFoundException if the source account does not exist.
     * @throws InsufficientFundsException if the account has insufficient funds.
     * @throws TransactionProcessingException if the withdrawal fails due to other reasons.
     */
    Transaction withdraw(WithdrawRequest request);

    /**
     * Processes a fund transfer transaction between two accounts.
     * @param request The TransferRequest containing fromAccountId, toAccountId, and amount.
     * @return The created Transaction entity.
     * @throws AccountNotFoundException if source or target account does not exist.
     * @throws InsufficientFundsException if the source account has insufficient funds.
     * @throws InvalidTransactionException if attempting to transfer to the same account.
     * @throws TransactionProcessingException if the transfer fails due to other reasons.
     */
    Transaction transfer(TransferRequest request);

    /**
     * Retrieves a transaction by its ID.
     * @param transactionId The ID of the transaction.
     * @return An Optional containing the Transaction if found, or empty otherwise.
     */
    Optional<Transaction> getTransactionById(String transactionId);

    /**
     * Retrieves all transactions for a given account ID (either as fromAccountId or toAccountId).
     * @param accountId The account ID.
     * @return A list of transactions related to the account.
     */
    List<Transaction> getTransactionsByAccountId(String accountId);
}
