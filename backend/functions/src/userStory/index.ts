/**
 * UserStory Module
 * Progressive user profiling through natural conversation
 */

// Types
export * from './types';

// Extraction
export { extractStoryFromMessage, recordQuestionAsked, applyTopicExtractions } from './extraction';

// Context for prompt injection
export {
  getUserStory,
  getUserStoryForPrompt,
  getUserStoryForPromptDE,
  getLocalizedStoryContext,
  // Mid-term memory (recent topics)
  getRecentTopicsForPrompt,
  getRecentTopicsForPromptDE,
  getLocalizedRecentTopicsContext,
} from './context';

// Prompts (for testing/debugging)
export {
  getExtractionPrompt,
  formatStoryForExtractionPrompt,
  formatRecentContext,
} from './prompts';
