package com.creditcardservice.controller;

import com.creditcardservice.dto.CreditCardRequestDTO;
import com.creditcardservice.dto.CreditCardResponseDTO;
import com.creditcardservice.dto.TransactionDTO;
import com.creditcardservice.service.CreditCardService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cards")
public class CreditCardController {

    @Autowired
    private CreditCardService creditCardService;

    // Issue a new card
    @PostMapping("/issue")
    public ResponseEntity<CreditCardResponseDTO> issueCard(@Valid @RequestBody CreditCardRequestDTO requestDTO) {
        CreditCardResponseDTO response = creditCardService.issueCard(requestDTO);
        return ResponseEntity.ok(response);
    }

    // Get all cards for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CreditCardResponseDTO>> getCardsByUser(@PathVariable String userId) {
        List<CreditCardResponseDTO> cards = creditCardService.getCardsByUserId(userId);
        return ResponseEntity.ok(cards);
    }

    // Get a card by ID
    @GetMapping("/{cardId}")
    public ResponseEntity<CreditCardResponseDTO> getCardById(@PathVariable String cardId) {
        CreditCardResponseDTO card = creditCardService.getCardById(cardId);
        return ResponseEntity.ok(card);
    }

    // Block a card
    @PutMapping("/{cardId}/block")
    public ResponseEntity<CreditCardResponseDTO> blockCard(@PathVariable String cardId) {
        CreditCardResponseDTO updated = creditCardService.blockCard(cardId);
        return ResponseEntity.ok(updated);
    }

    // Unblock a card
    @PutMapping("/{cardId}/unblock")
    public ResponseEntity<CreditCardResponseDTO> unblockCard(@PathVariable String cardId) {
        CreditCardResponseDTO updated = creditCardService.unblockCard(cardId);
        return ResponseEntity.ok(updated);
    }

    // Update transaction limit
    @PutMapping("/{cardId}/limit")
    public ResponseEntity<CreditCardResponseDTO> updateLimit(@PathVariable String cardId,
                                                             @RequestParam Double newLimit) {
        CreditCardResponseDTO updated = creditCardService.updateTransactionLimit(cardId, newLimit);
        return ResponseEntity.ok(updated);
    }

    // Get transactions for a card
    @GetMapping("/{cardId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByCardId(@PathVariable String cardId) {
        List<TransactionDTO> transactions = creditCardService.getTransactionsByCardId(cardId);
        return ResponseEntity.ok(transactions);
    }
}
