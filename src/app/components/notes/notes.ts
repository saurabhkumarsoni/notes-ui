import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
  AfterViewChecked,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { NoteService } from '../../services/note';
import { Note } from '../../models/note.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notes',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],

  templateUrl: './notes.html',
  styleUrl: './notes.css',
  standalone: true,
})
export class Notes implements OnInit, AfterViewChecked {
  private searchInput$ = new Subject<string>();

  @ViewChild('noteTitleInput') noteTitleInputRef!: ElementRef<HTMLInputElement>;
  private shouldFocusInput = false;
  sortBy: string = 'createdAt';
  sortOrder: string = 'desc';
  isSearching: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 6;

  searchTerm: string = '';
  notes: Note[] = [];
  noteForm!: FormGroup;
  editingNoteId: string | null = null;

  constructor(
    private noteService: NoteService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.noteForm = this.fb.group({
      name: ['', Validators.required],
      content: ['', Validators.required],
    });

    this.searchInput$
      .pipe(
        debounceTime(400),
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
          this.notes = [...response.notes];
          this.totalPages = response.totalPages;
          this.cdr.markForCheck();
        });
      });

    this.getAllNotes(); // load initial notes
  }

  getAllNotes(): void {
    if (this.isSearching && this.searchTerm.trim()) {
      this.noteService
        .searchNotes(
          this.searchTerm.trim(),
          this.currentPage,
          this.limit,
          this.sortBy,
          this.sortOrder
        )
        .subscribe((response) => {
          console.log('response of notes list', response);
          this.zone.run(() => {
            this.notes = [...response.notes];
            this.totalPages = response.totalPages;
            this.cdr.markForCheck();
          });
        });
    } else {
      this.noteService
        .getNotes(this.currentPage, this.limit, this.sortBy, this.sortOrder)
        .subscribe((response) => {
          this.zone.run(() => {
            this.notes = [...response.notes];
            this.totalPages = response.totalPages;
            this.cdr.markForCheck();
          });
        });
    }
  }

  onSubmit(): void {
    if (this.noteForm.invalid) return;

    const note = this.noteForm.value;

    if (this.editingNoteId) {
      this.noteService.updateNote(this.editingNoteId, note).subscribe(() => {
        this.getAllNotes();
        this.cancelEdit();
      });
    } else {
      this.noteService.addNote(note).subscribe(() => {
        this.zone.run(() => {
          this.getAllNotes();
          this.noteForm.reset();
        });
      });
    }
  }

  onEdit(note: Note): void {
    this.noteForm.patchValue(note);
    this.editingNoteId = this.getNoteId(note);
    this.shouldFocusInput = true;
  }

  cancelEdit(): void {
    this.editingNoteId = null;
    this.noteForm.reset();
  }

  onDelete(id: string): void {
    const confirmDelete = confirm('Are you sure you want to delete this note?');
    if (confirmDelete) {
      this.noteService.deleteNote(id).subscribe(() => this.getAllNotes());
    }
  }

  trackByNoteId(index: number, note: Note): string {
    return note._id ?? note.id ?? '';
  }

  // search
  onSearch(): void {
    this.searchInput$.next(this.searchTerm);
  }

  // pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllNotes();
    }
  }

  onSortChange(): void {
    this.currentPage = 1; // Reset to first page
    this.getAllNotes();
  }

  getNoteId(note: Note): string {
    return note._id ?? note.id ?? ''; // fallback to empty if none
  }

  ngAfterViewChecked(): void {
    if (this.shouldFocusInput && this.noteTitleInputRef) {
      this.noteTitleInputRef.nativeElement.focus();
      this.shouldFocusInput = false;
    }
  }
}
