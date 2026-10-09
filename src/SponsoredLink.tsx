import { useAuth } from './AuthContext';
import { usePremium } from './usePremium';

// Lien direct Monetag
const MONETAG_LINK = 'https://uplcm.com/4/11986460';

function isAdult(dateOfBirth?: string): boolean {
  if (!dateOfBirth) return false; // date inconnue : on ne montre rien (choix prudent)
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 18;
}

/**
 * Lien sponsorisé (lien direct). Le contenu de destination est choisi par le
 * réseau et ne peut pas être contrôlé finement : il n'est donc proposé qu'aux
 * utilisateurs majeurs du plan gratuit, jamais aux abonnés Premium.
 * Libellé volontairement neutre : on ne demande pas de cliquer pour "soutenir".
 */
export default function SponsoredLink() {
  const { userProfile } = useAuth();
  const { isPremium, loading } = usePremium();

  if (loading || isPremium || !isAdult(userProfile?.date_of_birth)) return null;

  return (
    <a
      href={MONETAG_LINK}
      target="_blank"
      rel="noopener noreferrer sponsored nofollow"
      style={{
        display: 'block',
        margin: '32px auto 0',
        maxWidth: 480,
        padding: '14px 16px',
        background: '#0e0e1d',
        border: '1px solid #333',
        borderRadius: 14,
        textDecoration: 'none'
      }}
    >
      <div style={{ fontSize: 11, color: '#666', letterSpacing: 1, marginBottom: 4 }}>
        SPONSORISÉ
      </div>
      <div style={{ fontSize: 14, color: '#e8e8f8', fontWeight: 600 }}>
        Découvrir un contenu sponsorisé
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
        S'ouvre dans un nouvel onglet
      </div>
    </a>
  );
}
