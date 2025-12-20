import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Deep Talk chat function
export { onMessageCreate } from './chat';

// Export conversation management functions
export { generateConversationTitle, enforceSingleActiveConversation } from './conversations';

// Export audio transcription functions
export {
  onAudioMessageCreate,
  onDiveAudioMessageCreate,
  transcribeAudioCallable,
} from './transcription';

// Export The Dive somatic learning functions
export { onDiveMessageCreate, onDiveSessionCreate, getDiveLesson } from './diveChat';

// Export Illuminate (Lighthouse) AI functions
export { analyzeDistortions, generateReframes } from './illuminate';

// Export Insight (Beacon) AI functions
export { generateWeeklyInsight, markInsightViewed, rateInsight } from './insight';

// Export Psychological Profile functions
export { createPsychologicalProfile } from './psychologicalProfile';
