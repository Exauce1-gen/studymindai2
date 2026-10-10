import { useEffect } from 'react';
import { supabase } from './supabase';

/**
 * Enregistre qu'un utilisateur a ouvert l'app aujourd'hui (une seule ligne par
 * utilisateur et par jour, jour en UTC). Sert à calculer le nombre d'actifs par
 * jour et le revenu publicitaire par visiteur. Aucune donnée de contenu.
 */
export function useDailyActivity(userId?: string, enabled?: boolean, isPremium?: boolean) {
  useEffect(() => {
    if (!userId || !enabled) return;

    const day = new Date().toISOString().split('T')[0];
    const key = `activity_logged_${userId}_${day}`;
    try {
      if (localStorage.getItem(key)) return; // déjà enregistré aujourd'hui sur cet appareil
    } catch {
      /* stockage indisponible : on tente quand même */
    }

    supabase
      .from('daily_activity')
      .upsert(
        { user_id: userId, day, is_premium: !!isPremium },
        { onConflict: 'user_id,day', ignoreDuplicates: true }
      )
      .then(({ error }) => {
        if (error) {
          console.error('daily_activity:', error.message);
          return;
        }
        try {
          localStorage.setItem(key, '1');
        } catch {
          /* ignoré */
        }
      });
  }, [userId, enabled]);
}
