import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserManagementService } from '../../../core/services/user-management.service';
import { UserWithRoles, Role, AssignRoleRequest, CreateUserRequest } from '../../../core/models/auth.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    Select,
    MultiSelect,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagement implements OnInit, OnDestroy {
  users: UserWithRoles[] = [];
  allRoles: Role[] = [];
  loading = false;
  displayAssignRoleDialog = false;
  selectedUser: UserWithRoles | null = null;
  selectedRole: Role | null = null;

  // Create User Dialog
  displayCreateUserDialog = false;
  newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    roleIds: []
  };
  selectedRolesForNewUser: Role[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all users
   */
  loadUsers(): void {
    this.loading = true;
    this.userManagementService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Load all available roles
   */
  loadRoles(): void {
    this.userManagementService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.allRoles = roles;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load roles'
          });
        }
      });
  }

  /**
   * Open assign role dialog
   */
  openAssignRoleDialog(user: UserWithRoles): void {
    this.selectedUser = user;
    this.selectedRole = null;
    this.displayAssignRoleDialog = true;
  }

  /**
   * Assign role to user
   */
  assignRole(): void {
    if (!this.selectedUser || !this.selectedRole) {
      return;
    }

    const request: AssignRoleRequest = {
      roleId: this.selectedRole.id
    };

    this.userManagementService.assignRole(this.selectedUser.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Role '${this.selectedRole!.name}' assigned to ${this.selectedUser!.username}`
          });
          this.displayAssignRoleDialog = false;
          this.loadUsers(); // Reload to get updated roles
        },
        error: (error) => {
          console.error('Error assigning role:', error);
          const errorMessage = error.error?.message || 'Failed to assign role';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
        }
      });
  }

  /**
   * Remove role from user
   */
  removeRole(user: UserWithRoles, role: Role): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove the '${role.name}' role from ${user.username}?`,
      header: 'Confirm Remove Role',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userManagementService.removeRole(user.id, role.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Role '${role.name}' removed from ${user.username}`
              });
              this.loadUsers(); // Reload to get updated roles
            },
            error: (error) => {
              console.error('Error removing role:', error);
              const errorMessage = error.error?.message || 'Failed to remove role';
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
              });
            }
          });
      }
    });
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(user: UserWithRoles): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const actionText = user.isActive ? 'Deactivate' : 'Activate';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} ${user.username}?`,
      header: `Confirm ${actionText}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const operation = user.isActive
          ? this.userManagementService.deactivateUser(user.id)
          : this.userManagementService.activateUser(user.id);

        operation.pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `User ${user.username} ${action}d successfully`
              });
              this.loadUsers(); // Reload to get updated status
            },
            error: (error) => {
              console.error(`Error ${action}ing user:`, error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to ${action} user`
              });
            }
          });
      }
    });
  }

  /**
   * Get severity for role tag
   */
  getRoleSeverity(roleName: string): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    switch (roleName) {
      case 'Admin':
        return 'danger';
      case 'Manager':
        return 'warn';
      case 'Customer':
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Get available roles for user (roles they don't have yet)
   */
  getAvailableRoles(user: UserWithRoles): Role[] {
    const userRoleIds = user.roles.map(r => r.id);
    return this.allRoles.filter(role => !userRoleIds.includes(role.id));
  }

  /**
   * Open create user dialog
   */
  openCreateUserDialog(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      roleIds: []
    };
    this.selectedRolesForNewUser = [];
    this.displayCreateUserDialog = true;
  }

  /**
   * Create new user
   */
  createUser(): void {
    // Validate form
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (this.selectedRolesForNewUser.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select at least one role'
      });
      return;
    }

    // Map selected roles to role IDs
    this.newUser.roleIds = this.selectedRolesForNewUser.map(role => role.id);

    // Call API
    this.userManagementService.createUser(this.newUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdUser) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `User '${createdUser.username}' created successfully`
          });
          this.displayCreateUserDialog = false;
          this.loadUsers(); // Reload users list
        },
        error: (error) => {
          console.error('Error creating user:', error);
          const errorMessage = error.error?.message || error.error?.errors
            ? Object.values(error.error.errors).flat().join(', ')
            : 'Failed to create user';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
        }
      });
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
