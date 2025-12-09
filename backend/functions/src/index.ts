import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Deep Talk chat function
export { onMessageCreate } from './chat';

// Export conversation management functions
export { generateConversationTitle, enforceSingleActiveConversation } from './conversations';

// Export audio transcription function
export { onAudioMessageCreate } from './transcription';
