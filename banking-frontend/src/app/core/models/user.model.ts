export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  kycStatus: KycStatus;
}

export interface UserCreationRequest {
  userId?: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  kycStatus: KycStatus;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNumber?: string;
  kycStatus?: KycStatus;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}