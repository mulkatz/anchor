import * as logger from 'firebase-functions/logger';
import { VertexAI } from '@google-cloud/vertexai';
import { trackUsage, extractTokenUsage } from './usage';

/**
 * Conversation Title Generation
 *
 * AI-generated titles, summaries, and topic tags for conversations.
 * Uses progressive generation:
 * - Draft: After 3+ user messages
 * - Final: On archive
 */

// ============================================
// Types
// ============================================

export interface TitleGenerationResult {
  title: string; // Max 50 chars
  summary: string; // Max 140 chars
  topics: string[]; // 2-3 topics
}

// Predefined topic vocabulary (for consistent tagging)
const TOPIC_VOCABULARY = {
  'en-US': [
    'work',
    'relationships',
    'family',
    'health',
    'sleep',
    'social',
    'finances',
    'self-worth',
    'future',
    'past',
    'breathing',
    'grounding',
    'panic',
    'overwhelm',
    'loneliness',
    'uncertainty',
    'perfectionism',
    'boundaries',
    'change',
    'loss',
  ],
  'de-DE': [
    'arbeit',
    'beziehungen',
    'familie',
    'gesundheit',
    'schlaf',
    'soziales',
    'finanzen',
    'selbstwert',
    'zukunft',
    'vergangenheit',
    'atmung',
    'erdung',
    'panik',
    'ueberforderung',
    'einsamkeit',
    'unsicherheit',
    'perfektionismus',
    'grenzen',
    'veraenderung',
    'verlust',
  ],
};

// ============================================
// JSON Parser
// ============================================

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
function parseAIJsonResponse<T>(responseText: string): T {
  let cleanedText = responseText.trim();

  if (cleanedText.startsWith('```')) {
    const lines = cleanedText.split('\n');
    lines.shift();
    if (lines[lines.length - 1]?.trim() === '```') {
      lines.pop();
    }
    cleanedText = lines.join('\n');
  }

  return JSON.parse(cleanedText);
}

// ============================================
// Prompt Templates
// ============================================

function getTitleGenerationPrompt(language: string): string {
  const isGerman = language.startsWith('de');
  const topics = TOPIC_VOCABULARY[isGerman ? 'de-DE' : 'en-US'].join(', ');

  if (isGerman) {
    return `Du bist ein warmherziger, einfühlsamer Titel-Generator für persönliche Gespräche.

AUFGABE:
Analysiere das Gespräch und generiere:
1. Einen TITEL (max 50 Zeichen) - kreativ und warmherzig
2. Eine ZUSAMMENFASSUNG (2-3 kurze Sätze) - warm, persönlich, wie ein Freund es beschreiben würde
3. 2-3 THEMEN-TAGS aus dieser Liste: ${topics}

TITEL-STIL:
- Kreativ und poetisch, aber verständlich
- Beispiele: "Arbeitssorgen navigieren", "Sonntags-Gedanken entwirren", "Atempause finden", "Beziehungsfragen klären"
- Vermeide klinische oder kalte Sprache
- Fokussiere auf das Thema, nicht den Nutzer

ZUSAMMENFASSUNG-STIL:
- Warm und freundlich, wie ein guter Freund
- Starte direkt mit dem Wesentlichen, NICHT mit "Ein Gespräch über..." oder "Ein Chat über..."
- Kurz aber bedeutungsvoll
- Beispiele: "Die kleinen Sorgen des Alltags und wie wir gemeinsam durchatmen können.", "Schwierige Gefühle bei der Arbeit verarbeiten und schauen was kommt.", "Einen harten Tag verdauen und sich erinnern was zählt."

ANTWORT-FORMAT (nur JSON, keine Markdown):
{
  "title": "Der generierte Titel",
  "summary": "Warme, freundliche Zusammenfassung...",
  "topics": ["thema1", "thema2"]
}`;
  }

  return `You are a warm, empathetic title generator for personal conversations.

TASK:
Analyze the conversation and generate:
1. A TITLE (max 50 chars) - creative and warm
2. A SUMMARY (1-2 short sentences) - warm, personal, like a friend would describe it
3. 2-3 TOPIC TAGS from this list: ${topics}

TITLE STYLE:
- Creative and poetic, but clear
- Examples: "Navigating Work Worries", "Untangling Sunday Thoughts", "Finding Breathing Room", "Sorting Through Relationship Questions"
- Avoid clinical or cold language
- Focus on the theme, not the user

SUMMARY STYLE:
- Warm and friendly, like a good friend would write
- Start directly with the essence, NOT with "A chat about..." or "A conversation about..."
- Short but meaningful
- Examples: "Everyday worries and finding a moment to breathe together.", "Working through some tough feelings about work and what comes next.", "Processing a difficult day and remembering what matters."

RESPONSE FORMAT (JSON only, no markdown):
{
  "title": "The generated title",
  "summary": "Warm, friendly summary starting directly with the topic...",
  "topics": ["topic1", "topic2"]
}`;
}

// ============================================
// Core Generation Function
// ============================================

export async function generateConversationTitleAndSummary(
  userId: string,
  conversationId: string,
  messages: Array<{ role: string; text: string }>,
  language: string,
  version: 'draft' | 'final'
): Promise<TitleGenerationResult | null> {
  // Build conversation text for AI
  const conversationText = messages
    .slice(-20) // Use last 20 messages max for context
    .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
    .join('\n\n');

  const vertexAI = new VertexAI({
    project: process.env.GCLOUD_PROJECT,
    location: 'us-central1',
  });

  const model = vertexAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: getTitleGenerationPrompt(language),
  });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate title, summary, and topics for this ${version === 'draft' ? 'ongoing' : 'completed'} conversation:\n\n${conversationText}`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.4,
      topP: 0.8,
    },
  });

  // Track usage
  const tokenUsage = extractTokenUsage(result);
  trackUsage({
    userId,
    timestamp: new Date(),
    service: 'ai_gemini_25_flash',
    feature: 'conversation_title',
    model: 'gemini-2.5-flash',
    inputTokens: tokenUsage.inputTokens,
    outputTokens: tokenUsage.outputTokens,
  });

  const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    logger.error('No response from AI for title generation', { userId, conversationId });
    return null;
  }

  // Parse JSON response
  try {
    const parsed = parseAIJsonResponse<TitleGenerationResult>(responseText);

    // Get valid topics for the language
    const isGerman = language.startsWith('de');
    const validTopics = TOPIC_VOCABULARY[isGerman ? 'de-DE' : 'en-US'];

    // Validate and sanitize (no length trim - frontend handles with line-clamp)
    return {
      title: (parsed.title || '').trim(),
      summary: (parsed.summary || '').trim(),
      topics: (parsed.topics || [])
        .filter((t) => typeof t === 'string')
        .slice(0, 3)
        .map((t) => t.toLowerCase().trim())
        .filter((t) => validTopics.includes(t)), // Only keep valid topics
    };
  } catch (error) {
    logger.error('Failed to parse title generation response', {
      userId,
      conversationId,
      responseText,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
