import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 450,
        background: '#0e0e1d',
        border: '1px solid #333',
        borderRadius: 20,
        padding: 40
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
            margin: '0 auto 16px'
          }}>
            🧠
          </div>
          <h1 style={{fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8}}>
            Study<span style={{color: '#6C5CE7'}}>Mind</span> AI
          </h1>
          <p style={{color: '#888', fontSize: 14}}>
            {isSignUp ? 'Créer votre compte' : 'Connectez-vous pour continuer'}
          </p>
        </div>

        {/* Bouton Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: '1px solid #333',
            background: '#fff',
            color: '#333',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 16,
            transition: 'all 0.2s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        {/* Séparateur */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          margin: '20px 0',
          color: '#666'
        }}>
          <div style={{flex: 1, height: 1, background: '#333'}}></div>
          <span style={{fontSize: 13}}>OU</span>
          <div style={{flex: 1, height: 1, background: '#333'}}></div>
        </div>

        {/* Formulaire Email */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: '1px solid #333',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: 15,
              outline: 'none',
              marginBottom: 16
            }}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: '1px solid #333',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: 15,
              outline: 'none',
              marginBottom: 16
            }}
          />

          {error && (
            <div style={{
              padding: 12,
              background: 'rgba(255,107,107,0.1)',
              border: '1px solid #ff6b6b',
              borderRadius: 8,
              color: '#ff6b6b',
              fontSize: 14,
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
              padding: 16,
              borderRadius: 12,
              border: 'none',
              background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16
            }}
          >
            {loading ? '⏳ Chargement...' : isSignUp ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div style={{textAlign: 'center', fontSize: 14, color: '#888'}}>
          {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
          {' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6C5CE7',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}
