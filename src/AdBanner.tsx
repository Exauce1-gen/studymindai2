import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

// Composant de publicité Google AdSense
export default function AdBanner({ slot, format = 'auto', style }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '20px 0', ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2666921129719953"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Slots de publicité prédéfinis
export const AdSlots = {
  DASHBOARD_TOP: '9412249254',
  // Pas encore créés dans AdSense — ces emplacements ne sont pas utilisés
  // dans le code pour l'instant (aucun composant ne les référence).
  LEARNING_SIDEBAR: '',
  RESULTS_BOTTOM: '',
};
