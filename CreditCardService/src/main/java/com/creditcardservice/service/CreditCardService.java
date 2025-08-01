package com.creditcardservice.service;

import com.creditcardservice.dto.*;
import java.util.List;

public interface CreditCardService {

    CreditCardResponseDTO issueCard(CreditCardRequestDTO requestDTO);

    List<CreditCardResponseDTO> getCardsByUserId(String userId);

    CreditCardResponseDTO getCardById(String cardId);

    CreditCardResponseDTO blockCard(String cardId);

    CreditCardResponseDTO unblockCard(String cardId);

    CreditCardResponseDTO updateTransactionLimit(String cardId, Double newLimit);

    List<TransactionDTO> getTransactionsByCardId(String cardId);
}
