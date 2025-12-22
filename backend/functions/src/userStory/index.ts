/**
 * UserStory Module
 * Progressive user profiling through natural conversation
 */

// Types
export * from './types';

// Extraction
export { extractStoryFromMessage, recordQuestionAsked } from './extraction';

// Context for prompt injection
export {
  getUserStory,
  getUserStoryForPrompt,
  getUserStoryForPromptDE,
  getLocalizedStoryContext,
} from './context';

// Prompts (for testing/debugging)
export {
  getExtractionPrompt,
  formatStoryForExtractionPrompt,
  formatRecentContext,
} from './prompts';
