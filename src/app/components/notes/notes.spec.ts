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
  searchNotes = jest.fn().mockReturnValue(of({ notes: [], totalPages: 1 }));
  getNotes = jest.fn().mockReturnValue(of({ notes: [], totalPages: 1 }));
  addNote = jest.fn().mockReturnValue(of({}));
  updateNote = jest.fn().mockReturnValue(of({}));
  deleteNote = jest.fn().mockReturnValue(of({}));
  archiveNote = jest.fn().mockReturnValue(of({}));
  trashNote = jest.fn().mockReturnValue(of({}));
  restoreNote = jest.fn().mockReturnValue(of({}));
  getNoteCount = jest.fn().mockReturnValue(of(0));
  getDueReminders = jest.fn().mockReturnValue(of({ due: [], upcoming: [] }));
}

class MockTagService {
  getTags = jest.fn().mockReturnValue(
    of([
      { id: 1, name: 'work' },
      { id: 2, name: 'personal' },
    ])
  );
}

class MockCategoryService {
  getCategories = jest.fn().mockReturnValue(
    of([
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
    ])
  );
}

class MockAlertService {
  success = jest.fn();
  error = jest.fn();
  confirm = jest.fn().mockResolvedValue({ isConfirmed: true });
}

class MockToastrService {
  info = jest.fn();
  success = jest.fn();
  error = jest.fn();
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
    expect(component.noteForm.get('name')?.hasError('required')).toBe(true);
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
