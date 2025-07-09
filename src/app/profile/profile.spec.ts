import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProfileComponent } from './profile';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';
import { StaticDataService } from '../services/static-data.service';
import { UserStoreService } from '../services/user-store.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock MatDialog to avoid dialog dependencies
const mockMatDialog = {
  open: jest.fn(),
  openDialogs: [],
  afterAllClosed: of(undefined),
  afterOpened: of(undefined),
  getDialogById: jest.fn(),
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserService: jest.Mocked<UserService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockAlertService: jest.Mocked<AlertService>;
  let mockStaticDataService: jest.Mocked<StaticDataService>;
  let mockUserStoreService: jest.Mocked<UserStoreService>;

  const mockUser = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    profileImage: 'https://example.com/profile.jpg',
    skills: ['JavaScript', 'Angular'],
    dateOfBirth: '1990-01-01',
    dateOfJoining: '2020-01-01',
    gender: 'Male',
    position: 'Developer',
    department: 'IT',
    employeeId: 'EMP001',
    reportingManager: 'Manager1',
    experience: '5',
    isMarried: false,
    linkedin: 'https://linkedin.com/in/john',
    github: 'https://github.com/john',
    address: {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      zip: '12345',
      country: 'Country',
    },
  };

  beforeEach(async () => {
    // Create comprehensive mocks
    mockUserService = {
      uploadProfileImage: jest
        .fn()
        .mockReturnValue(of({ profileImage: 'new-image-url.jpg' })),
      getUserById: jest.fn().mockReturnValue(of(mockUser)),
      updateUser: jest.fn().mockReturnValue(of({})),
    } as any;

    mockAuthService = {
      getUser: jest.fn().mockReturnValue({ id: '123' }),
    } as any;

    mockAlertService = {
      success: jest.fn(),
      error: jest.fn(),
    } as any;

    mockStaticDataService = {
      getPositions: jest.fn().mockReturnValue(of(['Developer', 'Manager'])),
      getDepartments: jest.fn().mockReturnValue(of(['IT', 'HR'])),
      getDegrees: jest
        .fn()
        .mockReturnValue(of([{ name: 'Bachelor' }, { name: 'Master' }])),
      getUniversities: jest
        .fn()
        .mockReturnValue(
          of([{ name: 'University A' }, { name: 'University B' }])
        ),
      getManagers: jest.fn().mockReturnValue(
        of([
          { id: 1, name: 'Manager1' },
          { id: 2, name: 'Manager2' },
        ])
      ),
    } as any;

    mockUserStoreService = {
      setProfileImage: jest.fn(),
      profileImage: jest.fn().mockReturnValue('stored-image-url.jpg'),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        ReactiveFormsModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: StaticDataService, useValue: mockStaticDataService },
        { provide: UserStoreService, useValue: mockUserStoreService },
        { provide: 'MatDialog', useValue: mockMatDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.defaultAvatar).toBe(
        'https://www.gravatar.com/avatar/?d=mp'
      );
      expect(component.positions).toEqual([]);
      expect(component.departments).toEqual([]);
      expect(component.degrees).toEqual([]);
      expect(component.universities).toEqual([]);
      expect(component.managers).toEqual([]);
    });

    it('should call initialization methods on ngOnInit', () => {
      const buildFormSpy = jest.spyOn(component, 'buildForm');
      const loadStaticDataSpy = jest.spyOn(component, 'loadStaticData');
      const loadUserProfileSpy = jest.spyOn(component, 'loadUserProfile');

      component.ngOnInit();

      expect(buildFormSpy).toHaveBeenCalled();
      expect(loadStaticDataSpy).toHaveBeenCalled();
      expect(loadUserProfileSpy).toHaveBeenCalled();
    });
  });

  describe('Form Building and Management', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should build form with all required controls', () => {
      expect(component.profileForm).toBeDefined();
      expect(component.profileForm.get('profileImage')).toBeTruthy();
      expect(component.profileForm.get('firstName')).toBeTruthy();
      expect(component.profileForm.get('lastName')).toBeTruthy();
      expect(component.profileForm.get('email')).toBeTruthy();
      expect(component.profileForm.get('phone')).toBeTruthy();
      expect(component.profileForm.get('dateOfBirth')).toBeTruthy();
      expect(component.profileForm.get('dateOfJoining')).toBeTruthy();
      expect(component.profileForm.get('gender')).toBeTruthy();
      expect(component.profileForm.get('position')).toBeTruthy();
      expect(component.profileForm.get('department')).toBeTruthy();
      expect(component.profileForm.get('employeeId')).toBeTruthy();
      expect(component.profileForm.get('reportingManager')).toBeTruthy();
      expect(component.profileForm.get('experience')).toBeTruthy();
      expect(component.profileForm.get('isMarried')).toBeTruthy();
      expect(component.profileForm.get('linkedin')).toBeTruthy();
      expect(component.profileForm.get('github')).toBeTruthy();
      expect(component.profileForm.get('address')).toBeTruthy();
      expect(component.profileForm.get('skills')).toBeTruthy();
    });

    it('should build nested address form group', () => {
      const addressGroup = component.profileForm.get('address');
      expect(addressGroup?.get('street')).toBeTruthy();
      expect(addressGroup?.get('city')).toBeTruthy();
      expect(addressGroup?.get('state')).toBeTruthy();
      expect(addressGroup?.get('zip')).toBeTruthy();
      expect(addressGroup?.get('country')).toBeTruthy();
    });

    it('should initialize skills as empty FormArray', () => {
      const skillsArray = component.skills;
      expect(skillsArray.length).toBe(0);
    });

    it('should get skills FormArray correctly', () => {
      const skillsArray = component.skills;
      expect(skillsArray).toBe(component.profileForm.get('skills'));
    });
  });

  describe('Skills Management', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should add skill to FormArray', () => {
      expect(component.skills.length).toBe(0);

      component.addSkill();

      expect(component.skills.length).toBe(1);
      expect(component.skills.at(0).value).toBe('');
    });

    it('should remove skill from FormArray', () => {
      component.addSkill();
      component.addSkill();
      expect(component.skills.length).toBe(2);

      component.removeSkill(0);

      expect(component.skills.length).toBe(1);
    });

    it('should set form array with items', () => {
      const testSkills = ['JavaScript', 'Angular', 'TypeScript'];
      const fb = TestBed.inject(FormBuilder) as FormBuilder;

      component.setFormArray('skills', testSkills, (skill) =>
        fb.control(skill)
      );

      expect(component.skills.length).toBe(3);
      expect(component.skills.at(0).value).toBe('JavaScript');
      expect(component.skills.at(1).value).toBe('Angular');
      expect(component.skills.at(2).value).toBe('TypeScript');
    });

    it('should clear existing items before setting new ones', () => {
      component.addSkill();
      component.addSkill();
      expect(component.skills.length).toBe(2);

      const testSkills = ['JavaScript'];
      const fb = TestBed.inject(FormBuilder) as FormBuilder;
      component.setFormArray('skills', testSkills, (skill) =>
        fb.control(skill)
      );

      expect(component.skills.length).toBe(1);
      expect(component.skills.at(0).value).toBe('JavaScript');
    });
  });

  describe('Static Data Loading', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should load all static data on loadStaticData call', () => {
      component.loadStaticData();

      expect(mockStaticDataService.getPositions).toHaveBeenCalled();
      expect(mockStaticDataService.getDepartments).toHaveBeenCalled();
      expect(mockStaticDataService.getDegrees).toHaveBeenCalled();
      expect(mockStaticDataService.getUniversities).toHaveBeenCalled();
      expect(mockStaticDataService.getManagers).toHaveBeenCalled();
    });

    it('should populate positions array', fakeAsync(() => {
      component.loadStaticData();
      tick();

      expect(component.positions).toEqual(['Developer', 'Manager']);
    }));

    it('should populate departments array', fakeAsync(() => {
      component.loadStaticData();
      tick();

      expect(component.departments).toEqual(['IT', 'HR']);
    }));

    it('should populate degrees array', fakeAsync(() => {
      component.loadStaticData();
      tick();

      expect(component.degrees).toEqual([
        { name: 'Bachelor' },
        { name: 'Master' },
      ]);
    }));

    it('should populate universities array', fakeAsync(() => {
      component.loadStaticData();
      tick();

      expect(component.universities).toEqual([
        { name: 'University A' },
        { name: 'University B' },
      ]);
    }));

    it('should populate managers array', fakeAsync(() => {
      component.loadStaticData();
      tick();

      expect(component.managers).toEqual([
        { id: 1, name: 'Manager1' },
        { id: 2, name: 'Manager2' },
      ]);
    }));
  });

  describe('User Profile Loading', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should load user profile and populate form', fakeAsync(() => {
      component.loadUserProfile();
      tick();

      expect(mockAuthService.getUser).toHaveBeenCalled();
      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
      expect(component.userImageUrl()).toBe('https://example.com/profile.jpg');
    }));

    it('should not load profile if no user ID', () => {
      mockAuthService.getUser.mockReturnValue(null);

      component.loadUserProfile();

      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should populate form with user data', fakeAsync(() => {
      component.loadUserProfile();
      tick();

      expect(component.profileForm.get('firstName')?.value).toBe('John');
      expect(component.profileForm.get('lastName')?.value).toBe('Doe');
      expect(component.profileForm.get('email')?.value).toBe(
        'john@example.com'
      );
    }));

    it('should set skills array from user data', fakeAsync(() => {
      component.loadUserProfile();
      tick();

      expect(component.skills.length).toBe(2);
      expect(component.skills.at(0).value).toBe('JavaScript');
      expect(component.skills.at(1).value).toBe('Angular');
    }));

    it('should handle empty skills array', fakeAsync(() => {
      mockUserService.getUserById.mockReturnValue(
        of({ ...mockUser, skills: undefined })
      );

      component.loadUserProfile();
      tick();

      expect(component.skills.length).toBe(0);
    }));
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should submit valid form', () => {
      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      component.onSubmit();

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        '123',
        component.profileForm.value
      );
      expect(mockAlertService.success).toHaveBeenCalledWith(
        'Profile updated successfully'
      );
    });

    it('should not submit invalid form', () => {
      // Make form invalid by setting required field to empty
      component.profileForm.setErrors({ invalid: true });

      component.onSubmit();

      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });

    it('should not submit if no user ID', () => {
      mockAuthService.getUser.mockReturnValue(null);

      component.onSubmit();

      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });

    it('should handle form submission error', () => {
      mockUserService.updateUser.mockReturnValue(
        throwError(() => new Error('Update failed'))
      );

      component.onSubmit();

      expect(mockAlertService.error).toHaveBeenCalledWith(
        'Failed to update profile'
      );
    });
  });

  describe('File Upload', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should handle file change event with valid file', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const openImageCropDialogSpy = jest.spyOn(
        component,
        'openImageCropDialog'
      );
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      } as any;

      component.onFileChange(mockEvent);

      expect(openImageCropDialogSpy).toHaveBeenCalledWith(mockFile);
    });

    it('should not call openImageCropDialog if no file selected', () => {
      const openImageCropDialogSpy = jest.spyOn(
        component,
        'openImageCropDialog'
      );
      const mockEvent = {
        target: {
          files: [],
        },
      } as any;

      component.onFileChange(mockEvent);

      expect(openImageCropDialogSpy).not.toHaveBeenCalled();
    });

    it('should handle null input target', () => {
      const openImageCropDialogSpy = jest.spyOn(
        component,
        'openImageCropDialog'
      );
      const mockEvent = {
        target: null,
      } as any;

      component.onFileChange(mockEvent);

      expect(openImageCropDialogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Signals and Computed Properties', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should initialize signals with correct default values', () => {
      expect(component.croppedImage()).toBeNull();
      expect(component.userImageUrl()).toBeNull();
    });

    it('should return default avatar when no images are set', () => {
      expect(component.profileImage()).toBe(
        'https://www.gravatar.com/avatar/?d=mp'
      );
    });

    it('should return cropped image when available', () => {
      component.croppedImage.set('cropped-image.jpg');

      expect(component.profileImage()).toBe('cropped-image.jpg');
    });

    it('should return user image when no cropped image', () => {
      component.userImageUrl.set('user-image.jpg');

      expect(component.profileImage()).toBe('user-image.jpg');
    });

    it('should prioritize cropped image over user image', () => {
      component.userImageUrl.set('user-image.jpg');
      component.croppedImage.set('cropped-image.jpg');

      expect(component.profileImage()).toBe('cropped-image.jpg');
    });

    it('should update signals correctly', () => {
      component.croppedImage.set('new-cropped.jpg');
      component.userImageUrl.set('new-user.jpg');

      expect(component.croppedImage()).toBe('new-cropped.jpg');
      expect(component.userImageUrl()).toBe('new-user.jpg');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      component.buildForm();
    });

    it('should handle undefined input in onFileChange', () => {
      const openImageCropDialogSpy = jest.spyOn(
        component,
        'openImageCropDialog'
      );
      const mockEvent = {
        target: {
          files: undefined,
        },
      } as any;

      component.onFileChange(mockEvent);

      expect(openImageCropDialogSpy).not.toHaveBeenCalled();
    });

    it('should handle empty files array in onFileChange', () => {
      const openImageCropDialogSpy = jest.spyOn(
        component,
        'openImageCropDialog'
      );
      const mockEvent = {
        target: {
          files: [],
        },
      } as any;

      component.onFileChange(mockEvent);

      expect(openImageCropDialogSpy).not.toHaveBeenCalled();
    });

    it('should handle missing target in onFileChange', () => {
      const openImageCropDialogSpy = jest.spyOn(
        component,
        'openImageCropDialog'
      );
      const mockEvent = {} as any;

      expect(() => component.onFileChange(mockEvent)).not.toThrow();
      expect(openImageCropDialogSpy).not.toHaveBeenCalled();
    });

    it('should handle setFormArray with empty items array', () => {
      component.addSkill(); // Add one skill first
      expect(component.skills.length).toBe(1);

      const fb = TestBed.inject(FormBuilder) as FormBuilder;
      component.setFormArray('skills', [], (skill) => fb.control(skill));

      expect(component.skills.length).toBe(0);
    });

    it('should handle removeSkill with invalid index gracefully', () => {
      component.addSkill();
      expect(component.skills.length).toBe(1);

      // This should not throw an error even with invalid index
      expect(() => component.removeSkill(5)).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full initialization flow', fakeAsync(() => {
      component.ngOnInit();
      tick();

      // Verify all initialization methods were called
      expect(mockStaticDataService.getPositions).toHaveBeenCalled();
      expect(mockStaticDataService.getDepartments).toHaveBeenCalled();
      expect(mockStaticDataService.getDegrees).toHaveBeenCalled();
      expect(mockStaticDataService.getUniversities).toHaveBeenCalled();
      expect(mockStaticDataService.getManagers).toHaveBeenCalled();
      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');

      // Verify form is built
      expect(component.profileForm).toBeDefined();

      // Verify data is loaded
      expect(component.positions).toEqual(['Developer', 'Manager']);
      expect(component.departments).toEqual(['IT', 'HR']);
    }));

    it('should handle complete form initialization flow', fakeAsync(() => {
      component.ngOnInit();
      tick();

      // Verify all initialization methods were called
      expect(mockStaticDataService.getPositions).toHaveBeenCalled();
      expect(mockStaticDataService.getDepartments).toHaveBeenCalled();
      expect(mockStaticDataService.getDegrees).toHaveBeenCalled();
      expect(mockStaticDataService.getUniversities).toHaveBeenCalled();
      expect(mockStaticDataService.getManagers).toHaveBeenCalled();
      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');

      // Verify form is built
      expect(component.profileForm).toBeDefined();

      // Verify data is loaded
      expect(component.positions).toEqual(['Developer', 'Manager']);
      expect(component.departments).toEqual(['IT', 'HR']);
    }));
  });
});
