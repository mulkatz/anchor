import Dexie, { type EntityTable } from 'dexie';

/**
 * IndexedDB database setup with Dexie
 * Provides offline-first data storage
 */

// Define your data models here
export interface ExampleItem {
  id?: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the database
export const db = new Dexie('YourAppDatabase') as Dexie & {
  exampleItems: EntityTable<ExampleItem, 'id'>;
};

// Schema declaration
db.version(1).stores({
  exampleItems: '++id, name, createdAt, updatedAt',
});

// Hooks for automatic timestamps
db.exampleItems.hook('creating', (primKey, obj) => {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.exampleItems.hook('updating', (modifications) => {
  (modifications as Partial<ExampleItem>).updatedAt = new Date();
});
