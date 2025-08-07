// src/app/features/notifications/notification-list/notification-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationResponse, NotificationStatus } from '../../../shared/models/notification.model';

declare var bootstrap: any;

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
  notifications: NotificationResponse[] = [];
  filteredNotifications: NotificationResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedNotification: NotificationResponse | null = null;

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedType: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserNotifications();
  }

  loadUserNotifications(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userId = this.authService.getIdentityClaims()?.sub;

    if (userId) {
      this.notificationService.getNotificationsByUserId(userId).subscribe({
        next: (data) => {
          this.notifications = data || [];
          this.filterNotifications();
          this.loading = false;

          if (this.notifications.length === 0) {
            this.successMessage = 'You have no notifications yet.';
          }
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.errorMessage = error.error?.message || 'Failed to load notifications. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Authentication required. Please log in again.';
      this.loading = false;
    }
  }

  filterNotifications(): void {
    let filtered = this.notifications;

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.content.toLowerCase().includes(searchLower) ||
        notification.type.toLowerCase().includes(searchLower) ||
        notification.notificationId.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(notification =>
        notification.status === this.selectedStatus
      );
    }

    // Apply type filter
    if (this.selectedType) {
      filtered = filtered.filter(notification =>
        notification.type === this.selectedType
      );
    }

    this.filteredNotifications = filtered;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.currentPage = 1;
    this.filterNotifications();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredNotifications = this.filteredNotifications.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterNotifications();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, this.currentPage - halfRange);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  viewNotificationDetails(notification: NotificationResponse): void {
    this.selectedNotification = notification;
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
  }


  getNotificationStatusClass(status: NotificationStatus): string {
    const statusClasses = {
      'SENT': 'bg-success text-white',
      'PENDING': 'bg-warning text-dark',
      'FAILED': 'bg-danger text-white'
    };
    return statusClasses[status] || 'bg-secondary text-white';
  }

  getNotificationStatusIcon(status: NotificationStatus): string {
    const statusIcons = {
      'SENT': 'bi bi-check-circle-fill',
      'PENDING': 'bi bi-clock-fill',
      'FAILED': 'bi bi-x-circle-fill'
    };
    return statusIcons[status] || 'bi bi-question-circle-fill';
  }

  getNotificationTypeClass(type: string) {
    const typeClasses = {
      'TRANSACTION': 'bg-primary text-white',
      'SECURITY': 'bg-danger text-white',
      'ACCOUNT': 'bg-info text-white',
      'SYSTEM': 'bg-secondary text-white'
    };
    'bg-light text-dark';
  }

  getNotificationTypeIcon(type: string) {
    const typeIcons = {
      'TRANSACTION': 'bi bi-credit-card-fill',
      'SECURITY': 'bi bi-shield-fill-exclamation',
      'ACCOUNT': 'bi bi-person-fill',
      'SYSTEM': 'bi bi-gear-fill'
    };
    'bi bi-bell-fill';
  }

  trackByNotificationId(index: number, notification: NotificationResponse): string {
    return notification.notificationId;
  }
}