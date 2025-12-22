/**
 * UserStory Extraction Prompts
 * AI prompts for extracting personal information from conversations
 */

/**
 * English extraction prompt
 */
export const EXTRACTION_PROMPT_EN = `You are analyzing a conversation message to extract any personal background information the user has naturally shared.

CURRENT KNOWN STORY:
{EXISTING_STORY}

USER MESSAGE:
{MESSAGE_TEXT}

CONVERSATION CONTEXT (last 3 messages for context):
{RECENT_CONTEXT}

FIELDS DELETED BY USER (never re-extract these):
{DELETED_FIELDS}

Extract any NEW information from these categories:

TIER 1 - Core Identity:
- name: Their first name or preferred name
- nickname: Any nickname they use
- age: Their age or birth year
- pronouns: Their preferred pronouns
- location: Where they live (city, country)

TIER 2 - Life Situation:
- occupation: What they do (work, student, between jobs, etc.)
- livingArrangement: Who they live with (alone, roommates, family, partner)
- dailySchedule: Their typical schedule (9-5, shift work, freelance, etc.)
- currentLifePhase: Major life phase (in college, new parent, career transition)

TIER 3 - Relationships:
- romanticStatus: Single, dating, relationship, married, etc.
- partnerName: Their partner's name if mentioned
- hasPets: If they have pets and what kind
- closeFriends: Description of their friend situation
- familyContext: Brief family situation
- supportSystem: Who they turn to for support

TIER 4 - Background:
- culturalBackground: Cultural or ethnic background
- upbringing: How/where they grew up
- significantLifeEvents: Major life events mentioned
- hometown: Where they're from originally

TIER 5 - Personal:
- interests: Things they're interested in
- hobbies: Activities they enjoy
- copingActivities: What helps them when anxious
- avoidances: What they avoid when anxious

TIER 6 - Therapeutic Context (only if explicitly shared):
- knownTriggers: Specific anxiety triggers
- anxietyManifestations: How their anxiety shows up
- anxietyType: Type of anxiety (social, generalized, panic, health, specific phobias)
- bodyExperience: How anxiety feels in their body (chest tightness, racing heart, etc.)
- whatDoesntWork: Things they've tried that don't help (avoid suggesting these!)
- pastTherapyExperience: If they've been to therapy before
- currentProfessionalSupport: If they're currently seeing a therapist/counselor
- therapyFocus: What they're working on in therapy

TIER 7 - Strengths & Resources (actively look for these - they're therapeutic gold):
- whatGivesHope: Sources of hope, meaning, or purpose they mention
- proudMoments: Things they're proud of or accomplishments
- pastWins: Challenges they've overcome (proof they can handle hard things)
- motivators: What drives or inspires them
- positiveRelationships: People who make them feel good or supported
- coreValues: What matters most to them

TOPICS & CURRENT CONCERNS (extract actively - these enable continuity across conversations):
Extract any specific problem, situation, or topic they're currently dealing with.
These are NOT permanent facts like name/age, but CURRENT situations with temporal relevance.

Examples of what to extract as topics:
- "I have a job interview next week" → topic about job interview anxiety, valence: negative
- "My roommate and I had a fight" → topic about roommate conflict, valence: negative
- "I can't sleep because of work stress" → topic about work-related sleep issues, valence: negative
- "I started therapy last month" → topic about new therapy journey, valence: positive (good step!)
- "My mom is sick" → topic about family health concerns, valence: negative
- "I have exams coming up" → topic about exam stress, valence: negative
- "I got the job!" → topic about job interview, status: resolved, resolutionOutcome: success
- "The interview didn't go well" → topic about job interview, status: resolved, resolutionOutcome: difficult

Categories: work, relationships, health, anxiety, life-event, other
Status: active (ongoing), resolved (they said it's done), fading (old, not mentioned recently)
Valence: positive (exciting, hopeful), negative (stressful, worrying), neutral (informational)
Resolution outcome (only for resolved topics): success, neutral, difficult

Also detect if the user is asking to FORGET something they previously shared.

Output ONLY valid JSON:
{
  "extractions": [
    {
      "field": "coreIdentity.name",
      "value": "Sarah",
      "confidence": "explicit",
      "evidence": "User said 'my name is Sarah'"
    }
  ],
  "topicExtractions": [
    {
      "type": "topic",
      "topic": "job interview anxiety",
      "context": "Interview at Google on Friday",
      "category": "work",
      "status": "active",
      "valence": "negative"
    }
  ],
  "suggestedFollowUps": ["occupation", "location"],
  "detectedForgetRequest": null
}

For resolved topics with outcomes:
{
  "topicExtractions": [
    {
      "type": "topic",
      "topic": "job interview",
      "context": "Got the job at Google!",
      "category": "work",
      "status": "resolved",
      "valence": "positive",
      "resolutionOutcome": "success"
    }
  ]
}

RULES:
1. Only extract what is CLEARLY stated or strongly implied
2. Confidence levels:
   - "explicit": Directly stated ("my name is X", "I'm 25")
   - "inferred": Logical conclusion ("my boyfriend" → in a relationship)
   - "mentioned": Referenced but details unclear ("my job is stressful" → has a job)
3. Never extract from:
   - Hypotheticals ("if I had a dog...")
   - Negations ("I'm not married" - do NOT extract "single", extract nothing)
   - Sarcasm or jokes
4. For relationship status changes (breakups, new relationship), use the CURRENT state
5. For arrays (interests, triggers), add to existing list, don't replace
6. Return empty extractions array if nothing new learned
7. Never make assumptions about sensitive topics (Tier 6)
8. If user says "forget X" or "don't remember X", include in detectedForgetRequest
9. NEVER extract fields that are in the deleted list`;

