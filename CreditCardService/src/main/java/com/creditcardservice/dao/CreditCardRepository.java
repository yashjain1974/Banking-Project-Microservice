package com.creditcardservice.dao;

import com.creditcardservice.model.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, String> {

    // Retrieve all cards for a specific user
	boolean existsByCardNumber(String cardNumber);
    List<CreditCard> findByUserId(String userId);
}
