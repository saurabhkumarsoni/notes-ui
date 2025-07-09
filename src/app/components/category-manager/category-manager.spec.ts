import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CategoryManager } from './category-manager';
import { CategoryService, Category } from '../../services/category.service';

// Mock services
class MockCategoryService {
  getCategories = jest.fn().mockReturnValue(
    of([
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
      { id: 3, name: 'Study' },
    ])
  );
  createCategory = jest
    .fn()
    .mockReturnValue(of({ id: 4, name: 'New Category' }));
  updateCategory = jest
    .fn()
    .mockReturnValue(of({ id: 1, name: 'Updated Category' }));
  deleteCategory = jest.fn().mockReturnValue(of({}));
}

describe('CategoryManager', () => {
  let component: CategoryManager;
  let fixture: ComponentFixture<CategoryManager>;
  let mockCategoryService: MockCategoryService;

  const mockCategories: Category[] = [
    { id: 1, name: 'Work' },
    { id: 2, name: 'Personal' },
    { id: 3, name: 'Study' },
  ];

  beforeEach(async () => {
    mockCategoryService = new MockCategoryService();

    await TestBed.configureTestingModule({
      imports: [CategoryManager, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with validators', () => {
      expect(component.categoryForm).toBeDefined();
      expect(
        component.categoryForm.get('name')?.hasError('required')
      ).toBeTruthy();
    });

    it('should load categories on init', () => {
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(component.categories()).toEqual(mockCategories);
    });

    it('should initialize with no editing category', () => {
      expect(component.editingCategory()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should require category name', () => {
      const nameControl = component.categoryForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('Valid Category');
      expect(nameControl?.hasError('required')).toBeFalsy();
    });

    it('should validate form state', () => {
      expect(component.categoryForm.invalid).toBeTruthy();

      component.categoryForm.patchValue({ name: 'Test Category' });
      expect(component.categoryForm.valid).toBeTruthy();
    });
  });

  describe('Category CRUD Operations', () => {
    describe('Create Category', () => {
      it('should create new category with valid name', () => {
        component.categoryForm.patchValue({ name: 'New Category' });

        component.saveCategory();

        expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
          'New Category'
        );
        expect(mockCategoryService.getCategories).toHaveBeenCalled();
      });

      it('should not create category with empty name', () => {
        component.categoryForm.patchValue({ name: '' });

        component.saveCategory();

        expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
      });

      it('should not create category with whitespace-only name', () => {
        component.categoryForm.patchValue({ name: '   ' });

        component.saveCategory();

        expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
      });

      it('should trim whitespace from category name', () => {
        component.categoryForm.patchValue({ name: '  New Category  ' });

        component.saveCategory();

        expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
          'New Category'
        );
      });
    });

    describe('Update Category', () => {
      beforeEach(() => {
        const categoryToEdit = mockCategories[0];
        component.editingCategory.set(categoryToEdit);
        component.categoryForm.patchValue({ name: 'Updated Name' });
      });

      it('should update existing category', () => {
        component.saveCategory();

        expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
          1,
          'Updated Name'
        );
        expect(mockCategoryService.getCategories).toHaveBeenCalled();
      });

      it('should reset editing state after update', () => {
        component.saveCategory();

        expect(component.editingCategory()).toBeNull();
        expect(component.categoryForm.get('name')?.value).toBeNull();
      });
    });

    describe('Delete Category', () => {
      it('should delete category after confirmation', () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        const categoryToDelete = mockCategories[0];

        component.deleteCategory(categoryToDelete);

        expect(window.confirm).toHaveBeenCalledWith('Delete category "Work"?');
        expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1);
        expect(mockCategoryService.getCategories).toHaveBeenCalled();
      });

      it('should not delete category if not confirmed', () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);
        const categoryToDelete = mockCategories[0];

        component.deleteCategory(categoryToDelete);

        expect(window.confirm).toHaveBeenCalledWith('Delete category "Work"?');
        expect(mockCategoryService.deleteCategory).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Functionality', () => {
    it('should enter edit mode for category', () => {
      const categoryToEdit = mockCategories[0];

      component.editCategory(categoryToEdit);

      expect(component.editingCategory()).toEqual(categoryToEdit);
      expect(component.categoryForm.get('name')?.value).toBe('Work');
    });

    it('should populate form with category data when editing', () => {
      const categoryToEdit = mockCategories[1];

      component.editCategory(categoryToEdit);

      expect(component.categoryForm.get('name')?.value).toBe('Personal');
    });

    it('should cancel edit and reset form', () => {
      const categoryToEdit = mockCategories[0];
      component.editCategory(categoryToEdit);

      component.cancelEdit();

      expect(component.editingCategory()).toBeNull();
      expect(component.categoryForm.get('name')?.value).toBeNull();
    });

    it('should reset form when canceling edit', () => {
      component.categoryForm.patchValue({ name: 'Some Value' });
      component.editingCategory.set(mockCategories[0]);

      component.cancelEdit();

      expect(component.categoryForm.pristine).toBeTruthy();
      expect(component.categoryForm.get('name')?.value).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading categories', () => {
      mockCategoryService.getCategories.mockReturnValue(
        throwError(() => 'Load failed')
      );
      jest.spyOn(console, 'error').mockImplementation();

      component.loadCategories();

      // Component should handle error gracefully
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
    });

    it('should handle error when creating category', () => {
      mockCategoryService.createCategory.mockReturnValue(
        throwError(() => 'Create failed')
      );
      component.categoryForm.patchValue({ name: 'New Category' });

      component.saveCategory();

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        'New Category'
      );
      // Component should handle error gracefully
    });

    it('should handle error when updating category', () => {
      mockCategoryService.updateCategory.mockReturnValue(
        throwError(() => 'Update failed')
      );
      component.editingCategory.set(mockCategories[0]);
      component.categoryForm.patchValue({ name: 'Updated Name' });

      component.saveCategory();

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
        1,
        'Updated Name'
      );
      // Component should handle error gracefully
    });

    it('should handle error when deleting category', () => {
      mockCategoryService.deleteCategory.mockReturnValue(
        throwError(() => 'Delete failed')
      );
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteCategory(mockCategories[0]);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1);
      // Component should handle error gracefully
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state during operations', () => {
      component.categoryForm.patchValue({ name: 'Test Category' });

      expect(component.categoryForm.get('name')?.value).toBe('Test Category');
      expect(component.categoryForm.valid).toBeTruthy();
    });

    it('should reset form after successful creation', () => {
      component.categoryForm.patchValue({ name: 'New Category' });

      component.saveCategory();

      expect(component.categoryForm.get('name')?.value).toBeNull();
      expect(component.editingCategory()).toBeNull();
    });

    it('should handle form validation correctly', () => {
      // Invalid form
      component.categoryForm.patchValue({ name: '' });
      expect(component.categoryForm.invalid).toBeTruthy();

      // Valid form
      component.categoryForm.patchValue({ name: 'Valid Name' });
      expect(component.categoryForm.valid).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full create flow', () => {
      component.categoryForm.patchValue({ name: 'Integration Test Category' });

      component.saveCategory();

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        'Integration Test Category'
      );
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(component.categoryForm.get('name')?.value).toBeNull();
      expect(component.editingCategory()).toBeNull();
    });

    it('should complete full edit flow', () => {
      const categoryToEdit = mockCategories[0];

      // Start edit
      component.editCategory(categoryToEdit);
      expect(component.editingCategory()).toEqual(categoryToEdit);
      expect(component.categoryForm.get('name')?.value).toBe('Work');

      // Update name
      component.categoryForm.patchValue({ name: 'Updated Work' });

      // Save changes
      component.saveCategory();
      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
        1,
        'Updated Work'
      );
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(component.editingCategory()).toBeNull();
    });

    it('should complete full delete flow', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const categoryToDelete = mockCategories[0];

      component.deleteCategory(categoryToDelete);

      expect(window.confirm).toHaveBeenCalledWith('Delete category "Work"?');
      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1);
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
    });

    it('should handle edit cancellation flow', () => {
      const categoryToEdit = mockCategories[0];

      // Start edit
      component.editCategory(categoryToEdit);
      component.categoryForm.patchValue({ name: 'Modified Name' });

      // Cancel edit
      component.cancelEdit();

      expect(component.editingCategory()).toBeNull();
      expect(component.categoryForm.get('name')?.value).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories list', () => {
      mockCategoryService.getCategories.mockReturnValue(of([]));

      component.loadCategories();

      expect(component.categories()).toEqual([]);
    });

    it('should handle category with special characters', () => {
      component.categoryForm.patchValue({ name: 'Category with @#$%' });

      component.saveCategory();

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        'Category with @#$%'
      );
    });

    it('should handle very long category names', () => {
      const longName = 'A'.repeat(100);
      component.categoryForm.patchValue({ name: longName });

      component.saveCategory();

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(longName);
    });

    it('should handle null/undefined category in edit', () => {
      expect(() => {
        component.editCategory(null as any);
      }).toThrow();
    });
  });
});
