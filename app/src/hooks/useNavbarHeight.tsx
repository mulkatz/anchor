import { useEffect, useState } from 'react';

/**
 * Hook to track the FloatingDock's height and bottom position
 * Returns the total offset from the bottom of the viewport
 */
export const useNavbarHeight = () => {
  const [navbarOffset, setNavbarOffset] = useState(0);

  useEffect(() => {
    const measureNavbar = () => {
      const navbar = document.querySelector('[data-floating-dock]');
      if (navbar) {
        const rect = navbar.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate total offset: distance from bottom of viewport to top of navbar
        const bottomOffset = viewportHeight - rect.top;
        setNavbarOffset(bottomOffset);
      }
    };

    // Initial measurement
    measureNavbar();

    // Measure on resize (orientation changes, etc.)
    window.addEventListener('resize', measureNavbar);

    // Use MutationObserver to detect when navbar is added to DOM
    const observer = new MutationObserver(measureNavbar);
    observer.observe(document.body, { childList: true, subtree: true });

    // Small delay to ensure navbar is rendered
    const timeout = setTimeout(measureNavbar, 100);

    return () => {
      window.removeEventListener('resize', measureNavbar);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return navbarOffset;
};
