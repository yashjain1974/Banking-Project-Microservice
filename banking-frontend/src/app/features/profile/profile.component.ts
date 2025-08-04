import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../core/services/auth.service';
import { User, UserRole, KycStatus } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-container">
      <h1>My Profile</h1>
      
      <div class="profile-grid">
        <mat-card class="profile-overview-card">
          <mat-card-content>
            <div class="profile-header">
              <div class="avatar">
                <mat-icon>person</mat-icon>
              </div>
              <div class="user-info">
                <h2>{{currentUser?.firstName}} {{currentUser?.lastName}}</h2>
                <p>{{currentUser?.email}}</p>
                <div class="user-badges">
                  <mat-chip [class]="getRoleClass(currentUser?.role)">
                    {{currentUser?.role}}
                  </mat-chip>
                  <mat-chip [class]="getKycClass(currentUser?.kycStatus)">
                    KYC: {{currentUser?.kycStatus}}
                  </mat-chip>
                </div>
              </div>
            </div>
            
            <div class="profile-stats">
              <div class="stat-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <span class="label">Member Since</span>
                  <span class="value">{{currentUser?.createdAt | date:'mediumDate'}}</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>phone</mat-icon>
                <div>
                  <span class="label">Phone</span>
                  <span class="value">{{currentUser?.phoneNumber}}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="profile-edit-card">
          <mat-card-header>
            <mat-card-title>Edit Profile</mat-card-title>
            <mat-card-subtitle>Update your personal information</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" required>
                  <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" required>
                  <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
                <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" required>
                <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date of Birth</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" required>
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="profileForm.get('dateOfBirth')?.hasError('required')">
                  Date of birth is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <textarea matInput formControlName="address" rows="3" required></textarea>
                <mat-error *ngIf="profileForm.get('address')?.hasError('required')">
                  Address is required
                </mat-error>
              </mat-form-field>
              
              <div class="form-actions">
                <button mat-button type="button" (click)="resetForm()">
                  Reset
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="profileForm.invalid || isLoading">
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <span *ngIf="!isLoading">Update Profile</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .profile-container h1 {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 32px;
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .profile-overview-card,
    .profile-edit-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .profile-header {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    
    .user-info h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .user-info p {
      margin: 8px 0;
      color: #666;
      font-size: 16px;
    }
    
    .user-badges {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    
    .profile-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .stat-item mat-icon {
      color: #666;
    }
    
    .stat-item .label {
      display: block;
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .stat-item .value {
      display: block;
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
    
    .role-customer {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .role-admin {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }
    
    .kyc-verified {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .kyc-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    
    .kyc-rejected {
      background-color: #ffebee;
      color: #c62828;
    }
    
    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.populateForm(user);
      }
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: new Date(user.dateOfBirth),
      address: user.address
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      
      const updateData = {
        ...this.profileForm.value,
        dateOfBirth: this.profileForm.value.dateOfBirth.toISOString().split('T')[0]
      };

      // In a real app, you'd call a user update service
      setTimeout(() => {
        this.isLoading = false;
        this.toastr.success('Profile updated successfully!', 'Success');
      }, 1000);
    }
  }

  resetForm(): void {
    if (this.currentUser) {
      this.populateForm(this.currentUser);
    }
  }

  getRoleClass(role?: UserRole): string {
    return role ? `role-${role.toLowerCase()}` : '';
  }

  getKycClass(kycStatus?: KycStatus): string {
    return kycStatus ? `kyc-${kycStatus.toLowerCase()}` : '';
  }
}