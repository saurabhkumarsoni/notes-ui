export interface Note {
  _id?: string; // MongoDB
  id?: string; // SQL or unified format
  name: string;
  content: string;
  quoteId?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
