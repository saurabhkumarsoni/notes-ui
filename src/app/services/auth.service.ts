import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<any>;
  user$: Observable<any>;
  private isBrowser = typeof window !== 'undefined';
  private baseUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {
    const user = this.isBrowser ? this.getUserFromStorage() : null;
    this.userSubject = new BehaviorSubject<any>(user);
    this.user$ = this.userSubject.asObservable();
  }

  register(data: { email: string; password: string }) {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.baseUrl}/signup`,
      data
    );
  }

  login(data: { email: string; password: string }) {
    return this.http.post<{
      accessToken: string;
      refreshToken: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    }>(`${this.baseUrl}/login`, data);
  }

  refreshToken(): Observable<{
    accessToken: string;
    refreshToken: string;
    user: object;
  }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{
      accessToken: string;
      refreshToken: string;
      user: object;
    }>(
      `${this.baseUrl}/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refreshToken') : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getProfile() {
    return this.http.get<{
      firstName: string;
      lastName: string;
      email: string;
    }>(`${this.baseUrl}/profile`);
  }

  private getUserFromStorage(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user: any): void {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  getUser(): any {
    return this.userSubject.value;
  }

  clearTokens(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    this.userSubject.next(null);
  }

  logout(): void {
    this.clearTokens();
    localStorage.clear();
  }
}
