import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';

import { Navbar } from './navbar';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserStoreService } from '../../services/user-store.service';

// Mock services
class MockAuthService {
  getUser = jasmine.createSpy('getUser').and.returnValue({
    id: 1,
    firstName: 'John',
    email: 'john@example.com',
  });
  clearTokens = jasmine.createSpy('clearTokens');
}

class MockUserService {
  getUserById = jasmine.createSpy('getUserById').and.returnValue(
    of({
      id: 1,
      firstName: 'John',
      profileImage: 'https://example.com/profile.jpg',
    })
  );
}

class MockUserStoreService {
  profileImage = jasmine
    .createSpy('profileImage')
    .and.returnValue('https://example.com/profile.jpg');
  setProfileImage = jasmine.createSpy('setProfileImage');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let mockAuthService: MockAuthService;
  let mockUserService: MockUserService;
  let mockUserStoreService: MockUserStoreService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockUserService = new MockUserService();
    mockUserStoreService = new MockUserStoreService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: UserStoreService, useValue: mockUserStoreService },
        { provide: Router, useValue: mockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.menuOpen).toBe(false);
      expect(component.defaultAvatar).toBe(
        'https://www.gravatar.com/avatar/?d=mp'
      );
    });

    it('should set userName from user data on init', () => {
      component.ngOnInit();

      expect(mockAuthService.getUser).toHaveBeenCalled();
      expect(component.userName).toBe('John');
    });

    it('should set default userName when user has no firstName', () => {
      mockAuthService.getUser.and.returnValue({
        id: 1,
        firstName: null,
        email: 'john@example.com',
      });

      component.ngOnInit();

      expect(component.userName).toBe('User');
    });

    it('should fetch user profile image on init when user has ID', () => {
      component.ngOnInit();

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserStoreService.setProfileImage).toHaveBeenCalledWith(
        'https://example.com/profile.jpg'
      );
    });

    it('should not fetch profile image when user has no ID', () => {
      mockAuthService.getUser.and.returnValue({
        firstName: 'John',
        email: 'john@example.com',
      });

      component.ngOnInit();

      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should handle error when fetching user profile image', () => {
      mockUserService.getUserById.and.returnValue(
        throwError(() => 'Profile fetch failed')
      );
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith(
        '❌ Failed to fetch user profile image',
        'Profile fetch failed'
      );
    });
  });

  describe('Profile Image', () => {
    it('should return profile image from store', () => {
      const profileImage = component.profileImage;

      expect(mockUserStoreService.profileImage).toHaveBeenCalled();
      expect(profileImage).toBe('https://example.com/profile.jpg');
    });

    it('should return default avatar when no profile image', () => {
      mockUserStoreService.profileImage.and.returnValue(null);

      const profileImage = component.profileImage;

      expect(profileImage).toBe('https://www.gravatar.com/avatar/?d=mp');
    });

    it('should return default avatar when profile image is undefined', () => {
      mockUserStoreService.profileImage.and.returnValue(undefined);

      const profileImage = component.profileImage;

      expect(profileImage).toBe('https://www.gravatar.com/avatar/?d=mp');
    });
  });

  describe('Menu Toggle', () => {
    it('should toggle menu state', () => {
      expect(component.menuOpen).toBe(false);

      component.toggleMenu();
      expect(component.menuOpen).toBe(true);

      component.toggleMenu();
      expect(component.menuOpen).toBe(false);
    });

    it('should start with menu closed', () => {
      expect(component.menuOpen).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to profile and close menu', () => {
      component.menuOpen = true;

      component.goToProfile();

      expect(component.menuOpen).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user-profile']);
    });

    it('should close menu when navigating to profile', () => {
      component.menuOpen = true;

      component.goToProfile();

      expect(component.menuOpen).toBe(false);
    });
  });

  describe('Logout Functionality', () => {
    it('should logout and navigate to login page', () => {
      component.menuOpen = true;

      component.logout();

      expect(component.menuOpen).toBe(false);
      expect(mockAuthService.clearTokens).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should close menu when logging out', () => {
      component.menuOpen = true;

      component.logout();

      expect(component.menuOpen).toBe(false);
    });
  });

  describe('Logout Functionality - Server Platform', () => {
    let serverComponent: Navbar;
    let serverFixture: ComponentFixture<Navbar>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [Navbar],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: UserService, useValue: mockUserService },
          { provide: UserStoreService, useValue: mockUserStoreService },
          { provide: Router, useValue: mockRouter },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      serverFixture = TestBed.createComponent(Navbar);
      serverComponent = serverFixture.componentInstance;
    });

    it('should not clear tokens on server platform', () => {
      serverComponent.logout();

      expect(mockAuthService.clearTokens).not.toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('User State Management', () => {
    it('should handle null user gracefully', () => {
      mockAuthService.getUser.and.returnValue(null);

      component.ngOnInit();

      expect(component.userName).toBe('User');
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should handle user without firstName', () => {
      mockAuthService.getUser.and.returnValue({
        id: 1,
        email: 'john@example.com',
      });

      component.ngOnInit();

      expect(component.userName).toBe('User');
    });

    it('should handle user with empty firstName', () => {
      mockAuthService.getUser.and.returnValue({
        id: 1,
        firstName: '',
        email: 'john@example.com',
      });

      component.ngOnInit();

      expect(component.userName).toBe('User');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full initialization flow', () => {
      component.ngOnInit();

      // Verify user data is fetched
      expect(mockAuthService.getUser).toHaveBeenCalled();
      expect(component.userName).toBe('John');

      // Verify profile image is fetched
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserStoreService.setProfileImage).toHaveBeenCalledWith(
        'https://example.com/profile.jpg'
      );
    });

    it('should handle complete logout flow', () => {
      component.menuOpen = true;

      component.logout();

      expect(component.menuOpen).toBe(false);
      expect(mockAuthService.clearTokens).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle menu interactions correctly', () => {
      // Test menu toggle
      component.toggleMenu();
      expect(component.menuOpen).toBe(true);

      // Test profile navigation closes menu
      component.goToProfile();
      expect(component.menuOpen).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user-profile']);

      // Open menu again
      component.toggleMenu();
      expect(component.menuOpen).toBe(true);

      // Test logout closes menu
      component.logout();
      expect(component.menuOpen).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle getUserById service error gracefully', () => {
      mockUserService.getUserById.and.returnValue(
        throwError(() => ({
          error: 'User not found',
        }))
      );
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith(
        '❌ Failed to fetch user profile image',
        { error: 'User not found' }
      );
      // Component should still function normally
      expect(component.userName).toBe('John');
    });

    it('should handle network errors when fetching profile', () => {
      mockUserService.getUserById.and.returnValue(
        throwError(() => 'Network error')
      );
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith(
        '❌ Failed to fetch user profile image',
        'Network error'
      );
    });
  });
});
