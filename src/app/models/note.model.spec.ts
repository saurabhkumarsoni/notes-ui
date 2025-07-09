import { Note } from './note.model';

describe('Note Model', () => {
  describe('Note interface', () => {
    it('should create a valid note with required fields', () => {
      const note: Note = {
        name: 'Test Note',
        content: 'This is test content',
        tags: [{ name: 'test' }],
        categoryId: null,
        priority: 'medium',
      };

      expect(note.name).toBe('Test Note');
      expect(note.content).toBe('This is test content');
      expect(note.tags).toEqual([{ name: 'test' }]);
      expect(note.categoryId).toBeNull();
      expect(note.priority).toBe('medium');
    });

    it('should create a note with all optional fields', () => {
      const testDate = new Date('2024-01-01T10:00:00Z');
      const note: Note = {
        _id: 'mongo-id-123',
        id: 'sql-id-456',
        name: 'Complete Note',
        content: 'Full content with all fields',
        quoteId: 'quote-789',
        tags: [{ name: 'work' }, { name: 'important' }],
        categoryId: null,
        userId: 'user-123',
        createdAt: testDate,
        updatedAt: testDate,
        priority: 'high',
        isArchived: false,
        isTrashed: false,
        reminderAt: '2024-01-01T10:00:00Z',
      };

      expect(note._id).toBe('mongo-id-123');
      expect(note.id).toBe('sql-id-456');
      expect(note.name).toBe('Complete Note');
      expect(note.content).toBe('Full content with all fields');
      expect(note.quoteId).toBe('quote-789');
      expect(note.tags).toEqual([{ name: 'work' }, { name: 'important' }]);
      expect(note.categoryId).toBeNull();
      expect(note.userId).toBe('user-123');
      expect(note.createdAt).toEqual(testDate);
      expect(note.updatedAt).toEqual(testDate);
      expect(note.priority).toBe('high');
      expect(note.isArchived).toBe(false);
      expect(note.isTrashed).toBe(false);
      expect(note.reminderAt).toBe('2024-01-01T10:00:00Z');
    });

    it('should allow empty tags array', () => {
      const note: Note = {
        name: 'Note without tags',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'low',
      };

      expect(note.tags).toEqual([]);
    });

    it('should allow multiple tags', () => {
      const note: Note = {
        name: 'Multi-tag note',
        content: 'Content',
        tags: [
          { name: 'work' },
          { name: 'urgent' },
          { name: 'meeting' },
          { name: 'project-alpha' },
        ],
        categoryId: null,
        priority: 'high',
      };

      expect(note.tags.length).toBe(4);
      expect(note.tags[0].name).toBe('work');
      expect(note.tags[3].name).toBe('project-alpha');
    });

    it('should support different priority levels', () => {
      const lowPriorityNote: Note = {
        name: 'Low Priority',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'low',
      };

      const mediumPriorityNote: Note = {
        name: 'Medium Priority',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'medium',
      };

      const highPriorityNote: Note = {
        name: 'High Priority',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'high',
      };

      expect(lowPriorityNote.priority).toBe('low');
      expect(mediumPriorityNote.priority).toBe('medium');
      expect(highPriorityNote.priority).toBe('high');
    });

    it('should support archived state', () => {
      const archivedNote: Note = {
        name: 'Archived Note',
        content: 'This note is archived',
        tags: [],
        categoryId: null,
        priority: 'medium',
        isArchived: true,
        isTrashed: false,
      };

      expect(archivedNote.isArchived).toBe(true);
      expect(archivedNote.isTrashed).toBe(false);
    });

    it('should support trashed state', () => {
      const trashedNote: Note = {
        name: 'Trashed Note',
        content: 'This note is trashed',
        tags: [],
        categoryId: null,
        priority: 'medium',
        isArchived: false,
        isTrashed: true,
      };

      expect(trashedNote.isArchived).toBe(false);
      expect(trashedNote.isTrashed).toBe(true);
    });

    it('should support reminder functionality', () => {
      const noteWithReminder: Note = {
        name: 'Meeting Note',
        content: 'Important meeting tomorrow',
        tags: [{ name: 'meeting' }],
        categoryId: null,
        priority: 'high',
        reminderAt: '2024-01-02T09:00:00Z',
      };

      expect(noteWithReminder.reminderAt).toBe('2024-01-02T09:00:00Z');
    });

    it('should support both MongoDB and SQL id formats', () => {
      const mongoNote: Note = {
        _id: '507f1f77bcf86cd799439011',
        name: 'MongoDB Note',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'medium',
      };

      const sqlNote: Note = {
        id: '123',
        name: 'SQL Note',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'medium',
      };

      const hybridNote: Note = {
        _id: '507f1f77bcf86cd799439011',
        id: '123',
        name: 'Hybrid Note',
        content: 'Content',
        tags: [],
        categoryId: null,
        priority: 'medium',
      };

      expect(mongoNote._id).toBe('507f1f77bcf86cd799439011');
      expect(mongoNote.id).toBeUndefined();

      expect(sqlNote.id).toBe('123');
      expect(sqlNote._id).toBeUndefined();

      expect(hybridNote._id).toBe('507f1f77bcf86cd799439011');
      expect(hybridNote.id).toBe('123');
    });

    it('should support quote references', () => {
      const noteWithQuote: Note = {
        name: 'Inspirational Quote',
        content: 'Remember this quote for later',
        quoteId: 'quote-inspirational-123',
        tags: [{ name: 'quotes' }, { name: 'inspiration' }],
        categoryId: null,
        priority: 'medium',
      };

      expect(noteWithQuote.quoteId).toBe('quote-inspirational-123');
    });

    it('should support user association', () => {
      const userNote: Note = {
        name: 'Personal Note',
        content: 'This is my personal note',
        tags: [{ name: 'personal' }],
        categoryId: null,
        priority: 'medium',
        userId: 'user-abc-123',
      };

      expect(userNote.userId).toBe('user-abc-123');
    });

    it('should handle date objects for timestamps', () => {
      const now = new Date();
      const note: Note = {
        name: 'Timestamped Note',
        content: 'Note with timestamps',
        tags: [],
        categoryId: null,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      };

      expect(note.createdAt).toEqual(now);
      expect(note.updatedAt).toEqual(now);
      expect(note.createdAt instanceof Date).toBe(true);
      expect(note.updatedAt instanceof Date).toBe(true);
    });
  });
});
