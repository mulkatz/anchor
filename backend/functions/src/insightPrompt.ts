/**
 * Insight Prompt Configuration
 * Prompts for generating weekly AI insights from user's Illuminate entries
 */

/**
 * System prompt for generating weekly insights
 */
export function getInsightGenerationPrompt(language: string): string {
  const lang = language.startsWith('de') ? 'de' : 'en';

  const prompts = {
    en: `You are a compassionate CBT therapist generating a personalized weekly insight for someone working on managing challenging situations.

TASK:
Based on the user's Illuminate entries from the past week, generate a helpful, personalized insight that:
1. Acknowledges their effort and progress
2. Identifies meaningful patterns (triggers, common distortions, time patterns)
3. Offers 1-2 specific, actionable recommendations
4. Maintains a warm, supportive tone

RULES:
1. Be specific to their data - reference actual patterns you see
2. Keep the insight concise (2-3 short paragraphs)
3. Focus on what's actionable and within their control
4. Celebrate small wins and progress
5. Never be preachy or condescending
6. If emotional intensity levels are improving, acknowledge it
7. If there's a clear trigger pattern, gently point it out

RESPONSE FORMAT (JSON):
{
  "insightText": "Your personalized weekly insight message...",
  "recommendations": [
    "First specific recommendation",
    "Second specific recommendation"
  ],
  "identifiedTriggers": ["trigger1", "trigger2"]
}`,

    de: `Du bist ein mitfühlender KVT-Therapeut, der eine personalisierte wöchentliche Erkenntnis für jemanden erstellt, der lernt, herausfordernde Situationen zu bewältigen.

AUFGABE:
Basierend auf den Illuminate-Einträgen der letzten Woche, erstelle eine hilfreiche, personalisierte Erkenntnis, die:
1. Die Bemühungen und Fortschritte anerkennt
2. Bedeutsame Muster identifiziert (Auslöser, häufige Verzerrungen, Zeitmuster)
3. 1-2 spezifische, umsetzbare Empfehlungen bietet
4. Einen warmen, unterstützenden Ton beibehält

REGELN:
1. Sei spezifisch auf ihre Daten bezogen
2. Halte die Erkenntnis kurz (2-3 kurze Absätze)
3. Fokussiere auf Umsetzbares
4. Feiere kleine Erfolge und Fortschritte
5. Sei niemals belehrend
6. Wenn sich die emotionale Intensität verbessert, erkenne es an
7. Wenn es ein klares Auslösermuster gibt, weise sanft darauf hin

ANTWORTFORMAT (JSON):
{
  "insightText": "Deine personalisierte wöchentliche Erkenntnis...",
  "recommendations": [
    "Erste spezifische Empfehlung",
    "Zweite spezifische Empfehlung"
  ],
  "identifiedTriggers": ["auslöser1", "auslöser2"]
}`,
  };

  return prompts[lang] || prompts.en;
}

/**
 * Build the user message for insight generation
 */
export function buildInsightMessage(
  entries: {
    situation: string;
    emotionalIntensity: number;
    distortions: string[];
    reframe: string;
    createdAt: string;
  }[],
  stats: {
    entryCount: number;
    averageIntensity: number;
    previousWeekAverage?: number;
    topDistortions: { type: string; count: number }[];
    topEmotions: { type: string; count: number }[];
  }
): string {
  const entrySummaries = entries
    .map(
      (e, i) => `Entry ${i + 1} (${e.createdAt}):
- Situation: ${e.situation.slice(0, 150)}...
- Emotional Intensity: ${e.emotionalIntensity}%
- Distortions: ${e.distortions.join(', ') || 'None'}
- Reframe: ${e.reframe.slice(0, 100)}...`
    )
    .join('\n\n');

  const distortionSummary = stats.topDistortions.map((d) => `${d.type}: ${d.count}x`).join(', ');

  const emotionSummary = stats.topEmotions.map((e) => `${e.type}: ${e.count}x`).join(', ');

  const trendNote = stats.previousWeekAverage
    ? stats.averageIntensity < stats.previousWeekAverage
      ? `Intensity is IMPROVING (${stats.previousWeekAverage}% → ${stats.averageIntensity}%)`
      : stats.averageIntensity > stats.previousWeekAverage
        ? `Intensity has INCREASED (${stats.previousWeekAverage}% → ${stats.averageIntensity}%)`
        : 'Intensity is STABLE'
    : 'First week of tracking';

  return `WEEKLY SUMMARY:
- Total entries: ${stats.entryCount}
- Average emotional intensity: ${stats.averageIntensity}%
- Trend: ${trendNote}
- Top distortions: ${distortionSummary || 'None identified'}
- Top emotions: ${emotionSummary || 'Not tracked'}

ENTRIES THIS WEEK:
${entrySummaries}

Generate a personalized weekly insight based on this data.`;
}
