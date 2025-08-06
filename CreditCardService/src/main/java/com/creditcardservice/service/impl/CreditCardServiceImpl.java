package com.creditcardservice.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Added for transactional methods

import com.creditcardservice.dao.CreditCardRepository;
import com.creditcardservice.dto.AccountDto;
import com.creditcardservice.dto.CreditCardRequestDTO;
import com.creditcardservice.dto.CreditCardResponseDTO;
import com.creditcardservice.dto.TransactionDTO;
import com.creditcardservice.dto.UserDto;
import com.creditcardservice.exceptions.CardServiceException; // NEW: Custom exception for Card Service
import com.creditcardservice.exceptions.ResourceNotFoundException; // Assuming this is your base exception
import com.creditcardservice.model.AccountStatus;
import com.creditcardservice.model.CardStatus;
import com.creditcardservice.model.CreditCard;
import com.creditcardservice.model.KycStatus;
import com.creditcardservice.proxyservice.AccountServiceClient; // NEW: Import AccountServiceClient
import com.creditcardservice.proxyservice.TransactionServiceProxy;
import com.creditcardservice.proxyservice.UserServiceClient; // NEW: Import UserServiceClient
import com.creditcardservice.service.CreditCardService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class CreditCardServiceImpl implements CreditCardService {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Autowired
    private TransactionServiceProxy transactionServiceProxy;

    @Autowired // NEW: Inject AccountServiceClient
    private AccountServiceClient accountServiceClient;

    @Autowired // NEW: Inject UserServiceClient
    private UserServiceClient userServiceClient;

    @Override
    @Transactional // Ensure atomicity for card issuance
    public CreditCardResponseDTO issueCard(CreditCardRequestDTO requestDTO) {
        // 1. Validate User existence via User Service
        UserDto user = userServiceClient.getUserById(requestDTO.getUserId());
        if (user == null) {
            throw new CardServiceException("Card issuance denied: User not found with ID: " + requestDTO.getUserId());
        }
        if (user.getKycStatus() != KycStatus.VERIFIED) { // Assuming KycStatus is accessible from UserDto
            throw new CardServiceException("Card issuance denied: User KYC status is " + user.getKycStatus() + ". Must be VERIFIED.");
        }

        // 2. Validate Account existence and status via Account Service
        AccountDto account = accountServiceClient.getAccountById(requestDTO.getAccountId());
        if (account == null) {
            throw new CardServiceException("Card issuance denied: Account not found with ID: " + requestDTO.getAccountId());
        }
        if (!account.getUserId().equals(requestDTO.getUserId())) {
            throw new CardServiceException("Card issuance denied: Account ID " + requestDTO.getAccountId() + " does not belong to user " + requestDTO.getUserId() + ".");
        }
        if (account.getStatus() != AccountStatus.ACTIVE) { // Assuming AccountStatus is accessible from AccountDto
            throw new CardServiceException("Card issuance denied: Account ID " + requestDTO.getAccountId() + " is " + account.getStatus() + ". Must be ACTIVE.");
        }

        // 3. Proceed with card creation
        CreditCard card = new CreditCard();
        card.setUserId(requestDTO.getUserId());
        card.setAccountId(requestDTO.getAccountId());
        card.setCardNumber(generateUniqueIndianCreditCardNumber());
        card.setCardType(requestDTO.getCardType());
        card.setIssueDate(requestDTO.getIssueDate());
        card.setExpiryDate(requestDTO.getExpiryDate());
        card.setStatus(CardStatus.ACTIVE);
        card.setTransactionLimit(requestDTO.getTransactionLimit());
        card.setCreatedAt(LocalDateTime.now());

        CreditCard savedCard = creditCardRepository.save(card);
        return mapToResponseDTO(savedCard);
    }
    
    private String generateUniqueIndianCreditCardNumber() {
        String cardNumber;
        do {
            cardNumber = generateValidIndianCreditCardNumber();
        } while (creditCardRepository.existsByCardNumber(cardNumber));
        return cardNumber;
    }

    private String generateValidIndianCreditCardNumber() {
        String bin = "531278"; // Example BIN for Mastercard India

        StringBuilder number = new StringBuilder(bin);
        Random random = new Random();

        // Generate next 9 digits randomly
        for (int i = 0; i < 9; i++) {
            number.append(random.nextInt(10));
        }

        // Calculate and append Luhn check digit
        number.append(calculateLuhnCheckDigit(number.toString()));

        return number.toString();
    }

    private int calculateLuhnCheckDigit(String number) {
        int sum = 0;
        boolean alternate = true;

        for (int i = number.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(number.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }

        return (10 - (sum % 10)) % 10;
    }


    @Override
    public List<CreditCardResponseDTO> getCardsByUserId(String userId) {
        List<CreditCard> cards = creditCardRepository.findByUserId(userId);
        if (cards.isEmpty()) {
            throw new ResourceNotFoundException("No cards found for userId: " + userId);
        }
        return cards.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CreditCardResponseDTO getCardById(String cardId) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));
        return mapToResponseDTO(card);
    }

    @Override
    public CreditCardResponseDTO blockCard(String cardId) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));
        card.setStatus(CardStatus.BLOCKED);
        return mapToResponseDTO(creditCardRepository.save(card));
    }

    @Override
    public CreditCardResponseDTO unblockCard(String cardId) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));
        card.setStatus(CardStatus.ACTIVE);
        return mapToResponseDTO(creditCardRepository.save(card));
    }

    @Override
    public CreditCardResponseDTO updateTransactionLimit(String cardId, Double newLimit) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));
        card.setTransactionLimit(newLimit);
        return mapToResponseDTO(creditCardRepository.save(card));
    }

    @Override
    @CircuitBreaker(name = "transactionService", fallbackMethod = "getTransactionsFallback")
    public List<TransactionDTO> getTransactionsByCardId(String cardId) {
        return transactionServiceProxy.getTransactionsByCardId(cardId);
    }

    public List<TransactionDTO> getTransactionsFallback(String cardId, Throwable t) {
        System.out.println("Fallback triggered due to: " + t.getMessage());
        return Collections.emptyList();
    }

    private CreditCardResponseDTO mapToResponseDTO(CreditCard card) {
        CreditCardResponseDTO dto = new CreditCardResponseDTO();
        dto.setCardId(card.getCardId());
        dto.setUserId(card.getUserId());
        dto.setAccountId(card.getAccountId());
        dto.setCardNumber(card.getCardNumber());
        dto.setCardType(card.getCardType());
        dto.setIssueDate(card.getIssueDate());
        dto.setExpiryDate(card.getExpiryDate());
        dto.setStatus(card.getStatus());
        dto.setTransactionLimit(card.getTransactionLimit());
        dto.setCreatedAt(card.getCreatedAt());
        return dto;
    }
}
