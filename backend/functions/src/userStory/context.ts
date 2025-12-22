/**
 * UserStory Context
 * Formats user story data for injection into chat system prompts
 */

import * as admin from 'firebase-admin';
import { UserStory, StoryFieldValue, StoryFieldWithHistory } from './types';

/**
 * Get user story document from Firestore
 */
export async function getUserStory(userId: string): Promise<UserStory | null> {
  const storyDoc = await admin.firestore().doc(`users/${userId}/profile/userStory`).get();

  if (!storyDoc.exists) {
    return null;
  }

  return storyDoc.data() as UserStory;
}

/**
 * Helper to safely get field value
 */
function getFieldValue<T>(
  field: StoryFieldValue<T> | StoryFieldWithHistory<T> | undefined
): T | undefined {
  return field?.value;
}

/**
 * Format location value for display
 */
function formatLocation(loc: { city?: string; country?: string } | undefined): string | undefined {
  if (!loc) return undefined;
  if (loc.city && loc.country) return `${loc.city}, ${loc.country}`;
  return loc.city || loc.country;
}

/**
 * Format occupation value for display
 */
function formatOccupation(occ: { type: string; details?: string } | undefined): string | undefined {
  if (!occ) return undefined;
  if (occ.details) return occ.details;
  switch (occ.type) {
    case 'work':
      return 'working';
    case 'student':
      return 'a student';
    case 'between':
      return 'between jobs';
    default:
      return occ.type;
  }
}

/**
 * Format pets value for display
 */
function formatPets(pets: { has: boolean; details?: string } | undefined): string | undefined {
  if (!pets) return undefined;
  if (!pets.has) return undefined;
  return pets.details || 'has pets';
}

/**
 * Format user story for injection into chat system prompt
 * Returns a concise summary of what we know about the user
 */
