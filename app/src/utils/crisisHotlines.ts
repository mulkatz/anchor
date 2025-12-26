import i18next from 'i18next';
import type { SupportedLanguage } from '../models';

/**
 * Crisis Hotline Configuration
 * Uses i18n for localized crisis resources
 * Supports: en-US, en-CA, de-DE
 */

export interface CrisisHotline {
  name: string;
  number: string;
  description: string;
  telLink: string; // For tel: links
}

export interface CrisisResources {
  primaryHotline: CrisisHotline;
  secondaryHotline?: CrisisHotline;
  emergency: CrisisHotline;
}

/**
 * Canadian crisis resources (hardcoded since we use en-US translations for Canada)
 */
const CANADIAN_CRISIS_RESOURCES: CrisisResources = {
  primaryHotline: {
    name: 'Talk Suicide Canada',
    number: '1-833-456-4566',
    description: '24/7 Mental Health Support',
    telLink: 'tel:1-833-456-4566',
  },
  secondaryHotline: {
    name: 'Crisis Text Line',
    number: 'Text HOME to 686868',
    description: 'Text-based crisis support',
    telLink: 'sms:686868',
  },
  emergency: {
    name: '911 Emergency',
    number: '911',
    description: 'For Immediate Danger',
    telLink: 'tel:911',
  },
};

/**
 * Detect if user is likely in Canada based on locale/timezone
 */
const isCanadianUser = (): boolean => {
  const language = i18next.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Check for Canadian English locale
  if (language === 'en-CA') return true;

  // Check for Canadian timezone (covers most major Canadian cities)
  const canadianTimezones = [
    'America/Toronto',
    'America/Vancouver',
    'America/Montreal',
    'America/Edmonton',
    'America/Winnipeg',
    'America/Halifax',
    'America/St_Johns',
    'America/Regina',
    'America/Calgary',
    'America/Whitehorse',
    'America/Yellowknife',
    'America/Iqaluit',
  ];

  return canadianTimezones.includes(timezone);
};

/**
 * Get crisis resources for the current language/region
 */
export const getCrisisResources = (): CrisisResources => {
  const currentLanguage = i18next.language;

  // Canadian users get Canadian resources
  if (isCanadianUser() && currentLanguage.startsWith('en')) {
    return CANADIAN_CRISIS_RESOURCES;
  }

  const resources: CrisisResources = {
    primaryHotline: {
      name: i18next.t('crisis.primaryHotline.name'),
      number: i18next.t('crisis.primaryHotline.number'),
      description: i18next.t('crisis.primaryHotline.description'),
      telLink: i18next.t('crisis.primaryHotline.telLink'),
    },
    emergency: {
      name: i18next.t('crisis.emergency.name'),
      number: i18next.t('crisis.emergency.number'),
      description: i18next.t('crisis.emergency.description'),
      telLink: i18next.t('crisis.emergency.telLink'),
    },
  };

  // German has a secondary hotline
  if (currentLanguage === 'de-DE') {
    resources.secondaryHotline = {
      name: i18next.t('crisis.secondaryHotline.name'),
      number: i18next.t('crisis.secondaryHotline.number'),
      description: i18next.t('crisis.secondaryHotline.description'),
      telLink: i18next.t('crisis.secondaryHotline.telLink'),
    };
  }

  return resources;
};

/**
 * Get Canadian crisis message text
 */
const getCanadianCrisisMessage = (): string => {
  return `I'm deeply concerned about what you're sharing. You deserve immediate support from a trained professional.

**Crisis Resources:**

🆘 **Talk Suicide Canada**
Call: 1-833-456-4566
Available 24/7

💬 **Crisis Text Line**
Text HOME to 686868

🚨 **Emergency: 911**
For immediate danger

You matter. Please reach out to one of these services now.`;
};

/**
 * Get crisis message text for AI responses
 */
export const getCrisisMessageText = (language: SupportedLanguage): string => {
  // Check for Canadian user first
  if (isCanadianUser() && language.startsWith('en')) {
    return getCanadianCrisisMessage();
  }

  switch (language) {
    case 'de-DE':
      return `Mir macht Sorgen, was du gerade teilst. Du verdienst sofortige Unterstützung von ausgebildeten Fachleuten.

**Krisenressourcen:**

🆘 **Telefonseelsorge**
Anrufen oder SMS: 0800-1110111 oder 0800-1110222
Verfügbar 24/7, kostenlos und anonym

🚨 **Notruf 112**
Bei akuter Gefahr

Du bist wichtig. Bitte kontaktiere jetzt einen dieser Dienste.`;

    case 'en-US':
    default:
      return `I'm deeply concerned about what you're sharing. You deserve immediate support from a trained professional.

**Crisis Resources:**

🆘 **988 Suicide & Crisis Lifeline**
Call or text: 988
Available 24/7

💬 **Crisis Text Line**
Text HOME to 741741

🌐 **International Association for Suicide Prevention**
findahelpline.com

You matter. Please reach out to one of these services now.`;
  }
};
