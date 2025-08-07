import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../features/notifications/notification.service'; // Import NotificationService
import { NotificationResponse } from '../../../shared/models/notification.model';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

    notificationCount: number = 0; // NEW: Property to hold notification count

    constructor(
        public authService: AuthService,
        private notificationService: NotificationService // Inject NotificationService
    ) { }

    ngOnInit(): void {
        if (this.authService.isLoggedIn()) {
            this.loadNotificationCount();
        }
    }

    loadNotificationCount(): void {
        const userId = this.authService.getIdentityClaims()?.sub;
        if (userId) {
            this.notificationService.getNotificationsByUserId(userId).subscribe(
                (notifications: NotificationResponse[]) => {
                    // For now, let's just count all notifications
                    this.notificationCount = notifications ? notifications.length : 0;
                },
                (error) => {
                    console.error('Error loading notification count:', error);
                    this.notificationCount = 0; // Reset count on error
                }
            );
        }
    }

    logout(): void {
        this.authService.logout();
    }
}