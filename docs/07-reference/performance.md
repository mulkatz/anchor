# Performance Targets

**Read this when:** Performance issues, optimization, profiling, build size concerns

---

## Build Size Targets

| Metric               | Target            | Priority |
| -------------------- | ----------------- | -------- |
| **Initial bundle**   | < 500KB (gzipped) | High     |
| **First load**       | < 1MB total       | High     |
| **Lighthouse score** | > 90              | Medium   |

### Bundle Optimization

**Code Splitting:**

- Lazy-load non-critical pages (Vault, Profile)
- Dynamic imports for heavy components

```typescript
const VaultPage = lazy(() => import('./pages/VaultPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
```

**Tree Shaking:**

- Vite automatically tree-shakes unused code
- Import only what you need from libraries

```typescript
// ❌ BAD
import * as icons from 'lucide-react';

// ✅ GOOD
import { Home, Settings } from 'lucide-react';
```

**Bundle Analysis:**

```bash
cd app
npm run build -- --report
```

---

## Runtime Performance

| Metric                  | Target      | Priority |
| ----------------------- | ----------- | -------- |
| **Frame rate**          | 60 FPS      | Critical |
| **Time to Interactive** | < 2 seconds | High     |
| **Haptics latency**     | < 50ms      | High     |
| **Animation jank**      | None        | High     |

### Ensuring 60 FPS

**Do:**

- Animate `transform` and `opacity` only (GPU-accelerated)
- Use `will-change` for frequently animated elements
- Use `requestAnimationFrame` for custom animations

**Don't:**

- Animate `width`, `height`, `margin`, `padding`
- Use heavy backdrop-blur on multiple elements
- Re-render large lists frequently

### Measuring Performance

**Chrome DevTools:**

1. Open DevTools → Performance tab
2. Click Record
3. Perform action
4. Check for:
   - Red frames (dropped)
   - Long tasks (> 50ms)
   - Layout thrashing

**React DevTools:**

1. Install React DevTools extension
2. Profiler tab
3. Record renders
4. Identify slow components

---

## Battery Usage

| Aspect                   | Target                    |
| ------------------------ | ------------------------- |
| **Wake locks**           | Minimal (only during SOS) |
| **Background processes** | None (yet)                |
| **Animation loops**      | Pause when not visible    |

### Optimization Strategies

**Pause animations when hidden:**

```typescript
const [isVisible, setIsVisible] = useState(true);

useEffect(() => {
  const handleVisibility = () => {
    setIsVisible(document.visibilityState === 'visible');
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);

// Pause animation loop when not visible
useEffect(() => {
  if (!isVisible) return;
  const id = setInterval(animationLoop, 16);
  return () => clearInterval(id);
}, [isVisible]);
```

**Reduce polling:**

- Use Firestore real-time listeners (efficient)
- Avoid setInterval for data fetching

---

## Memory Management

**Prevent leaks:**

```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe(); // Always cleanup!
}, []);
```

**Virtualize long lists:**

```typescript
// For 100+ items, use virtualization
import { FixedSizeList } from 'react-window';
```

**Image optimization:**

- Compress images before including
- Use appropriate sizes (not 4K for thumbnails)
- Lazy-load off-screen images

---

## Network Performance

**Firebase Firestore:**

- Use indexed queries
- Limit query results (`.limit(50)`)
- Cache aggressively

**Cloud Storage:**

- Audio files: 5MB max
- Profile photos: 2MB max
- Enable caching headers

**Offline-first (planned):**

- Use Dexie for IndexedDB caching
- Sync when online

---

## Profiling Commands

**Lighthouse:**

```bash
npx lighthouse http://localhost:5173 --view
```

**Bundle size:**

```bash
cd app
npm run build
du -sh dist/
```

**Detailed analysis:**

```bash
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts, then build
```

---

## See Also

- [Animations](../02-design-system/animations.md) - Performance tips
- [Troubleshooting](../06-development/troubleshooting.md) - Fixing jank
- [Tech Stack](../03-architecture/tech-stack.md) - Dependencies
