import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import OnboardingPage from './OnboardingPage';
import DashboardPage from './DashboardPage';
import LearningPage from './LearningPage';
import PremiumPage from './PremiumPage';

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [showLearning, setShowLearning] = useState(false);

  // 🔄 Loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#07070f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 20px',
            animation: 'pulse 1.5s infinite'
          }}>
            🧠
          </div>
          <p style={{ color: '#6C5CE7', fontSize: 16, fontWeight: 600 }}>
            Chargement de StudyMind AI...
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // 🔐 Non connecté
  if (!user) {
    return <LoginPage />;
  }

  // 🧠 Onboarding non terminé
  if (!userProfile?.onboarding_completed) {
    return <OnboardingPage />;
  }

  // 💎 Page Premium via URL
  if (window.location.pathname === '/premium') {
    return <PremiumPage />;
  }

  // 📚 Mode apprentissage
  if (showLearning) {
    return <LearningPage />;
  }

  // 🏠 Dashboard principal
  return (
    <DashboardPage onStartLearning={() => setShowLearning(true)} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
