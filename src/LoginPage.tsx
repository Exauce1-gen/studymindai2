import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    } 

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (err.message?.includes('User already registered')) {
        setError('Cet email est déjà utilisé');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: 40,
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(108,92,231,0.4)'
          }}>
            🧠
          </div>
          <h1 style={{fontSize: 28, fontWeight: 800, color: '#1a1a2e', marginBottom: 8}}>
            Study<span style={{color: '#6C5CE7'}}>Mind</span> AI
          </h1>
          <p style={{color: '#666', fontSize: 14}}>
            {mode === 'login' ? 'Connecte-toi pour apprendre' : 'Crée ton compte gratuitement'}
          </p>
        </div>

        {/* Formulaire Email */}
        <form onSubmit={handleEmailAuth}>
          <div style={{marginBottom: 16}}>
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 12,
                fontSize: 15,
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6C5CE7'}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{marginBottom: 20}}>
            <input
              type="password"
              placeholder="Mot de passe (min. 6 caractères)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 12,
                fontSize: 15,
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6C5CE7'}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: 10,
              color: '#c33',
              fontSize: 13,
              marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              borderRadius: 12,
              background: loading ? '#ccc' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(108,92,231,0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '⏳ Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div style={{textAlign: 'center', marginTop: 24}}>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6C5CE7',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {/* Info */}
        <div style={{
          marginTop: 24,
          padding: '12px 16px',
          background: '#f0f7ff',
          border: '1px solid #d0e8ff',
          borderRadius: 10,
          fontSize: 12,
          color: '#666',
          textAlign: 'center'
        }}>
          💡 Connexion sécurisée par Supabase
        </div>
      </div>
    </div>
  );
}
