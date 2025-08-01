package com.creditcardservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LimitUpdateRequestDTO {
    @NotNull
    private Double newLimit;
}
