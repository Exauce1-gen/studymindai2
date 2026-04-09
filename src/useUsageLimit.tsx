import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './AuthContext';

interface UsageLimit {
  canUse: boolean;
  usageCount: number;
  maxUsage: number;
  resetTime: string;
  loading: boolean;
}

export function useUsageLimit(featureType: 'summary' | 'quiz' | 'exam'): UsageLimit {
  const { user, userProfile } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const MAX_FREE_USAGE = 3; // 3 résumés gratuits par jour
  const isPremium = userProfile?.is_premium || false;

  useEffect(() => {
    if (user) {
      checkUsage();
    }
  }, [user, featureType]);

  const checkUsage = async () => {
    if (!user) return;

    // Si premium, pas de limite
    if (isPremium) {
      setUsageCount(0);
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // Format: 2026-04-09

      // Vérifier l'utilisation aujourd'hui
      const { data, error } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_type', featureType)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking usage:', error);
      }

      setUsageCount(data?.usage_count || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!user || isPremium) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Incrémenter ou créer l'utilisation
      const { data: existing } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_type', featureType)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('user_usage')
          .update({ usage_count: existing.usage_count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_usage')
          .insert({
            user_id: user.id,
            feature_type: featureType,
            date: today,
            usage_count: 1
          });
      }

      setUsageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const getResetTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return {
    canUse: isPremium || usageCount < MAX_FREE_USAGE,
    usageCount: isPremium ? 0 : usageCount,
    maxUsage: MAX_FREE_USAGE,
    resetTime: getResetTime(),
    loading
  };
}

// Export aussi la fonction pour incrémenter depuis les composants
export async function incrementFeatureUsage(userId: string, featureType: 'summary' | 'quiz' | 'exam') {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_type', featureType)
      .eq('date', today)
      .single();

    if (existing) {
      await supabase
        .from('user_usage')
        .update({ usage_count: existing.usage_count + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          feature_type: featureType,
          date: today,
          usage_count: 1
        });
    }
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}
