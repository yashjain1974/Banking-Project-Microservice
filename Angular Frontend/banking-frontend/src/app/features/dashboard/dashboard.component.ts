import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../user-profile/user-profile.service';
import { KycStatus } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loadingProfile: boolean = true;
  profileError: string | null = null;
  KycStatus = KycStatus; // Make enum available in template

  constructor(
    public authService: AuthService, // Made public to use in template
    private userProfileService: UserProfileService
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
      this.userProfileService.getUserProfile(userId).subscribe({
        next: (data) => {
          this.userProfile = data;
          this.loadingProfile = false;
          console.log('User Profile from Backend:', this.userProfile);
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
          this.profileError = error.error?.message || 'Failed to load user profile.';
          this.loadingProfile = false;
        }
      });
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

  getKycStatusIcon(status: KycStatus): string {
    switch (status) {
      case KycStatus.PENDING: return 'fas fa-clock';
      case KycStatus.VERIFIED: return 'fas fa-check-circle';
      case KycStatus.REJECTED: return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  /**
   * Navigate to banking services (when KYC is verified)
   */
  proceedToBanking(): void {
    // This method can be used for additional logic before navigation
    // The actual navigation is handled by routerLink in the template
    console.log('Proceeding to banking services...');
  }

  /**
   * Contact support for KYC issues
   */
  contactSupport(): void {
    // Implementation for contacting support
    // This could open a modal, navigate to support page, or open email client
    console.log('Contacting support...');

    // Example: Open email client
    const email = 'support@securebank.com';
    const subject = 'KYC Verification Support';
    const body = 'Hello, I need assistance with my KYC verification process. My User ID is: ' +
      (this.userProfile?.userId || 'N/A');

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /**
   * Refresh user profile data
   */
  refreshProfile(): void {
    this.loadUserProfile();
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    if (this.userProfile) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    return this.authService.getIdentityClaims()?.preferred_username || 'User';
  }

  /**
   * Get formatted user ID for display
   */
  getFormattedUserId(): string {
    if (this.userProfile?.userId) {
      // Format user ID for better readability (e.g., add dashes or spaces)
      return this.userProfile.userId.toString().replace(/(\d{4})(?=\d)/g, '$1-');
    }
    return 'N/A';
  }

  /**
   * Check if user can access banking services
   */
  canAccessBankingServices(): boolean {
    return this.userProfile?.kycStatus === KycStatus.VERIFIED;
  }

  /**
   * Get KYC status message for user guidance
   */
  getKycStatusMessage(): string {
    if (!this.userProfile) return '';

    switch (this.userProfile.kycStatus) {
      case KycStatus.PENDING:
        return 'Your account verification is in progress. This usually takes 2-3 business days.';
      case KycStatus.VERIFIED:
        return 'Your account is fully verified and ready for all banking services.';
      case KycStatus.REJECTED:
        return 'Your verification was unsuccessful. Please contact support for assistance.';
      default:
        return 'Account verification status unknown.';
    }
  }
}