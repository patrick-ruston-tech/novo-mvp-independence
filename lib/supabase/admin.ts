import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';

// Cliente com service role para as poucas escritas do site que a anon key
// não pode fazer quando a RLS estiver restrita: gravar os ids do GHL no lead
// e na captação, e ler o imóvel do lead mesmo se ele estiver despublicado.
//
// Só roda no servidor (Server Actions). A chave não tem prefixo NEXT_PUBLIC_,
// então o Next nunca a coloca no bundle do browser.
//
// Sem SUPABASE_SERVICE_ROLE_KEY no ambiente, cai no cliente anon: é o
// comportamento de antes, e deixa o deploy deste código independente de a
// env já existir no host. Depois de restringir a RLS, a env é obrigatória.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY ausente — usando anon key');
    return createServerClient();
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
