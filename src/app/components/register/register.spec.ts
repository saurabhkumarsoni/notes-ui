import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Register } from './register';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../shared/alert.service';

// Mock services
class MockAuthService {
  register = jasmine
    .createSpy('register')
    .and.returnValue(of({ message: 'Registration successful' }));
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

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockAuthService: MockAuthService;
  let mockAlertService: MockAlertService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockAlertService = new MockAlertService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [
        Register, // Import the standalone component
        ReactiveFormsModule,
        CommonModule,
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
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

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges(); // important to trigger ngOnInit()
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      const form = component.registrationForm;
      expect(form).toBeTruthy();
      expect(form.get('gender')?.value).toBe('male');
      expect(form.get('isMarried')?.value).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate firstName', () => {
      const control = component.registrationForm.get('firstName');
      control?.setValue('');
      expect(control?.hasError('required')).toBeTrue();

      control?.setValue('John');
      expect(control?.valid).toBeTrue();
    });

    it('should validate email format', () => {
      const control = component.registrationForm.get('email');
      control?.setValue('invalid');
      expect(control?.hasError('email')).toBeTrue();

      control?.setValue('valid@example.com');
      expect(control?.valid).toBeTrue();
    });

    it('should validate password length', () => {
      const control = component.registrationForm.get('password');
      control?.setValue('123');
      expect(control?.hasError('minlength')).toBeTrue();

      control?.setValue('longEnoughPassword');
      expect(control?.valid).toBeTrue();
    });
  });

  describe('onSubmit()', () => {
    it('should show error if form is invalid', () => {
      component.registrationForm.patchValue({
        firstName: '',
        email: '',
      });
      component.onSubmit();
      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Please fill all required fields correctly.'
      );
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call register and show success', () => {
      component.registrationForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        gender: 'male',
        isMarried: true,
        email: 'john@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(mockAuthService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        gender: 'male',
        isMarried: true,
        email: 'john@example.com',
        password: 'password123',
      });
      expect(mockAlertService.success).toHaveBeenCalledWith(
        'Registration successful!'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle backend error message', () => {
      mockAuthService.register.and.returnValue(
        throwError(() => ({
          error: { message: 'Email already exists' },
        }))
      );

      component.registrationForm.patchValue({
        firstName: 'Jane',
        lastName: 'Doe',
        age: 28,
        gender: 'female',
        isMarried: false,
        email: 'jane@example.com',
        password: 'password456',
      });

      component.onSubmit();
      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Email already exists'
      );
    });

    it('should fallback to generic error message', () => {
      component.registrationForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        gender: 'male',
        isMarried: false,
        email: 'john@example.com',
        password: 'password123',
      });

      mockAuthService.register.and.returnValue(throwError(() => ({})));
      component.onSubmit();
      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Registration failed. Please try again.'
      );
    });
  });
});
