import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Sign in to your banking account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" required>
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" 
                    class="full-width login-button" 
                    [disabled]="loginForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Sign In</span>
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-actions align="center">
          <p>Don't have an account? 
            <a routerLink="/register" class="register-link">Sign up here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .login-button {
      height: 48px;
      margin-top: 16px;
      font-size: 16px;
    }
    
    .register-link {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }
    
    .register-link:hover {
      text-decoration: underline;
    }
    
    mat-card-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    mat-card-title {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }
    
    mat-card-subtitle {
      font-size: 16px;
      color: #666;
      margin-top: 8px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simulate login for demo purposes
      // In real implementation, this would call Keycloak
      setTimeout(() => {
        const mockToken = this.generateMockJWT();
        this.authService.setToken(mockToken);
        this.isLoading = false;
        this.toastr.success('Login successful!', 'Welcome');
        this.router.navigate(['/dashboard']);
      }, 1000);
    }
  }

  private generateMockJWT(): string {
    // This is a mock JWT for demo purposes
    // In real implementation, you'd get this from Keycloak
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'user123',
      username: this.loginForm.value.username,
      realm_access: { roles: ['CUSTOMER'] },
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = 'mock-signature';
    
    return `${header}.${payload}.${signature}`;
  }
}