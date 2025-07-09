import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { CategoryService, Category } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/categories';

  const mockCategory: Category = {
    id: 1,
    name: 'Work'
  };

  const mockCategories: Category[] = [
    { id: 1, name: 'Work' },
    { id: 2, name: 'Personal' },
    { id: 3, name: 'Study' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CategoryService],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should get all categories', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        expect(categories.length).toBe(3);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });

    it('should handle empty categories list', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual([]);
        expect(categories.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single category', () => {
      const singleCategory = [mockCategory];
      
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual(singleCategory);
        expect(categories.length).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(singleCategory);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', () => {
      const categoryName = 'New Category';
      const expectedCategory = { id: 4, name: categoryName };
      
      service.createCategory(categoryName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: categoryName });
      req.flush(expectedCategory);
    });

    it('should create category with special characters', () => {
      const categoryName = 'Work & Personal';
      const expectedCategory = { id: 5, name: categoryName };
      
      service.createCategory(categoryName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: categoryName });
      req.flush(expectedCategory);
    });

    it('should create category with empty name', () => {
      const categoryName = '';
      const expectedCategory = { id: 6, name: categoryName };
      
      service.createCategory(categoryName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: categoryName });
      req.flush(expectedCategory);
    });

    it('should create category with long name', () => {
      const categoryName = 'A'.repeat(100);
      const expectedCategory = { id: 7, name: categoryName };
      
      service.createCategory(categoryName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: categoryName });
      req.flush(expectedCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', () => {
      const categoryId = 1;
      const newName = 'Updated Work';
      const expectedCategory = { id: categoryId, name: newName };
      
      service.updateCategory(categoryId, newName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedCategory);
    });

    it('should update category with different id types', () => {
      const categoryId = 999;
      const newName = 'High Priority';
      const expectedCategory = { id: categoryId, name: newName };
      
      service.updateCategory(categoryId, newName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedCategory);
    });

    it('should update category with special characters in name', () => {
      const categoryId = 2;
      const newName = 'Work/Personal & Study';
      const expectedCategory = { id: categoryId, name: newName };
      
      service.updateCategory(categoryId, newName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedCategory);
    });

    it('should update category with zero id', () => {
      const categoryId = 0;
      const newName = 'Zero Category';
      const expectedCategory = { id: categoryId, name: newName };
      
      service.updateCategory(categoryId, newName).subscribe(category => {
        expect(category).toEqual(expectedCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(expectedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', () => {
      const categoryId = 1;
      
      service.deleteCategory(categoryId).subscribe(response => {
        expect(response).toEqual({});
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should delete category with success message', () => {
      const categoryId = 2;
      const successResponse = { message: 'Category deleted successfully' };
      
      service.deleteCategory(categoryId).subscribe(response => {
        expect(response).toEqual(successResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(successResponse);
    });

    it('should delete category with different id types', () => {
      const categoryId = 999;
      
      service.deleteCategory(categoryId).subscribe(response => {
        expect(response).toEqual({ deleted: true });
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ deleted: true });
    });

    it('should delete category with zero id', () => {
      const categoryId = 0;
      
      service.deleteCategory(categoryId).subscribe(response => {
        expect(response).toEqual({ status: 'deleted' });
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'deleted' });
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors for getCategories', () => {
      service.getCategories().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle HTTP errors for createCategory', () => {
      service.createCategory('Test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle HTTP errors for updateCategory', () => {
      service.updateCategory(1, 'Test').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP errors for deleteCategory', () => {
      service.deleteCategory(1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
