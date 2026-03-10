// Configuration Supabase pour StudyMind AI
import { createClient } from '@supabase/supabase-js';

// Vos clés Supabase
const supabaseUrl = 'https://josrvfcyweohpkfhfjbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc3J2ZmN5d2VvaHBrZmhmamJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTE2MjIsImV4cCI6MjA4ODcyNzYyMn0.jila8a_zed2gjFVjmCyVRYsYO7YYer3H1XbrS80hdCU';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
