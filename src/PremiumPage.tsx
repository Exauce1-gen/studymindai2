import { useState } from 'react';
import { useAuth } from './AuthContext';
import { usePremium } from './usePremium';

export default function PremiumPage() {
  const { userProfile } = useAuth();
  const { isPremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');

  // LIENS DE PAIEMENT FEDAPAY
  const PAYMENT_LINKS = {
    weekly: 'https://me.fedapay.com/knJScWvE',  // 500 FCFA / $0.80
    monthly: 'https://me.fedapay.com/WWF27joO'  // 2000 FCFA / $3.20
  };

  const plans = {
    weekly: {
      price: 500,
      priceUSD: 0.80,
      duration: '7 jours',
      paymentLink: PAYMENT_LINKS.weekly,
      features: [
        '✨ Résumés illimités',
        '🎯 Quiz illimités',
        '📝 Examens complets type BAC/BEPC',
        '💬 Chat IA illimité',
        '📋 Fiches de révision illimitées',
        '📅 Planning personnalisé',
        '🚀 Accès prioritaire'
      ]
    },
    monthly: {
      price: 2000,
      priceUSD: 3.20,
      duration: '30 jours',
      paymentLink: PAYMENT_LINKS.monthly,
      popular: true,
      savings: 'Économisez 1000 FCFA !',
      features: [
        '✨ Résumés illimités',
        '🎯 Quiz illimités',
        '📝 Examens complets type BAC/BEPC',
        '💬 Chat IA illimité',
        '📋 Fiches de révision illimitées',
        '📅 Planning personnalisé',
        '🚀 Accès prioritaire',
        '💎 Badge Premium',
        '🎁 Nouvelles fonctionnalités en avant-première',
        '⚡ Support prioritaire'
      ]
    }
  };

  const handleSubscribe = () => {
    const plan = plans[selectedPlan];
    
    // Ouvrir la page de paiement FedaPay dans un nouvel onglet
    window.open(plan.paymentLink, '_blank');
    
    // Afficher un message à l'utilisateur
    setTimeout(() => {
      alert('✅ Une page de paiement FedaPay s\'est ouverte.\n\n📱 Complétez votre paiement et votre compte sera automatiquement activé Premium !\n\n⏱️ Activation en quelques secondes après paiement.');
    }, 500);
  };

  // SI UTILISATEUR EST DÉJÀ PREMIUM
  if (isPremium) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#07070f',
        padding: 20
      }}>
        {/* Header avec bouton retour */}
        <div style={{
          maxWidth: 1200,
          margin: '0 auto 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: 12,
              color: '#aaa',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#252540'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1a1a2e'}
          >
            ← Tableau de bord
          </button>
        </div>

        {/* Statut Premium */}
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          padding: 60
        }}>
          <div style={{
            width: 140,
            height: 140,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 70,
            margin: '0 auto 32px',
            boxShadow: '0 20px 60px rgba(108,92,231,0.4)',
            animation: 'float 3s ease-in-out infinite'
          }}>
            💎
          </div>

          <h1 style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#e8e8f8',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #fff, #6C5CE7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Vous êtes Premium ! 🎉
          </h1>

          <p style={{
            fontSize: 20,
            color: '#aaa',
            marginBottom: 40,
            maxWidth: 500,
            margin: '0 auto 40px'
          }}>
            Profitez de toutes les fonctionnalités illimitées de StudyMind AI
          </p>

          <div style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'rgba(108,92,231,0.15)',
            border: '1px solid #6C5CE7',
            borderRadius: 30,
            fontSize: 15,
            fontWeight: 700,
            color: '#6C5CE7',
            marginBottom: 48
          }}>
            ✨ Membre Premium Actif
          </div>

          <div style={{
            background: '#0e0e1d',
            border: '1px solid #333',
            borderRadius: 20,
            padding: 40,
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#6C5CE7',
              marginBottom: 24,
              textAlign: 'center'
            }}>
              ✨ Vos avantages Premium
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 16
            }}>
              {plans.monthly.features.map((feature, i) => (
                <div key={i} style={{
                  padding: 16,
                  background: '#1a1a2e',
                  borderRadius: 12,
                  color: '#e8e8f8',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid #252540'
                }}>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: 40,
            padding: 24,
            background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(253,121,168,0.05))',
            border: '1px solid rgba(108,92,231,0.3)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#e8e8f8',
              marginBottom: 8
            }}>
              Prêt à réviser ?
            </h3>
            <p style={{ color: '#aaa', fontSize: 15, marginBottom: 20 }}>
              Toutes les fonctionnalités sont débloquées pour vous !
            </p>
            <button
              onClick={() => window.location.href = '/learning'}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(108,92,231,0.4)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📚 Commencer à apprendre
            </button>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }


  // SI UTILISATEUR N'EST PAS PREMIUM
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      padding: 20
    }}>
      {/* Header avec bouton retour */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 12,
            color: '#aaa',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#252540'}
          onMouseOut={(e) => e.currentTarget.style.background = '#1a1a2e'}
        >
          ← Tableau de bord
        </button>
      </div>

      {/* Hero Section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: 60
      }}>
        <div style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'rgba(108,92,231,0.15)',
          border: '1px solid rgba(108,92,231,0.3)',
          borderRadius: 30,
          fontSize: 14,
          fontWeight: 700,
          color: '#6C5CE7',
          marginBottom: 28
        }}>
          💎 Passez à la vitesse supérieure
        </div>

        <h1 style={{
          fontSize: 64,
          fontWeight: 900,
          color: '#e8e8f8',
          marginBottom: 24,
          lineHeight: 1.1
        }}>
          Devenez{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Premium
          </span>
        </h1>

        <p style={{
          fontSize: 22,
          color: '#aaa',
          maxWidth: 650,
          margin: '0 auto 48px',
          lineHeight: 1.6
        }}>
          Débloquez toutes les fonctionnalités et révisez sans limites.<br/>
          Résumés, quiz et examens illimités pour réussir vos examens !
        </p>
      </div>

      {/* Plans de prix */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32
      }}>
        {/* Plan Hebdomadaire */}
        <div
          onClick={() => setSelectedPlan('weekly')}
          style={{
            background: selectedPlan === 'weekly' ? 'rgba(108,92,231,0.1)' : '#0e0e1d',
            border: selectedPlan === 'weekly' ? '2px solid #6C5CE7' : '2px solid #333',
            borderRadius: 24,
            padding: 36,
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative',
            transform: selectedPlan === 'weekly' ? 'scale(1.02)' : 'scale(1)',
            boxShadow: selectedPlan === 'weekly' ? '0 12px 40px rgba(108,92,231,0.3)' : 'none'
          }}
        >
          <h3 style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#e8e8f8',
            marginBottom: 12
          }}>
            Premium Hebdomadaire
          </h3>

          <div style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#6C5CE7',
            marginBottom: 8,
            lineHeight: 1
          }}>
            500 <span style={{fontSize: 26, color: '#aaa'}}>FCFA</span>
          </div>

          <div style={{
            fontSize: 15,
            color: '#888',
            marginBottom: 28
          }}>
            $0.80 USD • Pour {plans.weekly.duration}
          </div>

          <div style={{
            borderTop: '1px solid #333',
            paddingTop: 24,
            marginBottom: 8
          }}>
            {plans.weekly.features.map((feature, i) => (
              <div key={i} style={{
                padding: '12px 0',
                color: '#e8e8f8',
                fontSize: 15,
                borderBottom: i < plans.weekly.features.length - 1 ? '1px solid #222' : 'none'
              }}>
                {feature}
              </div>
            ))}
          </div>

          {selectedPlan === 'weekly' && (
            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              background: '#6C5CE7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              boxShadow: '0 4px 12px rgba(108,92,231,0.4)'
            }}>
              ✓
            </div>
          )}
        </div>

        {/* Plan Mensuel (Populaire) */}
        <div
          onClick={() => setSelectedPlan('monthly')}
          style={{
            background: selectedPlan === 'monthly' ? 'rgba(108,92,231,0.1)' : '#0e0e1d',
            border: selectedPlan === 'monthly' ? '2px solid #6C5CE7' : '2px solid #333',
            borderRadius: 24,
            padding: 36,
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative',
            transform: selectedPlan === 'monthly' ? 'scale(1.02)' : 'scale(1)',
            boxShadow: selectedPlan === 'monthly' ? '0 12px 40px rgba(108,92,231,0.3)' : 'none'
          }}
        >
          {plans.monthly.popular && (
            <div style={{
              position: 'absolute',
              top: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(108,92,231,0.4)'
            }}>
              ⭐ PLUS POPULAIRE
            </div>
          )}

          <h3 style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#e8e8f8',
            marginBottom: 12
          }}>
            Premium Mensuel
          </h3>

          <div style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#6C5CE7',
            marginBottom: 8,
            lineHeight: 1
          }}>
            2000 <span style={{fontSize: 26, color: '#aaa'}}>FCFA</span>
          </div>

          <div style={{
            fontSize: 15,
            color: '#888',
            marginBottom: 8
          }}>
            $3.20 USD • Pour {plans.monthly.duration}
          </div>

          <div style={{
            fontSize: 15,
            color: '#00b894',
            fontWeight: 700,
            marginBottom: 28
          }}>
            {plans.monthly.savings}
          </div>

          <div style={{
            borderTop: '1px solid #333',
            paddingTop: 24,
            marginBottom: 8
          }}>
            {plans.monthly.features.map((feature, i) => (
              <div key={i} style={{
                padding: '12px 0',
                color: '#e8e8f8',
                fontSize: 15,
                borderBottom: i < plans.monthly.features.length - 1 ? '1px solid #222' : 'none'
              }}>
                {feature}
              </div>
            ))}
          </div>

          {selectedPlan === 'monthly' && (
            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              background: '#6C5CE7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              boxShadow: '0 4px 12px rgba(108,92,231,0.4)'
            }}>
              ✓
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div style={{
        maxWidth: 550,
        margin: '0 auto 80px',
        textAlign: 'center'
      }}>
        <button
          onClick={handleSubscribe}
          style={{
            width: '100%',
            padding: 22,
            background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 19,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 16px 48px rgba(108,92,231,0.5)',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(108,92,231,0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(108,92,231,0.5)';
          }}
        >
          🚀 Souscrire maintenant - {selectedPlan === 'weekly' ? '500 FCFA' : '2000 FCFA'}
        </button>

        <p style={{
          fontSize: 14,
          color: '#888',
          marginTop: 20,
          lineHeight: 1.6
        }}>
          🔒 Paiement 100% sécurisé par FedaPay<br/>
          💳 Mobile Money (MTN, Moov) & Carte bancaire acceptés<br/>
          ✅ Activation instantanée après paiement
        </p>

        <div style={{
          marginTop: 24,
          padding: 20,
          background: 'rgba(0,184,148,0.1)',
          border: '1px solid rgba(0,184,148,0.3)',
          borderRadius: 12
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 15, color: '#00b894', fontWeight: 700 }}>
            Activation en quelques secondes !
          </div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
            Votre compte sera automatiquement mis à jour après le paiement
          </div>
        </div>
      </div>

      {/* Comparaison Gratuit vs Premium */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto 60px',
        background: '#0e0e1d',
        border: '2px solid #333',
        borderRadius: 24,
        padding: 48,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #6C5CE7, #fd79a8, #6C5CE7)',
          backgroundSize: '200% 100%',
          animation: 'gradient 3s ease infinite'
        }} />

        <h2 style={{
          fontSize: 32,
          fontWeight: 900,
          color: '#e8e8f8',
          marginBottom: 40,
          textAlign: 'center'
        }}>
          Gratuit vs Premium 💎
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20
        }}>
          {/* Headers */}
          <div style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: '#aaa',
            paddingBottom: 16,
            borderBottom: '2px solid #333'
          }}>
            Version Gratuite
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: '#6C5CE7',
            paddingBottom: 16,
            borderBottom: '2px solid #6C5CE7',
            background: 'linear-gradient(135deg, rgba(108,92,231,0.1), transparent)',
            borderRadius: '12px 12px 0 0',
            marginLeft: -16,
            marginRight: -16,
            paddingLeft: 16,
            paddingRight: 16
          }}>
            Version Premium 💎
          </div>

          {/* Résumés */}
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #252540'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 4 }}>
              3 résumés/jour
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Limite quotidienne
            </div>
          </div>
          <div style={{
            padding: 20,
            background: 'rgba(108,92,231,0.15)',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #6C5CE7'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4 }}>
              Résumés ILLIMITÉS
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Aucune limite !
            </div>
          </div>

          {/* Quiz */}
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #252540'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 4 }}>
              Quiz basiques
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Fonctionnalités limitées
            </div>
          </div>
          <div style={{
            padding: 20,
            background: 'rgba(108,92,231,0.15)',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #6C5CE7'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4 }}>
              Quiz ILLIMITÉS
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Toutes fonctionnalités
            </div>
          </div>

          {/* Examens */}
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #252540'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 4 }}>
              1 examen basic
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Format simplifié
            </div>
          </div>
          <div style={{
            padding: 20,
            background: 'rgba(108,92,231,0.15)',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #6C5CE7'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4 }}>
              Examens complets BAC/BEPC
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Format officiel
            </div>
          </div>

          {/* Chat IA */}
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #252540'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 4 }}>
              Chat limité
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Quelques messages/jour
            </div>
          </div>
          <div style={{
            padding: 20,
            background: 'rgba(108,92,231,0.15)',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #6C5CE7'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4 }}>
              Chat ILLIMITÉ
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Discutez sans limite
            </div>
          </div>

          {/* Publicités */}
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #252540'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📺</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 4 }}>
              Avec publicités
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Pubs affichées
            </div>
          </div>
          <div style={{
            padding: 20,
            background: 'rgba(108,92,231,0.15)',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #6C5CE7'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🚫</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4 }}>
              SANS publicités
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Zéro distraction
            </div>
          </div>

          {/* Support */}
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #252540'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 4 }}>
              Support standard
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Réponse sous 48h
            </div>
          </div>
          <div style={{
            padding: 20,
            background: 'rgba(108,92,231,0.15)',
            borderRadius: 12,
            textAlign: 'center',
            border: '1px solid #6C5CE7'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4 }}>
              Support PRIORITAIRE
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Réponse sous 24h
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 40,
          textAlign: 'center',
          padding: 24,
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(253,121,168,0.05))',
          borderRadius: 16
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#6C5CE7', marginBottom: 12 }}>
            🎯 Verdict : Premium change TOUT !
          </div>
          <div style={{ fontSize: 15, color: '#aaa' }}>
            Révisez 3x plus vite, sans limites, sans publicités.<br/>
            Rejoignez les milliers d'étudiants qui cartonnent avec Premium !
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div style={{
        maxWidth: 700,
        margin: '80px auto 60px',
        padding: 60,
        background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
        borderRadius: 28,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(108,92,231,0.5)'
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />

        <h2 style={{
          fontSize: 40,
          fontWeight: 900,
          color: '#fff',
          marginBottom: 20,
          position: 'relative',
          zIndex: 1
        }}>
          Prêt à CARTONNER ? 🔥
        </h2>

        <p style={{
          fontSize: 19,
          color: '#fff',
          opacity: 0.95,
          marginBottom: 36,
          position: 'relative',
          zIndex: 1,
          lineHeight: 1.6
        }}>
          Rejoins les milliers d'étudiants qui réussissent<br/>
          avec StudyMind AI Premium !
        </p>

        <button
          onClick={handleSubscribe}
          style={{
            padding: '20px 48px',
            background: '#fff',
            color: '#6C5CE7',
            border: 'none',
            borderRadius: 16,
            fontSize: 19,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s',
            textTransform: 'uppercase'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)';
          }}
        >
          🚀 Devenir Premium Maintenant
        </button>

        <p style={{
          fontSize: 13,
          color: '#fff',
          opacity: 0.8,
          marginTop: 24,
          position: 'relative',
          zIndex: 1
        }}>
          Paiement sécurisé • Activation instantanée • Résiliable à tout moment
        </p>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
