import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function PremiumPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION FEDAPAY
  // ═══════════════════════════════════════════════════════════════════════════
  
  const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || '';
  
  // Prix en USD (Dollar américain)
  const PREMIUM_PRICE = 3;
  const CURRENCY = 'USD';

  const handleSubscribe = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour souscrire');
      return;
    }

    setLoading(true);

    try {
      // Générer un ID de transaction unique
      const transactionId = `SM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Charger le SDK FedaPay
      if (!window.FedaPay) {
        const script = document.createElement('script');
        script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Configuration du paiement FedaPay
      window.FedaPay.init({
        public_key: FEDAPAY_PUBLIC_KEY,
        transaction: {
          amount: PREMIUM_PRICE,
          currency: CURRENCY,
          description: 'StudyMind Premium - Abonnement mensuel',
          callback_url: `${window.location.origin}?success=true`,
          customer: {
            firstname: user.email?.split('@')[0] || 'User',
            email: user.email || '',
          },
          custom_metadata: {
            user_id: user.id,
            plan: 'premium',
            frequency: 'monthly'
          }
        },
        onComplete: (resp) => {
          console.log('Paiement complété:', resp);
          if (resp.reason === 'CHECKOUT_COMPLETED') {
            window.location.href = `${window.location.origin}?success=true`;
          }
        },
        onError: (error) => {
          console.error('Erreur paiement:', error);
          alert('Erreur lors du paiement. Veuillez réessayer.');
        }
      });

      // Ouvrir le widget de paiement
      window.FedaPay.open();

    } catch (error: any) {
      console.error('Erreur FedaPay:', error);
      alert(`Erreur: ${error.message || 'Impossible de créer le paiement. Réessayez.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      color: '#e8e8f8',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto 40px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 36,
          fontWeight: 900,
          marginBottom: 16,
          background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Passez à Premium
        </h1>
        <p style={{
          fontSize: 18,
          color: '#888',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          Accès illimité à toutes les fonctionnalités IA. Aucune publicité. Support prioritaire.
        </p>
      </div>

      {/* Plans */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24
      }}>
        {/* Plan Gratuit */}
        <div style={{
          background: '#0e0e1d',
          border: '1px solid #333',
          borderRadius: 16,
          padding: 32
        }}>
          <div style={{fontSize: 32, marginBottom: 12}}>💎</div>
          <h3 style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>Gratuit</h3>
          <div style={{fontSize: 40, fontWeight: 900, color: '#6C5CE7', marginBottom: 4}}>$0</div>
          <div style={{fontSize: 14, color: '#666', marginBottom: 24}}>par mois</div>

          <ul style={{listStyle: 'none', padding: 0, marginBottom: 32}}>
            {[
              '10 résumés IA/jour',
              '5 quiz IA/jour',
              '2 examens/jour',
              'Chat IA limité',
              'Fiches de révision',
              'Planning d\'étude',
              '🚨 Avec publicités'
            ].map((item, i) => (
              <li key={i} style={{
                padding: '8px 0',
                color: '#888',
                display: 'flex',
                gap: 8,
                fontSize: 14
              }}>
                <span style={{color: item.includes('🚨') ? '#ff6b6b' : '#6C5CE7'}}>
                  {item.includes('🚨') ? '⚠️' : '✓'}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div style={{
            padding: '14px',
            borderRadius: 12,
            background: 'rgba(108,92,231,0.1)',
            border: '1px solid rgba(108,92,231,0.3)',
            color: '#6C5CE7',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Plan actuel
          </div>
        </div>

        {/* Plan Premium */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(253,121,168,0.2))',
          border: '2px solid #6C5CE7',
          borderRadius: 16,
          padding: 32,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            padding: '4px 16px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            ⭐ RECOMMANDÉ
          </div>

          <div style={{fontSize: 32, marginBottom: 12}}>🌟</div>
          <h3 style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>Premium</h3>
          <div style={{fontSize: 40, fontWeight: 900, color: '#6C5CE7', marginBottom: 4}}>
            $3
          </div>
          <div style={{fontSize: 14, color: '#888', marginBottom: 24}}>par mois USD</div>

          <ul style={{listStyle: 'none', padding: 0, marginBottom: 32}}>
            {[
              '♾️ Résumés IA ILLIMITÉS',
              '♾️ Quiz IA ILLIMITÉS',
              '♾️ Examens ILLIMITÉS',
              '♾️ Chat IA ILLIMITÉ',
              '🚫 AUCUNE PUBLICITÉ',
              '⚡ Support prioritaire',
              '🎁 Accès anticipé aux nouvelles fonctionnalités',
              '📊 Statistiques avancées'
            ].map((item, i) => (
              <li key={i} style={{
                padding: '8px 0',
                color: '#e8e8f8',
                display: 'flex',
                gap: 8,
                fontSize: 14,
                fontWeight: 600
              }}>
                <span style={{color: '#6C5CE7'}}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              border: 'none',
              background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(108,92,231,0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '⏳ Chargement...' : '🚀 Souscrire maintenant'}
          </button>

          <div style={{
            marginTop: 16,
            fontSize: 12,
            color: '#888',
            textAlign: 'center'
          }}>
            💳 Paiement sécurisé avec FedaPay
            <br />
            Orange Money • MTN • Moov • Visa • Mastercard
          </div>
        </div>
      </div>

      {/* Garantie */}
      <div style={{
        maxWidth: 600,
        margin: '40px auto 0',
        textAlign: 'center',
        padding: 24,
        background: 'rgba(108,92,231,0.05)',
        border: '1px solid rgba(108,92,231,0.2)',
        borderRadius: 16
      }}>
        <div style={{fontSize: 32, marginBottom: 12}}>🔒</div>
        <h4 style={{fontSize: 18, fontWeight: 700, marginBottom: 8}}>
          Paiement 100% Sécurisé
        </h4>
        <p style={{fontSize: 14, color: '#888', lineHeight: 1.6}}>
          Vos informations de paiement sont protégées par FedaPay,
          la solution de paiement de confiance en Afrique de l'Ouest.
          Vous pouvez annuler votre abonnement à tout moment.
        </p>
      </div>

      {/* FAQ */}
      <div style={{
        maxWidth: 800,
        margin: '60px auto 0'
      }}>
        <h3 style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 32,
          textAlign: 'center'
        }}>
          Questions fréquentes
        </h3>

        {[
          {
            q: 'Comment fonctionne le paiement ?',
            a: 'Vous payez $3 USD par mois via Mobile Money (Orange, MTN, Moov) ou carte bancaire. Le paiement est sécurisé par FedaPay.'
          },
          {
            q: 'Puis-je annuler à tout moment ?',
            a: 'Oui ! Vous pouvez annuler votre abonnement à tout moment. Vous conserverez l\'accès Premium jusqu\'à la fin de votre période payée.'
          },
          {
            q: 'Quels moyens de paiement acceptez-vous ?',
            a: 'Mobile Money (Orange Money, MTN Mobile Money, Moov Money), cartes Visa et Mastercard.'
          },
          {
            q: 'Pourquoi en dollars ?',
            a: 'Le dollar USD offre plus de stabilité et est accepté partout. FedaPay convertit automatiquement en FCFA au taux du jour (~2000 FCFA).'
          },
          {
            q: 'Y a-t-il un engagement ?',
            a: 'Non ! Aucun engagement. Vous pouvez annuler quand vous voulez, sans frais.'
          }
        ].map((item, i) => (
          <div key={i} style={{
            marginBottom: 24,
            padding: 20,
            background: '#0e0e1d',
            border: '1px solid #333',
            borderRadius: 12
          }}>
            <h4 style={{fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#6C5CE7'}}>
              {item.q}
            </h4>
            <p style={{fontSize: 14, color: '#888', lineHeight: 1.6, margin: 0}}>
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Déclaration TypeScript pour FedaPay
declare global {
  interface Window {
    FedaPay: any;
  }
}
