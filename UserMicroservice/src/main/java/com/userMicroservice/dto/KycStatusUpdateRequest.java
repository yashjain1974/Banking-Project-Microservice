package com.userMicroservice.dto;

import com.userMicroservice.model.KycStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating a user's KYC status.
 * Used by the Admin Dashboard.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusUpdateRequest {
    @NotNull(message = "KYC status cannot be null")
    private KycStatus kycStatus; // VERIFIED, REJECTED, PENDING
}