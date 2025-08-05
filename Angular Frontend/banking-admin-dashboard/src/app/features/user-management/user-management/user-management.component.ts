// banking-admin-dashboard/src/app/features/user-management/user-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor
import { FormsModule } from '@angular/forms'; // For ngModel in edit form
import { UserProfileService, UserProfile, UserProfileUpdateRequest } from '../user-profile/user-profile.service'; // Import service and interfaces
import { KycStatus, UserRole } from '../../../shared/models/user.model';
 // Import shared enums

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule], // Include FormsModule
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  allUsers: UserProfile[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectedUser: UserProfile | null = null; // For editing
  editForm: UserProfileUpdateRequest = {}; // Model for edit form
  userRoles = Object.values(UserRole); // For dropdown
  kycStatuses = Object.values(KycStatus); // For dropdown

  constructor(private userProfileService: UserProfileService) { }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.selectedUser = null; // Clear any selected user

    this.userProfileService.getAllUserProfiles().subscribe(
      (users) => {
        this.allUsers = users;
        this.loading = false;
        if (this.allUsers.length === 0) {
          this.successMessage = 'No user profiles found in the system.';
        }
      },
      (error) => {
        console.error('Error loading all users:', error);
        this.errorMessage = error.error?.message || 'Failed to load user profiles.';
        this.loading = false;
      }
    );
  }

  editUser(user: UserProfile): void {
    this.selectedUser = { ...user }; // Create a copy for editing
    // Initialize editForm with current user data
    this.editForm = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth, // Pass as string (YYYY-MM-DD)
      address: user.address,
      phoneNumber: user.phoneNumber,
      role: user.role,
      kycStatus: user.kycStatus
    };
    this.errorMessage = null;
    this.successMessage = null;
  }

  saveUserChanges(): void {
    if (!this.selectedUser) return;

    this.errorMessage = null;
    this.successMessage = null;

    this.userProfileService.updateUserProfile(this.selectedUser.userId, this.editForm).subscribe(
      (updatedUser) => {
        this.successMessage = `User ${updatedUser.username}'s profile updated successfully.`;
        this.loadAllUsers(); // Reload all users to reflect changes
        this.selectedUser = null; // Exit edit mode
      },
      (error) => {
        console.error('Error saving user changes:', error);
        this.errorMessage = error.error?.message || 'Failed to save user changes.';
      }
    );
  }

  cancelEdit(): void {
    this.selectedUser = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  deleteUser(userId: string, username: string): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (confirm(`Are you sure you want to DELETE user ${username} (${userId})? This action cannot be undone.`)) {
      this.userProfileService.deleteUserProfile(userId).subscribe(
        () => {
          this.successMessage = `User ${username} deleted successfully.`;
          this.loadAllUsers(); // Reload list after deletion
        },
        (error) => {
          console.error(`Error deleting user ${username}:`, error);
          this.errorMessage = error.error?.message || `Failed to delete user ${username}.`;
        }
      );
    }
  }
}