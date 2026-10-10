import { useEffect } from 'react';
import { usePremium } from './usePremium';

const SOCIAL_BAR_SRC = 'https://bicea.org/14/d8ac18defb40695bf28d159340af79fe';

/**
 * Adsterra Social Bar. Le script ajoute ses éléments directement dans <body> :
 * on les suit pour pouvoir les retirer quand le composant disparaît
 * (abonné Premium, ouverture d'un écran de paiement/paramètres, changement d'écran).
 */
export default function AdSocialBar() {
  const { isPremium, loading } = usePremium();

  useEffect(() => {
    if (loading || isPremium) return;

    const added: Node[] = [];
    const script = document.createElement('script');
    script.setAttribute('data-cfasync', 'false');
    script.src = SOCIAL_BAR_SRC;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n !== script) added.push(n);
        })
      );
    });
    observer.observe(document.body, { childList: true });
    document.body.appendChild(script);

    return () => {
      observer.disconnect();
      script.remove();
      added.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
    };
  }, [loading, isPremium]);

  return null;
}