/**
 * German extraction prompt
 */
export const EXTRACTION_PROMPT_DE = `Du analysierst eine Konversationsnachricht, um persönliche Hintergrundinformationen zu extrahieren, die der Nutzer natürlich geteilt hat.

AKTUELL BEKANNTE STORY:
{EXISTING_STORY}

NUTZER-NACHRICHT:
{MESSAGE_TEXT}

KONVERSATIONSKONTEXT (letzte 3 Nachrichten für Kontext):
{RECENT_CONTEXT}

VOM NUTZER GELÖSCHTE FELDER (diese niemals erneut extrahieren):
{DELETED_FIELDS}

Extrahiere alle NEUEN Informationen aus diesen Kategorien:

TIER 1 - Kernidentität:
- name: Ihr Vorname oder bevorzugter Name
- nickname: Spitzname falls verwendet
- age: Alter oder Geburtsjahr
- pronouns: Bevorzugte Pronomen
- location: Wohnort (Stadt, Land)

TIER 2 - Lebenssituation:
- occupation: Was sie machen (Arbeit, Student, zwischen Jobs, etc.)
- livingArrangement: Mit wem sie leben (allein, WG, Familie, Partner)
- dailySchedule: Typischer Tagesablauf (9-5, Schichtarbeit, Freelance, etc.)
- currentLifePhase: Aktuelle Lebensphase (Studium, frisch Eltern, Berufswechsel)

TIER 3 - Beziehungen:
- romanticStatus: Single, dating, Beziehung, verheiratet, etc.
- partnerName: Name des Partners falls erwähnt
- hasPets: Ob sie Haustiere haben und welche
- closeFriends: Beschreibung ihrer Freundessituation
- familyContext: Kurze Familiensituation
- supportSystem: An wen sie sich für Unterstützung wenden

TIER 4 - Hintergrund:
- culturalBackground: Kultureller oder ethnischer Hintergrund
- upbringing: Wie/wo sie aufgewachsen sind
- significantLifeEvents: Erwähnte bedeutende Lebensereignisse
- hometown: Woher sie ursprünglich kommen

TIER 5 - Persönliches:
- interests: Dinge die sie interessieren
- hobbies: Aktivitäten die sie genießen
- copingActivities: Was ihnen bei Angst hilft
- avoidances: Was sie bei Angst vermeiden

TIER 6 - Therapeutischer Kontext (nur wenn explizit geteilt):
- knownTriggers: Spezifische Angstauslöser
- anxietyManifestations: Wie sich ihre Angst zeigt
- anxietyType: Art der Angst (soziale Angst, generalisierte Angst, Panik, Gesundheitsangst, spezifische Phobien)
- bodyExperience: Wie sich Angst in ihrem Körper anfühlt (Engegefühl in der Brust, Herzrasen, etc.)
- whatDoesntWork: Dinge die sie probiert haben die nicht helfen (diese nicht vorschlagen!)
- pastTherapyExperience: Ob sie schon in Therapie waren
- currentProfessionalSupport: Ob sie aktuell einen Therapeuten sehen
- therapyFocus: Woran sie in der Therapie arbeiten

TIER 7 - Stärken & Ressourcen (aktiv danach suchen - therapeutisch sehr wertvoll):
- whatGivesHope: Quellen von Hoffnung, Sinn oder Zweck die sie erwähnen
- proudMoments: Dinge auf die sie stolz sind oder Errungenschaften
- pastWins: Herausforderungen die sie gemeistert haben (Beweis dass sie schwieriges schaffen können)
- motivators: Was sie antreibt oder inspiriert
- positiveRelationships: Menschen die ihnen gut tun oder sie unterstützen
- coreValues: Was ihnen am wichtigsten ist

THEMEN & AKTUELLE ANLIEGEN (aktiv extrahieren - ermöglichen Kontinuität über Gespräche):
Extrahiere jedes spezifische Problem, Situation oder Thema mit dem sie gerade zu tun haben.
Das sind KEINE permanenten Fakten wie Name/Alter, sondern AKTUELLE Situationen mit zeitlicher Relevanz.

Beispiele was als Themen extrahiert werden soll:
- "Ich hab nächste Woche ein Vorstellungsgespräch" → Thema über Bewerbungsangst, valence: negative
- "Mein Mitbewohner und ich hatten Streit" → Thema über Mitbewohner-Konflikt, valence: negative
- "Ich kann nicht schlafen wegen Arbeitsstress" → Thema über arbeitsbedingte Schlafprobleme, valence: negative
- "Ich hab letzten Monat mit Therapie angefangen" → Thema über neue Therapie-Reise, valence: positive
- "Meine Mama ist krank" → Thema über Gesundheitssorgen in der Familie, valence: negative
- "Ich hab Prüfungen vor mir" → Thema über Prüfungsstress, valence: negative
- "Ich hab den Job bekommen!" → Thema über Vorstellungsgespräch, status: resolved, resolutionOutcome: success
- "Das Gespräch lief nicht gut" → Thema über Vorstellungsgespräch, status: resolved, resolutionOutcome: difficult

Kategorien: work, relationships, health, anxiety, life-event, other
Status: active (laufend), resolved (sie sagten es ist erledigt), fading (alt, nicht kürzlich erwähnt)
Valence: positive (aufregend, hoffnungsvoll), negative (stressig, besorgniserregend), neutral (informativ)
Resolution outcome (nur für resolved topics): success, neutral, difficult

Erkenne auch ob der Nutzer darum bittet etwas zu VERGESSEN was er zuvor geteilt hat.

Gib NUR gültiges JSON aus:
{
  "extractions": [
    {
      "field": "coreIdentity.name",
      "value": "Sarah",
      "confidence": "explicit",
      "evidence": "Nutzer sagte 'ich heiße Sarah'"
    }
  ],
  "topicExtractions": [
    {
      "type": "topic",
      "topic": "Bewerbungsangst",
      "context": "Vorstellungsgespräch bei Google am Freitag",
      "category": "work",
      "status": "active",
      "valence": "negative"
    }
  ],
  "suggestedFollowUps": ["occupation", "location"],
  "detectedForgetRequest": null
}

Für abgeschlossene Themen mit Ausgang:
{
  "topicExtractions": [
    {
      "type": "topic",
      "topic": "Vorstellungsgespräch",
      "context": "Job bei Google bekommen!",
      "category": "work",
      "status": "resolved",
      "valence": "positive",
      "resolutionOutcome": "success"
    }
  ]
}

REGELN:
1. Nur extrahieren was KLAR gesagt oder stark impliziert wurde
2. Confidence-Level:
   - "explicit": Direkt gesagt ("ich heiße X", "ich bin 25")
   - "inferred": Logische Schlussfolgerung ("mein Freund" → in einer Beziehung)
   - "mentioned": Erwähnt aber Details unklar ("mein Job ist stressig" → hat einen Job)
3. Niemals extrahieren aus:
   - Hypothetischen ("wenn ich einen Hund hätte...")
   - Verneinungen ("ich bin nicht verheiratet" - extrahiere NICHT "single")
   - Sarkasmus oder Witzen
4. Bei Beziehungsstatusänderungen (Trennung, neue Beziehung), nutze den AKTUELLEN Status
5. Bei Arrays (Interessen, Trigger), zur Liste hinzufügen, nicht ersetzen
6. Leeres extractions Array zurückgeben wenn nichts Neues gelernt
7. Niemals Annahmen über sensible Themen (Tier 6) machen
8. Wenn Nutzer "vergiss X" oder "erinner dich nicht an X" sagt, in detectedForgetRequest aufnehmen
9. NIEMALS Felder extrahieren die in der gelöschten Liste sind`;

