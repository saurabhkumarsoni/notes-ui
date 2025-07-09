import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageSpy: jest.Mocked<Storage>;

  const baseUrl = 'http://localhost:3000/auth';
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    // Create localStorage spy
    localStorageSpy = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };

    // Mock localStorage on window
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize user from localStorage when in browser', () => {
      const storedUser = JSON.stringify(mockUser);
      localStorageSpy.getItem.mockReturnValue(storedUser);

      // Create a new service instance to test constructor behavior
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(httpClient);
      expect(newService.getUser()).toEqual(mockUser);
    });

    it('should initialize with null user when no stored user', () => {
      localStorageSpy.getItem.mockReturnValue(null);

      const newService = TestBed.inject(AuthService);
      expect(newService.getUser()).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      service.register(registerData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should login user and return tokens and user data', () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };

      service.login(loginData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token using stored refresh token', () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: mockUser,
      };

      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        'stored-refresh-token'
      );

      service.refreshToken().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer stored-refresh-token'
      );
      req.flush(mockResponse);
    });
  });

  describe('token management', () => {
    it('should set tokens in localStorage when in browser', () => {
      service.setTokens('access-token', 'refresh-token');

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access-token'
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token'
      );
    });

    it('should get access token from localStorage', () => {
      localStorageSpy.getItem.mockReturnValue('stored-access-token');

      const token = service.getAccessToken();

      expect(localStorageSpy.getItem).toHaveBeenCalledWith('accessToken');
      expect(token).toBe('stored-access-token');
    });

    it('should return null for access token when not stored', () => {
      localStorageSpy.getItem.mockReturnValue(null);

      const token = service.getAccessToken();

      expect(token).toBeNull();
    });

    it('should get refresh token from localStorage', () => {
      localStorageSpy.getItem.mockReturnValue('stored-refresh-token');

      const token = service.getRefreshToken();

      expect(localStorageSpy.getItem).toHaveBeenCalledWith('refreshToken');
      expect(token).toBe('stored-refresh-token');
    });

    it('should return null for refresh token when not stored', () => {
      localStorageSpy.getItem.mockReturnValue(null);

      const token = service.getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when access token exists', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        'access-token'
      );

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when access token does not exist', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', () => {
      service.getProfile().subscribe((profile) => {
        expect(profile).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('user management', () => {
    it('should set user in localStorage and update subject', () => {
      service.setUser(mockUser);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser)
      );
      expect(service.getUser()).toEqual(mockUser);
    });

    it('should get current user from subject', () => {
      service.setUser(mockUser);

      expect(service.getUser()).toEqual(mockUser);
    });
  });

  describe('clearTokens', () => {
    it('should clear tokens and user from localStorage', () => {
      service.clearTokens();

      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('user');
      expect(service.getUser()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear tokens and localStorage', () => {
      service.logout();

      expect(window.localStorage.removeItem).toHaveBeenCalledWith(
        'accessToken'
      );
      expect(window.localStorage.removeItem).toHaveBeenCalledWith(
        'refreshToken'
      );
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(window.localStorage.clear).toHaveBeenCalled();
      expect(service.getUser()).toBeNull();
    });
  });

  describe('user$ observable', () => {
    it('should emit user changes', (done) => {
      service.user$.subscribe((user) => {
        if (user === mockUser) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.setUser(mockUser);
    });
  });
});
