import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isBrowser = typeof window !== 'undefined';
  private baseUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  register(data: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/register`, data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, data);
  }

  storeToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearToken() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
  }
}
