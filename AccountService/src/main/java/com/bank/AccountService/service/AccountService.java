package com.bank.AccountService.service;
import com.bank.AccountService.dto.AccountResponse;
import com.bank.AccountService.dto.ApiResponse;
import com.bank.AccountService.dto.CreateAccountRequest;
import com.bank.AccountService.dto.UpdateAccountRequest;
import com.bank.AccountService.entity.Account;
import com.bank.AccountService.entity.AccountStatus;
import com.bank.AccountService.exception.AccountNotFoundException;
import com.bank.AccountService.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accountNumber;
        do {
            accountNumber = String.valueOf(100000000000L + random.nextLong(900000000000L));
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    public AccountResponse createAccount(CreateAccountRequest request) {
        Account account = Account.builder()
                .accountNumber(generateUniqueAccountNumber())
                .userId(request.getUserId())
                .email(request.getEmail())
                .phone(request.getPhone())
                .type(request.getType())
                .status(AccountStatus.ACTIVE)
                .balance(0.0)
                .build();
        Account saved = accountRepository.save(account);
        return mapToDto(saved);
    }

    public List<AccountResponse> getAccountsByUser(String userId) {
        return accountRepository.findByUserId(userId)
                .stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        return mapToDto(account);
    }

    public AccountResponse updateAccount(Long id, UpdateAccountRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        account.setPhone(request.getPhone());
        account.setEmail(request.getEmail());
        return mapToDto(accountRepository.save(account));
    }

    public ApiResponse deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        account.setStatus(AccountStatus.CLOSED);
        accountRepository.save(account);
        return new ApiResponse("Account closed", true);
    }

    private AccountResponse mapToDto(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .userId(account.getUserId())
                .email(account.getEmail())
                .phone(account.getPhone())
                .type(account.getType())
                .status(account.getStatus())
                .balance(account.getBalance())
                .build();
    }
}