import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgZone,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
} from '@angular/core';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';

import { Notes } from './notes';
import { NoteService } from '../../services/note';
import { TagService } from '../../services/tag.service';
import { CategoryService } from '../../services/category.service';
import { AlertService } from '../../shared/alert.service';
import { Note } from '../../models/note.model';

// Mock services
class MockNoteService {
  searchNotes = jasmine
    .createSpy()
    .and.returnValue(of({ notes: [], totalPages: 1 }));
  getNotes = jasmine
    .createSpy()
    .and.returnValue(of({ notes: [], totalPages: 1 }));
  addNote = jasmine.createSpy().and.returnValue(of({}));
  updateNote = jasmine.createSpy().and.returnValue(of({}));
  deleteNote = jasmine.createSpy().and.returnValue(of({}));
  archiveNote = jasmine.createSpy().and.returnValue(of({}));
  trashNote = jasmine.createSpy().and.returnValue(of({}));
  restoreNote = jasmine.createSpy().and.returnValue(of({}));
  getNoteCount = jasmine.createSpy().and.returnValue(of(0));
  getDueReminders = jasmine
    .createSpy()
    .and.returnValue(of({ due: [], upcoming: [] }));
}

class MockTagService {
  getTags = jasmine.createSpy().and.returnValue(
    of([
      { id: 1, name: 'work' },
      { id: 2, name: 'personal' },
    ])
  );
}

class MockCategoryService {
  getCategories = jasmine.createSpy().and.returnValue(
    of([
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
    ])
  );
}

class MockAlertService {
  success = jasmine.createSpy();
  error = jasmine.createSpy();
  confirm = jasmine
    .createSpy()
    .and.returnValue(Promise.resolve({ isConfirmed: true }));
}

class MockToastrService {
  info = jasmine.createSpy();
  success = jasmine.createSpy();
  error = jasmine.createSpy();
}

describe('Notes Component', () => {
  let component: Notes;
  let fixture: ComponentFixture<Notes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Notes, // Import the standalone component
        ReactiveFormsModule,
        BrowserAnimationsModule,
        CommonModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FormBuilder,
        { provide: NoteService, useClass: MockNoteService },
        { provide: TagService, useClass: MockTagService },
        { provide: CategoryService, useClass: MockCategoryService },
        { provide: AlertService, useClass: MockAlertService },
        { provide: ToastrService, useClass: MockToastrService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // handles custom tags/components if any
    }).compileComponents();

    fixture = TestBed.createComponent(Notes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form correctly', () => {
    component.ngOnInit();
    expect(component.noteForm).toBeDefined();
    expect(component.noteForm.get('name')?.hasError('required')).toBeTrue();
  });

  it('should submit valid form and call addNote', () => {
    component.noteForm.patchValue({
      name: 'Test Note',
      content: 'Some content',
      priority: 'Low',
    });

    component.onSubmit();

    expect(TestBed.inject(NoteService).addNote).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    component.noteForm.patchValue({
      name: '',
      content: '',
      priority: '',
    });

    component.onSubmit();

    expect(TestBed.inject(NoteService).addNote).not.toHaveBeenCalled();
  });
});
