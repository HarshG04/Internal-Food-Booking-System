export interface User {
  id: number;
  name: string;
  email: string;
  employeeId: string;
  role: 'USER' | 'VENDOR' | 'MANAGER';
  companyName?: string;
  phone?: string;
}

export interface LoginRequest {
  identifier: string; // email or employeeId
  password: string;
  role: 'USER' | 'VENDOR' | 'MANAGER';
}

export interface AuthResponse {
  user: User;
  message: string;
}
