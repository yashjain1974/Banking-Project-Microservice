import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor
import { FormsModule } from '@angular/forms'; // For ngModel and form handling
import { HttpClient } from '@angular/common/http'; // For making HTTP requests
import { Router } from '@angular/router'; // For navigation

import { environment } from '../../../../environments/environment'; // Your environment file
import { KycStatus, UserRole } from '../../../shared/models/user.model';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import FormsModule
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Model for the registration form data
  registrationForm = {
    username: '',
    password: '', // Password will be sent to User Microservice for Keycloak creation
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '', // Will be a string, convert to LocalDate in backend
    address: '',
    phoneNumber: '',
    // Default values for new registrations
    role: UserRole.CUSTOMER, // Default to CUSTOMER
    kycStatus: KycStatus.PENDING // Default to PENDING for admin approval
  };

  errorMessage: string | null = null;
  successMessage: string | null = null;


  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Handles the registration form submission.
   * Calls the User Microservice to create the user profile.
   */
  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Construct the request payload for the User Microservice
    const payload = {
      userId: null, // User Microservice will generate or Keycloak will provide
      username: this.registrationForm.username,
      password: this.registrationForm.password, // Password sent for Keycloak creation
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
    this.http.post(`${environment.apiUrl}/auth/register`, payload).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Your account is pending admin approval.';
        // Optional: Redirect to a success page or login page after a delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      (error) => {
        console.error('Registration failed:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        // Handle specific error messages from backend (e.g., duplicate username/email)
      }
    );
  }
}