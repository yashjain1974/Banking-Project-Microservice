import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    SidenavComponent,
    HeaderComponent
  ],
  template: `
    <div class="app-container" *ngIf="!isAuthPage">
      <app-header (menuToggle)="sidenav.toggle()"></app-header>
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <app-sidenav></app-sidenav>
        </mat-sidenav>
        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
    
    <div class="auth-container" *ngIf="isAuthPage">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .sidenav-container {
      flex: 1;
    }
    
    .sidenav {
      width: 250px;
      background: #f8f9fa;
      border-right: 1px solid #e0e0e0;
    }
    
    .main-content {
      padding: 24px;
      background: #fafafa;
      min-height: calc(100vh - 64px);
    }
    
    .auth-container {
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Banking App';
  isAuthPage = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAuthPage = event.url.includes('/login') || event.url.includes('/register');
      });
  }
}