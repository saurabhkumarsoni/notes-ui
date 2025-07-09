import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpResponse,
} from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let authService: jest.Mocked<AuthService>;
  let mockNext: jest.MockedFunction<HttpHandlerFn>;

  beforeEach(() => {
    const authServiceSpy = {
      getAccessToken: jest.fn(),
      refreshToken: jest.fn(),
      setTokens: jest.fn(),
      logout: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    mockNext = jest.fn().mockReturnValue(of(new HttpResponse({ body: {} })));
  });

  afterEach(() => {
    // No cleanup needed
  });

  describe('Auth routes handling', () => {
    it('should skip token attachment for login route', () => {
      const req = new HttpRequest('POST', '/auth/login', {});

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe();
      });

      expect(mockNext).toHaveBeenCalledWith(req);
      expect(authService.getAccessToken).not.toHaveBeenCalled();
    });

    it('should skip token attachment for signup route', () => {
      const req = new HttpRequest('POST', '/auth/signup', {});

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe();
      });

      expect(mockNext).toHaveBeenCalledWith(req);
      expect(authService.getAccessToken).not.toHaveBeenCalled();
    });

    it('should skip token attachment for refresh route', () => {
      const req = new HttpRequest('POST', '/auth/refresh', {});

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe();
      });

      expect(mockNext).toHaveBeenCalledWith(req);
      expect(authService.getAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('Token attachment', () => {
    it('should attach token when available for non-auth routes', () => {
      const req = new HttpRequest('GET', '/api/notes', {});
      authService.getAccessToken.mockReturnValue('test-token');

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext);
      });

      const expectedReq = req.clone({
        setHeaders: { Authorization: 'Bearer test-token' },
      });
      expect(mockNext).toHaveBeenCalledWith(expectedReq);
    });

    it('should not attach token when not available', () => {
      const req = new HttpRequest('GET', '/api/notes', {});
      authService.getAccessToken.mockReturnValue(null);

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext);
      });

      expect(mockNext).toHaveBeenCalledWith(req);
    });
  });

  describe('Error handling', () => {
    it('should handle 401 error with token refresh', (done) => {
      const req = new HttpRequest('GET', '/api/notes', {});
      const error = new HttpErrorResponse({ status: 401 });
      const refreshResponse = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        user: {},
      };
      const successResponse = new HttpResponse({ body: {} });

      authService.getAccessToken.mockReturnValue('old-token');
      authService.refreshToken.mockReturnValue(of(refreshResponse));

      // First call returns 401 error, second call (after refresh) succeeds
      mockNext
        .mockReturnValueOnce(throwError(() => error))
        .mockReturnValueOnce(of(successResponse));

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe({
          next: () => {
            expect(authService.refreshToken).toHaveBeenCalled();
            expect(authService.setTokens).toHaveBeenCalledWith(
              'new-token',
              'new-refresh'
            );
            expect(mockNext).toHaveBeenCalledTimes(2);
            done();
          },
          error: () => done.fail('Should not error'),
        });
      });
    });

    it('should logout and redirect on refresh token failure', (done) => {
      const req = new HttpRequest('GET', '/api/notes', {});
      const error = new HttpErrorResponse({ status: 401 });
      const refreshError = new Error('Refresh failed');

      authService.getAccessToken.mockReturnValue('old-token');
      authService.refreshToken.mockReturnValue(throwError(() => refreshError));
      mockNext.mockReturnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe({
          next: () => done.fail('Should not succeed'),
          error: (err) => {
            expect(authService.logout).toHaveBeenCalled();
            expect(err).toBe(refreshError);
            done();
          },
        });
      });
    });

    it('should pass through non-401 errors', (done) => {
      const req = new HttpRequest('GET', '/api/notes', {});
      const error = new HttpErrorResponse({ status: 500 });

      authService.getAccessToken.mockReturnValue('token');
      mockNext.mockReturnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe({
          next: () => done.fail('Should not succeed'),
          error: (err) => {
            expect(err).toBe(error);
            expect(authService.refreshToken).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should not retry 401 errors on auth routes', (done) => {
      const req = new HttpRequest('POST', '/auth/login', {});
      const error = new HttpErrorResponse({ status: 401 });

      mockNext.mockReturnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe({
          next: () => done.fail('Should not succeed'),
          error: (err) => {
            expect(err).toBe(error);
            expect(authService.refreshToken).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });
  });

  describe('Successful request flow', () => {
    it('should complete successfully when no errors occur', (done) => {
      const req = new HttpRequest('GET', '/api/notes', {});
      const response = new HttpResponse({ body: { data: 'test' } });

      authService.getAccessToken.mockReturnValue('token');
      mockNext.mockReturnValue(of(response));

      TestBed.runInInjectionContext(() => {
        AuthInterceptor(req, mockNext).subscribe({
          next: (res) => {
            expect(res).toBe(response);
            done();
          },
          error: () => done.fail('Should not error'),
        });
      });
    });
  });
});
