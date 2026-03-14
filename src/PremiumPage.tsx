import { useState } from 'react';

interface PremiumPageProps {
  onClose: () => void;
}

export default function PremiumPage({ onClose }: PremiumPageProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    
    // Stripe Payment Link - Vous allez le créer dans Stripe Dashboard
    // Remplacez par votre lien de paiement Stripe
    const stripePaymentLink = 'https://buy.stripe.com/test_eVq6oI5Lz1Vbg5Sat78AE00';
    
    // Redirection vers Stripe
    window.location.href = stripePaymentLink;
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
            fontSize: 20,
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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
              Upgrade to Premium 🌟
            </h1>
            <p style={{ color: '#888', fontSize: 16 }}>
              Unlock unlimited learning with AI
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
              padding: 32
            }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💎</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#e8e8f8' }}>Free</h3>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#6C5CE7', marginBottom: 4 }}>
                  $0
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>per month</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                {[
                  '10 summaries/day',
                  '5 quizzes/day',
                  '2 exams/day',
                  'Limited chat',
                  'Ads included'
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
                Current plan
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
              {/* Badge */}
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
                color: '#fff',
                whiteSpace: 'nowrap'
              }}>
                BEST VALUE
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🌟</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#e8e8f8' }}>Premium</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#6C5CE7' }}>$3</span>
                  <span style={{ fontSize: 14, color: '#888' }}>/ month</span>
                </div>
                <div style={{ fontSize: 12, color: '#6C5CE7', fontStyle: 'italic' }}>
                  (~2000 FCFA)
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                {[
                  '✨ UNLIMITED summaries',
                  '✨ UNLIMITED quizzes',
                  '✨ UNLIMITED exams',
                  '✨ UNLIMITED chat',
                  '✨ NO ADS',
                  '✨ Priority support',
                  '✨ Early access to new features'
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                    <span style={{ color: '#6C5CE7', fontSize: 16, flexShrink: 0 }}>✓</span>
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
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => {
                  if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {loading ? '⏳ Redirecting to Stripe...' : '🚀 Subscribe now'}
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
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: '#e8e8f8' }}>
              Frequently asked questions
            </h3>

            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. You\'ll keep Premium access until the end of your billing period.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept international credit/debit cards (Visa, Mastercard, Amex) and Mobile Money (Orange Money, MTN Money, Moov Money).'
              },
              {
                q: 'Will I be charged in dollars or FCFA?',
                a: 'You\'ll be charged in USD ($3), but Stripe automatically converts it to your local currency. You can pay with Mobile Money in FCFA.'
              },
              {
                q: 'What happens if I go back to free?',
                a: 'You\'ll return to the free plan limits (10 summaries/day, 5 quizzes/day, ads included).'
              },
              {
                q: 'Is my payment secure?',
                a: 'Absolutely! All payments are processed by Stripe, one of the world\'s most trusted and secure payment platforms.'
              }
            ].map((faq, i) => (
              <div key={i} style={{ marginBottom: i < 4 ? 20 : 0 }}>
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
            border: '1px solid rgba(108,92,231,0.2)',
            borderRadius: 12
          }}>
            <div style={{ fontSize: 13, color: '#6C5CE7', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>🔒</span>
              <span>100% secure payment powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
