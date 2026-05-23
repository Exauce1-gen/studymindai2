import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.rpc('check_expired_premium');

  if (error) {
    return res.status(500).json({ error });
  }

  return res.status(200).json({ success: true, data });
}
