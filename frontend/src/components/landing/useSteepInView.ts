import { useEffect, useRef, useState } from 'react';

export function useSteepInView(
  rootMargin = '0px 0px -15% 0px'
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.85) {
            setIsInView(false);
          }
        });
      },
      { threshold: 0.08, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isInView];
}
