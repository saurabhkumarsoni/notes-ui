import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  NgZone,
  AfterViewChecked,
  computed,
  signal,
  model,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatOption,
} from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { NoteService } from '../../services/note';
import { TagService } from '../../services/tag.service';
import { CategoryService, Category } from '../../services/category.service';
import { AlertService } from '../../shared/alert.service';
import { Note } from '../../models/note.model';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notes',
  standalone: true,
  templateUrl: './notes.html',
  styleUrls: ['./notes.css'],
  imports: [
    CommonModule,
    NgClass,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatAutocomplete,
    MatOption,
    MatAutocompleteModule,
  ],
})
export class Notes implements OnInit, AfterViewChecked {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly allTags = signal<string[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly tagInputControl = new FormControl('');
  readonly filteredTags = computed(() => {
    const input = this.tagInputControl.value?.toLowerCase() || '';
    return this.allTags().filter(
      (tag) =>
        tag.toLowerCase().includes(input) && !this.tags.value.includes(tag)
    );
  });

  private searchInput$ = new Subject<string>();
  @ViewChild('noteTitleInput') noteTitleInputRef!: ElementRef<HTMLInputElement>;
  private shouldFocusInput = false;

  noteForm!: FormGroup;
  notes: Note[] = [];
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  limit = 6;
  sortBy = 'createdAt';
  sortOrder = 'desc';
  editingNoteId: string | null = null;
  isSearching = false;
  currentTagControl!: FormControl;

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private tagService: TagService,
    private categoryService: CategoryService,
    private alertService: AlertService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchTags();
    this.fetchCategory();
    this.currentTagControl = this.fb.control('');

    this.noteForm = this.fb.group({
      name: ['', Validators.required],
      content: ['', Validators.required],
      tags: this.fb.array([]),
      categoryId: [null],
    });

    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.searchTerm = term.trim();
          this.currentPage = 1;
          this.isSearching = !!this.searchTerm;
          return this.noteService.searchNotes(
            this.searchTerm,
            this.currentPage,
            this.limit,
            this.sortBy,
            this.sortOrder
          );
        })
      )
      .subscribe((response) => {
        this.zone.run(() => {
          this.notes = response.notes;
          this.totalPages = response.totalPages;
          this.cdr.markForCheck();
        });
      });

    this.getAllNotes();
  }

  get tags(): FormArray {
    return this.noteForm.get('tags') as FormArray;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.value.includes(value)) {
      this.tags.push(this.fb.control(value));
    }
    this.tagInputControl.setValue('');
  }

  removeTag(index: number): void {
    if (index >= 0) this.tags.removeAt(index);
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const tag = event.option.viewValue;
    if (tag && !this.tags.value.includes(tag)) {
      this.tags.push(this.fb.control(tag));
    }
    this.tagInputControl.setValue('');
  }

  onSubmit(): void {
    if (this.noteForm.invalid) return;

    const formValue = this.noteForm.value;
    const payload: Note = {
      name: formValue.name,
      content: formValue.content,
      tags: formValue.tags.map((t: string) => ({ name: t })),
      categoryId: formValue.categoryId,
    };

    const request$ = this.editingNoteId
      ? this.noteService.updateNote(this.editingNoteId, payload)
      : this.noteService.addNote(payload);

    request$.subscribe({
      next: () => {
        this.alertService.success(
          this.editingNoteId ? 'Note updated' : 'Note created'
        );
        this.getAllNotes();
        this.cancelEdit();
      },
      error: () => {
        this.alertService.error(
          this.editingNoteId ? 'Update failed' : 'Creation failed'
        );
      },
    });
  }

  cancelEdit(): void {
    this.editingNoteId = null;
    this.noteForm.reset();
    this.tags.clear();
  }

  onEdit(note: Note): void {
    this.noteForm.patchValue({
      name: note.name,
      content: note.content,
      categoryId: note.categoryId || null,
    });
    this.tags.clear();
    (note.tags || []).forEach((tag) => {
      this.tags.push(this.fb.control(typeof tag === 'string' ? tag : tag.name));
    });
    this.editingNoteId = note._id ?? note.id ?? null;
    this.shouldFocusInput = true;
  }

  getAllNotes(): void {
    const source$ =
      this.isSearching && this.searchTerm.trim()
        ? this.noteService.searchNotes(
            this.searchTerm,
            this.currentPage,
            this.limit,
            this.sortBy,
            this.sortOrder
          )
        : this.noteService.getNotes(
            this.currentPage,
            this.limit,
            this.sortBy,
            this.sortOrder
          );

    source$.subscribe({
      next: (response) => {
        this.zone.run(() => {
          this.notes = response.notes;
          this.totalPages = response.totalPages;
          this.cdr.markForCheck();
        });
      },
      error: () => this.alertService.error('Failed to load notes'),
    });
  }

  fetchTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => this.allTags.set(tags.map((t) => t.name)),
      error: () => this.alertService.error('Failed to load tags'),
    });
  }

  fetchCategory(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.alertService.error('Failed to load categories'),
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldFocusInput && this.noteTitleInputRef) {
      this.noteTitleInputRef.nativeElement.focus();
      this.shouldFocusInput = false;
    }
  }

  trackTag(index: number, tag: string): string {
    return tag;
  }

  getNoteId(note: Note): string {
    return note._id ?? note.id ?? '';
  }

  onDelete(id: string): void {
    this.alertService
      .confirm('Do you really want to delete this note?')
      .then((result) => {
        if (result.isConfirmed) {
          this.noteService.deleteNote(id).subscribe({
            next: () => {
              this.alertService.success('Note deleted successfully');
              this.getAllNotes();
            },
            error: () => this.alertService.error('Failed to delete note'),
          });
        }
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllNotes();
    }
  }

  trackByNoteId(index: number, note: Note): string {
    return note._id ?? note.id ?? '';
  }
}
