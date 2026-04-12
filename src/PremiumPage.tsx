import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './AuthContext';
import { usePremium } from './usePremium';

// Déclarer FedaPay global
declare global {
  interface Window {
    FedaPay: any;
  }
}

export default function PremiumPage() {
  const { user, userProfile } = useAuth();
  const { isPremium } = usePremium();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');
  const [fedaPayReady, setFedaPayReady] = useState(false);

  // Vérifier que FedaPay est chargé
  useEffect(() => {
    const checkFedaPay = setInterval(() => {
      if (window.FedaPay) {
        console.log('FedaPay loaded:', window.FedaPay);
        setFedaPayReady(true);
        clearInterval(checkFedaPay);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkFedaPay);
      if (!window.FedaPay) {
        console.error('FedaPay SDK failed to load');
      }
    }, 10000);

    return () => clearInterval(checkFedaPay);
  }, []);

  const plans = {
    weekly: {
      price: 500,
      priceUSD: 1,
      duration: '7 jours',
      features: [
        '✨ Résumés illimités',
        '🎯 Quiz illimités',
        '📝 Examens complets type BAC',
        '💬 Chat IA illimité',
        '📋 Fiches de révision illimitées',
        '📅 Planning personnalisé',
        '🚀 Accès prioritaire'
      ]
    },
    monthly: {
      price: 2000,
      priceUSD: 3,
      duration: '30 jours',
      popular: true,
      savings: 'Économisez 1000 FCFA !',
      features: [
        '✨ Résumés illimités',
        '🎯 Quiz illimités',
        '📝 Examens complets type BAC',
        '💬 Chat IA illimité',
        '📋 Fiches de révision illimitées',
        '📅 Planning personnalisé',
        '🚀 Accès prioritaire',
        '💎 Badge Premium',
        '🎁 Nouvelles fonctionnalités en avant-première'
      ]
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      alert('Vous devez être connecté pour souscrire');
      return;
    }

    if (!fedaPayReady || !window.FedaPay) {
      alert('Chargement du système de paiement... Veuillez réessayer dans quelques secondes.');
      return;
    }

    setLoading(true);

    try {
      const plan = plans[selectedPlan];
      
      // Configuration FedaPay
      const publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY;
      
      if (!publicKey) {
        alert('Erreur de configuration. Contactez le support.');
        setLoading(false);
        return;
      }

      console.log('Creating FedaPay transaction...');

      // Créer un ID de transaction unique
      const transactionId = `studymind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // NOUVELLE MÉTHODE - Utiliser FedaPay.init directement
      window.FedaPay.init({
        public_key: publicKey,
        transaction: {
          amount: plan.price,
          description: `StudyMind AI Premium - ${selectedPlan === 'weekly' ? 'Hebdomadaire (7 jours)' : 'Mensuel (30 jours)'}`,
          customer: {
            firstname: userProfile?.first_name || 'Utilisateur',
            lastname: 'StudyMind',
            email: user.email
          }
        },
        onComplete: function(response: any) {
          console.log('Payment completed:', response);
          
          // Sauvegarder dans Supabase
          supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_id: response.id || transactionId,
              plan_type: selectedPlan,
              amount: plan.price,
              status: response.status === 'approved' ? 'approved' : 'pending',
              fedapay_status: response.status,
              created_at: new Date().toISOString()
            })
            .then(() => {
              if (response.status === 'approved') {
                // Mettre à jour is_premium
                return supabase
                  .from('users')
                  .update({ is_premium: true })
                  .eq('id', user.id);
              }
            })
            .then(() => {
              alert('Paiement réussi ! Vous êtes maintenant Premium 🎉');
              window.location.reload();
            })
            .catch((err) => {
              console.error('Error saving transaction:', err);
            });
        },
        onError: function(error: any) {
          console.error('Payment error:', error);
          alert('Erreur lors du paiement. Réessayez.');
          setLoading(false);
        }
      });

      setLoading(false);

    } catch (error: any) {
      console.error('Erreur FedaPay:', error);
      alert(`Erreur: ${error.message || 'Impossible de créer la transaction'}`);
      setLoading(false);
    }
  };

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
              cursor: 'pointer'
            }}
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
            width: 120,
            height: 120,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            margin: '0 auto 24px'
          }}>
            💎
          </div>
          <h1 style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#e8e8f8',
            marginBottom: 16
          }}>
            Vous êtes Premium ! 🎉
          </h1>
          <p style={{
            fontSize: 18,
            color: '#aaa',
            marginBottom: 32
          }}>
            Profitez de toutes les fonctionnalités illimitées
          </p>

          <div style={{
            background: '#0e0e1d',
            border: '1px solid #333',
            borderRadius: 16,
            padding: 32,
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#6C5CE7',
              marginBottom: 20
            }}>
              ✨ Vos avantages Premium
            </h3>
            {plans.monthly.features.map((feature, i) => (
              <div key={i} style={{
                padding: '12px 0',
                borderBottom: i < plans.monthly.features.length - 1 ? '1px solid #222' : 'none',
                color: '#e8e8f8',
                fontSize: 15
              }}>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            cursor: 'pointer'
          }}
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
          padding: '8px 20px',
          background: 'rgba(108,92,231,0.15)',
          border: '1px solid rgba(108,92,231,0.3)',
          borderRadius: 30,
          fontSize: 14,
          fontWeight: 700,
          color: '#6C5CE7',
          marginBottom: 24
        }}>
          💎 Passez à la vitesse supérieure
        </div>

        <h1 style={{
          fontSize: 56,
          fontWeight: 900,
          color: '#e8e8f8',
          marginBottom: 20,
          lineHeight: 1.1
        }}>
          Devenez <span style={{
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Premium</span>
        </h1>

        <p style={{
          fontSize: 20,
          color: '#aaa',
          maxWidth: 600,
          margin: '0 auto 40px'
        }}>
          Débloquez toutes les fonctionnalités et révisez sans limites
        </p>
      </div>

      {/* Plans de prix */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24
      }}>
        {/* Plan Hebdomadaire */}
        <div
          onClick={() => setSelectedPlan('weekly')}
          style={{
            background: selectedPlan === 'weekly' ? 'rgba(108,92,231,0.1)' : '#0e0e1d',
            border: selectedPlan === 'weekly' ? '2px solid #6C5CE7' : '1px solid #333',
            borderRadius: 20,
            padding: 32,
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative'
          }}
        >
          <h3 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#e8e8f8',
            marginBottom: 8
          }}>
            Hebdomadaire
          </h3>

          <div style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#6C5CE7',
            marginBottom: 4
          }}>
            500 <span style={{fontSize: 24, color: '#aaa'}}>FCFA</span>
          </div>

          <p style={{
            fontSize: 14,
            color: '#888',
            marginBottom: 24
          }}>
            Pour {plans.weekly.duration}
          </p>

          <div style={{marginBottom: 24}}>
            {plans.weekly.features.map((feature, i) => (
              <div key={i} style={{
                padding: '10px 0',
                color: '#e8e8f8',
                fontSize: 14,
                borderBottom: i < plans.weekly.features.length - 1 ? '1px solid #222' : 'none'
              }}>
                {feature}
              </div>
            ))}
          </div>

          {selectedPlan === 'weekly' && (
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              background: '#6C5CE7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
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
            border: selectedPlan === 'monthly' ? '2px solid #6C5CE7' : '1px solid #333',
            borderRadius: 20,
            padding: 32,
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative'
          }}
        >
          {plans.monthly.popular && (
            <div style={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 16px',
              background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff'
            }}>
              ⭐ PLUS POPULAIRE
            </div>
          )}

          <h3 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#e8e8f8',
            marginBottom: 8
          }}>
            Mensuel
          </h3>

          <div style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#6C5CE7',
            marginBottom: 4
          }}>
            2000 <span style={{fontSize: 24, color: '#aaa'}}>FCFA</span>
          </div>

          <p style={{
            fontSize: 14,
            color: '#00b894',
            fontWeight: 700,
            marginBottom: 24
          }}>
            {plans.monthly.savings}
          </p>

          <div style={{marginBottom: 24}}>
            {plans.monthly.features.map((feature, i) => (
              <div key={i} style={{
                padding: '10px 0',
                color: '#e8e8f8',
                fontSize: 14,
                borderBottom: i < plans.monthly.features.length - 1 ? '1px solid #222' : 'none'
              }}>
                {feature}
              </div>
            ))}
          </div>

          {selectedPlan === 'monthly' && (
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              background: '#6C5CE7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}>
              ✓
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <button
          onClick={handleSubscribe}
          disabled={loading || !fedaPayReady}
          style={{
            width: '100%',
            padding: 20,
            background: (loading || !fedaPayReady) ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 18,
            fontWeight: 800,
            cursor: (loading || !fedaPayReady) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || !fedaPayReady) ? 'none' : '0 12px 40px rgba(108,92,231,0.4)',
            transition: 'all 0.3s'
          }}
        >
          {loading ? '⏳ Chargement...' : !fedaPayReady ? '⏳ Chargement paiement...' : `🚀 Souscrire ${selectedPlan === 'weekly' ? '(500 FCFA/1$)' : '(2000 FCFA/3$)'}`}
        </button>

        <p style={{
          fontSize: 13,
          color: '#888',
          marginTop: 16
        }}>
          Paiement sécurisé par FedaPay • Résiliable à tout moment
        </p>
      </div>

      {/* Comparaison Gratuit vs Premium */}
      <div style={{
        maxWidth: 800,
        margin: '80px auto 0',
        background: '#0e0e1d',
        border: '1px solid #333',
        borderRadius: 20,
        padding: 40
      }}>
        <h2 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#e8e8f8',
          marginBottom: 32,
          textAlign: 'center'
        }}>
          Gratuit vs Premium
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16
        }}>
          <div style={{textAlign: 'center', color: '#aaa', fontWeight: 700, fontSize: 18}}>
            Gratuit
          </div>
          <div style={{textAlign: 'center', color: '#6C5CE7', fontWeight: 700, fontSize: 18}}>
            Premium 💎
          </div>

          <div style={{padding: 16, background: '#1a1a2e', borderRadius: 12, textAlign: 'center'}}>
            3 résumés/jour
          </div>
          <div style={{padding: 16, background: 'rgba(108,92,231,0.1)', borderRadius: 12, textAlign: 'center', color: '#6C5CE7', fontWeight: 700}}>
            Résumés illimités
          </div>

          <div style={{padding: 16, background: '#1a1a2e', borderRadius: 12, textAlign: 'center'}}>
            1 examen basic
          </div>
          <div style={{padding: 16, background: 'rgba(108,92,231,0.1)', borderRadius: 12, textAlign: 'center', color: '#6C5CE7', fontWeight: 700}}>
            Examens complets illimités
          </div>

          <div style={{padding: 16, background: '#1a1a2e', borderRadius: 12, textAlign: 'center'}}>
            Publicités
          </div>
          <div style={{padding: 16, background: 'rgba(108,92,231,0.1)', borderRadius: 12, textAlign: 'center', color: '#6C5CE7', fontWeight: 700}}>
            Sans publicité
          </div>

          <div style={{padding: 16, background: '#1a1a2e', borderRadius: 12, textAlign: 'center'}}>
            Support standard
          </div>
          <div style={{padding: 16, background: 'rgba(108,92,231,0.1)', borderRadius: 12, textAlign: 'center', color: '#6C5CE7', fontWeight: 700}}>
            Support prioritaire
          </div>
        </div>
      </div>
    </div>
  );
}
