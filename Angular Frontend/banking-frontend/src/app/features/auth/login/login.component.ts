import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Initiates the Keycloak login flow
   */
  login(): void {
    // Add loading state or animation here if needed
    this.authService.login();
  }

  /**
   * Navigate to registration page
   */
  register(): void {
    // Navigate to registration page
    this.router.navigate(['/register']);

    // Or if registration is handled by Keycloak:
    // window.open('your-keycloak-registration-url', '_blank');
  }

  /**
   * Show help or support options
   */
  getHelp(): void {
    // Navigate to help page or open support modal
    this.router.navigate(['/help']);

    // Or open external help link:
    // window.open('https://your-bank-help.com', '_blank');
  }

  /**
   * Show demo or product tour
   */
  viewDemo(): void {
    // Navigate to demo page or start interactive tour
    this.router.navigate(['/demo']);

    // Or open demo in new tab:
    // window.open('https://your-bank-demo.com', '_blank');
  }
}