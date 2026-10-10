import { useEffect, useRef, useState } from 'react';
import { usePremium } from './usePremium';

interface AdSlotProps {
  maxWidth: number;
  minHeight: number;
  /** Injecte les scripts du réseau dans le conteneur ; peut renvoyer un nettoyage. */
  mount: (container: HTMLElement) => void | (() => void);
}

/**
 * Emplacement publicitaire :
 * - rien pour les abonnés Premium (ni tant que le statut est inconnu) ;
 * - scripts chargés seulement quand l'emplacement approche de l'écran ;
 * - les scripts sont créés via le DOM (ceux collés dans le JSX ne s'exécutent pas) ;
 * - le conteneur est vidé avant et après injection, ce qui évite les doublons en StrictMode.
 */
export default function AdSlot({ maxWidth, minHeight, mount }: AdSlotProps) {
  const { isPremium, loading } = usePremium();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (loading || isPremium) return;
    const el = wrapperRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, isPremium]);

  useEffect(() => {
    if (!inView || loading || isPremium) return;
    const el = slotRef.current;
    if (!el) return;

    el.innerHTML = '';
    const cleanup = mount(el);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      el.innerHTML = '';
    };
  }, [inView, loading, isPremium]);

  if (loading || isPremium) return null;

  return (
    <div ref={wrapperRef} style={{ margin: '32px auto 0', maxWidth }}>
      <div style={{
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 6
      }}>
        PUBLICITÉ
      </div>
      <div ref={slotRef} style={{ minHeight, display: 'flex', justifyContent: 'center' }} />
    </div>
  );
}
