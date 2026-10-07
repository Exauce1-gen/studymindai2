import { useState, useEffect } from 'react';

const DISMISS_KEY = 'pwa_install_banner_dismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true // Safari iOS
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);

  useEffect(() => {
    // Déjà installée, ou déjà fermée définitivement par l'utilisateur : ne rien afficher
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === 'true') {
      return;
    }

    if (isIOS()) {
      // iOS ne déclenche jamais "beforeinstallprompt" : on affiche directement
      // la bannière avec les instructions manuelles.
      setPlatform('ios');
      setShow(true);
      return;
    }

    // Android / Chrome / Edge : on intercepte l'invite native du navigateur
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShow(false);
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === 'accepted') {
      // Vraiment installée : on ne la montre plus jamais.
      dismiss();
    } else {
      // Annulée par l'utilisateur dans la fenêtre native : on masque juste
      // pour cette visite, elle réapparaîtra au prochain passage sur le Dashboard.
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 16,
      right: 16,
      maxWidth: 480,
      margin: '0 auto',
      background: '#151526',
      border: '1px solid #333',
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      zIndex: 1000
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 900,
        color: '#fff',
        flexShrink: 0
      }}>
        AI
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 2 }}>
          Installer StudyMind AI
        </div>
        <div style={{ color: '#9a9ab0', fontSize: 12.5, lineHeight: 1.4 }}>
          {platform === 'ios'
            ? <>Appuie sur <strong>Partager</strong> puis <strong>« Sur l'écran d'accueil »</strong></>
            : 'Accès plus rapide, même sur connexion lente'}
        </div>
      </div>

      {platform === 'android' && (
        <button
          onClick={handleInstall}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          Installer
        </button>
      )}

      <button
        onClick={dismiss}
        aria-label="Fermer"
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: 20,
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
          lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  );
}
