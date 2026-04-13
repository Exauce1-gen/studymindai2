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
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    console.log('[DEBUG]', message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Vérifier que FedaPay est chargé
  useEffect(() => {
    addDebugLog('Checking for FedaPay SDK...');
    
    const checkFedaPay = setInterval(() => {
      if (window.FedaPay) {
        addDebugLog('✅ FedaPay SDK loaded successfully');
        console.log('FedaPay object:', window.FedaPay);
        console.log('FedaPay methods:', Object.keys(window.FedaPay));
        setFedaPayReady(true);
        clearInterval(checkFedaPay);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkFedaPay);
      if (!window.FedaPay) {
        addDebugLog('❌ FedaPay SDK failed to load after 10 seconds');
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
    addDebugLog('🔵 Subscribe button clicked');
    
    if (!user) {
      addDebugLog('❌ No user logged in');
      alert('Vous devez être connecté pour souscrire');
      return;
    }

    addDebugLog(`✅ User logged in: ${user.email}`);

    if (!fedaPayReady || !window.FedaPay) {
      addDebugLog('❌ FedaPay not ready');
      alert('Chargement du système de paiement... Veuillez réessayer dans quelques secondes.');
      return;
    }

    addDebugLog('✅ FedaPay is ready');

    setLoading(true);

    try {
      const plan = plans[selectedPlan];
      addDebugLog(`Selected plan: ${selectedPlan} (${plan.price} FCFA)`);
      
      // Configuration FedaPay
      const publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY;
      
      addDebugLog(`Public key: ${publicKey ? publicKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
      
      if (!publicKey) {
        addDebugLog('❌ VITE_FEDAPAY_PUBLIC_KEY not found in environment variables');
        alert('Erreur de configuration FedaPay. La clé publique est manquante.');
        setLoading(false);
        return;
      }

      addDebugLog('Creating FedaPay transaction...');

      // Vérifier toutes les méthodes disponibles
      addDebugLog('Available FedaPay methods: ' + Object.keys(window.FedaPay).join(', '));

      const transactionData = {
        public_key: publicKey,
        transaction: {
          amount: plan.price,
          description: `StudyMind AI Premium - ${selectedPlan === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}`,
          customer: {
            firstname: userProfile?.first_name || 'Utilisateur',
            lastname: 'StudyMind',
            email: user.email
          }
        },
        onComplete: function(response: any) {
          addDebugLog('✅ Payment completed');
          console.log('Payment response:', response);
          alert('Paiement réussi ! 🎉');
          
          // Sauvegarder dans Supabase
          supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              transaction_id: response.id || `txn_${Date.now()}`,
              plan_type: selectedPlan,
              amount: plan.price,
              status: 'approved',
              created_at: new Date().toISOString()
            })
            .then(() => {
              return supabase
                .from('users')
                .update({ is_premium: true })
                .eq('id', user.id);
            })
            .then(() => {
              window.location.reload();
            });
        },
        onError: function(error: any) {
          addDebugLog('❌ Payment error: ' + JSON.stringify(error));
          console.error('Payment error:', error);
          alert('Erreur lors du paiement');
          setLoading(false);
        }
      };

      addDebugLog('Transaction data prepared');
      console.log('Transaction data:', transactionData);

      // Essayer différentes méthodes
      if (typeof window.FedaPay.init === 'function') {
        addDebugLog('Calling FedaPay.init()...');
        window.FedaPay.init(transactionData);
        addDebugLog('✅ FedaPay.init() called successfully');
      } else if (typeof window.FedaPay.open === 'function') {
        addDebugLog('Calling FedaPay.open()...');
        window.FedaPay.open(transactionData);
        addDebugLog('✅ FedaPay.open() called successfully');
      } else if (typeof window.FedaPay === 'function') {
        addDebugLog('Calling FedaPay() as function...');
        window.FedaPay(transactionData);
        addDebugLog('✅ FedaPay() called successfully');
      } else {
        addDebugLog('❌ No suitable FedaPay method found');
        alert('Erreur: Impossible de démarrer FedaPay. Vérifiez la console.');
      }

      setLoading(false);

    } catch (error: any) {
      addDebugLog('❌ Exception caught: ' + error.message);
      console.error('Error:', error);
      alert(`Erreur: ${error.message}`);
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
        <div style={{
          maxWidth: 1200,
          margin: '0 auto 40px'
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
            color: '#aaa'
          }}>
            Profitez de toutes les fonctionnalités illimitées
          </p>
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
      {/* DEBUG LOG PANEL */}
      {debugLog.length > 0 && (
        <div style={{
          maxWidth: 1200,
          margin: '0 auto 20px',
          padding: 20,
          background: '#0e0e1d',
          border: '1px solid #6C5CE7',
          borderRadius: 12,
          maxHeight: 300,
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#6C5CE7',
            marginBottom: 12
          }}>
            🔍 Debug Log (Envoie-moi ce log !)
          </h3>
          {debugLog.map((log, i) => (
            <div key={i} style={{
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#aaa',
              marginBottom: 4
            }}>
              {log}
            </div>
          ))}
        </div>
      )}

      <div style={{
        maxWidth: 1200,
        margin: '0 auto 40px'
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

      <div style={{
        maxWidth: 1000,
        margin: '0 auto 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24
      }}>
        <div
          onClick={() => setSelectedPlan('weekly')}
          style={{
            background: selectedPlan === 'weekly' ? 'rgba(108,92,231,0.1)' : '#0e0e1d',
            border: selectedPlan === 'weekly' ? '2px solid #6C5CE7' : '1px solid #333',
            borderRadius: 20,
            padding: 32,
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
            Hebdomadaire
          </h3>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#6C5CE7', marginBottom: 4 }}>
            500 <span style={{fontSize: 24, color: '#aaa'}}>FCFA</span>
          </div>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
            Pour 7 jours
          </p>
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
              justifyContent: 'center'
            }}>✓</div>
          )}
        </div>

        <div
          onClick={() => setSelectedPlan('monthly')}
          style={{
            background: selectedPlan === 'monthly' ? 'rgba(108,92,231,0.1)' : '#0e0e1d',
            border: selectedPlan === 'monthly' ? '2px solid #6C5CE7' : '1px solid #333',
            borderRadius: 20,
            padding: 32,
            cursor: 'pointer',
            position: 'relative'
          }}
        >
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
          }}>⭐ POPULAIRE</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
            Mensuel
          </h3>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#6C5CE7', marginBottom: 4 }}>
            2000 <span style={{fontSize: 24, color: '#aaa'}}>FCFA</span>
          </div>
          <p style={{ fontSize: 14, color: '#00b894', fontWeight: 700, marginBottom: 24 }}>
            Économisez 1000 FCFA !
          </p>
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
              justifyContent: 'center'
            }}>✓</div>
          )}
        </div>
      </div>

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
            boxShadow: (loading || !fedaPayReady) ? 'none' : '0 12px 40px rgba(108,92,231,0.4)'
          }}
        >
          {loading ? '⏳ Chargement...' : !fedaPayReady ? '⏳ Chargement paiement...' : `🚀 Souscrire ${selectedPlan === 'weekly' ? '(500 FCFA)' : '(2000 FCFA)'}`}
        </button>

        <p style={{ fontSize: 13, color: '#888', marginTop: 16 }}>
          Paiement sécurisé par FedaPay • Résiliable à tout moment
        </p>
      </div>
    </div>
  );
}
