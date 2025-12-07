export interface User {
  id: string; // From JWT 'sub' claim
  email: string;
  token: string;
}

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  jti: string; // JWT ID
  exp: number; // Expiration timestamp (seconds)
  iss: string; // Issuer
  aud: string; // Audience
}

// form types
export interface TodoFormData {
  name: string;
  dueDate: string; // YYYY-MM-DD format for input[type="date"]
  notes: string;
  tags: string; // Comma-separated string
  location: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}
