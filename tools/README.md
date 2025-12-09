# Tools

This directory contains development utilities and automation scripts.

## Purpose

Tools are separate projects that help with:
- Automated testing
- Screenshot generation
- Code generation
- Build automation
- Development workflows

## Structure

Each tool is a separate npm package:

```
tools/
├── screenshot-generator/   # Automated app screenshots
│   ├── package.json
│   ├── src/
│   └── README.md
├── code-generator/         # Boilerplate code generation
│   ├── package.json
│   ├── templates/
│   └── README.md
└── README.md              # This file
```

## Available Tools

### (Example) Screenshot Generator

Automates screenshot capture for App Store and Google Play listings.

```bash
cd tools/screenshot-generator
npm install
npm run generate
```

See individual tool READMEs for specific usage.

## Creating a New Tool

1. Create directory in `tools/`
2. Initialize with `npm init`
3. Add to root `package.json` workspaces if needed
4. Document usage in tool's README.md

### Template

```bash
mkdir tools/my-tool
cd tools/my-tool
npm init -y
```

```json
{
  "name": "my-tool",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  }
}
```

## Tool Guidelines

### When to Create a Tool

Create a tool when:
- ✅ Task is repetitive and time-consuming
- ✅ Task can be automated
- ✅ Tool can be reused across projects
- ✅ Tool has clear input/output

Don't create a tool when:
- ❌ Task is one-time only
- ❌ Existing tools can do the job
- ❌ Tool is more complex than manual work

### Tool Best Practices

- **Single purpose** - Each tool does one thing well
- **Good documentation** - Clear README with examples
- **Error handling** - Graceful failures with helpful messages
- **Configuration** - Allow customization via config files
- **Testing** - Test your tools like production code

## Running Tools

### From Root

```bash
# If tool is in workspaces
npm run tool-name --workspace=tools/tool-name

# Or directly
node tools/tool-name/index.js
```

### From Tool Directory

```bash
cd tools/tool-name
npm install
npm start
```

## Common Tool Patterns

### CLI Tool

```javascript
#!/usr/bin/env node
const args = process.argv.slice(2);
const [command, ...options] = args;

switch (command) {
  case 'generate':
    generate(options);
    break;
  default:
    console.log('Usage: my-tool <command>');
}
```

### Configuration File

```javascript
// Load config
const config = require('./config.json');

// Or use environment variables
const config = {
  apiKey: process.env.API_KEY,
  baseUrl: process.env.BASE_URL,
};
```

### Progress Feedback

```javascript
const ora = require('ora');

const spinner = ora('Processing...').start();

try {
  await doWork();
  spinner.succeed('Done!');
} catch (error) {
  spinner.fail('Failed!');
  console.error(error);
}
```

## Example Tools You Might Add

### Screenshot Generator
- Automate app screenshot capture
- Generate localized screenshots
- Resize for different devices

### Code Generator
- Generate boilerplate components
- Create CRUD operations
- Scaffold new features

### Database Seeder
- Populate development database
- Create test data
- Reset database to known state

### Asset Optimizer
- Compress images
- Generate icon sets
- Optimize SVGs

### Release Automation
- Update version numbers
- Generate changelogs
- Create git tags

### i18n Manager
- Extract translation keys
- Generate translation files
- Validate translations

## Dependencies

Tools can have their own dependencies separate from the main app:

```bash
cd tools/my-tool
npm install --save-dev puppeteer chalk commander
```

## Sharing Code with Main App

If a tool needs to import from the main app:

```javascript
// Use relative path
const { apiClient } = require('../../app/src/services/api');
```

Or create a shared package:

```
packages/
  shared/
    src/
      utils.ts
```

## Tool Testing

Test your tools to ensure reliability:

```bash
cd tools/my-tool
npm install --save-dev jest
```

```javascript
// my-tool.test.js
test('generates correct output', () => {
  const result = myTool({ input: 'test' });
  expect(result).toBe('expected');
});
```

## Publishing Tools

If your tool is useful for others:

1. Create public repo
2. Add MIT license
3. Write good documentation
4. Publish to npm: `npm publish`

---

## Resources

- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Interactive CLI
- [Chalk](https://github.com/chalk/chalk) - Terminal colors
- [Ora](https://github.com/sindresorhus/ora) - Terminal spinners

---

**Last updated:** December 2025
