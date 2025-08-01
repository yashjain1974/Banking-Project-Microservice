package com.transaction.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor; // Lombok annotation for all-argument constructor
import lombok.Data; // Lombok annotation for getters, setters, equals, hashCode, and toString
import lombok.NoArgsConstructor; // Lombok annotation for no-argument constructor

@Entity // Marks this class as a JPA entity, mapping it to a database table
@Data // Generates getters, setters, equals, hashCode, and toString methods
@NoArgsConstructor // Generates a no-argument constructor (required by JPA)
@AllArgsConstructor // Generates a constructor with all fields
public class Transaction {

    @Id // Designates 'transactionId' as the primary key
    // Using UUID for unique ID generation, which is robust for distributed systems
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id", updatable = false, nullable = false)
    private String transactionId;

    @Column(name = "from_account_id", nullable = true)
    private String fromAccountId; // Foreign key referencing Account Service's Account ID

    @Column(name = "to_account_id")
    private String toAccountId; // Foreign key referencing Account Service's Account ID (can be null for DEPOSIT/WITHDRAW)

    @Column(name = "amount", nullable = false)
    private Double amount;

    
    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "transaction_type", nullable = false)
    private TransactionType type;

   
    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "transaction_status", nullable = false)
    private TransactionStatus status;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

}