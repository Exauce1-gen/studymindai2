import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import AdBanner300x250 from './AdBanner300x250';
import { MONETAG_LINK, isAdult } from './adConfig';

const WAIT_SECONDS = 30;
const MAX_BONUS_PER_DAY = 2;

// Compteur de bonus du jour (stocké dans le navigateur).
function storageKey(userId?: string) {
  return `bonus_${userId}_${new Date().toISOString().split('T')[0]}`;
}
function bonusUsed(userId?: string): number {
  try {
    return parseInt(localStorage.getItem(storageKey(userId)) || '0', 10) || 0;
  } catch {
    return 0;
  }
}
function addBonusUsed(userId?: string) {
  try {
    localStorage.setItem(storageKey(userId), String(bonusUsed(userId) + 1));
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

interface Props {
  label: string; // ex: "résumé", "quiz", "message"
  onGrant: () => Promise<void>;
}

/**
 * Bonus contre une pub de 30 s, affiché quand le quota du jour est épuisé.
 * - Majeurs : le lien direct s'ouvre dans un nouvel onglet, on attend 30 s.
 * - Mineurs : une bannière s'affiche dans la fenêtre pendant 30 s (pas de lien direct).
 * Le bonus n'est crédité que lorsque l'élève récupère le message final (croix / bouton).
 * Note : le temps écoulé est mesuré, mais il n'est pas possible de prouver que la pub a été regardée.
 */
export default function RewardedUnlock({ label, onGrant }: Props) {
  const { user, userProfile } = useAuth();
  const adult = isAdult(userProfile?.date_of_birth);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'waiting' | 'done'>('waiting');
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  const [used, setUsed] = useState(0);
  const startRef = useRef(0);
  const claimingRef = useRef(false);

  useEffect(() => {
    setUsed(bonusUsed(user?.id));
  }, [user?.id]);

  const remaining = Math.max(0, MAX_BONUS_PER_DAY - used);

  // Compte à rebours basé sur l'heure réelle (robuste si l'onglet est en pause
  // pendant que l'élève est sur la page de pub).
  useEffect(() => {
    if (!open || phase !== 'waiting') return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const left = Math.max(0, WAIT_SECONDS - elapsed);
      setSecondsLeft(left);
      if (left === 0) setPhase('done');
    };

    const id = window.setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    tick();
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [open, phase]);

  const start = () => {
    startRef.current = Date.now();
    claimingRef.current = false;
    setSecondsLeft(WAIT_SECONDS);
    setPhase('waiting');
    setOpen(true);
    // Doit être appelé directement dans le clic, sinon le navigateur bloque la fenêtre.
    if (adult) window.open(MONETAG_LINK, '_blank', 'noopener,noreferrer');
  };

  const cancel = () => setOpen(false);

  const claim = async () => {
    if (claimingRef.current) return;
    claimingRef.current = true;
    addBonusUsed(user?.id);
    setUsed(bonusUsed(user?.id));
    setOpen(false);
    await onGrant();
  };

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        {remaining > 0 ? (
          <>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 10, lineHeight: 1.5 }}>
              {adult
                ? 'Clique sur le bouton, regarde la pub et reviens 30s après pour gagner ton bonus.'
                : 'Clique sur le bouton et regarde la pub pendant 30s pour gagner ton bonus.'}
            </div>
            <button
              onClick={start}
              style={{
                padding: '12px 24px',
                background: 'rgba(0,184,148,0.15)',
                border: '1px solid #00b894',
                borderRadius: 10,
                color: '#00b894',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🎁 Gagner +1 {label}
            </button>
            <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
              {remaining} bonus restant{remaining > 1 ? 's' : ''} aujourd'hui
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: '#888' }}>
            Tu as utilisé tes {MAX_BONUS_PER_DAY} bonus du jour. Reviens demain ou passe à Premium.
          </div>
        )}
      </div>

      {open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 380,
            maxHeight: '92vh',
            overflowY: 'auto',
            background: '#151526',
            border: '1px solid #333',
            borderRadius: 18,
            padding: '28px 20px 22px',
            textAlign: 'center'
          }}>
            <button
              onClick={phase === 'done' ? claim : cancel}
              aria-label={phase === 'done' ? 'Récupérer mon bonus' : 'Annuler'}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: 26,
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ×
            </button>

            {phase === 'waiting' ? (
              <>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  Bonus dans {secondsLeft}s
                </div>
                <div style={{
                  height: 6,
                  background: '#262638',
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 14
                }}>
                  <div style={{
                    width: `${((WAIT_SECONDS - secondsLeft) / WAIT_SECONDS) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6C5CE7, #fd79a8)',
                    transition: 'width 0.5s linear'
                  }} />
                </div>

                {adult ? (
                  <>
                    <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.5 }}>
                      Une page de pub s'est ouverte dans un nouvel onglet. Regarde-la, puis reviens ici.
                    </div>
                    <a
                      href={MONETAG_LINK}
                      target="_blank"
                      rel="noopener noreferrer sponsored nofollow"
                      style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: '#6C5CE7' }}
                    >
                      La pub ne s'est pas ouverte ? Touche ici
                    </a>
                  </>
                ) : (
                  <AdBanner300x250 />
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Bonus gagné !
                </div>
                <div style={{ fontSize: 14, color: '#aaa', marginBottom: 18 }}>
                  +1 {label} offert. Touche la croix ou le bouton pour l'activer.
                </div>
                <button
                  onClick={claim}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Récupérer mon bonus
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
