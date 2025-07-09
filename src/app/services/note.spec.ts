import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { NoteService } from './note';
import { Note } from '../models/note.model';

describe('NoteService', () => {
  let service: NoteService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/notes';

  const mockNote: Note = {
    id: '1',
    name: 'Test Note',
    content: 'Test content',
    tags: [{ name: 'test' }],
    categoryId: null,
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false,
    isTrashed: false,
    reminderAt: '2024-01-01T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), NoteService],
    });
    service = TestBed.inject(NoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotes', () => {
    it('should get notes with all parameters', () => {
      const mockResponse = { notes: [mockNote], totalPages: 1 };

      service
        .getNotes(1, 10, 'createdAt', 'desc', 'all', 'test')
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url === apiUrl &&
          request.params.get('page') === '1' &&
          request.params.get('limit') === '10' &&
          request.params.get('sortBy') === 'createdAt' &&
          request.params.get('order') === 'DESC' &&
          request.params.get('filter') === 'all' &&
          request.params.get('search') === 'test'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get notes without optional parameters', () => {
      const mockResponse = { notes: [mockNote], totalPages: 1 };

      service.getNotes(1, 10, 'createdAt', 'asc').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === apiUrl &&
          request.params.get('page') === '1' &&
          request.params.get('limit') === '10' &&
          request.params.get('sortBy') === 'createdAt' &&
          request.params.get('order') === 'ASC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchNotes', () => {
    it('should search notes with all parameters', () => {
      const mockResponse = { notes: [mockNote], totalPages: 1 };

      service
        .searchNotes('test', 1, 10, 'title', 'desc', 'archived')
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url === `${apiUrl}/search` &&
          request.params.get('search') === 'test' &&
          request.params.get('page') === '1' &&
          request.params.get('limit') === '10' &&
          request.params.get('sortBy') === 'title' &&
          request.params.get('order') === 'DESC' &&
          request.params.get('filter') === 'archived'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getNoteById', () => {
    it('should get note by id', () => {
      service.getNoteById('1').subscribe((note) => {
        expect(note).toEqual(mockNote);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNote);
    });
  });

  describe('addNote', () => {
    it('should add a new note', () => {
      service.addNote(mockNote).subscribe((note) => {
        expect(note).toEqual(mockNote);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockNote);
      req.flush(mockNote);
    });
  });

  describe('updateNote', () => {
    it('should update a note', () => {
      const updatedNote = { ...mockNote, name: 'Updated Title' };

      service.updateNote('1', updatedNote).subscribe((note) => {
        expect(note).toEqual(updatedNote);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedNote);
      req.flush(updatedNote);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', () => {
      service.deleteNote('1').subscribe((response) => {
        expect(response).toEqual({});
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('archiveNote', () => {
    it('should archive a note', () => {
      const archivedNote = { ...mockNote, isArchived: true };

      service.archiveNote('1').subscribe((note) => {
        expect(note).toEqual(archivedNote);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/archive`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(archivedNote);
    });
  });

  describe('trashNote', () => {
    it('should move note to trash', () => {
      const trashedNote = { ...mockNote, isTrashed: true };

      service.trashNote('1').subscribe((note) => {
        expect(note).toEqual(trashedNote);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/trash`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(trashedNote);
    });
  });

  describe('restoreNote', () => {
    it('should restore a note', () => {
      const restoredNote = { ...mockNote, isArchived: false, isTrashed: false };

      service.restoreNote('1').subscribe((note) => {
        expect(note).toEqual(restoredNote);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/restore`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(restoredNote);
    });
  });

  describe('getNoteCount', () => {
    it('should get note count for all filter', () => {
      const mockResponse = { count: 5 };

      service.getNoteCount('all').subscribe((count) => {
        expect(count).toBe(5);
      });

      const req = httpMock.expectOne(`${apiUrl}/count?filter=all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get note count for trashed filter', () => {
      const mockResponse = { count: 2 };

      service.getNoteCount('trashed').subscribe((count) => {
        expect(count).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/count?filter=trashed`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get note count for archived filter', () => {
      const mockResponse = { count: 3 };

      service.getNoteCount('archived').subscribe((count) => {
        expect(count).toBe(3);
      });

      const req = httpMock.expectOne(`${apiUrl}/count?filter=archived`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getDueReminders', () => {
    it('should get due reminders', () => {
      const mockResponse = { due: [mockNote], upcoming: [mockNote] };

      service.getDueReminders().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/reminders`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
