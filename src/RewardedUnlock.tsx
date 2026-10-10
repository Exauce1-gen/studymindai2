import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { MONETAG_LINK } from './adConfig';

const WAIT_SECONDS = 30;
const MAX_BONUS_PER_DAY = 2;
const PENDING_MAX_AGE_MS = 60 * 60 * 1000; // une demande de bonus expire après 1 h

// ---- Compteur de bonus du jour (stocké dans le navigateur) ----
function countKey(userId?: string) {
  return `bonus_${userId}_${new Date().toISOString().split('T')[0]}`;
}
function bonusUsed(userId?: string): number {
  try {
    return parseInt(localStorage.getItem(countKey(userId)) || '0', 10) || 0;
  } catch {
    return 0;
  }
}
function addBonusUsed(userId?: string) {
  try {
    localStorage.setItem(countKey(userId), String(bonusUsed(userId) + 1));
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

// ---- Demande de bonus en cours (survit à un rechargement ou à un départ de l'app) ----
interface Pending {
  startedAt: number;
  label: string;
}
const pendingKey = (userId?: string) => `bonus_pending_${userId}`;
function readPending(userId?: string): Pending | null {
  try {
    const raw = localStorage.getItem(pendingKey(userId));
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}
function writePending(userId: string | undefined, p: Pending) {
  try {
    localStorage.setItem(pendingKey(userId), JSON.stringify(p));
  } catch {
    /* ignoré */
  }
}
function clearPending(userId?: string) {
  try {
    localStorage.removeItem(pendingKey(userId));
  } catch {
    /* ignoré */
  }
}

interface Props {
  label: string; // ex: "résumé", "quiz", "message"
  onGrant: () => Promise<void>;
}

/**
 * Bonus contre une pub : le lien direct Monetag s'ouvre dans un nouvel onglet,
 * on attend 30 s. Si l'élève reste dans l'app, un message "Bonus gagné" apparaît
 * (croix = récupérer). S'il quitte l'app ou si la page est rechargée, le bonus
 * s'active automatiquement à son retour une fois les 30 s écoulées.
 * Le temps écoulé est mesuré, mais on ne peut pas prouver que la pub a été regardée.
 */
export default function RewardedUnlock({ label, onGrant }: Props) {
  const { user } = useAuth();
  const uid = user?.id;

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'waiting' | 'done'>('waiting');
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  const [used, setUsed] = useState(0);
  const startRef = useRef(0);
  const claimingRef = useRef(false);

  const remaining = Math.max(0, MAX_BONUS_PER_DAY - used);

  useEffect(() => {
    setUsed(bonusUsed(uid));
  }, [uid]);

  // Crédite le bonus (une seule fois : la demande en cours sert de jeton).
  const grant = async (announce: boolean) => {
    if (!uid || claimingRef.current) return;
    claimingRef.current = true;

    const pending = readPending(uid);
    clearPending(uid);
    if (!pending) return; // déjà crédité
    if (bonusUsed(uid) >= MAX_BONUS_PER_DAY) return;

    addBonusUsed(uid);
    setUsed(bonusUsed(uid));
    setOpen(false);
    await onGrant();

    if (announce) {
      try {
        await supabase.from('notifications').insert({
          user_id: uid,
          type: 'info',
          title: '🎁 Bonus activé',
          message: `+1 ${label} offert grâce à la pub.`,
        });
      } catch {
        /* notification facultative */
      }
    }
  };

  // Retour dans l'app (après un départ ou un rechargement) avec une demande en cours.
  useEffect(() => {
    if (!uid) return;
    const pending = readPending(uid);
    if (!pending || pending.label !== label) return;

    const elapsed = Date.now() - pending.startedAt;
    if (elapsed > PENDING_MAX_AGE_MS) {
      clearPending(uid);
    } else if (elapsed >= WAIT_SECONDS * 1000) {
      grant(true);
    } else {
      // Revenu trop tôt : on reprend le compte à rebours là où il en était.
      startRef.current = pending.startedAt;
      claimingRef.current = false;
      setPhase('waiting');
      setOpen(true);
    }
  }, [uid]);

  // Compte à rebours basé sur l'heure réelle (robuste quand l'onglet est en pause).
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
    if (!uid) return;
    startRef.current = Date.now();
    claimingRef.current = false;
    writePending(uid, { startedAt: startRef.current, label });
    setSecondsLeft(WAIT_SECONDS);
    setPhase('waiting');
    setOpen(true);
    // Doit être appelé directement dans le clic, sinon le navigateur bloque la fenêtre.
    window.open(MONETAG_LINK, '_blank', 'noopener,noreferrer');
  };

  const cancel = () => {
    clearPending(uid);
    setOpen(false);
  };

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        {remaining > 0 ? (
          <>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 10, lineHeight: 1.5 }}>
              Clique sur le bouton, regarde la pub et reviens 30s après pour gagner ton bonus.
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
              onClick={phase === 'done' ? () => grant(false) : cancel}
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
                <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.5 }}>
                  Une page de pub s'est ouverte dans un nouvel onglet. Regarde-la, puis reviens ici :
                  ton bonus s'active automatiquement.
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
              <>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Bonus gagné !
                </div>
                <div style={{ fontSize: 14, color: '#aaa', marginBottom: 18 }}>
                  +1 {label} offert. Touche la croix ou le bouton pour l'activer.
                </div>
                <button
                  onClick={() => grant(false)}
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
