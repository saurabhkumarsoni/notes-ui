import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { AuthService } from '../../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jest.Mocked<AuthService>;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(() => {
    const authSpy = {
      getAccessToken: jest.fn(),
    };
    const routeSpy = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    routerSpy = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should allow activation when token exists', () => {
    authServiceSpy.getAccessToken.mockReturnValue('fake-token');

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect to /login when token is missing', () => {
    authServiceSpy.getAccessToken.mockReturnValue(null);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
