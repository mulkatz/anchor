/**
 * Therapeutic Journaling Prompts (Soundings)
 * CBT-based prompts to guide reflection in Depths
 */

export type PromptCategory =
  | 'anxiety_exploration'
  | 'cognitive_reframe'
  | 'gratitude'
  | 'self_compassion'
  | 'progress_reflection'
  | 'trigger_awareness';

export interface JournalingPrompt {
  id: string;
  category: PromptCategory;
  textKey: string; // i18n key
  fallbackText: string; // English fallback
}

/**
 * Therapeutic prompts organized by category
 * Each prompt guides users toward helpful reflection patterns
 */
export const journalingPrompts: JournalingPrompt[] = [
  // Anxiety Exploration - Understanding current feelings
  {
    id: 'ax_1',
    category: 'anxiety_exploration',
    textKey: 'soundings.prompts.ax1',
    fallbackText: "What's weighing on my mind right now?",
  },
  {
    id: 'ax_2',
    category: 'anxiety_exploration',
    textKey: 'soundings.prompts.ax2',
    fallbackText: 'If my anxiety could talk, what would it be trying to tell me?',
  },
  {
    id: 'ax_3',
    category: 'anxiety_exploration',
    textKey: 'soundings.prompts.ax3',
    fallbackText: 'Where do I feel tension in my body right now?',
  },
  {
    id: 'ax_4',
    category: 'anxiety_exploration',
    textKey: 'soundings.prompts.ax4',
    fallbackText: 'What thought keeps replaying in my mind?',
  },

  // Cognitive Reframe - Challenging distorted thinking
  {
    id: 'cr_1',
    category: 'cognitive_reframe',
    textKey: 'soundings.prompts.cr1',
    fallbackText: 'What evidence do I have for and against this worry?',
  },
  {
    id: 'cr_2',
    category: 'cognitive_reframe',
    textKey: 'soundings.prompts.cr2',
    fallbackText: 'What would I tell a friend who had this same thought?',
  },
  {
    id: 'cr_3',
    category: 'cognitive_reframe',
    textKey: 'soundings.prompts.cr3',
    fallbackText: 'Will this matter in a week? A month? A year?',
  },
  {
    id: 'cr_4',
    category: 'cognitive_reframe',
    textKey: 'soundings.prompts.cr4',
    fallbackText: "What's a more balanced way to look at this situation?",
  },

  // Gratitude - Shifting focus to positives
  {
    id: 'gr_1',
    category: 'gratitude',
    textKey: 'soundings.prompts.gr1',
    fallbackText: 'What small thing brought me comfort today?',
  },
  {
    id: 'gr_2',
    category: 'gratitude',
    textKey: 'soundings.prompts.gr2',
    fallbackText: 'Who or what made me feel supported recently?',
  },
  {
    id: 'gr_3',
    category: 'gratitude',
    textKey: 'soundings.prompts.gr3',
    fallbackText: 'What went better than expected lately?',
  },

  // Self-Compassion - Being kind to oneself
  {
    id: 'sc_1',
    category: 'self_compassion',
    textKey: 'soundings.prompts.sc1',
    fallbackText: "What do I need to hear right now that I'm not telling myself?",
  },
  {
    id: 'sc_2',
    category: 'self_compassion',
    textKey: 'soundings.prompts.sc2',
    fallbackText: 'How can I be gentler with myself today?',
  },
  {
    id: 'sc_3',
    category: 'self_compassion',
    textKey: 'soundings.prompts.sc3',
    fallbackText: 'What would I say to comfort my younger self feeling this way?',
  },

  // Progress Reflection - Acknowledging growth
  {
    id: 'pr_1',
    category: 'progress_reflection',
    textKey: 'soundings.prompts.pr1',
    fallbackText: 'How have I grown in handling anxiety compared to before?',
  },
  {
    id: 'pr_2',
    category: 'progress_reflection',
    textKey: 'soundings.prompts.pr2',
    fallbackText: 'What coping strategy worked well for me recently?',
  },
  {
    id: 'pr_3',
    category: 'progress_reflection',
    textKey: 'soundings.prompts.pr3',
    fallbackText: "What's one small victory I can acknowledge?",
  },

  // Trigger Awareness - Understanding patterns
  {
    id: 'ta_1',
    category: 'trigger_awareness',
    textKey: 'soundings.prompts.ta1',
    fallbackText: 'What triggered my anxiety today? Was it a thought, event, or sensation?',
  },
  {
    id: 'ta_2',
    category: 'trigger_awareness',
    textKey: 'soundings.prompts.ta2',
    fallbackText: 'Do I notice any patterns in when I feel most anxious?',
  },
  {
    id: 'ta_3',
    category: 'trigger_awareness',
    textKey: 'soundings.prompts.ta3',
    fallbackText: 'What situations tend to make my anxiety better or worse?',
  },
];

/**
 * Get a random selection of prompts across categories
 * Ensures variety by picking from different categories
 */
export function getRandomPrompts(count: number = 3): JournalingPrompt[] {
  const categories: PromptCategory[] = [
    'anxiety_exploration',
    'cognitive_reframe',
    'gratitude',
    'self_compassion',
    'progress_reflection',
    'trigger_awareness',
  ];

  // Shuffle categories
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);

  const result: JournalingPrompt[] = [];

  // Pick one prompt from each category until we have enough
  for (let i = 0; i < count && i < shuffledCategories.length; i++) {
    const category = shuffledCategories[i];
    const categoryPrompts = journalingPrompts.filter((p) => p.category === category);
    const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
    if (randomPrompt) {
      result.push(randomPrompt);
    }
  }

  return result;
}

/**
 * Get prompts for a specific category
 */
export function getPromptsByCategory(category: PromptCategory): JournalingPrompt[] {
  return journalingPrompts.filter((p) => p.category === category);
}
