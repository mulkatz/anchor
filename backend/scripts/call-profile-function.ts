#!/usr/bin/env npx ts-node

/**
 * Test Script for Calling the Deployed createPsychologicalProfile Cloud Function
 *
 * Usage:
 *   npx ts-node call-profile-function.ts <userId> <adminKey> [language]
 *
 * Example:
 *   npx ts-node call-profile-function.ts abc123 my-secret-key en-US
 */

// Cloud Function URL
const FUNCTION_URL = 'https://createpsychologicalprofile-e7aoqov5mq-uc.a.run.app';

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
  if (!text) {
    console.log(colors.dim + '  "(none)"' + colors.reset);
    return;
  }
  const truncated = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  console.log(colors.dim + '  "' + truncated + '"' + colors.reset);
}

function formatTimestamp(
  ts: { _seconds: number; _nanoseconds: number } | null | undefined
): string {
  if (!ts) return '(unknown)';
  const date = new Date(ts._seconds * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface FunctionResponse {
  result?: Record<string, unknown>;
  error?: {
    status?: string;
    message?: string;
    details?: unknown;
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      colors.red +
        'Usage: npx ts-node call-profile-function.ts <userId> <adminKey> [language]' +
        colors.reset
    );
    console.log(
      colors.dim +
        'Example: npx ts-node call-profile-function.ts abc123 my-secret-key en-US' +
        colors.reset
    );
    process.exit(1);
  }

  const userId = args[0];
  const adminKey = args[1];
  const language = args[2] || 'en-US';

  header('🔬 DR. MULDER - PSYCHOLOGICAL PROFILE');
  console.log(colors.dim + `  User ID: ${userId}` + colors.reset);
  console.log(colors.dim + `  Language: ${language}` + colors.reset);
  console.log(
    colors.dim +
      `  Admin Key: ${adminKey.slice(0, 4)}${'*'.repeat(Math.max(0, adminKey.length - 4))}` +
      colors.reset
  );
  console.log(colors.dim + `  Function URL: ${FUNCTION_URL}` + colors.reset);

  try {
    console.log('\n' + colors.magenta + '⏳ Calling cloud function...' + colors.reset);
    const startTime = Date.now();

    // Call the function directly via HTTP
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          userId,
          adminKey,
          language,
        },
      }),
    });

    const responseData = (await response.json()) as FunctionResponse;

    if (!response.ok || responseData.error) {
      throw {
        code: responseData.error?.status || response.status,
        message: responseData.error?.message || 'Unknown error',
        details: JSON.stringify(responseData.error?.details || responseData),
      };
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(colors.green + `✓ Profile generated in ${duration}s` + colors.reset);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = responseData.result as any;

    if (!profile) {
      throw { code: 'NO_DATA', message: 'No profile data returned' };
    }

    // === METADATA ===
    section('DOCUMENT METADATA');
    label('Version', profile.version);
    label('Schema', profile.schemaVersion);
    label('Created', formatTimestamp(profile.createdAt));
    label('Last Updated', formatTimestamp(profile.lastUpdated));

    // === CORE IDENTITY ===
    header('🧠 CORE IDENTITY');

    section('Presenting Concerns');
    label('Primary', profile.coreIdentity?.presentingConcerns?.primary);
    console.log(colors.white + '  Secondary:' + colors.reset);
    list(profile.coreIdentity?.presentingConcerns?.secondary || [], 4);
    if (profile.coreIdentity?.presentingConcerns?.evolutionNotes) {
      console.log(colors.white + '  Evolution Notes:' + colors.reset);
      quote(profile.coreIdentity.presentingConcerns.evolutionNotes);
    }

    section('CBT Formulation');
    if (profile.coreIdentity?.formulation) {
      console.log(colors.blue + '  Cognitive Patterns:' + colors.reset);
      quote(profile.coreIdentity.formulation.cognitivePatterns || '', 300);
      console.log(colors.blue + '  Emotional Profile:' + colors.reset);
      quote(profile.coreIdentity.formulation.emotionalProfile || '', 300);
      console.log(colors.blue + '  Behavioral Patterns:' + colors.reset);
      quote(profile.coreIdentity.formulation.behavioralPatterns || '', 300);
    }

    section('Strengths');
    if (profile.coreIdentity?.strengths) {
      console.log(colors.green + '  Personal:' + colors.reset);
      list(profile.coreIdentity.strengths.personal || [], 4);
      console.log(colors.green + '  Coping:' + colors.reset);
      list(profile.coreIdentity.strengths.coping || [], 4);
      console.log(colors.green + '  Insights:' + colors.reset);
      list(profile.coreIdentity.strengths.insights || [], 4);
    }

    section('Risk Factors');
    if (profile.coreIdentity?.riskFactors) {
      console.log(colors.red + '  Current Vulnerabilities:' + colors.reset);
      list(profile.coreIdentity.riskFactors.currentVulnerabilities || [], 4);
      console.log(colors.green + '  Protective Factors:' + colors.reset);
      list(profile.coreIdentity.riskFactors.protectiveFactors || [], 4);
      label('Crisis History Count', profile.coreIdentity.riskFactors.crisisHistoryCount);
    }

    // === DYNAMIC STATE ===
    header('📊 DYNAMIC STATE');

    section('Current Focus');
    console.log(colors.white + '  Active Themes:' + colors.reset);
    list(profile.dynamicState?.currentFocus?.activeThemes || [], 4);
    console.log(colors.white + '  Working Hypotheses:' + colors.reset);
    list(profile.dynamicState?.currentFocus?.workingHypotheses || [], 4);

    section('Distortion Profile');
    if (profile.dynamicState?.distortionProfile) {
      label(
        'Dominant',
        (profile.dynamicState.distortionProfile.dominantDistortions || []).join(', ')
      );
      label(
        'Emerging',
        (profile.dynamicState.distortionProfile.emergingDistortions || []).join(', ') || '(none)'
      );
      label(
        'Declining',
        (profile.dynamicState.distortionProfile.decliningDistortions || []).join(', ') || '(none)'
      );
    }

    section('Emotional Profile');
    if (profile.dynamicState?.emotionalProfile) {
      label('Intensity Trend', profile.dynamicState.emotionalProfile.intensityTrend);
      label(
        '30-Day Avg Intensity',
        profile.dynamicState.emotionalProfile.averageIntensity30Day + '/100'
      );
    }

    section('Treatment Considerations');
    if (profile.dynamicState?.treatmentConsiderations) {
      label('Current Approach', profile.dynamicState.treatmentConsiderations.currentApproach);
      console.log(colors.green + '  Effective Interventions:' + colors.reset);
      list(
        (profile.dynamicState.treatmentConsiderations.effectiveInterventions || []).map(
          (i: { name: string; type: string }) => `${i.name} (${i.type})`
        ),
        4
      );
      console.log(colors.yellow + '  Suggested Adaptations:' + colors.reset);
      list(profile.dynamicState.treatmentConsiderations.suggestedAdaptations || [], 4);
    }

    // === HISTORICAL CHRONICLE ===
    header('📜 HISTORICAL CHRONICLE');

    section('Milestones');
    const milestones = profile.historicalChronicle?.milestones || [];
    if (milestones.length === 0) {
      console.log(colors.dim + '  (no milestones yet)' + colors.reset);
    } else {
      milestones.forEach(
        (m: {
          type: string;
          title: string;
          significance: string;
          date: { _seconds: number; _nanoseconds: number };
          description: string;
        }) => {
          const icon =
            m.type === 'breakthrough'
              ? '🌟'
              : m.type === 'insight'
                ? '💡'
                : m.type === 'setback'
                  ? '⚠️'
                  : '📌';
          console.log(`  ${icon} ${colors.bright}${m.title}${colors.reset} (${m.significance})`);
          console.log(colors.dim + `     ${formatTimestamp(m.date)}` + colors.reset);
          quote(m.description, 150);
        }
      );
    }

    section('Weekly Notes');
    const weeklyNotes = profile.historicalChronicle?.weeklyNotes || [];
    label('Total Notes', weeklyNotes.length);

    // === COMPUTED METRICS ===
    header('📈 COMPUTED METRICS');
    if (profile.computedMetrics) {
      label('Progress Score', profile.computedMetrics.progressScore + '/100');
      label('Progress Trend', profile.computedMetrics.progressTrend);
      label('Days on Platform', profile.computedMetrics.daysOnPlatform);
      label('Total Interactions', profile.computedMetrics.totalInteractions);
      label('Primary Distortion', profile.computedMetrics.primaryDistortion);
    }

    // === FOOTER ===
    console.log('\n' + colors.cyan + '═'.repeat(60) + colors.reset);
    console.log(colors.green + colors.bright + '✓ Profile analysis complete' + colors.reset);
    console.log(
      colors.dim +
        `  Document stored at: users/${userId}/profile/psychologicalProfile` +
        colors.reset
    );
    console.log(colors.cyan + '═'.repeat(60) + colors.reset + '\n');
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string; details?: string };
    console.error('\n' + colors.red + '✗ Error:' + colors.reset);
    if (err.code) {
      console.error(colors.red + `  Code: ${err.code}` + colors.reset);
    }
    if (err.message) {
      console.error(colors.red + `  Message: ${err.message}` + colors.reset);
    }
    if (err.details) {
      console.error(colors.dim + `  Details: ${err.details}` + colors.reset);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
