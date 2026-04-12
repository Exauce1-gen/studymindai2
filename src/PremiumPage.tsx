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

  useEffect(() => {
    const checkFedaPay = setInterval(() => {
      if (window.FedaPay) {
        setFedaPayReady(true);
        clearInterval(checkFedaPay);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkFedaPay);
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

  const handleSubscribe = async () => {};

  if (isPremium) return <div />;

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', padding: 20 }}>

      <div style={{
        maxWidth: 1000,
        margin: '0 auto 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24
      }}>

        {/* Hebdomadaire */}
        <div onClick={() => setSelectedPlan('weekly')} style={{ padding: 32 }}>
          <h3>Hebdomadaire</h3>

          <div style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#6C5CE7',
            marginBottom: 4
          }}>
            500 <span style={{fontSize: 24, color: '#aaa'}}>FCFA</span>
          </div>

          <div style={{
            fontSize: 14,
            color: '#888',
            marginBottom: 4
          }}>
            ≈ 1$
          </div>
        </div>

        {/* Mensuel */}
        <div onClick={() => setSelectedPlan('monthly')} style={{ padding: 32 }}>
          <h3>Mensuel</h3>

          <div style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#6C5CE7',
            marginBottom: 4
          }}>
            2000 <span style={{fontSize: 24, color: '#aaa'}}>FCFA</span>
          </div>

          <div style={{
            fontSize: 14,
            color: '#888',
            marginBottom: 4
          }}>
            ≈ 3$
          </div>
        </div>

      </div>
    </div>
  );
}
