# Icons

**IMPORTANT: This project uses `lucide-react` exclusively for all icons. Do NOT use inline SVGs or SVG files.**

## Icon Standard: lucide-react ONLY

All icons in this project must come from the `lucide-react` library. This ensures:

- **Consistency**: Unified icon style across the entire app
- **Performance**: Icons are optimized React components, not inline SVGs
- **Maintainability**: Single source of truth for all icons
- **Accessibility**: Built-in accessibility features

## Usage

```tsx
import { Camera, User, Settings, AlertCircle, MessageCircle } from 'lucide-react';

// Basic usage
<Camera size={24} className="text-biolum-cyan" />

// With custom styling
<User size={32} strokeWidth={1.5} className="text-mist-white" />

// In IconButton component (type-safe)
import { IconButton } from '@/components/ui/buttons/IconButton';
import { Send } from 'lucide-react';

<IconButton icon={Send} iconSize={24} onClick={handleClick} />
```

## Finding Icons

Browse all available icons at: [https://lucide.dev/icons/](https://lucide.dev/icons/)

## Custom Brand Assets

For custom brand logos or unique graphics that don't exist in lucide-react:

- Place image files (PNG, WebP) in this directory
- Use them with `<img>` tags for static brand assets only
- **Never create inline SVG icons** - find an equivalent in lucide-react instead

## Organization

```
icons/
└── brand/           # Brand logos and custom assets (rare exceptions only)
```
