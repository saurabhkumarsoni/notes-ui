import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Note } from '../models/note.model';
import { map, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  // private apiUrl = 'http://localhost:5000/api/notes';
  private apiUrl = 'http://localhost:3000/api/notes';

  constructor(private http: HttpClient) {}
  getNotes(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: 'all' | 'archived' | 'trashed' = 'all',
    search = ''
  ) {
    const params: any = {
      page,
      limit,
      sortBy,
      order: sortOrder.toUpperCase(),
      ...(filter && { filter }),
      ...(search && { search }),
    };

    return this.http.get<{ notes: Note[]; totalPages: number }>(this.apiUrl, {
      params,
    });
  }

  searchNotes(
    search: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: 'all' | 'archived' | 'trashed' = 'all'
  ) {
    const params = {
      search,
      page,
      limit,
      sortBy,
      order: sortOrder.toUpperCase(),
      filter,
    };

    return this.http.get<{ notes: Note[]; totalPages: number }>(
      `${this.apiUrl}/search`,
      { params }
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

  // Archive a note
  archiveNote(id: string): Observable<Note> {
    return this.http.patch<Note>(`${this.apiUrl}/${id}/archive`, {});
  }

  // Move note to trash
  trashNote(id: string): Observable<Note> {
    return this.http.patch<Note>(`${this.apiUrl}/${id}/trash`, {});
  }

  // Restore a note (from archive or trash)
  restoreNote(id: string): Observable<Note> {
    return this.http.patch<Note>(`${this.apiUrl}/${id}/restore`, {});
  }

  getNoteCount(filter: 'trashed' | 'archived' | 'all'): Observable<number> {
    return this.http
      .get<{ count: number }>(`${this.apiUrl}/count?filter=${filter}`)
      .pipe(map((response) => response.count));
  }
}
