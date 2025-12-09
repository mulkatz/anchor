import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Deep Talk chat function
export { onMessageCreate } from './chat';
