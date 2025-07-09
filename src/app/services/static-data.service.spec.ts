import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { StaticDataService } from './static-data.service';

describe('StaticDataService', () => {
  let service: StaticDataService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/static';

  const mockPositions = ['Developer', 'Manager', 'Designer', 'Analyst'];
  const mockDepartments = ['IT', 'HR', 'Finance', 'Marketing'];
  const mockDegrees = [
    { name: 'Bachelor of Science' },
    { name: 'Master of Science' },
    { name: 'PhD' }
  ];
  const mockUniversities = [
    { name: 'MIT' },
    { name: 'Stanford University' },
    { name: 'Harvard University' }
  ];
  const mockManagers = [
    { id: 1, name: 'John Doe', department: 'IT' },
    { id: 2, name: 'Jane Smith', department: 'HR' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), StaticDataService],
    });
    service = TestBed.inject(StaticDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPositions', () => {
    it('should get all positions', () => {
      service.getPositions().subscribe(positions => {
        expect(positions).toEqual(mockPositions);
        expect(positions.length).toBe(4);
      });

      const req = httpMock.expectOne(`${baseUrl}/positions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPositions);
    });

    it('should handle empty positions list', () => {
      service.getPositions().subscribe(positions => {
        expect(positions).toEqual([]);
        expect(positions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/positions`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single position', () => {
      const singlePosition = ['CEO'];
      
      service.getPositions().subscribe(positions => {
        expect(positions).toEqual(singlePosition);
        expect(positions.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/positions`);
      expect(req.request.method).toBe('GET');
      req.flush(singlePosition);
    });

    it('should handle positions with special characters', () => {
      const specialPositions = ['Senior Developer', 'VP of Engineering', 'C++ Developer'];
      
      service.getPositions().subscribe(positions => {
        expect(positions).toEqual(specialPositions);
      });

      const req = httpMock.expectOne(`${baseUrl}/positions`);
      expect(req.request.method).toBe('GET');
      req.flush(specialPositions);
    });
  });

  describe('getDepartments', () => {
    it('should get all departments', () => {
      service.getDepartments().subscribe(departments => {
        expect(departments).toEqual(mockDepartments);
        expect(departments.length).toBe(4);
      });

      const req = httpMock.expectOne(`${baseUrl}/departments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDepartments);
    });

    it('should handle empty departments list', () => {
      service.getDepartments().subscribe(departments => {
        expect(departments).toEqual([]);
        expect(departments.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/departments`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single department', () => {
      const singleDepartment = ['Engineering'];
      
      service.getDepartments().subscribe(departments => {
        expect(departments).toEqual(singleDepartment);
        expect(departments.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/departments`);
      expect(req.request.method).toBe('GET');
      req.flush(singleDepartment);
    });

    it('should handle departments with special characters', () => {
      const specialDepartments = ['R&D', 'Sales & Marketing', 'Quality Assurance'];
      
      service.getDepartments().subscribe(departments => {
        expect(departments).toEqual(specialDepartments);
      });

      const req = httpMock.expectOne(`${baseUrl}/departments`);
      expect(req.request.method).toBe('GET');
      req.flush(specialDepartments);
    });
  });

  describe('getDegrees', () => {
    it('should get all degrees', () => {
      service.getDegrees().subscribe(degrees => {
        expect(degrees).toEqual(mockDegrees);
        expect(degrees.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/degrees`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDegrees);
    });

    it('should handle empty degrees list', () => {
      service.getDegrees().subscribe(degrees => {
        expect(degrees).toEqual([]);
        expect(degrees.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/degrees`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single degree', () => {
      const singleDegree = [{ name: 'Associate Degree' }];
      
      service.getDegrees().subscribe(degrees => {
        expect(degrees).toEqual(singleDegree);
        expect(degrees.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/degrees`);
      expect(req.request.method).toBe('GET');
      req.flush(singleDegree);
    });

    it('should handle degrees with complex names', () => {
      const complexDegrees = [
        { name: 'Bachelor of Science in Computer Science' },
        { name: 'Master of Business Administration (MBA)' },
        { name: 'Doctor of Philosophy in Engineering' }
      ];
      
      service.getDegrees().subscribe(degrees => {
        expect(degrees).toEqual(complexDegrees);
      });

      const req = httpMock.expectOne(`${baseUrl}/degrees`);
      expect(req.request.method).toBe('GET');
      req.flush(complexDegrees);
    });
  });

  describe('getUniversities', () => {
    it('should get all universities', () => {
      service.getUniversities().subscribe(universities => {
        expect(universities).toEqual(mockUniversities);
        expect(universities.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/universities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUniversities);
    });

    it('should handle empty universities list', () => {
      service.getUniversities().subscribe(universities => {
        expect(universities).toEqual([]);
        expect(universities.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/universities`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single university', () => {
      const singleUniversity = [{ name: 'Local Community College' }];
      
      service.getUniversities().subscribe(universities => {
        expect(universities).toEqual(singleUniversity);
        expect(universities.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/universities`);
      expect(req.request.method).toBe('GET');
      req.flush(singleUniversity);
    });

    it('should handle universities with complex names', () => {
      const complexUniversities = [
        { name: 'University of California, Berkeley' },
        { name: 'Massachusetts Institute of Technology (MIT)' },
        { name: 'École Polytechnique Fédérale de Lausanne' }
      ];
      
      service.getUniversities().subscribe(universities => {
        expect(universities).toEqual(complexUniversities);
      });

      const req = httpMock.expectOne(`${baseUrl}/universities`);
      expect(req.request.method).toBe('GET');
      req.flush(complexUniversities);
    });
  });

  describe('getManagers', () => {
    it('should get all managers', () => {
      service.getManagers().subscribe(managers => {
        expect(managers).toEqual(mockManagers);
        expect(managers.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/managers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockManagers);
    });

    it('should handle empty managers list', () => {
      service.getManagers().subscribe(managers => {
        expect(managers).toEqual([]);
        expect(managers.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/managers`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle single manager', () => {
      const singleManager = [{ id: 1, name: 'CEO', department: 'Executive' }];
      
      service.getManagers().subscribe(managers => {
        expect(managers).toEqual(singleManager);
        expect(managers.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/managers`);
      expect(req.request.method).toBe('GET');
      req.flush(singleManager);
    });

    it('should handle managers with complex data', () => {
      const complexManagers = [
        { 
          id: 1, 
          name: 'John Doe', 
          department: 'IT', 
          email: 'john@example.com',
          phone: '+1-555-0123',
          level: 'Senior'
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          department: 'HR',
          email: 'jane@example.com',
          phone: '+1-555-0124',
          level: 'Director'
        }
      ];
      
      service.getManagers().subscribe(managers => {
        expect(managers).toEqual(complexManagers);
      });

      const req = httpMock.expectOne(`${baseUrl}/managers`);
      expect(req.request.method).toBe('GET');
      req.flush(complexManagers);
    });

    it('should handle managers with minimal data', () => {
      const minimalManagers = [
        { name: 'Manager 1' },
        { name: 'Manager 2' }
      ];
      
      service.getManagers().subscribe(managers => {
        expect(managers).toEqual(minimalManagers);
      });

      const req = httpMock.expectOne(`${baseUrl}/managers`);
      expect(req.request.method).toBe('GET');
      req.flush(minimalManagers);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors for getPositions', () => {
      service.getPositions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/positions`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle HTTP errors for getDepartments', () => {
      service.getDepartments().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/departments`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP errors for getDegrees', () => {
      service.getDegrees().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/degrees`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle HTTP errors for getUniversities', () => {
      service.getUniversities().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/universities`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle HTTP errors for getManagers', () => {
      service.getManagers().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/managers`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });
});
