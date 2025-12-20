#!/usr/bin/env npx ts-node

/**
 * Test Script for Psychological Profile Generation
 *
 * Usage:
 *   cd backend/scripts
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npx ts-node test-profile.ts <userId> [language]
 *
 * Or with Firebase emulator:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node test-profile.ts <userId> [language]
 *
 * Example:
 *   npx ts-node test-profile.ts abc123 en-US
 */

import * as admin from 'firebase-admin';
import { createOrUpdateProfile } from '../functions/src/psychologicalProfile/profileUpdate';

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Check for emulator
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('🔧 Using Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
  }

  admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'anxiety-buddy-app',
  });
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  white: '\x1b[37m',
};

function header(text: string): void {
  console.log('\n' + colors.cyan + colors.bright + '═'.repeat(60) + colors.reset);
  console.log(colors.cyan + colors.bright + ' ' + text + colors.reset);
  console.log(colors.cyan + colors.bright + '═'.repeat(60) + colors.reset);
}

function section(text: string): void {
  console.log('\n' + colors.yellow + colors.bright + '▸ ' + text + colors.reset);
  console.log(colors.dim + '─'.repeat(40) + colors.reset);
}

function label(name: string, value: string | number | null | undefined): void {
  const displayValue =
    value === null || value === undefined ? colors.dim + '(none)' : String(value);
  console.log(colors.white + '  ' + name + ': ' + colors.reset + displayValue);
}

function list(items: string[], indent = 2): void {
  if (!items || items.length === 0) {
    console.log(' '.repeat(indent) + colors.dim + '(none)' + colors.reset);
    return;
  }
  items.forEach((item) => {
    console.log(' '.repeat(indent) + colors.green + '• ' + colors.reset + item);
  });
}

function quote(text: string, maxLength = 200): void {
  const truncated = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  console.log(colors.dim + '  "' + truncated + '"' + colors.reset);
}

