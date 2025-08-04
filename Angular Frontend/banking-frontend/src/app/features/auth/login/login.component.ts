import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <h2>Banking App Login</h2>
      <button (click)="login()" class="login-button">Login with Keycloak</button>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f0f2f5;
      font-family: Arial, sans-serif;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    .login-button {
      padding: 12px 25px;
      font-size: 1.1em;
      color: #fff;
      background-color: #007bff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .login-button:hover {
      background-color: #0056b3;
    }
  `]
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  login(): void {
    this.authService.login(); // Initiates the Keycloak login flow
  }
}
