import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StaticDataService {
  private baseUrl = 'http://localhost:3000/api/static';

  constructor(private http: HttpClient) {}

  getPositions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/positions`);
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/departments`);
  }

  getDegrees(): Observable<{ name: string }[]> {
    return this.http.get<{ name: string }[]>(`${this.baseUrl}/degrees`);
  }

  getUniversities(): Observable<{ name: string }[]> {
    return this.http.get<{ name: string }[]>(`${this.baseUrl}/universities`);
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/managers`);
  }
}