function formatDate(timestamp: admin.firestore.Timestamp | null | undefined): string {
  if (!timestamp) return '(unknown)';
  return timestamp.toDate().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(
      colors.red + 'Usage: npx ts-node test-profile.ts <userId> [language]' + colors.reset
    );
    console.log(colors.dim + 'Example: npx ts-node test-profile.ts abc123 en-US' + colors.reset);
    process.exit(1);
  }

  const userId = args[0];
  const language = (args[1] as 'en-US' | 'de-DE') || 'en-US';

  header(`🔬 DR. MULDER - PSYCHOLOGICAL PROFILE`);
  console.log(colors.dim + `  User ID: ${userId}` + colors.reset);
  console.log(colors.dim + `  Language: ${language}` + colors.reset);
  console.log(colors.dim + `  Time: ${new Date().toISOString()}` + colors.reset);

  try {
    console.log('\n' + colors.magenta + '⏳ Generating profile...' + colors.reset);
    const startTime = Date.now();

    const profile = await createOrUpdateProfile(userId, language);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(colors.green + `✓ Profile generated in ${duration}s` + colors.reset);

    // === METADATA ===
    section('DOCUMENT METADATA');
    label('Version', profile.version);
    label('Schema', profile.schemaVersion);
    label('Created', formatDate(profile.createdAt));
    label('Last Updated', formatDate(profile.lastUpdated));
    label('Last Weekly Update', formatDate(profile.lastWeeklyUpdate));

    // === CORE IDENTITY ===
    header('🧠 CORE IDENTITY');

    section('Presenting Concerns');
    label('Primary', profile.coreIdentity.presentingConcerns.primary);
    console.log(colors.white + '  Secondary:' + colors.reset);
    list(profile.coreIdentity.presentingConcerns.secondary, 4);
    if (profile.coreIdentity.presentingConcerns.evolutionNotes) {
      console.log(colors.white + '  Evolution Notes:' + colors.reset);
      quote(profile.coreIdentity.presentingConcerns.evolutionNotes);
    }

    section('CBT Formulation');
    console.log(colors.blue + '  Cognitive Patterns:' + colors.reset);
    quote(profile.coreIdentity.formulation.cognitivePatterns, 300);
    console.log(colors.blue + '  Emotional Profile:' + colors.reset);
    quote(profile.coreIdentity.formulation.emotionalProfile, 300);
    console.log(colors.blue + '  Physiological Responses:' + colors.reset);
    quote(profile.coreIdentity.formulation.physiologicalResponses, 300);
    console.log(colors.blue + '  Behavioral Patterns:' + colors.reset);
    quote(profile.coreIdentity.formulation.behavioralPatterns, 300);
    console.log(colors.blue + '  Environmental Factors:' + colors.reset);
    quote(profile.coreIdentity.formulation.environmentalFactors, 300);

    section('Strengths');
    console.log(colors.green + '  Personal:' + colors.reset);
    list(profile.coreIdentity.strengths.personal, 4);
    console.log(colors.green + '  Relational:' + colors.reset);
    list(profile.coreIdentity.strengths.relational, 4);
    console.log(colors.green + '  Coping:' + colors.reset);
    list(profile.coreIdentity.strengths.coping, 4);
    console.log(colors.green + '  Insights:' + colors.reset);
    list(profile.coreIdentity.strengths.insights, 4);

    section('Risk Factors');
    console.log(colors.red + '  Historical:' + colors.reset);
    list(profile.coreIdentity.riskFactors.historicalFactors, 4);
    console.log(colors.red + '  Current Vulnerabilities:' + colors.reset);
    list(profile.coreIdentity.riskFactors.currentVulnerabilities, 4);
    console.log(colors.green + '  Protective Factors:' + colors.reset);
    list(profile.coreIdentity.riskFactors.protectiveFactors, 4);
    label('Crisis History Count', profile.coreIdentity.riskFactors.crisisHistoryCount);

    // === DYNAMIC STATE ===
    header('📊 DYNAMIC STATE');

    section('Current Focus');
    console.log(colors.white + '  Active Themes:' + colors.reset);
    list(profile.dynamicState.currentFocus.activeThemes, 4);
    console.log(colors.white + '  Working Hypotheses:' + colors.reset);
    list(profile.dynamicState.currentFocus.workingHypotheses, 4);

    section('Distortion Profile');
    label('Dominant', profile.dynamicState.distortionProfile.dominantDistortions.join(', '));
    label(
      'Emerging',
      profile.dynamicState.distortionProfile.emergingDistortions.join(', ') || '(none)'
    );
    label(
      'Declining',
      profile.dynamicState.distortionProfile.decliningDistortions.join(', ') || '(none)'
    );
    if (profile.dynamicState.distortionProfile.patterns.length > 0) {
      console.log(colors.white + '  Patterns:' + colors.reset);
      profile.dynamicState.distortionProfile.patterns.slice(0, 5).forEach((p) => {
        console.log(
          `    ${colors.yellow}${p.type}${colors.reset}: ` +
            `${p.count30Day} (30d) / ${p.countAllTime} (all) - ${p.trend}`
        );
      });
    }

    section('Emotional Profile');
    label('Intensity Trend', profile.dynamicState.emotionalProfile.intensityTrend);
    label(
      '30-Day Avg Intensity',
      profile.dynamicState.emotionalProfile.averageIntensity30Day + '/100'
    );
    if (profile.dynamicState.emotionalProfile.frequentEmotions.length > 0) {
      console.log(colors.white + '  Frequent Emotions:' + colors.reset);
      profile.dynamicState.emotionalProfile.frequentEmotions.slice(0, 5).forEach((e) => {
        console.log(
          `    ${colors.magenta}${e.type}${colors.reset}: ${e.count30Day}x (avg: ${e.averageIntensity})`
        );
      });
    }

    section('Treatment Considerations');
    label('Current Approach', profile.dynamicState.treatmentConsiderations.currentApproach);
    console.log(colors.green + '  Effective Interventions:' + colors.reset);
    list(
      profile.dynamicState.treatmentConsiderations.effectiveInterventions.map(
        (i) => `${i.name} (${i.type})`
      ),
      4
    );
    console.log(colors.red + '  Ineffective Interventions:' + colors.reset);
    list(
      profile.dynamicState.treatmentConsiderations.ineffectiveInterventions.map(
        (i) => `${i.name} (${i.type})`
      ),
      4
    );
    console.log(colors.yellow + '  Suggested Adaptations:' + colors.reset);
    list(profile.dynamicState.treatmentConsiderations.suggestedAdaptations, 4);

    section('Engagement');
    label('Usage Pattern', profile.dynamicState.engagement.appUsagePattern);
    label('Preferred Features', profile.dynamicState.engagement.preferredFeatures.join(', '));
    label('Time of Day', profile.dynamicState.engagement.timeOfDayPattern);
    label('Days Active (Month)', profile.dynamicState.engagement.daysActiveThisMonth);

    // === HISTORICAL CHRONICLE ===
    header('📜 HISTORICAL CHRONICLE');

    section('Milestones');
    if (profile.historicalChronicle.milestones.length === 0) {
      console.log(colors.dim + '  (no milestones yet)' + colors.reset);
    } else {
      profile.historicalChronicle.milestones.forEach((m) => {
        const icon =
          m.type === 'breakthrough'
            ? '🌟'
            : m.type === 'insight'
              ? '💡'
              : m.type === 'setback'
                ? '⚠️'
                : '📌';
        console.log(`  ${icon} ${colors.bright}${m.title}${colors.reset} (${m.significance})`);
        console.log(colors.dim + `     ${formatDate(m.date)}` + colors.reset);
        quote(m.description, 150);
      });
    }

    section('Weekly Notes');
    label('Total Notes', profile.historicalChronicle.weeklyNotes.length);
    if (profile.historicalChronicle.weeklyNotes.length > 0) {
      const latestNote =
        profile.historicalChronicle.weeklyNotes[profile.historicalChronicle.weeklyNotes.length - 1];
      console.log(colors.white + `  Latest (Week of ${latestNote.weekStartDate}):` + colors.reset);
      console.log(colors.dim + '  Summary:' + colors.reset);
      quote(latestNote.observations.weekInReview, 500);
      if (latestNote.observations.quotableInsights.length > 0) {
        console.log(colors.cyan + '  Quotable Insights:' + colors.reset);
        latestNote.observations.quotableInsights.forEach((q) => {
          console.log(colors.cyan + `    "${q}"` + colors.reset);
        });
      }
    }

    section('Assessment History');
    if (profile.historicalChronicle.assessmentHistory.length === 0) {
      console.log(colors.dim + '  (no assessments)' + colors.reset);
    } else {
      profile.historicalChronicle.assessmentHistory.forEach((a) => {
        const change =
          a.changeFromPrevious !== null
            ? ` (${a.changeFromPrevious > 0 ? '+' : ''}${a.changeFromPrevious})`
            : '';
        console.log(`  ${formatDate(a.date)}: Score ${a.totalScore} - ${a.severity}${change}`);
      });
    }

    // === COMPUTED METRICS ===
    header('📈 COMPUTED METRICS');
    label('Progress Score', profile.computedMetrics.progressScore + '/100');
    label('Progress Trend', profile.computedMetrics.progressTrend);
    label('Days on Platform', profile.computedMetrics.daysOnPlatform);
    label('Total Interactions', profile.computedMetrics.totalInteractions);
    label('Primary Distortion', profile.computedMetrics.primaryDistortion);
    label('Most Effective Intervention', profile.computedMetrics.mostEffectiveIntervention);
    console.log(colors.white + '  Weekly Averages:' + colors.reset);
    label('    Conversations', profile.computedMetrics.weeklyAverage.conversations);
    label('    Illuminate Entries', profile.computedMetrics.weeklyAverage.illuminateEntries);
    label('    Daily Logs', profile.computedMetrics.weeklyAverage.dailyLogs);

    // === FOOTER ===
    console.log('\n' + colors.cyan + '═'.repeat(60) + colors.reset);
    console.log(colors.green + colors.bright + '✓ Profile analysis complete' + colors.reset);
    console.log(
      colors.dim +
        `  Document stored at: users/${userId}/profile/psychologicalProfile` +
        colors.reset
    );
    console.log(colors.cyan + '═'.repeat(60) + colors.reset + '\n');
  } catch (error) {
    console.error('\n' + colors.red + '✗ Error generating profile:' + colors.reset);
    console.error(
      colors.red + (error instanceof Error ? error.message : String(error)) + colors.reset
    );
    if (error instanceof Error && error.stack) {
      console.error(colors.dim + error.stack + colors.reset);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
