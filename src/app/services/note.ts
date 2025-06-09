import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Note } from '../models/note.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private apiUrl = 'http://localhost:5000/api/notes';

  constructor(private http: HttpClient) {}

  getNotes(
    page: number = 1,
    limit: number = 6
  ): Observable<{ notes: Note[]; totalPages: number }> {
    return this.http.get<{ notes: Note[]; totalPages: number }>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  addNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }

  updateNote(id: string, note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

 searchNotes(query: string, page: number = 1, limit: number = 6) {
  return this.http.get<{ notes: Note[]; totalPages: number }>(
    `${this.apiUrl}/search?query=${query}&page=${page}&limit=${limit}`
  );
}

}
