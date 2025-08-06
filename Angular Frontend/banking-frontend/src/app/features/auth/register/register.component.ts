import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { KycStatus, UserRole } from '../../../shared/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Model for the registration form data
  registrationForm = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    role: UserRole.CUSTOMER,
    kycStatus: KycStatus.PENDING
  };

  // UI State variables
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword: boolean = false;
  agreeToTerms: boolean = false;
  isSubmitting: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Handles the registration form submission.
   * Calls the User Microservice to create the user profile.
   */
  onSubmit(): void {
    if (!this.agreeToTerms) {
      this.errorMessage = 'Please agree to the terms and conditions';
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;
    this.isSubmitting = true;

    // Construct the request payload for the User Microservice
    const payload = {
      userId: null,
      username: this.registrationForm.username,
      password: this.registrationForm.password,
      email: this.registrationForm.email,
      role: this.registrationForm.role,
      firstName: this.registrationForm.firstName,
      lastName: this.registrationForm.lastName,
      dateOfBirth: this.registrationForm.dateOfBirth,
      address: this.registrationForm.address,
      phoneNumber: this.registrationForm.phoneNumber,
      kycStatus: this.registrationForm.kycStatus
    };

    // Make the POST request to the User Microservice via API Gateway
    this.http.post(`${environment.apiUrl}/auth/register`, payload).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Your account is pending admin approval.';
        this.isSubmitting = false;

        // Redirect to login page after a delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Get password strength based on criteria
   */
  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.registrationForm.password;

    if (password.length === 0) return 'weak';

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  /**
   * Get password strength text
   */
  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  }

  /**
   * Clear error message when user starts typing
   */
  clearError(): void {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }
}