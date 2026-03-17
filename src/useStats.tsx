import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface UserStats {
  summaries_count: number;
  quizzes_completed: number;
  exams_taken: number;
  chats_count: number;
  cards_created: number;
  total_quiz_score: number;
  total_exam_score: number;
  perfect_scores: number;
  study_time_minutes: number;
  last_active_date: string;
  streak_days: number;
  max_streak: number;
  badges: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGES DISPONIBLES
// ═══════════════════════════════════════════════════════════════════════════

const AVAILABLE_BADGES = [
  { id: 'first_summary', name: 'Débutant', description: 'Premier résumé créé', icon: '🎓', requirement: (stats: UserStats) => stats.summaries_count >= 1 },
  { id: 'quiz_master', name: 'Curieux', description: '5 quiz complétés', icon: '🧩', requirement: (stats: UserStats) => stats.quizzes_completed >= 5 },
  { id: 'exam_taker', name: 'Studieux', description: '10 examens passés', icon: '📝', requirement: (stats: UserStats) => stats.exams_taken >= 10 },
  { id: 'week_streak', name: 'Persévérant', description: '7 jours consécutifs', icon: '🔥', requirement: (stats: UserStats) => stats.streak_days >= 7 },
  { id: 'high_scorer', name: 'Expert', description: 'Moyenne > 16/20', icon: '⭐', requirement: (stats: UserStats) => {
    const total = stats.quizzes_completed + stats.exams_taken;
    if (total === 0) return false;
    return ((stats.total_quiz_score + stats.total_exam_score) / total) >= 16;
  }},
  { id: 'perfectionist', name: 'Perfectionniste', description: '3 notes parfaites (20/20)', icon: '💯', requirement: (stats: UserStats) => stats.perfect_scores >= 3 },
  { id: 'champion', name: 'Champion', description: '50 résumés créés', icon: '🚀', requirement: (stats: UserStats) => stats.summaries_count >= 50 },
  { id: 'dedicated', name: 'Dévoué', description: '30 jours consécutifs', icon: '💪', requirement: (stats: UserStats) => stats.streak_days >= 30 },
];

// ═══════════════════════════════════════════════════════════════════════════
// HOOK useStats
// ═══════════════════════════════════════════════════════════════════════════

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────
  // CHARGER LES STATS
  // ─────────────────────────────────────────────────────────────────────────

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Si pas de stats, en créer
        if (error.code === 'PGRST116') {
          await createStats();
          return;
        }
        throw error;
      }

      setStats(data);
      updateBadges(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CRÉER LES STATS INITIALES
  // ─────────────────────────────────────────────────────────────────────────

  const createStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setStats(data);
      updateBadges(data);
    } catch (error) {
      console.error('Error creating stats:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // METTRE À JOUR LES BADGES
  // ─────────────────────────────────────────────────────────────────────────

  const updateBadges = (currentStats: UserStats) => {
    const updatedBadges = AVAILABLE_BADGES.map(badge => ({
      ...badge,
      unlocked: badge.requirement(currentStats) || currentStats.badges.includes(badge.id)
    }));

    setBadges(updatedBadges);

    // Sauvegarder les nouveaux badges débloqués
    const newlyUnlocked = updatedBadges
      .filter(b => b.unlocked && !currentStats.badges.includes(b.id))
      .map(b => b.id);

    if (newlyUnlocked.length > 0) {
      saveBadges([...currentStats.badges, ...newlyUnlocked]);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SAUVEGARDER LES BADGES
  // ─────────────────────────────────────────────────────────────────────────

  const saveBadges = async (badgeIds: string[]) => {
    if (!user) return;

    try {
      await supabase
        .from('user_stats')
        .update({ badges: badgeIds })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // INCRÉMENTER UN COMPTEUR
  // ─────────────────────────────────────────────────────────────────────────

  const incrementStat = async (field: keyof UserStats, value: number = 1) => {
    if (!user || !stats) return;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update({ [field]: (stats[field] as number) + value })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setStats(data);
      updateBadges(data);
    } catch (error) {
      console.error('Error incrementing stat:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // METTRE À JOUR LE STREAK
  // ─────────────────────────────────────────────────────────────────────────

  const updateStreak = async () => {
    if (!user || !stats) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.last_active_date;

    // Déjà mis à jour aujourd'hui
    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActive === yesterdayStr) {
      // Continuation du streak
      newStreak = stats.streak_days + 1;
    }

    const newMaxStreak = Math.max(stats.max_streak, newStreak);

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          last_active_date: today,
          streak_days: newStreak,
          max_streak: newMaxStreak
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setStats(data);
      updateBadges(data);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AJOUTER UN SCORE DE QUIZ
  // ─────────────────────────────────────────────────────────────────────────

  const addQuizScore = async (score: number, maxScore: number = 20) => {
    if (!user || !stats) return;

    const isPerfect = score === maxScore;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          quizzes_completed: stats.quizzes_completed + 1,
          total_quiz_score: stats.total_quiz_score + score,
          perfect_scores: isPerfect ? stats.perfect_scores + 1 : stats.perfect_scores
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setStats(data);
      updateBadges(data);
    } catch (error) {
      console.error('Error adding quiz score:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AJOUTER UN SCORE D'EXAMEN
  // ─────────────────────────────────────────────────────────────────────────

  const addExamScore = async (score: number, maxScore: number = 20) => {
    if (!user || !stats) return;

    const isPerfect = score === maxScore;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          exams_taken: stats.exams_taken + 1,
          total_exam_score: stats.total_exam_score + score,
          perfect_scores: isPerfect ? stats.perfect_scores + 1 : stats.perfect_scores
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setStats(data);
      updateBadges(data);
    } catch (error) {
      console.error('Error adding exam score:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CALCULER LA MOYENNE
  // ─────────────────────────────────────────────────────────────────────────

  const getAverageScore = (): number => {
    if (!stats) return 0;
    const total = stats.quizzes_completed + stats.exams_taken;
    if (total === 0) return 0;
    return Math.round(((stats.total_quiz_score + stats.total_exam_score) / total) * 10) / 10;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET : CHARGER AU MONTAGE
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadStats();
  }, [user]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET : METTRE À JOUR LE STREAK
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (stats) {
      updateStreak();
    }
  }, [stats?.last_active_date]);

  // ─────────────────────────────────────────────────────────────────────────
  // RETOUR
  // ─────────────────────────────────────────────────────────────────────────

  return {
    stats,
    badges,
    loading,
    incrementStat,
    addQuizScore,
    addExamScore,
    getAverageScore,
    reload: loadStats
  };
}
