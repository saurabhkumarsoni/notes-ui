import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { TagService, Tag } from './tag.service';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/tags';

  const mockTag: Tag = {
    id: 1,
    name: 'important'
  };

  const mockTags: Tag[] = [
    { id: 1, name: 'important' },
    { id: 2, name: 'urgent' },
    { id: 3, name: 'personal' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TagService],
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTags', () => {
    it('should get all tags', () => {
      service.getTags().subscribe(tags => {
        expect(tags).toEqual(mockTags);
        expect(tags.length).toBe(3);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTags);
    });

    it('should handle empty tags list', () => {
      service.getTags().subscribe(tags => {
        expect(tags).toEqual([]);
        expect(tags.length).toBe(0);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single tag', () => {
      const singleTag = [mockTag];
      
      service.getTags().subscribe(tags => {
        expect(tags).toEqual(singleTag);
        expect(tags.length).toBe(1);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(singleTag);
    });

    it('should handle large number of tags', () => {
      const manyTags = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `tag${i + 1}` }));
      
      service.getTags().subscribe(tags => {
        expect(tags).toEqual(manyTags);
        expect(tags.length).toBe(100);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(manyTags);
    });
  });

  describe('createTag', () => {
    it('should create a new tag', () => {
      const tagName = 'new-tag';
      const expectedTag = { id: 4, name: tagName };
      
      service.createTag(tagName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: tagName });
      req.flush(expectedTag);
    });

    it('should create tag with special characters', () => {
      const tagName = 'work-&-personal';
      const expectedTag = { id: 5, name: tagName };
      
      service.createTag(tagName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: tagName });
      req.flush(expectedTag);
    });

    it('should create tag with empty name', () => {
      const tagName = '';
      const expectedTag = { id: 6, name: tagName };
      
      service.createTag(tagName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: tagName });
      req.flush(expectedTag);
    });

    it('should create tag with unicode characters', () => {
      const tagName = '重要-важный-महत्वपूर्ण';
      const expectedTag = { id: 7, name: tagName };
      
      service.createTag(tagName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: tagName });
      req.flush(expectedTag);
    });

    it('should create tag with very long name', () => {
      const tagName = 'a'.repeat(255);
      const expectedTag = { id: 8, name: tagName };
      
      service.createTag(tagName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: tagName });
      req.flush(expectedTag);
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', () => {
      const tagId = 1;
      const newName = 'updated-important';
      const expectedTag = { id: tagId, name: newName };
      
      service.updateTag(tagId, newName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedTag);
    });

    it('should update tag with different id types', () => {
      const tagId = 999;
      const newName = 'high-priority';
      const expectedTag = { id: tagId, name: newName };
      
      service.updateTag(tagId, newName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedTag);
    });

    it('should update tag with special characters', () => {
      const tagId = 2;
      const newName = 'work/personal & study';
      const expectedTag = { id: tagId, name: newName };
      
      service.updateTag(tagId, newName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedTag);
    });

    it('should update tag with zero id', () => {
      const tagId = 0;
      const newName = 'zero-tag';
      const expectedTag = { id: tagId, name: newName };
      
      service.updateTag(tagId, newName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedTag);
    });

    it('should update tag with negative id', () => {
      const tagId = -1;
      const newName = 'negative-tag';
      const expectedTag = { id: tagId, name: newName };
      
      service.updateTag(tagId, newName).subscribe(tag => {
        expect(tag).toEqual(expectedTag);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedTag);
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', () => {
      const tagId = 1;
      const expectedResponse = { message: 'Tag deleted successfully' };
      
      service.deleteTag(tagId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('should delete tag with different response format', () => {
      const tagId = 2;
      const expectedResponse = { message: 'Deleted' };
      
      service.deleteTag(tagId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('should delete tag with custom message', () => {
      const tagId = 3;
      const expectedResponse = { message: 'Tag "important" has been removed' };
      
      service.deleteTag(tagId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('should delete tag with zero id', () => {
      const tagId = 0;
      const expectedResponse = { message: 'Tag with id 0 deleted' };
      
      service.deleteTag(tagId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('should delete tag with large id', () => {
      const tagId = 999999;
      const expectedResponse = { message: 'Tag deleted successfully' };
      
      service.deleteTag(tagId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${tagId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors for getTags', () => {
      service.getTags().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle HTTP errors for createTag', () => {
      service.createTag('test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle HTTP errors for updateTag', () => {
      service.updateTag(1, 'test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP errors for deleteTag', () => {
      service.deleteTag(1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
