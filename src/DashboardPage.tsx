import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useStats } from './useStats';
import AdBanner, { AdSlots } from './AdBanner';
import BadgeDisplay from './BadgeDisplay';
import PremiumPage from './PremiumPage';

interface DashboardPageProps {
  onStartLearning: () => void;
}

export default function DashboardPage({ onStartLearning }: DashboardPageProps) {
  const { userProfile, signOut } = useAuth();
  const { stats, badges, loading: statsLoading, getAverageScore } = useStats();
  const [showPremium, setShowPremium] = useState(false);

  if (!userProfile) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      color: '#e8e8f8',
      fontFamily: 'system-ui'
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid rgba(108,92,231,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(7,7,15,0.95)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            🧠
          </div>
          <div style={{fontWeight: 800, fontSize: 19, letterSpacing: '-0.4px'}}>
            Study<span style={{color: '#6C5CE7'}}>Mind</span> AI
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{
            background: 'rgba(108,92,231,0.12)',
            border: '1px solid rgba(108,92,231,0.3)',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color: '#6C5CE7'
          }}>
            {userProfile.grade}
          </div>
          <button
            onClick={() => setShowPremium(true)}
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(108,92,231,0.3)'
            }}
          >
            ✨ Premium
          </button>
          <button
            onClick={signOut}
            style={{
              background: 'rgba(253,121,168,0.12)',
              border: '1px solid rgba(253,121,168,0.3)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              color: '#fd79a8',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Greeting */}
        <div style={{marginBottom: 48}}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 8,
            background: 'linear-gradient(135deg, #fff, #6C5CE7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {getGreeting()}, {userProfile.first_name} ! 👋
          </h1>
          <p style={{color: '#888', fontSize: 16}}>
            Prêt à apprendre quelque chose de nouveau aujourd'hui ?
          </p>
        </div>

        {/* Stats cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(108,92,231,0.05))',
            border: '1px solid rgba(108,92,231,0.3)',
            borderRadius: 16,
            padding: 20
          }}>
            <div style={{fontSize: 32, marginBottom: 8}}>📄</div>
            <div style={{fontSize: 24, fontWeight: 800, color: '#6C5CE7', marginBottom: 4}}>
              {stats?.summaries_count || 0}
            </div>
            <div style={{fontSize: 13, color: '#888'}}>Résumés créés</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(253,121,168,0.15), rgba(253,121,168,0.05))',
            border: '1px solid rgba(253,121,168,0.3)',
            borderRadius: 16,
            padding: 20
          }}>
            <div style={{fontSize: 32, marginBottom: 8}}>🧩</div>
            <div style={{fontSize: 24, fontWeight: 800, color: '#fd79a8', marginBottom: 4}}>
              {stats?.quizzes_completed || 0}
            </div>
            <div style={{fontSize: 13, color: '#888'}}>Quiz complétés</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0,206,201,0.15), rgba(0,206,201,0.05))',
            border: '1px solid rgba(0,206,201,0.3)',
            borderRadius: 16,
            padding: 20
          }}>
            <div style={{fontSize: 32, marginBottom: 8}}>🔥</div>
            <div style={{fontSize: 24, fontWeight: 800, color: '#00cec9', marginBottom: 4}}>
              {stats?.streak_days || 0}j
            </div>
            <div style={{fontSize: 13, color: '#888'}}>Série active</div>
          </div>
        </div>

        {/* Publicité AdSense */}
        <AdBanner slot={AdSlots.DASHBOARD_TOP} format="horizontal" />

        {/* Main CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
          borderRadius: 20,
          padding: 40,
          textAlign: 'center',
          marginBottom: 32,
          boxShadow: '0 20px 60px rgba(108,92,231,0.3)'
        }}>
          <h2 style={{fontSize: 28, fontWeight: 800, marginBottom: 12}}>
            🚀 Commence à apprendre
          </h2>
          <p style={{fontSize: 16, marginBottom: 24, opacity: 0.9}}>
            Résumés IA, Quiz personnalisés, Chat intelligent et plus encore !
          </p>
          <button
            onClick={onStartLearning}
            style={{
              padding: '16px 40px',
              border: 'none',
              borderRadius: 14,
              background: '#fff',
              color: '#6C5CE7',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            ✨ Commencer maintenant
          </button>
        </div>

        {/* Subjects */}
        <div>
          <h3 style={{fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#e8e8f8'}}>
            📚 Tes matières
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10
          }}>
            {userProfile.subjects.map(subject => (
              <div
                key={subject}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(108,92,231,0.12)',
                  border: '1px solid rgba(108,92,231,0.3)',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#6C5CE7'
                }}
              >
                {subject}
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques détaillées */}
        {stats && (
          <div style={{
            background: '#0e0e1d',
            border: '1px solid #333',
            borderRadius: 16,
            padding: 24,
            marginTop: 32
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#e8e8f8',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📊 Vos statistiques complètes
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16
            }}>
              {[
                { icon: '📄', label: 'Résumés', value: stats.summaries_count, color: '#6C5CE7' },
                { icon: '🧩', label: 'Quiz', value: stats.quizzes_completed, color: '#fd79a8' },
                { icon: '📝', label: 'Examens', value: stats.exams_taken, color: '#00cec9' },
                { icon: '📊', label: 'Moyenne', value: `${getAverageScore()}/20`, color: '#6C5CE7' },
                { icon: '🔥', label: 'Série', value: `${stats.streak_days} jours`, color: '#ff6b6b' },
                { icon: '⏱️', label: 'Temps', value: `${Math.floor(stats.study_time_minutes / 60)}h ${stats.study_time_minutes % 60}m`, color: '#00cec9' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = stat.color;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#333';
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: stat.color,
                    marginBottom: 4
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <BadgeDisplay badges={badges} />
      </div>

      {/* Premium Modal */}
      {showPremium && <PremiumPage onClose={() => setShowPremium(false)} />}
    </div>
  );
}