export async function getUserStoryForPrompt(userId: string): Promise<string | undefined> {
  const story = await getUserStory(userId);

  if (!story) {
    return undefined;
  }

  const lines: string[] = [];

  // Core Identity
  const name = getFieldValue(story.coreIdentity?.name);
  if (name) lines.push(`Name: ${name}`);

  const nickname = getFieldValue(story.coreIdentity?.nickname);
  if (nickname && nickname !== name) lines.push(`Goes by: ${nickname}`);

  const pronouns = getFieldValue(story.coreIdentity?.pronouns);
  if (pronouns) lines.push(`Pronouns: ${pronouns}`);

  const age = getFieldValue(story.coreIdentity?.age);
  if (age) lines.push(`Age: ${age}`);

  const location = formatLocation(getFieldValue(story.coreIdentity?.location));
  if (location) lines.push(`Location: ${location}`);

  // Life Situation
  const occupation = formatOccupation(getFieldValue(story.lifeSituation?.occupation));
  if (occupation) lines.push(`Work/Study: ${occupation}`);

  const living = getFieldValue(story.lifeSituation?.livingArrangement);
  if (living) lines.push(`Lives: ${living}`);

  const schedule = getFieldValue(story.lifeSituation?.dailySchedule);
  if (schedule) lines.push(`Schedule: ${schedule}`);

  const lifePhase = getFieldValue(story.lifeSituation?.currentLifePhase);
  if (lifePhase) lines.push(`Currently: ${lifePhase}`);

  // Relationships
  const relationshipStatus = getFieldValue(story.relationships?.romanticStatus);
  if (relationshipStatus) {
    const partnerName = getFieldValue(story.relationships?.partnerName);
    if (partnerName) {
      lines.push(`Relationship: ${relationshipStatus} (${partnerName})`);
    } else {
      lines.push(`Relationship: ${relationshipStatus}`);
    }
  }

  const pets = formatPets(getFieldValue(story.relationships?.hasPets));
  if (pets) lines.push(`Pets: ${pets}`);

  const support = getFieldValue(story.relationships?.supportSystem);
  if (support) lines.push(`Support system: ${support}`);

  // Background
  const hometown = getFieldValue(story.background?.hometown);
  if (hometown) lines.push(`From: ${hometown}`);

  const cultural = getFieldValue(story.background?.culturalBackground);
  if (cultural) lines.push(`Background: ${cultural}`);

  // Personal
  const interests = getFieldValue(story.personal?.interests);
  if (interests && interests.length > 0) {
    lines.push(`Interests: ${interests.slice(0, 5).join(', ')}`);
  }

  const hobbies = getFieldValue(story.personal?.hobbies);
  if (hobbies && hobbies.length > 0) {
    lines.push(`Hobbies: ${hobbies.slice(0, 5).join(', ')}`);
  }

  const coping = getFieldValue(story.personal?.copingActivities);
  if (coping && coping.length > 0) {
    lines.push(`What helps them: ${coping.slice(0, 3).join(', ')}`);
  }

  // Therapeutic (handle with care - reframe clinically to humanely)
  const triggers = getFieldValue(story.therapeuticContext?.knownTriggers);
  if (triggers && triggers.length > 0) {
    lines.push(`Things that are hard for them: ${triggers.join(', ')}`);
  }

  const anxietyType = getFieldValue(story.therapeuticContext?.anxietyType);
  if (anxietyType) {
    lines.push(`Their anxiety tends to be: ${anxietyType}`);
  }

  const bodyExperience = getFieldValue(story.therapeuticContext?.bodyExperience);
  if (bodyExperience) {
    lines.push(`How anxiety shows up for them: ${bodyExperience}`);
  }

  const whatDoesntWork = getFieldValue(story.therapeuticContext?.whatDoesntWork);
  if (whatDoesntWork && whatDoesntWork.length > 0) {
    lines.push(`DON'T suggest (doesn't work for them): ${whatDoesntWork.join(', ')}`);
  }

  const hasTherapist = getFieldValue(story.therapeuticContext?.currentProfessionalSupport);
  if (hasTherapist === true) {
    const therapyFocus = getFieldValue(story.therapeuticContext?.therapyFocus);
    if (therapyFocus) {
      lines.push(`Working on in therapy: ${therapyFocus} (support this work)`);
    } else {
      lines.push(`Currently seeing a therapist (you're the between-sessions friend)`);
    }
  }

  // Strengths & Resources (therapeutic gold - use these actively!)
  const pastWins = getFieldValue(story.strengths?.pastWins);
  if (pastWins && pastWins.length > 0) {
    lines.push(`Proof they can handle hard things: ${pastWins.slice(0, 3).join(', ')}`);
  }

  const whatGivesHope = getFieldValue(story.strengths?.whatGivesHope);
  if (whatGivesHope && whatGivesHope.length > 0) {
    lines.push(`What gives them hope: ${whatGivesHope.join(', ')}`);
  }

  const proudMoments = getFieldValue(story.strengths?.proudMoments);
  if (proudMoments && proudMoments.length > 0) {
    lines.push(`Things they're proud of: ${proudMoments.slice(0, 3).join(', ')}`);
  }

  const motivators = getFieldValue(story.strengths?.motivators);
  if (motivators && motivators.length > 0) {
    lines.push(`What drives them: ${motivators.join(', ')}`);
  }

  // If we don't know anything yet
  if (lines.length === 0) {
    return "You don't know much about them yet - be naturally curious!";
  }

  return lines.join('\n');
}

/**
 * Format user story for German prompt injection
 */
