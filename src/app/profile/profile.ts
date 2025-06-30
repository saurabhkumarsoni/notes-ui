import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
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
  croppedImage = signal<string | null>(null);
  positions: string[] = [];
  departments: string[] = [];
  degrees: { name: string }[] = [];
  universities: { name: string }[] = [];
  managers: any[] = [];

  defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp';
  userImageUrl = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private staticDataService: StaticDataService,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private userStore: UserStoreService // ✅ FIX HERE
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const userId = this.authService.getUser()?.id;
    if (userId) {
      this.userService.getUserById(userId).subscribe((user) => {
        this.profileForm.patchValue(user);

        // this.userImageUrl = user.profileImage;
        this.userImageUrl.set(user.profileImage);

        this.setFormArray('skills', user.skills || [], (skill) =>
          this.fb.control(skill)
        );
        this.cdRef.detectChanges();
      });
    }

    this.loadStaticData();
  }

  get skills(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  // Methods to add/remove dynamic fields
  addSkill() {
    this.skills.push(this.fb.control(''));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const userId = this.authService.getUser()?.id;

      this.userService.updateUser(userId, this.profileForm.value).subscribe({
        next: (res) => {
          console.log('✅ Profile updated successfully', res);
        },
        error: (err) => {
          console.error('❌ Failed to update profile', err);
        },
      });
    }
  }

  openImageCropDialog(file: File) {
    const dialogRef = this.dialog.open(ImageCropComponent, {
      data: { file } /* … */,
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { file: File; objectUrl: string } | null) => {
        if (!result) return; // cancelled

        console.log('🗂 cropped file:', result.file);
        console.log('🖼 preview URL:', result.objectUrl);

        const userId = this.authService.getUser()!.id;
        this.userService.uploadProfileImage(userId, result.file).subscribe({
          next: (res) => {
            console.log('🚀 upload response:', res);
            this.ngZone.run(() => {
              this.croppedImage.set(res.profileImage);
              this.profileForm.patchValue({ profileImage: res.profileImage });
              this.userStore.setProfileImage(res.profileImage);
              this.cdRef.markForCheck();
            });
          },
          error: (err) => console.error('❌ upload failed', err),
        });
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.openImageCropDialog(file);
    }
  }

  readonly profileImage = computed(
    () => this.croppedImage() || this.userImageUrl() || this.defaultAvatar
  );

  buildForm() {
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

  setFormArray(controlName: string, values: any[], builder: (val: any) => any) {
    const array = this.profileForm.get(controlName) as FormArray;
    array.clear();
    values?.forEach((val) => array.push(builder(val)));
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
}
