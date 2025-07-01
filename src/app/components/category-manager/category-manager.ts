// src/app/components/category-manager.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-manager.html',
})
export class CategoryManager implements OnInit {
  categoryForm!: FormGroup;
  categories = signal<Category[]>([]);
  editingCategory = signal<Category | null>(null);

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((data) => this.categories.set(data));
  }

  saveCategory() {
    const name = this.categoryForm.value.name.trim();
    if (!name) return;

    const edit = this.editingCategory();
    const action$ = edit
      ? this.categoryService.updateCategory(edit.id, name)
      : this.categoryService.createCategory(name);

    action$.subscribe(() => {
      this.loadCategories();
      this.cancelEdit();
    });
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({ name: category.name });
  }

  cancelEdit() {
    this.editingCategory.set(null);
    this.categoryForm.reset();
  }

  deleteCategory(category: Category) {
    if (confirm(`Delete category "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe(() => this.loadCategories());
    }
  }
}
