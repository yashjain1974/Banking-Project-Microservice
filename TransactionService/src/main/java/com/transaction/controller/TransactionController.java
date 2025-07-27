package com.transaction.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.transaction.dto.DepositRequest;
import com.transaction.dto.TransferRequest;
import com.transaction.dto.WithdrawRequest;
import com.transaction.exceptions.AccountNotFoundException;
import com.transaction.exceptions.InsufficientFundsException;
import com.transaction.exceptions.InvalidTransactionException;
import com.transaction.exceptions.TransactionProcessingException;
import com.transaction.model.Transaction;
import com.transaction.service.TransactionService;

import jakarta.validation.Valid; // For input validation

@RestController // Marks this class as a REST controller, handling incoming HTTP requests
@RequestMapping("/transactions") // Base path for all endpoints in this controller
public class TransactionController {
	
	@Autowired
    private final TransactionService transactionService;

    @Autowired // Injects the TransactionService implementation
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Handles POST /transactions/deposit requests.
     * Facilitates depositing funds into an account.
     * @param request The DepositRequest DTO containing account ID and amount.
     * @return ResponseEntity with the created Transaction and HTTP status 201 (Created).
     * @throws AccountNotFoundException if the target account does not exist.
     * @throws TransactionProcessingException if the deposit fails.
     * (Other exceptions are handled by GlobalExceptionHandler)
     */
    @PostMapping("/deposit")
    public ResponseEntity<Transaction> deposit(@Valid @RequestBody DepositRequest request) {
        // @Valid triggers validation defined in DepositRequest DTO
        // Exceptions are thrown by the service layer and caught by GlobalExceptionHandler
        Transaction transaction = transactionService.deposit(request);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    /**
     * Handles POST /transactions/withdraw requests.
     * Facilitates withdrawing funds from an account.
     * @param request The WithdrawRequest DTO containing account ID and amount.
     * @return ResponseEntity with the created Transaction and HTTP status 201 (Created).
     * @throws AccountNotFoundException if the source account does not exist.
     * @throws InsufficientFundsException if the account has insufficient funds.
     * @throws TransactionProcessingException if the withdrawal fails.
     */
    @PostMapping("/withdraw")
    public ResponseEntity<Transaction> withdraw(@Valid @RequestBody WithdrawRequest request) {
        Transaction transaction = transactionService.withdraw(request);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    /**
     * Handles POST /transactions/transfer requests.
     * Facilitates fund transfer between accounts.
     * @param request The TransferRequest DTO containing fromAccountId, toAccountId, and amount.
     * @return ResponseEntity with the created Transaction and HTTP status 201 (Created).
     * @throws AccountNotFoundException if source or target account does not exist.
     * @throws InsufficientFundsException if the source account has insufficient funds.
     * @throws InvalidTransactionException if attempting to transfer to the same account.
     * @throws TransactionProcessingException if the transfer fails.
     */
    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transfer(@Valid @RequestBody TransferRequest request) {
        Transaction transaction = transactionService.transfer(request);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    /**
     * Handles GET /transactions/account/{id} requests.
     * Retrieves all transactions for a specific account.
     * @param accountId The ID of the account.
     * @return ResponseEntity with a list of Transaction entities and HTTP status 200 (OK).
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Transaction>> getTransactionsByAccountId(@PathVariable String accountId) {
        List<Transaction> transactions = transactionService.getTransactionsByAccountId(accountId);
        if (transactions.isEmpty()) {
            // Optionally return 404 if no transactions are found for the account,
            // or 200 with an empty list depending on API design preference.
            // For now, returning 200 OK with an empty list is common.
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Or HttpStatus.OK with empty list
        }
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    /**
     * Handles GET /transactions/{transactionId} requests.
     * Retrieves a single transaction by its ID.
     * @param transactionId The ID of the transaction.
     * @return ResponseEntity with the Transaction entity and HTTP status 200 (OK),
     * or 404 (Not Found) if the transaction does not exist.
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String transactionId) {
        Optional<Transaction> transaction = transactionService.getTransactionById(transactionId);
        return transaction.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                          .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
