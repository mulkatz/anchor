# Treasures (Achievement System)

**Ocean-themed gamification** | **18 Total Achievements**

---

## Philosophy

- **Motivating without pressure** - celebrate progress, never punish
- **Ocean/deep-sea metaphors** - "First Light" not "Bronze Badge"
- **Gentle language** - no "failed" or "lost streak" messaging
- **Celebrate small wins AND major milestones**

---

## Achievement Categories

### Chat (Deep Talk) - 3 Achievements

| ID                    | Name                | Requirement      | Icon          |
| --------------------- | ------------------- | ---------------- | ------------- |
| `first_light`         | First Light         | 1 conversation   | Sunrise       |
| `echoes_in_the_deep`  | Echoes in the Deep  | 10 conversations | MessageCircle |
| `the_depths_know_you` | The Depths Know You | 50 conversations | Anchor        |

### Dive (Somatic Lessons) - 4 Achievements

| ID                   | Name               | Requirement                | Icon     |
| -------------------- | ------------------ | -------------------------- | -------- |
| `first_descent`      | First Descent      | 1 lesson completed         | Sailboat |
| `twilight_explorer`  | Twilight Explorer  | 5 lessons completed        | Waves    |
| `midnight_navigator` | Midnight Navigator | 15 lessons completed       | Compass  |
| `trench_walker`      | Trench Walker      | 25 lessons completed (all) | Shell    |

### Lighthouse (Illuminate Reflections) - 3 Achievements

| ID                  | Name              | Requirement    | Icon     |
| ------------------- | ----------------- | -------------- | -------- |
| `first_beam`        | First Beam        | 1 reflection   | Sun      |
| `pattern_spotter`   | Pattern Spotter   | 5 reflections  | Eye      |
| `lighthouse_keeper` | Lighthouse Keeper | 25 reflections | Landmark |

### Tide Log (Daily Check-ins) - 4 Achievements

| ID                | Name            | Requirement | Icon       |
| ----------------- | --------------- | ----------- | ---------- |
| `first_tide`      | First Tide      | 1 log       | Droplet    |
| `reef_builder`    | Reef Builder    | 7 logs      | Fish       |
| `coral_garden`    | Coral Garden    | 30 logs     | Gem        |
| `tide_chronicler` | Tide Chronicler | 100 logs    | ScrollText |

### Streaks (Gentle Consistency) - 3 Achievements

| ID               | Name           | Requirement   | Icon     |
| ---------------- | -------------- | ------------- | -------- |
| `gentle_current` | Gentle Current | 3-day streak  | Sparkles |
| `steady_tide`    | Steady Tide    | 7-day streak  | Ship     |
| `moon_cycle`     | Moon Cycle     | 30-day streak | Moon     |

### Milestones (Special Moments) - 1 Achievement

| ID             | Name         | Requirement    | Icon |
| -------------- | ------------ | -------------- | ---- |
| `deep_release` | Deep Release | 1 released log | Wind |

---

## Data Model

### Firestore Structure

```
users/{userId}/achievements/summary
  - unlockedAchievements: string[]
  - achievementDates: { [achievementId]: Timestamp }
  - stats: {
      conversations: number
      dive_lessons: number
      illuminate_entries: number
      daily_logs: number
      released_logs: number
      current_streak: number
      longest_streak: number
      last_activity_date: string (YYYY-MM-DD)
    }
  - createdAt, updatedAt: Timestamp

users/{userId}/activity_log/{YYYY-MM-DD}
  - date: string
  - activities: string[] ('chat' | 'dive' | 'lighthouse' | 'tidelog')
  - updatedAt: Timestamp
```

---

## Trigger Architecture

### Client-Side Detection

`useAchievementTracker.tsx` listens to Firestore collections:

| Collection              | Metric                  | Achievements                |
| ----------------------- | ----------------------- | --------------------------- |
| `conversations`         | count                   | chat (3)                    |
| `dive_progress/summary` | completedLessons.length | dive (4)                    |
| `illuminate_entries`    | count                   | lighthouse (3)              |
| `daily_logs`            | count + is_released     | tidelog (4) + milestone (1) |

### Server-Side Streak Calculation

Cloud Function `onActivityLogWrite` triggers on `activity_log/{date}` writes:

1. Fetches all activity_log documents for user
2. Calculates current streak from consecutive dates
3. Updates `achievements/summary` with streak stats
4. Unlocks streak achievements if thresholds met

### Activity Logging

Activities are logged for streak tracking when:

- **chat**: New conversation created
- **dive**: Dive lesson completed
- **lighthouse**: Illuminate entry saved
- **tidelog**: Daily log created

Only one activity per type per day counts (idempotent via `arrayUnion`).

---

## UI Components

### AchievementsPage (`/treasures`)

- Header with title + progress count
- StreakCard at top (warm-ember themed)
- Category sections with achievement grids

### AchievementCard

- **Locked**: Muted icon, progress ring, lock badge
- **Unlocked**: Cyan icon, transparent background

### StreakCard

- Warm-ember color scheme (differentiates from cyan achievements)
- Shows current streak + next milestone
- "Personal best!" badge when at longest streak
- Compact zero-state with encouragement

### AchievementToast

- Triggered on new unlock
- Biolum-cyan styling with glow
- 4-second duration
- Medium haptic feedback

### Profile Integration

- Treasures card at top of Profile page
- Shows progress bar and count
- Navigates to AchievementsPage

---

## Key Files

| File                                        | Purpose                           |
| ------------------------------------------- | --------------------------------- |
| `app/src/data/achievements.ts`              | Achievement definitions           |
| `app/src/contexts/AchievementContext.tsx`   | State + Firestore sync + caching  |
| `app/src/hooks/useAchievementTracker.tsx`   | Firestore listeners for triggers  |
| `app/src/pages/AchievementsPage.tsx`        | Main achievements page            |
| `app/src/components/features/achievements/` | UI components                     |
| `backend/functions/src/achievements.ts`     | Streak calculation Cloud Function |

---

## Testing

### Debug Function (DEV only)

```javascript
// In browser console
testAchievementToast('first_light'); // Show toast for specific achievement
testAchievementToast(); // Show toast for 'first_light'
```

### Manual Testing

1. **Chat**: Start a new conversation
2. **Dive**: Complete a lesson in The Dive
3. **Lighthouse**: Save an Illuminate reflection
4. **Tidelog**: Create a daily log entry
5. **Streak**: Perform any activity on consecutive days
6. **Release**: Mark a daily log as released

---

_Last Updated: December 2024_
