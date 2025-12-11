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

// Journal entry for Depths feature (stored locally for offline-first)
export interface LocalJournalSession {
  id: string; // UUID
  text: string;
  startedAt: Date;
  fixedAt: Date | null;
  wordCount: number;
}

export interface LocalJournalEntry {
  id?: number; // Auto-increment local ID
  firestoreId?: string; // Firestore document ID (for sync)
  userId: string;
  date: string; // YYYY-MM-DD (primary lookup key)
  sessions: LocalJournalSession[];
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict'; // Track sync state
  lastSyncedAt?: Date;
}

// Create the database
export const db = new Dexie('AnxietyBuddyDatabase') as Dexie & {
  exampleItems: EntityTable<ExampleItem, 'id'>;
  journalEntries: EntityTable<LocalJournalEntry, 'id'>;
};

// Schema declaration - increment version when adding tables
db.version(1).stores({
  exampleItems: '++id, name, createdAt, updatedAt',
});

db.version(2).stores({
  exampleItems: '++id, name, createdAt, updatedAt',
  journalEntries: '++id, firestoreId, userId, date, syncStatus, createdAt, updatedAt',
});

// Hooks for automatic timestamps
db.exampleItems.hook('creating', (primKey, obj) => {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.exampleItems.hook('updating', (modifications) => {
  (modifications as Partial<ExampleItem>).updatedAt = new Date();
});

db.journalEntries.hook('creating', (primKey, obj) => {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
  if (!obj.syncStatus) {
    obj.syncStatus = 'pending';
  }
});

db.journalEntries.hook('updating', (modifications) => {
  (modifications as Partial<LocalJournalEntry>).updatedAt = new Date();
  // Mark as pending sync when updated locally
  if ((modifications as Partial<LocalJournalEntry>).sessions !== undefined) {
    (modifications as Partial<LocalJournalEntry>).syncStatus = 'pending';
  }
});
