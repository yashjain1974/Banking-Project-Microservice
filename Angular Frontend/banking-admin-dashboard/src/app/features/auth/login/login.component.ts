// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;
  showWelcome = true;

  constructor(private authService: AuthService) { }

  login(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.authService.login();
      this.isLoading = false;
    }, 1000);
  }

  onLogoClick(): void {
    this.showWelcome = !this.showWelcome;
  }
}