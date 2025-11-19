import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserWithRoles, Role, AssignRoleRequest, CreateUserRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly baseUrl = `${environment.authApi}`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with their roles (Admin only)
   */
  getAllUsers(): Observable<UserWithRoles[]> {
    return this.http.get<UserWithRoles[]>(`${this.baseUrl}/users`);
  }

  /**
   * Get user by ID with roles (Admin only)
   */
  getUserById(userId: string): Observable<UserWithRoles> {
    return this.http.get<UserWithRoles>(`${this.baseUrl}/users/${userId}`);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`);
  }

  /**
   * Create new user with roles (Admin only)
   */
  createUser(request: CreateUserRequest): Observable<UserWithRoles> {
    return this.http.post<UserWithRoles>(`${this.baseUrl}/users`, request);
  }

  /**
   * Get user's roles
   */
  getUserRoles(userId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/users/${userId}/roles`);
  }

  /**
   * Assign role to user (Admin only)
   */
  assignRole(userId: string, request: AssignRoleRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/roles`, request);
  }

  /**
   * Remove role from user (Admin only)
   */
  removeRole(userId: string, roleId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}/roles/${roleId}`);
  }

  /**
   * Deactivate user (Admin only)
   */
  deactivateUser(userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/deactivate`, {});
  }

  /**
   * Activate user (Admin only)
   */
  activateUser(userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/activate`, {});
  }
}
