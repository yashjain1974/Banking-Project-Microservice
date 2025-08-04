// src/app/shared/models/user.model.ts

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
    // Add other roles if needed, e.g., PENDING_CUSTOMER
}

export enum KycStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}