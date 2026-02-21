# Contributing to Anchor

Thank you for your interest in contributing! This is a mental health application, so please be especially mindful of clinical accuracy, safety, and accessibility.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

- Use [GitHub Issues](https://github.com/mulkatz/anxiety-buddy/issues) with the "bug" label
- Include: steps to reproduce, expected behavior, actual behavior, device/OS details
- Check existing issues first to avoid duplicates

### Suggesting Features

- Open a [GitHub Issue](https://github.com/mulkatz/anxiety-buddy/issues) with the "enhancement" label
- Describe the use case and proposed solution
- For therapeutic features, cite evidence-based approaches where possible

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes following our conventions (see below)
4. Ensure the build passes: `cd app && npm run build`
5. Commit with conventional commits: `feat: add new feature`
6. Push and open a Pull Request against `main`

### Development Setup

See [README.md](README.md#getting-started) for setup instructions.

## Conventions

- **Language:** All code and comments in English
- **TypeScript:** Strict mode, functional components
- **i18n:** All user-facing strings must use translation keys — never hardcode text
- **Design tokens:** Use project design tokens (void-blue, biolum-cyan, etc.) — never raw Tailwind colors
- **Haptics:** Every interaction needs appropriate haptic feedback
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- **Branches:** `feat/description`, `fix/description`

## Special Considerations

This is a mental health app. When contributing, please ensure:

- **Clinical accuracy:** Therapeutic approaches must be evidence-based (CBT, ACT, somatic grounding)
- **Safety-first:** Crisis detection must remain robust — never weaken safety features
- **Accessibility:** Design for cognitive overload states — minimal text, large touch targets, calming motion
- **Privacy:** Minimize data collection, maximize user control

## Questions?

Open a [Discussion](https://github.com/mulkatz/anxiety-buddy/discussions) for questions that aren't bug reports or feature requests.
