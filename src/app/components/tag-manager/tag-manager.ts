import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TagService, Tag } from '../../services/tag.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tag-manager.html',
})
export class TagManagerComponent implements OnInit {
  private tagService = inject(TagService);
  private fb = inject(FormBuilder);

  tagForm = this.fb.group({
    name: ['', Validators.required],
  });

  // ✅ Signals
  tags = signal<Tag[]>([]);
  editingTag = signal<Tag | null>(null);

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags() {
    this.tagService.getTags().subscribe({
      next: (tags) => this.tags.set(tags),
      error: (err) => console.error('Error loading tags:', err),
    });
  }

  saveTag() {
    const name = this.tagForm.value.name?.trim();
    if (!name) return;

    const editing = this.editingTag();

    if (editing) {
      this.tagService.updateTag(editing.id, name).subscribe({
        next: () => {
          this.loadTags();
          this.cancelEdit();
        },
        error: (err) => console.error('Error updating tag:', err),
      });
    } else {
      this.tagService.createTag(name).subscribe({
        next: () => {
          this.loadTags();
          this.tagForm.reset();
        },
        error: (err) => console.error('Error creating tag:', err),
      });
    }
  }

  editTag(tag: Tag) {
    this.editingTag.set(tag);
    this.tagForm.patchValue({ name: tag.name });
  }

  cancelEdit() {
    this.editingTag.set(null);
    this.tagForm.reset();
  }

  deleteTag(tag: Tag) {
    if (confirm(`Delete tag "${tag.name}"?`)) {
      this.tagService.deleteTag(tag.id).subscribe({
        next: () => this.loadTags(),
        error: (err) => console.error('Error deleting tag:', err),
      });
    }
  }
}
