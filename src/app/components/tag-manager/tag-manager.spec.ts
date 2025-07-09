import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { TagManagerComponent } from './tag-manager';
import { TagService, Tag } from '../../services/tag.service';

// Mock services
class MockTagService {
  getTags = jest.fn().mockReturnValue(
    of([
      { id: 1, name: 'work' },
      { id: 2, name: 'personal' },
      { id: 3, name: 'urgent' },
    ])
  );
  createTag = jest.fn().mockReturnValue(of({ id: 4, name: 'new-tag' }));
  updateTag = jest.fn().mockReturnValue(of({ id: 1, name: 'updated-tag' }));
  deleteTag = jest.fn().mockReturnValue(of({}));
}

describe('TagManagerComponent', () => {
  let component: TagManagerComponent;
  let fixture: ComponentFixture<TagManagerComponent>;
  let mockTagService: MockTagService;

  const mockTags: Tag[] = [
    { id: 1, name: 'work' },
    { id: 2, name: 'personal' },
    { id: 3, name: 'urgent' },
  ];

  beforeEach(async () => {
    mockTagService = new MockTagService();

    await TestBed.configureTestingModule({
      imports: [TagManagerComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: TagService, useValue: mockTagService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TagManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with validators', () => {
      expect(component.tagForm).toBeDefined();
      expect(component.tagForm.get('name')?.hasError('required')).toBeTruthy();
    });

    it('should load tags on init', () => {
      expect(mockTagService.getTags).toHaveBeenCalled();
      expect(component.tags()).toEqual(mockTags);
    });

    it('should initialize with no editing tag', () => {
      expect(component.editingTag()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should require tag name', () => {
      const nameControl = component.tagForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('valid-tag');
      expect(nameControl?.hasError('required')).toBeFalsy();
    });

    it('should validate form state', () => {
      expect(component.tagForm.invalid).toBeTruthy();

      component.tagForm.patchValue({ name: 'test-tag' });
      expect(component.tagForm.valid).toBeTruthy();
    });
  });

  describe('Tag CRUD Operations', () => {
    describe('Create Tag', () => {
      it('should create new tag with valid name', () => {
        component.tagForm.patchValue({ name: 'new-tag' });

        component.saveTag();

        expect(mockTagService.createTag).toHaveBeenCalledWith('new-tag');
        expect(mockTagService.getTags).toHaveBeenCalled();
      });

      it('should not create tag with empty name', () => {
        component.tagForm.patchValue({ name: '' });

        component.saveTag();

        expect(mockTagService.createTag).not.toHaveBeenCalled();
      });

      it('should not create tag with whitespace-only name', () => {
        component.tagForm.patchValue({ name: '   ' });

        component.saveTag();

        expect(mockTagService.createTag).not.toHaveBeenCalled();
      });

      it('should trim whitespace from tag name', () => {
        component.tagForm.patchValue({ name: '  new-tag  ' });

        component.saveTag();

        expect(mockTagService.createTag).toHaveBeenCalledWith('new-tag');
      });

      it('should reset form after successful creation', () => {
        component.tagForm.patchValue({ name: 'new-tag' });

        component.saveTag();

        expect(component.tagForm.get('name')?.value).toBeNull();
      });
    });

    describe('Update Tag', () => {
      beforeEach(() => {
        const tagToEdit = mockTags[0];
        component.editingTag.set(tagToEdit);
        component.tagForm.patchValue({ name: 'updated-name' });
      });

      it('should update existing tag', () => {
        component.saveTag();

        expect(mockTagService.updateTag).toHaveBeenCalledWith(
          1,
          'updated-name'
        );
        expect(mockTagService.getTags).toHaveBeenCalled();
      });

      it('should reset editing state after update', () => {
        component.saveTag();

        expect(component.editingTag()).toBeNull();
        expect(component.tagForm.get('name')?.value).toBeNull();
      });
    });

    describe('Delete Tag', () => {
      it('should delete tag after confirmation', () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        const tagToDelete = mockTags[0];

        component.deleteTag(tagToDelete);

        expect(window.confirm).toHaveBeenCalledWith('Delete tag "work"?');
        expect(mockTagService.deleteTag).toHaveBeenCalledWith(1);
        expect(mockTagService.getTags).toHaveBeenCalled();
      });

      it('should not delete tag if not confirmed', () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);
        const tagToDelete = mockTags[0];

        component.deleteTag(tagToDelete);

        expect(window.confirm).toHaveBeenCalledWith('Delete tag "work"?');
        expect(mockTagService.deleteTag).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Functionality', () => {
    it('should enter edit mode for tag', () => {
      const tagToEdit = mockTags[0];

      component.editTag(tagToEdit);

      expect(component.editingTag()).toEqual(tagToEdit);
      expect(component.tagForm.get('name')?.value).toBe('work');
    });

    it('should populate form with tag data when editing', () => {
      const tagToEdit = mockTags[1];

      component.editTag(tagToEdit);

      expect(component.tagForm.get('name')?.value).toBe('personal');
    });

    it('should cancel edit and reset form', () => {
      const tagToEdit = mockTags[0];
      component.editTag(tagToEdit);

      component.cancelEdit();

      expect(component.editingTag()).toBeNull();
      expect(component.tagForm.get('name')?.value).toBeNull();
    });

    it('should reset form when canceling edit', () => {
      component.tagForm.patchValue({ name: 'Some Value' });
      component.editingTag.set(mockTags[0]);

      component.cancelEdit();

      expect(component.tagForm.pristine).toBeTruthy();
      expect(component.tagForm.get('name')?.value).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading tags', () => {
      mockTagService.getTags.mockReturnValue(throwError(() => 'Load failed'));
      jest.spyOn(console, 'error').mockImplementation();

      component.loadTags();

      // Component should handle error gracefully
      expect(mockTagService.getTags).toHaveBeenCalled();
    });

    it('should handle error when creating tag', () => {
      mockTagService.createTag.mockReturnValue(
        throwError(() => 'Create failed')
      );
      component.tagForm.patchValue({ name: 'new-tag' });

      component.saveTag();

      expect(mockTagService.createTag).toHaveBeenCalledWith('new-tag');
      // Component should handle error gracefully
    });

    it('should handle error when updating tag', () => {
      mockTagService.updateTag.mockReturnValue(
        throwError(() => 'Update failed')
      );
      component.editingTag.set(mockTags[0]);
      component.tagForm.patchValue({ name: 'updated-name' });

      component.saveTag();

      expect(mockTagService.updateTag).toHaveBeenCalledWith(1, 'updated-name');
      // Component should handle error gracefully
    });

    it('should handle error when deleting tag', () => {
      mockTagService.deleteTag.mockReturnValue(
        throwError(() => 'Delete failed')
      );
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteTag(mockTags[0]);

      expect(mockTagService.deleteTag).toHaveBeenCalledWith(1);
      // Component should handle error gracefully
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state during operations', () => {
      component.tagForm.patchValue({ name: 'test-tag' });

      expect(component.tagForm.get('name')?.value).toBe('test-tag');
      expect(component.tagForm.valid).toBeTruthy();
    });

    it('should reset form after successful creation', () => {
      component.tagForm.patchValue({ name: 'new-tag' });

      component.saveTag();

      expect(component.tagForm.get('name')?.value).toBeNull();
      expect(component.editingTag()).toBeNull();
    });

    it('should handle form validation correctly', () => {
      // Invalid form
      component.tagForm.patchValue({ name: '' });
      expect(component.tagForm.invalid).toBeTruthy();

      // Valid form
      component.tagForm.patchValue({ name: 'valid-name' });
      expect(component.tagForm.valid).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full create flow', () => {
      component.tagForm.patchValue({ name: 'integration-test-tag' });

      component.saveTag();

      expect(mockTagService.createTag).toHaveBeenCalledWith(
        'integration-test-tag'
      );
      expect(mockTagService.getTags).toHaveBeenCalled();
      expect(component.tagForm.get('name')?.value).toBeNull();
      expect(component.editingTag()).toBeNull();
    });

    it('should complete full edit flow', () => {
      const tagToEdit = mockTags[0];

      // Start edit
      component.editTag(tagToEdit);
      expect(component.editingTag()).toEqual(tagToEdit);
      expect(component.tagForm.get('name')?.value).toBe('work');

      // Update name
      component.tagForm.patchValue({ name: 'updated-work' });

      // Save changes
      component.saveTag();
      expect(mockTagService.updateTag).toHaveBeenCalledWith(1, 'updated-work');
      expect(mockTagService.getTags).toHaveBeenCalled();
      expect(component.editingTag()).toBeNull();
    });

    it('should complete full delete flow', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const tagToDelete = mockTags[0];

      component.deleteTag(tagToDelete);

      expect(window.confirm).toHaveBeenCalledWith('Delete tag "work"?');
      expect(mockTagService.deleteTag).toHaveBeenCalledWith(1);
      expect(mockTagService.getTags).toHaveBeenCalled();
    });

    it('should handle edit cancellation flow', () => {
      const tagToEdit = mockTags[0];

      // Start edit
      component.editTag(tagToEdit);
      component.tagForm.patchValue({ name: 'modified-name' });

      // Cancel edit
      component.cancelEdit();

      expect(component.editingTag()).toBeNull();
      expect(component.tagForm.get('name')?.value).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tags list', () => {
      mockTagService.getTags.mockReturnValue(of([]));

      component.loadTags();

      expect(component.tags()).toEqual([]);
    });

    it('should handle tag with special characters', () => {
      component.tagForm.patchValue({ name: 'tag-with-@#$%' });

      component.saveTag();

      expect(mockTagService.createTag).toHaveBeenCalledWith('tag-with-@#$%');
    });

    it('should handle very long tag names', () => {
      const longName = 'a'.repeat(100);
      component.tagForm.patchValue({ name: longName });

      component.saveTag();

      expect(mockTagService.createTag).toHaveBeenCalledWith(longName);
    });

    it('should handle null/undefined tag in edit', () => {
      expect(() => {
        component.editTag(null as any);
      }).toThrow();
    });

    it('should handle tags with numeric names', () => {
      component.tagForm.patchValue({ name: '123' });

      component.saveTag();

      expect(mockTagService.createTag).toHaveBeenCalledWith('123');
    });

    it('should handle tags with mixed case', () => {
      component.tagForm.patchValue({ name: 'MixedCase' });

      component.saveTag();

      expect(mockTagService.createTag).toHaveBeenCalledWith('MixedCase');
    });
  });
});
