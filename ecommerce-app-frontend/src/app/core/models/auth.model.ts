// Authentication Models

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  token: string;
  message: string;
  roles: string[]; // NEW: User roles from backend
}

export interface User {
  userId: string;
  username: string;
  email: string;
  roles: string[]; // NEW: User roles
}

// Role Management Models

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface UserWithRoles {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  roles: Role[];
}

export interface AssignRoleRequest {
  roleId: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleIds: string[];
}
