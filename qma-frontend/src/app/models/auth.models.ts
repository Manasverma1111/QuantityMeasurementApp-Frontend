// ── Matches Spring Boot AuthResponse.java ────────────────────────────────────
// public record AuthResponse(String token, String email, String name) {}
export interface AuthResponse {
  token: string;   // ← "token", NOT "accessToken"
  email: string;
  name: string;
}

// ── Matches LoginRequest.java ────────────────────────────────────────────────
// private String email; private String password;
export interface LoginRequest {
  email: string;
  password: string;
}

// ── Matches RegisterRequest.java ─────────────────────────────────────────────
// private String name; private String email; private String password;
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// ── Local user object (built from AuthResponse, stored in localStorage) ──────
export interface User {
  email: string;
  name: string;
  provider: 'local' | 'google';
}

// ── Standard JWT payload fields ───────────────────────────────────────────────
export interface JwtPayload {
  sub: string;   // usually the user email in Spring Security
  iat: number;
  exp: number;
  [key: string]: any;
}