import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Note } from '../models/note.model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  // private apiUrl = 'http://localhost:5000/api/notes';
  private apiUrl = 'http://localhost:3000/api/notes';

  constructor(private http: HttpClient) {}

  getNotes(
    page: number = 1,
    limit: number = 6,
    sortBy: string = 'createdAt',
    order: string = 'desc'
  ): Observable<{ notes: Note[]; totalPages: number }> {
    return this.http.get<{ notes: Note[]; totalPages: number }>(
      `${this.apiUrl}?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`
    );
  }

  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  addNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }

  updateNote(id: string, note: Note): Observable<Note> {
    console.log(note);

    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: string): Observable<any> {
    console.log('delete note', id);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchNotes(
    search: string,
    page: number = 1,
    limit: number = 6,
    sortBy: string = 'createdAt',
    order: string = 'desc'
  ): Observable<{ notes: Note[]; totalPages: number }> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<{ notes: Note[]; totalPages: number }>(
      `${this.apiUrl}/search`,
      { params }
    );
  }
}
