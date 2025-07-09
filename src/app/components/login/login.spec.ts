import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../shared/alert.service';

// Mock services
class MockAuthService {
  login = jasmine.createSpy('login').and.returnValue(
    of({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 1, firstName: 'John', email: 'john@example.com' },
    })
  );
  setTokens = jasmine.createSpy('setTokens');
  setUser = jasmine.createSpy('setUser');
}

class MockAlertService {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/test-url');
  events = of(new NavigationEnd(1, '/test', '/test'));
}

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: MockAuthService;
  let mockAlertService: MockAlertService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockAlertService = new MockAlertService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            queryParams: of({}),
            params: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize login form with validators', () => {
      expect(component.loginForm).toBeDefined();
      expect(
        component.loginForm.get('email')?.hasError('required')
      ).toBeTruthy();
      expect(
        component.loginForm.get('password')?.hasError('required')
      ).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();

      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('required')).toBeFalsy();
    });

    it('should require password field', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();

      passwordControl?.setValue('password123');
      expect(passwordControl?.hasError('required')).toBeFalsy();
    });

    it('should validate email format correctly', () => {
      const emailControl = component.loginForm.get('email');

      // Invalid email formats
      emailControl?.setValue('invalid');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('invalid@');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('@invalid.com');
      expect(emailControl?.hasError('email')).toBeTruthy();

      // Valid email format
      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });
  });

  describe('Login Functionality', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with valid credentials', () => {
      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockAuthService.setTokens).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token'
      );
      expect(mockAuthService.setUser).toHaveBeenCalledWith({
        id: 1,
        firstName: 'John',
        email: 'john@example.com',
      });
      expect(mockAlertService.success).toHaveBeenCalledWith(
        'Logged in successfully ✅'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/notes']);
    });

    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Please enter valid email and password.'
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not submit with invalid email format', () => {
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: 'password123',
      });

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Please enter valid email and password.'
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login error with NestJS custom message', () => {
      const errorResponse = {
        error: {
          message: {
            message: 'Invalid credentials provided',
          },
        },
      };
      mockAuthService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Invalid credentials provided'
      );
      expect(mockAuthService.setTokens).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error with default string message', () => {
      const errorResponse = {
        error: {
          message: 'User not found',
        },
      };
      mockAuthService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith('User not found');
      expect(mockAuthService.setTokens).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error with fallback message', () => {
      const errorResponse = {};
      mockAuthService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Login failed. Please try again.'
      );
      expect(mockAuthService.setTokens).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle network error', () => {
      mockAuthService.login.and.returnValue(throwError(() => 'Network error'));

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Login failed. Please try again.'
      );
      expect(mockAuthService.setTokens).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('should mark form as touched when submitted with invalid data', () => {
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(component.loginForm.get('email')?.touched).toBeTruthy();
      expect(component.loginForm.get('password')?.touched).toBeTruthy();
    });

    it('should reset form state after successful login', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      // Form should remain as is after successful login (component doesn't reset it)
      expect(component.loginForm.get('email')?.value).toBe('test@example.com');
      expect(component.loginForm.get('password')?.value).toBe('password123');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full login flow', () => {
      // Set up valid form data
      component.loginForm.patchValue({
        email: 'user@example.com',
        password: 'securePassword',
      });

      // Submit form
      component.onSubmit();

      // Verify complete flow
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'securePassword',
      });
      expect(mockAuthService.setTokens).toHaveBeenCalled();
      expect(mockAuthService.setUser).toHaveBeenCalled();
      expect(mockAlertService.success).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/notes']);
    });

    it('should handle empty form submission gracefully', () => {
      // Leave form empty
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      // Should show validation error and not proceed
      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Please enter valid email and password.'
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
