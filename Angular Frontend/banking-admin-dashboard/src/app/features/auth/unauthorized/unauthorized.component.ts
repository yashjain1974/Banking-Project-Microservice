import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized-container">
      <h2>Access Denied</h2>
      <p>You do not have the necessary permissions to view this page.</p>
      <p>Please ensure you are logged in with an administrator account.</p>
      <button routerLink="/login" class="login-button">Go to Login</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f8d7da;
      color: #721c24;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    h2 {
      font-size: 2.5em;
      margin-bottom: 15px;
    }
    p {
      font-size: 1.2em;
      margin-bottom: 10px;
    }
    .login-button {
      padding: 10px 20px;
      font-size: 1em;
      color: #fff;
      background-color: #dc3545;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin-top: 20px;
    }
    .login-button:hover {
      background-color: #c82333;
    }
  `]
})
export class UnauthorizedComponent {

}
