/**
 * Illuminate Prompt Configuration
 * CBT-based prompts for cognitive distortion detection and reframe generation
 */

/**
 * Cognitive distortion definitions for AI detection
 */
export const COGNITIVE_DISTORTIONS = {
  catastrophizing: {
    name: 'Catastrophizing',
    description: 'Imagining the worst possible outcome',
    examples: [
      'If I fail this, my life is over',
      'This will be a complete disaster',
      'Everything is going to fall apart',
    ],
    indicators: ['worst', 'disaster', 'terrible', 'never recover', 'end of', 'ruined'],
  },
  mind_reading: {
    name: 'Mind Reading',
    description: 'Assuming you know what others are thinking without evidence',
    examples: ["They think I'm stupid", 'Everyone is judging me', 'She must hate me'],
    indicators: ['they think', 'everyone knows', 'they must', 'probably thinks', 'judging me'],
  },
  fortune_telling: {
    name: 'Fortune Telling',
    description: 'Predicting negative outcomes without evidence',
    examples: [
      'I know this will go wrong',
      "It's definitely going to fail",
      "There's no way this works out",
    ],
    indicators: ['will definitely', 'going to fail', 'know it will', 'no way', 'never going to'],
  },
  all_or_nothing: {
    name: 'All-or-Nothing Thinking',
    description: 'Seeing things in black-and-white, with no middle ground',
    examples: [
      "If I can't do it perfectly, why bother",
      "I either succeed completely or I'm a failure",
      'Everything is ruined because of one mistake',
    ],
    indicators: ['always', 'never', 'completely', 'totally', 'perfect or', 'either...or'],
  },
  emotional_reasoning: {
    name: 'Emotional Reasoning',
    description: 'Believing something is true because you feel it strongly',
    examples: [
      'I feel like a failure, so I must be one',
      'I feel anxious, so something bad must be happening',
      'I feel guilty, so I must have done something wrong',
    ],
    indicators: ['I feel like', 'feels like', 'must be true because I feel'],
  },
  should_statements: {
    name: 'Should Statements',
    description: 'Rigid rules about how things should be',
    examples: [
      'I should be able to handle this',
      "I shouldn't feel this way",
      'They should have known better',
    ],
    indicators: ['should', "shouldn't", 'must', 'have to', 'ought to'],
  },
  labeling: {
    name: 'Labeling',
    description: 'Attaching negative labels to yourself or others',
    examples: ["I'm such an idiot", "I'm a loser", "They're completely selfish"],
    indicators: ['I am a', "I'm such a", 'they are just', 'total', 'complete'],
  },
  personalization: {
    name: 'Personalization',
    description: 'Taking excessive responsibility for things outside your control',
    examples: [
      "It's all my fault they're upset",
      'If only I had done something different',
      'This happened because of me',
    ],
    indicators: ['my fault', 'because of me', 'if only I', 'I caused', 'I made'],
  },
  filtering: {
    name: 'Mental Filtering',
    description: 'Focusing only on negative aspects while ignoring positives',
    examples: [
      'The whole day was ruined because of that one comment',
      'Nothing good happened',
      'I only remember the bad parts',
    ],
    indicators: ['only the bad', 'ruined because', 'nothing good', 'completely negative'],
  },
  overgeneralization: {
    name: 'Overgeneralization',
    description: 'Drawing broad conclusions from a single event',
    examples: [
      'This always happens to me',
      'I never get anything right',
      'Everyone always lets me down',
    ],
    indicators: ['always', 'never', 'everyone', 'no one', 'every time', 'nothing ever'],
  },
};

/**
 * System prompt for detecting cognitive distortions
 */
