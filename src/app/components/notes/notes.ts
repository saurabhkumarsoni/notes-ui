import { AlertService } from './../../shared/alert.service';
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
    private zone: NgZone,
    private alertService: AlertService
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

    this.getAllNotes();
  }

  getAllNotes(): void {
    const source$ =
      this.isSearching && this.searchTerm.trim()
        ? this.noteService.searchNotes(
            this.searchTerm.trim(),
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
          this.notes = [...response.notes];
          this.totalPages = response.totalPages;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.alertService.error('Failed to load notes');
      },
    });
  }

  onSubmit(): void {
    if (this.noteForm.invalid) return;

    const note = this.noteForm.value;

    if (this.editingNoteId) {
      this.noteService.updateNote(this.editingNoteId, note).subscribe({
        next: () => {
          this.alertService.success('Note updated successfully');
          this.getAllNotes();
          this.cancelEdit();
        },
        error: () => this.alertService.error('Failed to update note'),
      });
    } else {
      this.noteService.addNote(note).subscribe({
        next: () => {
          this.alertService.success('Note created successfully');
          this.getAllNotes();
          this.noteForm.reset();
        },
        error: () => this.alertService.error('Failed to create note'),
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

  trackByNoteId(index: number, note: Note): string {
    return note._id ?? note.id ?? '';
  }

  onSearch(): void {
    this.searchInput$.next(this.searchTerm);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllNotes();
    }
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.getAllNotes();
  }

  getNoteId(note: Note): string {
    return note._id ?? note.id ?? '';
  }

  ngAfterViewChecked(): void {
    if (this.shouldFocusInput && this.noteTitleInputRef) {
      this.noteTitleInputRef.nativeElement.focus();
      this.shouldFocusInput = false;
    }
  }
}
