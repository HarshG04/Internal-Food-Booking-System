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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
