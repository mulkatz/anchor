#!/usr/bin/env node

/**
 * Version bump script for Cap2Cal
 * Updates version across package.json, Android, and iOS
 *
 * Usage: npm run bump:patch | bump:minor | bump:major
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appDir = join(__dirname, '..');

// Parse command line arguments
const bumpType = process.argv[2]; // 'patch', 'minor', or 'major'

if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Usage: node bump-version.js <patch|minor|major>');
  process.exit(1);
}

// Read current version from package.json
const packageJsonPath = join(appDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Calculate new version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;

switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Calculate build number (major * 10000 + minor * 100 + patch)
const [newMajor, newMinor, newPatch] = newVersion.split('.').map(Number);
const buildNumber = newMajor * 10000 + newMinor * 100 + newPatch;

console.log(`Bumping version from ${currentVersion} to ${newVersion}`);
console.log(`Build number: ${buildNumber}`);

// 1. Update package.json
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ Updated package.json');

// 2. Update Android build.gradle
const buildGradlePath = join(appDir, 'native/android/app/build.gradle');
let buildGradle = readFileSync(buildGradlePath, 'utf8');

buildGradle = buildGradle.replace(/versionCode \d+/, `versionCode ${buildNumber}`);
buildGradle = buildGradle.replace(/versionName "[^"]+"/, `versionName "${newVersion}"`);

writeFileSync(buildGradlePath, buildGradle);
console.log('✓ Updated Android build.gradle');

// 3. Update iOS project.pbxproj
const pbxprojPath = join(appDir, 'native/ios/App/App.xcodeproj/project.pbxproj');
let pbxproj = readFileSync(pbxprojPath, 'utf8');

pbxproj = pbxproj.replace(
  /CURRENT_PROJECT_VERSION = \d+;/g,
  `CURRENT_PROJECT_VERSION = ${buildNumber};`
);
pbxproj = pbxproj.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${newVersion};`);

writeFileSync(pbxprojPath, pbxproj);
console.log('✓ Updated iOS project.pbxproj');

console.log('\n✨ Version bump complete!');
console.log(`Version: ${currentVersion} → ${newVersion}`);
console.log(`Build: ${buildNumber}`);
