# Icons

Place your icon assets in this directory.

## Recommended Format

- **SVG** for scalability
- **PNG** for bitmap icons (multiple sizes: 16x16, 32x32, 64x64, 128x128)
- **WebP** for modern browsers with fallbacks

## Organization

```
icons/
├── social/          # Social media icons
├── ui/              # UI icons (arrows, checkmarks, etc.)
└── brand/           # Brand logos
```

## Usage

```tsx
import logo from '../assets/icons/logo.svg';

<img src={logo} alt="Logo" />;
```

Or with Lucide React icons (already installed):

```tsx
import { Camera, User, Settings } from 'lucide-react';

<Camera size={24} />;
```
