import { createClient } from '@supabase/supabase-js';

// Browser-side client singleton
// Used only for client-side operations (form submissions, leads)
let client: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}
