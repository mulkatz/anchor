# Documentation

Welcome to the Project Starter documentation. This directory contains comprehensive guides for developers working with this template.

## Documentation Index

### Getting Started

| Document | Description | For |
|----------|-------------|-----|
| [README.md](../README.md) | Project overview, quick start guide | Everyone |
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Complete setup and development guide | New developers |
| [CLAUDE.md](../CLAUDE.md) | AI assistant context, architecture details | AI assistants, senior devs |

### Architecture & Design

| Document | Description | For |
|----------|-------------|-----|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, design decisions | Architects, senior devs |

### By Topic

#### Mobile App (`/app`)
- **Structure:** See [CLAUDE.md - Repository Structure](../CLAUDE.md#repository-structure)
- **Components:** See [CLAUDE.md - Component Architecture](../CLAUDE.md#component-architecture)
- **Hooks:** See [CLAUDE.md - Custom Hooks Pattern](../CLAUDE.md#custom-hooks-pattern)
- **Services:** See [CLAUDE.md - Service Layer Pattern](../CLAUDE.md#service-layer-pattern)

#### Backend (`/backend`)
- **Functions:** See [GETTING-STARTED.md - Backend Development](./GETTING-STARTED.md#backend-development-firebase-functions)
- **Firebase:** See [Firebase Documentation](https://firebase.google.com/docs)

#### Development
- **Workflow:** See [GETTING-STARTED.md - Development Workflow](./GETTING-STARTED.md#development-workflow)
- **Testing:** See [ARCHITECTURE.md - Testing Strategy](./ARCHITECTURE.md#testing-strategy-recommended)
- **Deployment:** See [GETTING-STARTED.md - Building for Production](./GETTING-STARTED.md#building-for-production)

## Quick Links

### For First-Time Contributors
1. Read [README.md](../README.md) - Understand what this project is
2. Follow [GETTING-STARTED.md](./GETTING-STARTED.md) - Set up your environment
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the architecture

### For AI Assistants
1. Read [CLAUDE.md](../CLAUDE.md) - Complete project context
2. Review existing code patterns
3. Ask clarifying questions when needed

### For Code Reviews
1. Check naming conventions in [CLAUDE.md](../CLAUDE.md#naming-conventions)
2. Verify component structure follows [patterns](../CLAUDE.md#component-architecture)
3. Ensure types are defined in `models/`

## External Resources

### Official Documentation
- [React](https://react.dev) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Language
- [Vite](https://vitejs.dev) - Build tool
- [Capacitor](https://capacitorjs.com/docs) - Mobile runtime
- [Firebase](https://firebase.google.com/docs) - Backend platform
- [Tailwind CSS](https://tailwindcss.com) - Styling

### Useful Guides
- [React Hooks](https://react.dev/reference/react) - Complete hooks reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - TS guide
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins) - Native functionality
- [Firebase Functions](https://firebase.google.com/docs/functions) - Backend functions

### Community
- [Stack Overflow](https://stackoverflow.com) - Questions with tags: `react`, `typescript`, `capacitor`, `firebase`
- [Discord/Slack](https://discord.gg/capacitor) - Capacitor community
- [GitHub Discussions](https://github.com/ionic-team/capacitor/discussions) - Capacitor discussions

## Adding Documentation

### When to Add Documentation

Add documentation when:
- ✅ Introducing new architecture patterns
- ✅ Adding complex features
- ✅ Making breaking changes
- ✅ Establishing team conventions

Don't add documentation for:
- ❌ Self-explanatory code
- ❌ Standard React patterns
- ❌ Temporary experiments

### Documentation Template

```markdown
# Feature/Topic Name

## Overview
Brief description of what this is and why it exists.

## Usage
How to use this feature/pattern.

\`\`\`typescript
// Code example
\`\`\`

## API Reference
If applicable, document the public API.

## Common Issues
Known gotchas or frequently asked questions.

## Related
Links to related documentation or code.
```

### Where to Put Documentation

| Type | Location | Example |
|------|----------|---------|
| Project overview | `/README.md` | Project introduction |
| Getting started | `/docs/GETTING-STARTED.md` | Setup guide |
| Architecture | `/docs/ARCHITECTURE.md` | System design |
| AI context | `/CLAUDE.md` | Complete context for AI |
| Feature-specific | `/docs/features/` | Feature documentation |
| API docs | `/docs/api/` | API reference |
| Component docs | Inline comments + Storybook | Component usage |

## Maintaining Documentation

### Review Schedule
- **After each feature:** Update relevant docs
- **Monthly:** Review for outdated content
- **Before releases:** Ensure changelog is updated

### Documentation Checklist

Before merging a PR with documentation changes:
- [ ] Spell check
- [ ] Links work
- [ ] Code examples compile
- [ ] Screenshots are up to date
- [ ] TOC is updated (if applicable)
- [ ] Cross-references are correct

---

## Need Help?

- **Can't find what you're looking for?** Check the [README](../README.md) or [CLAUDE.md](../CLAUDE.md)
- **Found an error?** Open an issue or submit a PR
- **Have a question?** Ask on Stack Overflow with relevant tags

---

**Last updated:** December 2025
