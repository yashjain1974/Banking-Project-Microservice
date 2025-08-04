import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../user-profile/user-profile.service'; // Import UserProfileService and UserProfile interface
import { KycStatus } from '../../shared/models/user.model';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink
  template: `
    <div class="dashboard-container">
      <h2>Welcome to Your Dashboard!</h2>
      <div *ngIf="authService.isLoggedIn()">
        <p>You are logged in as: <strong>{{ (authService.getIdentityClaims()?.preferred_username || 'User') }}</strong></p>
        <button (click)="logout()" class="logout-button">Logout</button>

        <h3>Your Profile Details</h3>
        <div *ngIf="loadingProfile" class="loading-message">Loading user profile...</div>
        <div *ngIf="profileError" class="error-message">Error loading profile: {{ profileError }}</div>

        <div *ngIf="userProfile && !loadingProfile">
          <p>User ID: {{ userProfile.userId }}</p>
          <p>Email: {{ userProfile.email }}</p>
          <p>Full Name: {{ userProfile.firstName }} {{ userProfile.lastName }}</p>
          <p>KYC Status: <strong [ngClass]="getKycStatusClass(userProfile.kycStatus)">{{ userProfile.kycStatus }}</strong></p>

          <div class="kyc-status-section">
            <ng-container [ngSwitch]="userProfile.kycStatus">
              <div *ngSwitchCase="KycStatus.PENDING" class="kyc-pending-message">
                <p>Your account is pending KYC verification. Full banking features will be available once approved by an administrator.</p>
                <p>Please ensure all your submitted details are accurate.</p>
              </div>
              <div *ngSwitchCase="KycStatus.REJECTED" class="kyc-rejected-message">
                <p>Your KYC verification was rejected. Full banking features are currently unavailable.</p>
                <p>Please contact support for more information.</p>
              </div>
              <div *ngSwitchCase="KycStatus.VERIFIED" class="kyc-verified-message">
                <p>Your KYC is verified! You now have full access to all banking features.</p>
                <button routerLink="/banking-features" class="proceed-button">Proceed to Banking</button>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
      <div *ngIf="!authService.isLoggedIn()">
        <p>You are not logged in. Please <a routerLink="/login">Login</a>.</p>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css'] // Assuming you have a CSS file
})
export class DashboardComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loadingProfile: boolean = true;
  profileError: string | null = null;
  KycStatus = KycStatus; // Make enum available in template

  constructor(
    public authService: AuthService, // Made public to use in template
    private userProfileService: UserProfileService // Inject UserProfileService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadUserProfile();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  loadUserProfile(): void {
    this.loadingProfile = true;
    this.profileError = null;
    const userId = this.authService.getIdentityClaims()?.sub;

    if (userId) {
      this.userProfileService.getUserProfile(userId).subscribe(
        (data) => {
          this.userProfile = data;
          this.loadingProfile = false;
          console.log('User Profile from Backend:', this.userProfile);
        },
        (error) => {
          console.error('Error fetching user profile:', error);
          this.profileError = error.error?.message || 'Failed to load user profile.';
          this.loadingProfile = false;
        }
      );
    } else {
      this.profileError = 'User ID not found in token.';
      this.loadingProfile = false;
    }
  }

  getKycStatusClass(status: KycStatus): string {
    switch (status) {
      case KycStatus.PENDING: return 'status-pending';
      case KycStatus.VERIFIED: return 'status-verified';
      case KycStatus.REJECTED: return 'status-rejected';
      default: return '';
    }
  }
}