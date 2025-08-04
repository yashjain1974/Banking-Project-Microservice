import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KycStatus, UserRole } from '../../shared/models/user.model';



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

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private userProfileApiUrl = `${environment.apiUrl}/auth/user`; // Base URL for user profiles

  constructor(private http: HttpClient) { }

  /**
   * Fetches the user's profile by their user ID from the User Microservice.
   * @param userId The ID of the user (typically from JWT).
   * @returns An Observable of UserProfile.
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userProfileApiUrl}/${userId}`);
  }
}