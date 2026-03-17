interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface BadgeDisplayProps {
  badges: Badge[];
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div style={{
      background: '#0e0e1d',
      border: '1px solid #333',
      borderRadius: 16,
      padding: 20,
      marginTop: 24
    }}>
      <h3 style={{
        fontSize: 18,
        fontWeight: 800,
        color: '#e8e8f8',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        🏆 Badges ({unlockedBadges.length}/{badges.length})
      </h3>

      {/* Badges débloqués */}
      {unlockedBadges.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 12,
            color: '#6C5CE7',
            fontWeight: 700,
            marginBottom: 10,
            textTransform: 'uppercase'
          }}>
            ✨ Débloqués
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12
          }}>
            {unlockedBadges.map(badge => (
              <div
                key={badge.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(253,121,168,0.15))',
                  border: '1px solid rgba(108,92,231,0.5)',
                  borderRadius: 12,
                  padding: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title={badge.description}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = '#6C5CE7';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(108,92,231,0.5)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>{badge.icon}</div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#e8e8f8',
                  marginBottom: 2
                }}>
                  {badge.name}
                </div>
                <div style={{
                  fontSize: 9,
                  color: '#888',
                  lineHeight: 1.3
                }}>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges verrouillés */}
      {lockedBadges.length > 0 && (
        <div>
          <div style={{
            fontSize: 12,
            color: '#666',
            fontWeight: 700,
            marginBottom: 10,
            textTransform: 'uppercase'
          }}>
            🔒 À débloquer
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12
          }}>
            {lockedBadges.map(badge => (
              <div
                key={badge.id}
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: 12,
                  padding: 12,
                  textAlign: 'center',
                  opacity: 0.5,
                  cursor: 'pointer'
                }}
                title={badge.description}
              >
                <div style={{ fontSize: 32, marginBottom: 6, filter: 'grayscale(1)' }}>
                  {badge.icon}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#666',
                  marginBottom: 2
                }}>
                  {badge.name}
                </div>
                <div style={{
                  fontSize: 9,
                  color: '#555',
                  lineHeight: 1.3
                }}>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlockedBadges.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>
            Aucun badge débloqué pour le moment
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            Continuez à apprendre pour débloquer des badges !
          </div>
        </div>
      )}
    </div>
  );
}