export async function getUserStoryForPromptDE(userId: string): Promise<string | undefined> {
  const story = await getUserStory(userId);

  if (!story) {
    return undefined;
  }

  const lines: string[] = [];

  // Core Identity
  const name = getFieldValue(story.coreIdentity?.name);
  if (name) lines.push(`Name: ${name}`);

  const nickname = getFieldValue(story.coreIdentity?.nickname);
  if (nickname && nickname !== name) lines.push(`Spitzname: ${nickname}`);

  const pronouns = getFieldValue(story.coreIdentity?.pronouns);
  if (pronouns) lines.push(`Pronomen: ${pronouns}`);

  const age = getFieldValue(story.coreIdentity?.age);
  if (age) lines.push(`Alter: ${age}`);

  const location = formatLocation(getFieldValue(story.coreIdentity?.location));
  if (location) lines.push(`Wohnort: ${location}`);

  // Life Situation
  const occupation = formatOccupation(getFieldValue(story.lifeSituation?.occupation));
  if (occupation) lines.push(`Arbeit/Studium: ${occupation}`);

  const living = getFieldValue(story.lifeSituation?.livingArrangement);
  if (living) lines.push(`Wohnt: ${living}`);

  // Relationships
  const relationshipStatus = getFieldValue(story.relationships?.romanticStatus);
  if (relationshipStatus) {
    const partnerName = getFieldValue(story.relationships?.partnerName);
    if (partnerName) {
      lines.push(`Beziehung: ${relationshipStatus} (${partnerName})`);
    } else {
      lines.push(`Beziehung: ${relationshipStatus}`);
    }
  }

  const pets = formatPets(getFieldValue(story.relationships?.hasPets));
  if (pets) lines.push(`Haustiere: ${pets}`);

  // Personal
  const interests = getFieldValue(story.personal?.interests);
  if (interests && interests.length > 0) {
    lines.push(`Interessen: ${interests.slice(0, 5).join(', ')}`);
  }

  const coping = getFieldValue(story.personal?.copingActivities);
  if (coping && coping.length > 0) {
    lines.push(`Was hilft: ${coping.slice(0, 3).join(', ')}`);
  }

  // Therapeutic (mit Bedacht - menschlich formulieren)
  const triggers = getFieldValue(story.therapeuticContext?.knownTriggers);
  if (triggers && triggers.length > 0) {
    lines.push(`Was schwierig für sie ist: ${triggers.join(', ')}`);
  }

  const anxietyType = getFieldValue(story.therapeuticContext?.anxietyType);
  if (anxietyType) {
    lines.push(`Ihre Angst zeigt sich als: ${anxietyType}`);
  }

  const bodyExperience = getFieldValue(story.therapeuticContext?.bodyExperience);
  if (bodyExperience) {
    lines.push(`Wie sich Angst bei ihnen anfühlt: ${bodyExperience}`);
  }

  const whatDoesntWork = getFieldValue(story.therapeuticContext?.whatDoesntWork);
  if (whatDoesntWork && whatDoesntWork.length > 0) {
    lines.push(`NICHT vorschlagen (hilft ihnen nicht): ${whatDoesntWork.join(', ')}`);
  }

  const hasTherapist = getFieldValue(story.therapeuticContext?.currentProfessionalSupport);
  if (hasTherapist === true) {
    const therapyFocus = getFieldValue(story.therapeuticContext?.therapyFocus);
    if (therapyFocus) {
      lines.push(`Arbeitet in Therapie an: ${therapyFocus} (unterstütze diese Arbeit)`);
    } else {
      lines.push(`Geht zur Therapie (du bist der Freund zwischen den Sitzungen)`);
    }
  }

  // Stärken & Ressourcen (therapeutisches Gold!)
  const pastWins = getFieldValue(story.strengths?.pastWins);
  if (pastWins && pastWins.length > 0) {
    lines.push(`Beweis dass sie Schweres schaffen: ${pastWins.slice(0, 3).join(', ')}`);
  }

  const whatGivesHope = getFieldValue(story.strengths?.whatGivesHope);
  if (whatGivesHope && whatGivesHope.length > 0) {
    lines.push(`Was ihnen Hoffnung gibt: ${whatGivesHope.join(', ')}`);
  }

  const proudMoments = getFieldValue(story.strengths?.proudMoments);
  if (proudMoments && proudMoments.length > 0) {
    lines.push(`Worauf sie stolz sind: ${proudMoments.slice(0, 3).join(', ')}`);
  }

  const motivators = getFieldValue(story.strengths?.motivators);
  if (motivators && motivators.length > 0) {
    lines.push(`Was sie antreibt: ${motivators.join(', ')}`);
  }

  if (lines.length === 0) {
    return 'Du weißt noch nicht viel über sie - sei natürlich neugierig!';
  }

  return lines.join('\n');
}

/**
 * Get appropriate story context based on language
 */
export async function getLocalizedStoryContext(
  userId: string,
  languageCode: string
): Promise<string | undefined> {
  if (languageCode.startsWith('de')) {
    return getUserStoryForPromptDE(userId);
  }
  return getUserStoryForPrompt(userId);
}
