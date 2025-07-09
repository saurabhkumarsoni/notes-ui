import { TestBed } from '@angular/core/testing';
import { UserStoreService } from './user-store.service';

describe('UserStoreService', () => {
  let service: UserStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserStoreService],
    });
    service = TestBed.inject(UserStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null profile image', () => {
    expect(service.profileImage()).toBeNull();
  });

  describe('setProfileImage', () => {
    it('should set profile image URL', () => {
      const testUrl = 'https://example.com/profile.jpg';
      
      service.setProfileImage(testUrl);
      
      expect(service.profileImage()).toBe(testUrl);
    });

    it('should update profile image URL when called multiple times', () => {
      const firstUrl = 'https://example.com/profile1.jpg';
      const secondUrl = 'https://example.com/profile2.jpg';
      
      service.setProfileImage(firstUrl);
      expect(service.profileImage()).toBe(firstUrl);
      
      service.setProfileImage(secondUrl);
      expect(service.profileImage()).toBe(secondUrl);
    });
  });

  describe('clear', () => {
    it('should clear profile image', () => {
      const testUrl = 'https://example.com/profile.jpg';
      
      // Set an image first
      service.setProfileImage(testUrl);
      expect(service.profileImage()).toBe(testUrl);
      
      // Clear the image
      service.clear();
      expect(service.profileImage()).toBeNull();
    });

    it('should clear profile image when already null', () => {
      // Ensure it starts as null
      expect(service.profileImage()).toBeNull();
      
      // Clear when already null
      service.clear();
      expect(service.profileImage()).toBeNull();
    });
  });

  describe('integration tests', () => {
    it('should handle multiple set and clear operations', () => {
      const url1 = 'https://example.com/profile1.jpg';
      const url2 = 'https://example.com/profile2.jpg';
      
      // Initial state
      expect(service.profileImage()).toBeNull();
      
      // Set first image
      service.setProfileImage(url1);
      expect(service.profileImage()).toBe(url1);
      
      // Clear
      service.clear();
      expect(service.profileImage()).toBeNull();
      
      // Set second image
      service.setProfileImage(url2);
      expect(service.profileImage()).toBe(url2);
      
      // Clear again
      service.clear();
      expect(service.profileImage()).toBeNull();
    });
  });
});
