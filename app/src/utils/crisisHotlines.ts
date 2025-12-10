import i18next from 'i18next';
import type { SupportedLanguage } from '../models';

/**
 * Crisis Hotline Configuration
 * Uses i18n for localized crisis resources
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
 * Get crisis resources for the current language
 */
export const getCrisisResources = (): CrisisResources => {
  const currentLanguage = i18next.language;

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
 * Get crisis message text for AI responses
 */
export const getCrisisMessageText = (language: SupportedLanguage): string => {
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
