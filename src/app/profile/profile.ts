import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ImageCropComponent } from '../components/image-crop/image-crop';
import { materialImports } from '../material';
import { CustomDropdownComponent } from '../shared/custom-dropdown/custom-dropdown';
import { CustomDatepickerComponent } from '../shared/custom-datepicker/custom-datepicker';
import { CustomAutocompleteComponent } from '../shared/custom-autocomplete/custom-autocomplete';

import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { StaticDataService } from '../services/static-data.service';
import { UserStoreService } from '../services/user-store.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    materialImports,
    CustomDropdownComponent,
    CustomDatepickerComponent,
    CustomAutocompleteComponent,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;

  // reactive signals
  croppedImage = signal<string | null>(null);
  userImageUrl = signal<string | null>(null);
  readonly profileImage = computed(
    () => this.croppedImage() || this.userImageUrl() || this.defaultAvatar
  );

  // dropdown data
  positions: string[] = [];
  departments: string[] = [];
  degrees: { name: string }[] = [];
  universities: { name: string }[] = [];
  managers: any[] = [];

  defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private staticDataService: StaticDataService,
    private userStore: UserStoreService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadStaticData();
    this.loadUserProfile();
  }

  // -----------------------
  // Form & Field Helpers
  // -----------------------

  get skills(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  buildForm(): void {
    this.profileForm = this.fb.group({
      profileImage: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      dateOfBirth: [''],
      dateOfJoining: [''],
      gender: [''],
      position: [''],
      department: [''],
      employeeId: [''],
      reportingManager: [''],
      experience: [''],
      isMarried: [false],
      linkedin: [''],
      github: [''],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zip: [''],
        country: [''],
      }),
      skills: this.fb.array([]),
    });
  }

  setFormArray<T>(key: string, items: T[], builder: (item: T) => any): void {
    const formArray = this.profileForm.get(key) as FormArray;
    formArray.clear();
    items.forEach((item) => formArray.push(builder(item)));
  }

  addSkill(): void {
    this.skills.push(this.fb.control(''));
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  // -----------------------
  // API Calls
  // -----------------------

  loadUserProfile(): void {
    const userId = this.authService.getUser()?.id;
    if (!userId) return;

    this.userService.getUserById(userId).subscribe((user) => {
      this.profileForm.patchValue(user);
      this.userImageUrl.set(user.profileImage);
      this.setFormArray('skills', user.skills || [], (skill) =>
        this.fb.control(skill)
      );
      this.cdr.detectChanges();
    });
  }

  loadStaticData(): void {
    this.staticDataService
      .getPositions()
      .subscribe((data) => (this.positions = data));
    this.staticDataService
      .getDepartments()
      .subscribe((data) => (this.departments = data));
    this.staticDataService
      .getDegrees()
      .subscribe((data) => (this.degrees = data));
    this.staticDataService
      .getUniversities()
      .subscribe((data) => (this.universities = data));
    this.staticDataService
      .getManagers()
      .subscribe((data) => (this.managers = data));
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const userId = this.authService.getUser()?.id;
    if (!userId) return;

    this.userService.updateUser(userId, this.profileForm.value).subscribe({
      next: () => this.alertService.success('Profile updated successfully'),
      error: () => this.alertService.error('Failed to update profile'),
    });
  }

  // -----------------------
  // Image Upload
  // -----------------------

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) this.openImageCropDialog(file);
  }

  openImageCropDialog(file: File): void {
    const dialogRef = this.dialog.open(ImageCropComponent, { data: { file } });

    dialogRef
      .afterClosed()
      .subscribe((result: { file: File; objectUrl: string } | null) => {
        if (!result) return;

        const userId = this.authService.getUser()?.id;
        if (!userId) return;

        this.userService.uploadProfileImage(userId, result.file).subscribe({
          next: (res) => {
            this.ngZone.run(() => {
              this.croppedImage.set(res.profileImage);
              this.profileForm.patchValue({ profileImage: res.profileImage });
              this.userStore.setProfileImage(res.profileImage);
              this.cdr.markForCheck();
              this.alertService.success(
                'Profile image updated successfully ✅'
              );
            });
          },
          error: () =>
            this.alertService.error('Failed to upload profile image ❌'),
        });
      });
  }
}
