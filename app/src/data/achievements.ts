import type { AchievementDefinition, AchievementCategory } from '../models';

/**
 * Achievement Definitions
 *
 * All achievements follow ocean-themed naming to match the app's aesthetic.
 * Philosophy:
 * - Motivating without pressure
 * - Celebrating small wins AND major milestones
 * - Gentle language (no "failed" or "lost" messaging)
 */

export const achievements: AchievementDefinition[] = [
  // ============================================
  // CHAT (Deep Talk) - 3 achievements
  // ============================================
  {
    id: 'first_light',
    category: 'chat',
    iconName: 'Sunrise',
    requirement: { type: 'count', target: 1, metric: 'conversations' },
    order: 1,
  },
  {
    id: 'echoes_in_the_deep',
    category: 'chat',
    iconName: 'MessageCircle',
    requirement: { type: 'count', target: 10, metric: 'conversations' },
    order: 2,
  },
  {
    id: 'the_depths_know_you',
    category: 'chat',
    iconName: 'Anchor',
    requirement: { type: 'count', target: 50, metric: 'conversations' },
    order: 3,
  },

  // ============================================
  // THE DIVE (Somatic Lessons) - 4 achievements
  // ============================================
  {
    id: 'first_descent',
    category: 'dive',
    iconName: 'ArrowDownToLine',
    requirement: { type: 'count', target: 1, metric: 'dive_lessons' },
    order: 1,
  },
  {
    id: 'twilight_explorer',
    category: 'dive',
    iconName: 'Waves',
    requirement: { type: 'count', target: 5, metric: 'dive_lessons' },
    order: 2,
  },
  {
    id: 'midnight_navigator',
    category: 'dive',
    iconName: 'Compass',
    requirement: { type: 'count', target: 15, metric: 'dive_lessons' },
    order: 3,
  },
  {
    id: 'trench_walker',
    category: 'dive',
    iconName: 'Shell',
    requirement: { type: 'milestone', target: 25, metric: 'dive_lessons' },
    order: 4,
  },

  // ============================================
  // LIGHTHOUSE (Illuminate Reflections) - 3 achievements
  // ============================================
  {
    id: 'first_beam',
    category: 'lighthouse',
    iconName: 'Lightbulb',
    requirement: { type: 'count', target: 1, metric: 'illuminate_entries' },
    order: 1,
  },
  {
    id: 'pattern_spotter',
    category: 'lighthouse',
    iconName: 'Search',
    requirement: { type: 'count', target: 5, metric: 'illuminate_entries' },
    order: 2,
  },
  {
    id: 'lighthouse_keeper',
    category: 'lighthouse',
    iconName: 'Building2',
    requirement: { type: 'count', target: 25, metric: 'illuminate_entries' },
    order: 3,
  },

  // ============================================
  // TIDE LOG (Daily Check-ins) - 4 achievements
  // ============================================
  {
    id: 'first_tide',
    category: 'tidelog',
    iconName: 'Droplet',
    requirement: { type: 'count', target: 1, metric: 'daily_logs' },
    order: 1,
  },
  {
    id: 'reef_builder',
    category: 'tidelog',
    iconName: 'Flower2',
    requirement: { type: 'count', target: 7, metric: 'daily_logs' },
    order: 2,
  },
  {
    id: 'coral_garden',
    category: 'tidelog',
    iconName: 'TreeDeciduous',
    requirement: { type: 'count', target: 30, metric: 'daily_logs' },
    order: 3,
  },
  {
    id: 'tide_chronicler',
    category: 'tidelog',
    iconName: 'BookOpen',
    requirement: { type: 'count', target: 100, metric: 'daily_logs' },
    order: 4,
  },

  // ============================================
  // STREAKS (Gentle Consistency) - 3 achievements
  // ============================================
  {
    id: 'gentle_current',
    category: 'streak',
    iconName: 'Sparkles',
    requirement: { type: 'streak', target: 3, metric: 'activity_days' },
    order: 1,
  },
  {
    id: 'steady_tide',
    category: 'streak',
    iconName: 'TrendingUp',
    requirement: { type: 'streak', target: 7, metric: 'activity_days' },
    order: 2,
  },
  {
    id: 'moon_cycle',
    category: 'streak',
    iconName: 'Moon',
    requirement: { type: 'streak', target: 30, metric: 'activity_days' },
    order: 3,
  },

  // ============================================
  // MILESTONES (Special Moments) - 1 achievement
  // ============================================
  {
    id: 'deep_release',
    category: 'milestone',
    iconName: 'Wind',
    requirement: { type: 'count', target: 1, metric: 'released_logs' },
    order: 1,
  },
];

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (
  category: AchievementCategory
): AchievementDefinition[] => {
  return achievements.filter((a) => a.category === category).sort((a, b) => a.order - b.order);
};

/**
 * Get achievement by ID
 */
export const getAchievementById = (id: string): AchievementDefinition | undefined => {
  return achievements.find((a) => a.id === id);
};

/**
 * Category display order for UI
 */
export const categoryOrder: AchievementCategory[] = [
  'streak',
  'chat',
  'dive',
  'lighthouse',
  'tidelog',
  'milestone',
];

/**
 * Total achievement count
 */
export const TOTAL_ACHIEVEMENTS = achievements.length;
