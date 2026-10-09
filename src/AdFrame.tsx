import { useEffect, useRef, useState } from 'react';
import { usePremium } from './usePremium';

type AdKind = 'banner' | 'native';

/**
 * Les pubs tournent dans un iframe "sandbox" SANS `allow-same-origin` :
 * le code du réseau publicitaire ne peut ni lire le localStorage de l'app
 * (où se trouve la session Supabase), ni modifier la page. Il peut seulement
 * afficher la pub et ouvrir un nouvel onglet quand on clique dessus.
 */
const SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';

const FRAME_STYLE =
  '<meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style>';

const ADS: Record<AdKind, { width: number | string; maxWidth: number; height: number; html: string }> = {
  // Adsterra — bannière 300x250
  banner: {
    width: 300,
    maxWidth: 300,
    height: 250,
    html:
      '<!DOCTYPE html><html><head>' + FRAME_STYLE + '</head><body>' +
      '<script>atOptions={"key":"20fc9e612591866e215158a0c4eae20b","format":"iframe","height":250,"width":300,"params":{}};</script>' +
      '<script src="https://bicea.org/22/20fc9e612591866e215158a0c4eae20b"></script>' +
      '</body></html>',
  },
  // Adsterra — bannière native
  native: {
    width: '100%',
    maxWidth: 480,
    height: 320,
    html:
      '<!DOCTYPE html><html><head>' + FRAME_STYLE + '</head><body>' +
      '<script async="async" data-cfasync="false" src="https://bicea.org/21/4e2be52272380774a825aa653412c2c4"></script>' +
      '<div id="container-4e2be52272380774a825aa653412c2c4"></div>' +
      '</body></html>',
  },
};

export default function AdFrame({ kind }: { kind: AdKind }) {
  const { isPremium, loading } = usePremium();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Chargement différé : le réseau pub n'est contacté que lorsque l'emplacement
  // approche de l'écran (économise la connexion des utilisateurs lents).
  useEffect(() => {
    if (loading || isPremium) return;
    const el = ref.current;
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

  // Aucune pub pour les abonnés Premium, ni tant que le statut est inconnu.
  if (loading || isPremium) return null;

  const ad = ADS[kind];

  return (
    <div ref={ref} style={{ margin: '32px auto 0', maxWidth: ad.maxWidth }}>
      <div style={{
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 6
      }}>
        PUBLICITÉ
      </div>
      <div style={{ minHeight: ad.height, display: 'flex', justifyContent: 'center' }}>
        {inView && (
          <iframe
            title="Publicité"
            srcDoc={ad.html}
            sandbox={SANDBOX}
            scrolling="no"
            style={{ border: 0, width: ad.width, height: ad.height, maxWidth: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
