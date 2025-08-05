import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'banking-frontend';
  constructor(private authService: AuthService) {
    console.log('App initializing');
    this.authService.init(); // Make sure this calls loadDiscoveryDocumentAndTryLogin()
  }
}