/**
 * Format existing story for injection into extraction prompt
 */
export function formatStoryForExtractionPrompt(story: Record<string, unknown> | null): string {
  if (!story) {
    return 'No information known yet.';
  }

  const lines: string[] = [];

  // Helper to extract value from story field
  const getValue = (obj: Record<string, unknown>, path: string): unknown => {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  };

  // Helper to format field value
  const formatField = (path: string, label: string) => {
    const field = getValue(story, path) as { value?: unknown } | undefined;
    if (field?.value !== undefined && field?.value !== null) {
      const value = field.value;
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          lines.push(`${label}: ${value.join(', ')}`);
        } else if ('details' in value) {
          lines.push(
            `${label}: ${(value as { details?: string }).details || JSON.stringify(value)}`
          );
        } else {
          lines.push(`${label}: ${JSON.stringify(value)}`);
        }
      } else {
        lines.push(`${label}: ${value}`);
      }
    }
  };

  // Extract known fields
  formatField('coreIdentity.name', 'Name');
  formatField('coreIdentity.nickname', 'Nickname');
  formatField('coreIdentity.age', 'Age');
  formatField('coreIdentity.pronouns', 'Pronouns');
  formatField('coreIdentity.location', 'Location');
  formatField('lifeSituation.occupation', 'Occupation');
  formatField('lifeSituation.livingArrangement', 'Living');
  formatField('relationships.romanticStatus', 'Relationship');
  formatField('relationships.partnerName', 'Partner');
  formatField('relationships.hasPets', 'Pets');
  formatField('personal.interests', 'Interests');
  formatField('personal.hobbies', 'Hobbies');
  formatField('therapeuticContext.knownTriggers', 'Known triggers');

  if (lines.length === 0) {
    return 'No information known yet.';
  }

  return lines.join('\n');
}

/**
 * Format recent conversation context for extraction
 */
export function formatRecentContext(messages: Array<{ role: string; text: string }>): string {
  if (!messages || messages.length === 0) {
    return 'No recent context available.';
  }

  return messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Anchor'}: ${msg.text}`)
    .join('\n');
}

/**
 * Get extraction prompt for language
 */
export function getExtractionPrompt(languageCode: string): string {
  if (languageCode.startsWith('de')) {
    return EXTRACTION_PROMPT_DE;
  }
  return EXTRACTION_PROMPT_EN;
}
