import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Votre clé publique Stripe
const stripePromise = loadStripe('pk_test_51TApqxKEDPD2hZYdq0AKjEEK1jes8saJnUYKzlO84kIeME0nOuznK2SGRjSSLyc4yybPsl2KhnGOla2D5Bs5iSEI00nClOPTMX');

interface PremiumPageProps {
  onClose: () => void;
}

export default function PremiumPage({ onClose }: PremiumPageProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      const stripe = await stripePromise;
      if (!stripe) {
        alert('Erreur de chargement Stripe');
        return;
      }

      // Rediriger vers Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{
          price: 'price_1TArqIKEDPD2hZYdhxJZ5qmP', // Votre Price ID
          quantity: 1,
        }],
        mode: 'subscription',
        successUrl: `${window.location.origin}?success=true`,
        cancelUrl: `${window.location.origin}?canceled=true`,
      });

      if (error) {
        console.error('Erreur Stripe:', error);
        alert('Erreur lors de la redirection vers le paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: '#07070f',
        borderRadius: 24,
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 20
          }}
        >
          ×
        </button>

        <div style={{ padding: '40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{
              fontSize: 36,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 12
            }}>
              Passe à Premium 🌟
            </h1>
            <p style={{ color: '#888', fontSize: 16 }}>
              Débloquez tout le potentiel de StudyMind AI
            </p>
          </div>

          {/* Plans comparison */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 40
          }}>
            {/* Plan Gratuit */}
            <div style={{
              background: '#0e0e1d',
              border: '1px solid #333',
              borderRadius: 16,
              padding: 32,
              position: 'relative'
            }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💎</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Gratuit</h3>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#6C5CE7', marginBottom: 4 }}>
                  0 FCFA
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>par mois</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                {[
                  '10 résumés par jour',
                  '5 quiz par jour',
                  '2 examens par jour',
                  'Chat limité',
                  'Publicités'
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                    <span style={{ color: '#666', fontSize: 16 }}>•</span>
                    <span style={{ color: '#888', fontSize: 14 }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  border: '1px solid #333',
                  borderRadius: 12,
                  background: '#1a1a2e',
                  color: '#666',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'not-allowed'
                }}
              >
                Plan actuel
              </button>
            </div>

            {/* Plan Premium */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(253,121,168,0.2))',
              border: '2px solid #6C5CE7',
              borderRadius: 16,
              padding: 32,
              position: 'relative'
            }}>
              {/* Badge "Populaire" */}
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
                color: '#fff'
              }}>
                POPULAIRE
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🌟</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Premium</h3>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#6C5CE7', marginBottom: 4 }}>
                  2000 FCFA
                </div>
                <div style={{ fontSize: 14, color: '#888' }}>par mois</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                {[
                  '✨ Résumés ILLIMITÉS',
                  '✨ Quiz ILLIMITÉS',
                  '✨ Examens ILLIMITÉS',
                  '✨ Chat ILLIMITÉ',
                  '✨ SANS PUBLICITÉS',
                  '✨ Support prioritaire',
                  '✨ Nouvelles fonctionnalités en premier'
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                    <span style={{ color: '#6C5CE7', fontSize: 16 }}>✓</span>
                    <span style={{ color: '#e8e8f8', fontSize: 14, fontWeight: 600 }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: 'none',
                  borderRadius: 12,
                  background: loading ? '#666' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(108,92,231,0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={e => {
                  if (!loading) e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {loading ? '⏳ Redirection...' : '🚀 S\'abonner maintenant'}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div style={{
            background: '#0e0e1d',
            border: '1px solid #333',
            borderRadius: 16,
            padding: 32
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
              Questions fréquentes
            </h3>

            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: 'Oui ! Vous pouvez annuler votre abonnement à tout moment. Vous garderez l\'accès Premium jusqu\'à la fin de votre période payée.'
              },
              {
                q: 'Comment payer ?',
                a: 'Nous acceptons les cartes bancaires internationales et Mobile Money (Orange Money, MTN Money, Moov Money).'
              },
              {
                q: 'Que se passe-t-il si je reviens au plan gratuit ?',
                a: 'Vous retrouverez les limites du plan gratuit (10 résumés/jour, 5 quiz/jour, publicités).'
              }
            ].map((faq, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e8f8', marginBottom: 8 }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>

          {/* Security badge */}
          <div style={{
            textAlign: 'center',
            marginTop: 32,
            padding: 16,
            background: 'rgba(108,92,231,0.1)',
            borderRadius: 12
          }}>
            <div style={{ fontSize: 13, color: '#6C5CE7', fontWeight: 600 }}>
              🔒 Paiement 100% sécurisé par Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
