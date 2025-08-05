import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KycStatus, UserRole } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';
// Import shared enums

// Define the UserProfile interface to match your UserResponse DTO from backend
export interface UserProfile {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: string; // Use string for date/time from backend
    firstName: string;
    lastName: string;
    dateOfBirth: string; // Use string for date from backend
    address: string;
    phoneNumber: string;
    kycStatus: KycStatus;
}

// Interface for updating user profile (mirroring backend UserUpdateRequest DTO)
export interface UserProfileUpdateRequest {
    username?: string; // Optional fields for update
    email?: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string; // Send as string "YYYY-MM-DD"
    address?: string;
    phoneNumber?: string;
    kycStatus?: KycStatus;
}


@Injectable({
    providedIn: 'root'
})
export class UserProfileService {

    private usersApiUrl = `${environment.apiUrl}/auth/users`; // Base URL for all users
    private userProfileApiUrl = `${environment.apiUrl}/auth/user`; // Base URL for single user profile

    constructor(private http: HttpClient) { }

    /**
     * Fetches all user profiles from the User Microservice.
     * GET /auth/users
     * @returns An Observable of a list of UserProfile.
     */
    getAllUserProfiles(): Observable<UserProfile[]> {
        return this.http.get<UserProfile[]>(this.usersApiUrl);
    }

    /**
     * Fetches a single user's profile by their user ID from the User Microservice.
     * GET /auth/user/{userId}
     * @param userId The ID of the user.
     * @returns An Observable of UserProfile.
     */
    getUserProfile(userId: string): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.userProfileApiUrl}/${userId}`);
    }

    /**
     * Updates an existing user profile.
     * PUT /auth/user/{userId}
     * @param userId The ID of the user to update.
     * @param request The UserProfileUpdateRequest payload.
     * @returns An Observable of the updated UserProfile.
     */
    updateUserProfile(userId: string, request: UserProfileUpdateRequest): Observable<UserProfile> {
        return this.http.put<UserProfile>(`${this.userProfileApiUrl}/${userId}`, request);
    }

    /**
     * Deletes a user profile.
     * DELETE /auth/user/{userId}
     * @param userId The ID of the user profile to delete.
     * @returns An Observable of void.
     */
    deleteUserProfile(userId: string): Observable<void> { // <--- NEW METHOD
        return this.http.delete<void>(`${this.userProfileApiUrl}/${userId}`);
    }
}