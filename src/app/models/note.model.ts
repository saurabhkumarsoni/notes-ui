export interface Note {
  _id?: string; // MongoDB
  id?: string; // SQL or unified format
  name: string;
  content: string;
  quoteId?: string;
  tags: { name: string }[];
  categoryId: null;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  priority: string;
  isArchived?: boolean;
  isTrashed?: boolean;
  reminderAt?: string;
}

interface Category {
  id: number;
  name: string;
}
