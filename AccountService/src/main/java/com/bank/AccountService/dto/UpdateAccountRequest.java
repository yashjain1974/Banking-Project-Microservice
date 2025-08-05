package com.bank.AccountService.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class UpdateAccountRequest {

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;
}


