package com.creditcardservice.service.impl;

import com.creditcardservice.dao.CreditCardRepository;
import com.creditcardservice.dto.*;
import com.creditcardservice.exceptions.ResourceNotFoundException;
import com.creditcardservice.model.CardStatus;
import com.creditcardservice.model.CreditCard;
import com.creditcardservice.proxyservice.TransactionServiceProxy;
import com.creditcardservice.service.CreditCardService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CreditCardServiceImpl implements CreditCardService {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Override
    public CreditCardResponseDTO issueCard(CreditCardRequestDTO requestDTO) {
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



    // -------------------------
    // Mapping Utility
    // -------------------------

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

    @Autowired
    private TransactionServiceProxy transactionServiceProxy;

    @Override
    @CircuitBreaker(name = "transactionService", fallbackMethod = "getTransactionsFallback")
    public List<TransactionDTO> getTransactionsByCardId(String cardId) {
        return transactionServiceProxy.getTransactionsByCardId(cardId);
    }

    public List<TransactionDTO> getTransactionsFallback(String cardId, Throwable t) {
        System.out.println("Fallback triggered due to: " + t.getMessage());
        return Collections.emptyList();
    }

}


//package com.creditcardservice.service.impl;
//
//import com.creditcardservice.dao.CreditCardRepository;
//import com.creditcardservice.dto.*;
//import com.creditcardservice.exceptions.ResourceNotFoundException;
//import com.creditcardservice.model.CardStatus;
//import com.creditcardservice.model.CreditCard;
//import com.creditcardservice.proxyservice.TransactionServiceProxy;
//import com.creditcardservice.service.CreditCardService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//@Service
//public class CreditCardServiceImpl implements CreditCardService {
//
//    @Autowired
//    private CreditCardRepository creditCardRepository;
//
//    @Autowired
//    private TransactionServiceProxy transactionProxy;
//
//    @Override
//    public CreditCardResponseDTO issueCard(CreditCardRequestDTO requestDTO) {
//        CreditCard card = new CreditCard();
//        card.setCardId(UUID.randomUUID().toString());
//        card.setUserId(requestDTO.getUserId());
//        card.setAccountId(requestDTO.getAccountId());
//        card.setCardNumber(generateCardNumber());
//        card.setCardType(requestDTO.getCardType());
//        card.setStatus(CardStatus.ACTIVE);
//        card.setIssueDate(LocalDate.now());
//        card.setExpiryDate(LocalDate.now().plusYears(5));
//        card.setTransactionLimit(requestDTO.getTransactionLimit());
//        card.setCreatedAt(LocalDateTime.now());
//
//        return mapToResponseDTO(creditCardRepository.save(card));
//    }
//
//    @Override
//    public List<CreditCardResponseDTO> getCardsByUserId(String userId) {
//        return creditCardRepository.findByUserId(userId)
//                .stream()
//                .map(this::mapToResponseDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public CreditCardResponseDTO getCardById(String cardId) {
//        CreditCard card = creditCardRepository.findById(cardId)
//                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardId));
//        return mapToResponseDTO(card);
//    }
//
//    @Override
//    public CreditCardResponseDTO blockCard(String cardId) {
//        CreditCard card = getEntity(cardId);
//        card.setStatus(CardStatus.BLOCKED);
//        return mapToResponseDTO(creditCardRepository.save(card));
//    }
//
//    @Override
//    public CreditCardResponseDTO unblockCard(String cardId) {
//        CreditCard card = getEntity(cardId);
//        card.setStatus(CardStatus.ACTIVE);
//        return mapToResponseDTO(creditCardRepository.save(card));
//    }
//
//    @Override
//    public CreditCardResponseDTO updateTransactionLimit(String cardId, Double newLimit) {
//        CreditCard card = getEntity(cardId);
//        card.setTransactionLimit(newLimit);
//        return mapToResponseDTO(creditCardRepository.save(card));
//    }
//
//    @Override
//    public List<TransactionDTO> getTransactionsByCardId(String cardId) {
//        // proxy call to transaction microservice
//        return transactionProxy.getTransactionsByCardId(cardId);
//    }
//
//    // ========== Utility Methods ==========
//
//    private CreditCard getEntity(String cardId) {
//        return creditCardRepository.findById(cardId)
//                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardId));
//    }
//
//    private CreditCardResponseDTO mapToResponseDTO(CreditCard card) {
//        CreditCardResponseDTO dto = new CreditCardResponseDTO();
//        dto.setCardId(card.getCardId());
//        dto.setUserId(card.getUserId());
//        dto.setAccountId(card.getAccountId());
//        dto.setCardNumber(card.getCardNumber());
//        dto.setCardType(card.getCardType());
//        dto.setStatus(card.getStatus());
//        dto.setIssueDate(card.getIssueDate());
//        dto.setExpiryDate(card.getExpiryDate());
//        dto.setTransactionLimit(card.getTransactionLimit());
//        dto.setCreatedAt(card.getCreatedAt());
//        return dto;
//    }
//
//    private String generateCardNumber() {
//        return "4000" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
//    }
//}
