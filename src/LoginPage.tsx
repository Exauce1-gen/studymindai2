import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
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
        } else {
          setError('');
          alert('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
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
            placeholder="Mot de passe (min. 6 caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
              marginBottom: 16,
              boxShadow: loading ? 'none' : '0 8px 24px rgba(108,92,231,0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '⏳ Chargement...' : isSignUp ? '🚀 Créer mon compte' : '✨ Se connecter'}
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
              textDecoration: 'underline',
              fontSize: 14
            }}
          >
            {isSignUp ? 'Se connecter' : "S'inscrire gratuitement"}
          </button>
        </div>

        {/* Info */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: 'rgba(108,92,231,0.1)',
          border: '1px solid rgba(108,92,231,0.3)',
          borderRadius: 12,
          fontSize: 13,
          color: '#aaa',
          textAlign: 'center'
        }}>
          ✨ <strong style={{color: '#6C5CE7'}}>100% Gratuit</strong> • Pas de carte bancaire requise
        </div>
      </div>
    </div>
  );
}
