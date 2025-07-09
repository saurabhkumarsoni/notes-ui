import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/users';

  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 30,
    gender: 'male',
    isMarried: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserById', () => {
    it('should get user by id', () => {
      service.getUserById('1').subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle different user ids', () => {
      const userId = '123';
      
      service.getUserById(userId).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update user data', () => {
      const updatedData = { firstName: 'Jane', lastName: 'Smith' };
      const updatedUser = { ...mockUser, ...updatedData };
      
      service.updateUser('1', updatedData).subscribe(user => {
        expect(user).toEqual(updatedUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(updatedUser);
    });

    it('should update user with complete data', () => {
      const completeData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        age: 25,
        gender: 'female',
        isMarried: true
      };
      
      service.updateUser('1', completeData).subscribe(user => {
        expect(user).toEqual({ ...mockUser, ...completeData });
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(completeData);
      req.flush({ ...mockUser, ...completeData });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users', () => {
      const mockUsers = [mockUser, { ...mockUser, id: '2', firstName: 'Jane' }];
      
      service.getAllUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle empty user list', () => {
      service.getAllUsers().subscribe(users => {
        expect(users).toEqual([]);
        expect(users.length).toBe(0);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', () => {
      service.deleteUser('1').subscribe(response => {
        expect(response).toEqual({ message: 'User deleted successfully' });
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'User deleted successfully' });
    });

    it('should handle different user ids for deletion', () => {
      const userId = '456';
      
      service.deleteUser(userId).subscribe(response => {
        expect(response).toEqual({});
      });

      const req = httpMock.expectOne(`${baseUrl}/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('uploadProfileImage', () => {
    it('should upload profile image', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { imageUrl: 'http://example.com/profile.jpg' };
      
      service.uploadProfileImage('1', mockFile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/1/upload`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeInstanceOf(FormData);
      
      // Verify FormData contains the file
      const formData = req.request.body as FormData;
      expect(formData.get('file')).toBe(mockFile);
      
      req.flush(mockResponse);
    });

    it('should upload profile image for different user', () => {
      const mockFile = new File(['test2'], 'avatar.png', { type: 'image/png' });
      const userId = '789';
      const mockResponse = { imageUrl: 'http://example.com/avatar.png' };
      
      service.uploadProfileImage(userId, mockFile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${userId}/upload`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeInstanceOf(FormData);
      
      const formData = req.request.body as FormData;
      expect(formData.get('file')).toBe(mockFile);
      
      req.flush(mockResponse);
    });
  });
});
