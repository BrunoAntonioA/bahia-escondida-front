export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  clientId: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
