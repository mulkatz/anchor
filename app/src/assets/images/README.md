# Images

Place your image assets in this directory.

## Optimization

Before adding images:

1. Compress using tools like TinyPNG or Squoosh
2. Use WebP format for better compression
3. Provide multiple sizes for responsive images

## Recommended Sizes

- **Thumbnails:** 150x150, 300x300
- **Cards:** 400x300, 800x600
- **Hero images:** 1920x1080, 2560x1440
- **Avatars:** 64x64, 128x128, 256x256

## Usage

```tsx
import heroImage from '../assets/images/hero.jpg';

<img src={heroImage} alt="Hero" className="w-full" />;
```

For responsive images:

```tsx
<picture>
  <source srcSet={heroWebP} type="image/webp" />
  <img src={heroJPG} alt="Hero" />
</picture>
```
