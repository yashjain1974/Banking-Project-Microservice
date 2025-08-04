import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <mat-nav-list class="nav-list">
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>
      
      <a mat-list-item routerLink="/accounts" routerLinkActive="active">
        <mat-icon matListItemIcon>account_balance</mat-icon>
        <span matListItemTitle>Accounts</span>
      </a>
      
      <a mat-list-item routerLink="/transactions" routerLinkActive="active">
        <mat-icon matListItemIcon>swap_horiz</mat-icon>
        <span matListItemTitle>Transactions</span>
      </a>
      
      <a mat-list-item routerLink="/cards" routerLinkActive="active">
        <mat-icon matListItemIcon>credit_card</mat-icon>
        <span matListItemTitle>Credit Cards</span>
      </a>
      
      <a mat-list-item routerLink="/loans" routerLinkActive="active">
        <mat-icon matListItemIcon>home</mat-icon>
        <span matListItemTitle>Loans</span>
      </a>
      
      <mat-divider></mat-divider>
      
      <a mat-list-item routerLink="/notifications" routerLinkActive="active">
        <mat-icon matListItemIcon>notifications</mat-icon>
        <span matListItemTitle>Notifications</span>
      </a>
      
      <a mat-list-item routerLink="/profile" routerLinkActive="active">
        <mat-icon matListItemIcon>person</mat-icon>
        <span matListItemTitle>Profile</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .nav-list {
      padding-top: 16px;
    }
    
    .mat-mdc-list-item.active {
      background-color: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }
    
    .mat-mdc-list-item.active .mat-icon {
      color: #3f51b5;
    }
    
    .mat-mdc-list-item {
      margin-bottom: 4px;
      border-radius: 8px;
      margin-left: 8px;
      margin-right: 8px;
    }
    
    .mat-mdc-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class SidenavComponent {
  constructor(public authService: AuthService) {}
}