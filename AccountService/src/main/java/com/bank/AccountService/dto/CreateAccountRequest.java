package com.bank.AccountService.dto;
import com.bank.AccountService.entity.AccountType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class CreateAccountRequest {

    @NotBlank
    private String userId;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotNull
    private AccountType type;
}