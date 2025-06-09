import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
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

@Component({
  selector: 'app-notes',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],

  templateUrl: './notes.html',
  styleUrl: './notes.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notes implements OnInit {
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.noteForm = this.fb.group({
      name: ['', Validators.required],
      content: ['', Validators.required],
    });
    this.getAllNotes();
  }

  getAllNotes(): void {
    if (this.isSearching && this.searchTerm.trim()) {
      this.noteService
        .searchNotes(this.searchTerm.trim(), this.currentPage, this.limit)
        .subscribe((response) => {
          this.notes = response.notes;
          this.totalPages = response.totalPages;
          this.cdr.markForCheck();
        });
    } else {
      this.noteService
        .getNotes(this.currentPage, this.limit)
        .subscribe((response) => {
          this.notes = response.notes;
          this.totalPages = response.totalPages;
          this.cdr.markForCheck();
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
        this.getAllNotes();
        this.noteForm.reset();
      });
    }
  }

  onEdit(note: Note): void {
    this.noteForm.patchValue(note);
    this.editingNoteId = note._id!;
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
    return note._id!;
  }

  // search
  onSearch(): void {
    const trimmed = this.searchTerm.trim();
    this.currentPage = 1; // reset to first page
    this.isSearching = !!trimmed;
    this.getAllNotes();
  }

  // pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllNotes();
    }
  }
}