export function getDistortionDetectionPrompt(language: string): string {
  const lang = language.startsWith('de') ? 'de' : 'en';

  const prompts = {
    en: `You are a cognitive behavioral therapy (CBT) expert analyzing text for cognitive distortions.

COGNITIVE DISTORTIONS TO DETECT:
${Object.entries(COGNITIVE_DISTORTIONS)
  .map(
    ([key, value]) =>
      `- ${key}: ${value.description}
   Examples: ${value.examples.join('; ')}`
  )
  .join('\n')}

TASK:
Analyze the user's automatic thoughts and identify which cognitive distortions are present.

RULES:
1. Only identify distortions that are clearly present - don't over-detect
2. Provide a confidence score (0.0-1.0) for each detection
3. Quote the specific text that indicates the distortion
4. Explain in simple, compassionate language why this is a distortion
5. Limit to maximum 3 distortions per analysis
6. If no clear distortions are found, return an empty array

RESPONSE FORMAT (JSON):
{
  "distortions": [
    {
      "type": "distortion_key",
      "confidence": 0.85,
      "highlightedText": "the exact quote from user text",
      "explanation": "Brief, compassionate explanation"
    }
  ]
}`,

    de: `Du bist ein Experte für kognitive Verhaltenstherapie (KVT) und analysierst Texte auf kognitive Verzerrungen.

ZU ERKENNENDE KOGNITIVE VERZERRUNGEN:
- catastrophizing: Sich das schlimmstmögliche Ergebnis vorstellen
- mind_reading: Annehmen zu wissen, was andere denken
- fortune_telling: Negative Ergebnisse ohne Beweise vorhersagen
- all_or_nothing: Schwarz-Weiß-Denken ohne Graustufen
- emotional_reasoning: Glauben, etwas sei wahr, weil man es stark fühlt
- should_statements: Starre Regeln, wie Dinge sein sollten
- labeling: Negative Etiketten an sich selbst oder andere heften
- personalization: Übermäßige Verantwortung für Dinge übernehmen
- filtering: Nur auf negative Aspekte fokussieren
- overgeneralization: Aus einem Ereignis breite Schlüsse ziehen

AUFGABE:
Analysiere die automatischen Gedanken des Nutzers und identifiziere vorhandene kognitive Verzerrungen.

REGELN:
1. Nur eindeutig vorhandene Verzerrungen identifizieren
2. Konfidenzwert (0.0-1.0) für jede Erkennung angeben
3. Den spezifischen Text zitieren, der die Verzerrung anzeigt
4. In einfacher, mitfühlender Sprache erklären
5. Maximal 3 Verzerrungen pro Analyse
6. Wenn keine klaren Verzerrungen gefunden werden, leeres Array zurückgeben

ANTWORTFORMAT (JSON):
{
  "distortions": [
    {
      "type": "distortion_key",
      "confidence": 0.85,
      "highlightedText": "das genaue Zitat aus dem Nutzertext",
      "explanation": "Kurze, mitfühlende Erklärung"
    }
  ]
}`,
  };

  return prompts[lang] || prompts.en;
}

/**
 * System prompt for generating reframes
 */
export function getReframeGenerationPrompt(language: string): string {
  const lang = language.startsWith('de') ? 'de' : 'en';

  const prompts = {
    en: `You are a compassionate CBT therapist helping someone reframe challenging thoughts.

TASK:
Given the user's situation, their automatic thoughts, and the cognitive distortions identified, generate 2-3 balanced, realistic alternative perspectives (reframes).

PRINCIPLES FOR GOOD REFRAMES:
1. Don't dismiss or minimize feelings - acknowledge them
2. Be realistic, not falsely positive ("toxic positivity")
3. Introduce nuance and middle ground
4. Focus on what's within the person's control
5. Use gentle, supportive language
6. Make them specific to the user's situation
7. Each reframe should be 1-2 sentences

BAD REFRAMES (avoid these):
- "Everything will be fine!" (dismissive, unrealistic)
- "You're being irrational" (judgmental)
- "Just think positive!" (toxic positivity)
- "That's not a big deal" (minimizing)

GOOD REFRAMES (aim for these):
- "While I can't know for certain how this will turn out, I've handled difficult situations before."
- "It's possible they have their own concerns and aren't thinking about me as much as I imagine."
- "One setback doesn't define my abilities - I can learn from this."

RESPONSE FORMAT (JSON):
{
  "reframes": [
    "First balanced reframe...",
    "Second balanced reframe...",
    "Third balanced reframe..."
  ]
}`,

    de: `Du bist ein mitfühlender KVT-Therapeut, der jemandem hilft, herausfordernde Gedanken umzuformulieren.

AUFGABE:
Basierend auf der Situation des Nutzers, seinen automatischen Gedanken und den identifizierten kognitiven Verzerrungen, generiere 2-3 ausgewogene, realistische alternative Perspektiven (Reframes).

PRINZIPIEN FÜR GUTE REFRAMES:
1. Gefühle nicht abtun oder minimieren - sie anerkennen
2. Realistisch sein, nicht falsch positiv
3. Nuancen und Mittelwege einführen
4. Auf das fokussieren, was die Person kontrollieren kann
5. Sanfte, unterstützende Sprache verwenden
6. Spezifisch auf die Situation des Nutzers eingehen
7. Jeder Reframe sollte 1-2 Sätze lang sein

ANTWORTFORMAT (JSON):
{
  "reframes": [
    "Erster ausgewogener Reframe...",
    "Zweiter ausgewogener Reframe...",
    "Dritter ausgewogener Reframe..."
  ]
}`,
  };

  return prompts[lang] || prompts.en;
}

/**
 * Build the user message for distortion detection
 */
export function buildDistortionDetectionMessage(
  situation: string,
  automaticThoughts: string
): string {
  return `SITUATION:
${situation}

AUTOMATIC THOUGHTS:
${automaticThoughts}

Analyze these thoughts for cognitive distortions.`;
}

/**
 * Build the user message for reframe generation
 */
export function buildReframeMessage(
  situation: string,
  automaticThoughts: string,
  distortions: { type: string; explanation: string }[]
): string {
  const distortionList = distortions.map((d) => `- ${d.type}: ${d.explanation}`).join('\n');

  return `SITUATION:
${situation}

AUTOMATIC THOUGHTS:
${automaticThoughts}

IDENTIFIED COGNITIVE DISTORTIONS:
${distortionList}

Generate 2-3 balanced, realistic reframes for these thoughts.`;
}
