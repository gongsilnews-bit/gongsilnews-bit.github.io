import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kjrjrjnsiynrcelzepju.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj';

export const supabase = createClient(supabaseUrl, supabaseKey);
