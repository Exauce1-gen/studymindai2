import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // "Hier" en UTC : si le dernier jour actif d'un utilisateur est hier (pas
  // aujourd'hui), sa série est encore intacte mais sera perdue à minuit UTC
  // s'il ne revient pas.
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  try {
    const { data: atRiskUsers, error: fetchError } = await supabase
      .from('user_stats')
      .select('user_id, streak_days')
      .eq('last_active_date', yesterday)
      .gt('streak_days', 0);

    if (fetchError) {
      return res.status(500).json({ error: fetchError });
    }

    if (!atRiskUsers || atRiskUsers.length === 0) {
      return res.status(200).json({ success: true, notified: 0 });
    }

    const notifications = atRiskUsers.map((u: any) => ({
      user_id: u.user_id,
      type: 'streak',
      title: `🔥 Ta série de ${u.streak_days} jour${u.streak_days > 1 ? 's' : ''} est en danger !`,
      message: `Reviens aujourd'hui avant minuit pour ne pas la perdre.`,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      return res.status(500).json({ error: insertError });
    }

    return res.status(200).json({ success: true, notified: notifications.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
