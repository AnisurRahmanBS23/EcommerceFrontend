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
}

export interface User {
  userId: string;
  username: string;
  email: string;
}
