export interface User {
  id: number;
  employeeId: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'VENDOR';
  createdAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  employeeId: number;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'VENDOR';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  sessionId: string;
  user: User;
}
