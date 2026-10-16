/**
 * Unificação de contato no GHL (item 2 dos pedidos de out/2026).
 *
 * Antes, o painel e o site mandavam e-mail + telefone direto para
 * /contacts/upsert e o GHL decidia sozinho pela configuração de contato
 * duplicado da conta: a mesma pessoa voltando com telefone novo (ou e-mail
 * novo) podia virar um segundo contato, ou ter o dado antigo sobrescrito sem
 * rastro.
 *
 * Agora o chamador procura o contato pelo e-mail E pelo telefone antes de
 * gravar, e esta função decide o que fazer. Regras:
 *  - nenhum encontrado → upsert de sempre (contato novo);
 *  - um encontrado (ou os dois são o mesmo) → atualiza ESSE contato com o
 *    dado novo; o dado anterior fica numa nota (o histórico de conversa é do
 *    contato, não do número, então nada se perde);
 *  - e-mail num contato e telefone em OUTRO → não junta nada sozinho: fica
 *    no contato do e-mail e os dois ganham nota "possível duplicado" para
 *    alguém revisar e mesclar no GHL.
 *
 * Pura (sem rede). Testes no painel: painel-admin/scripts/check-contato-unificado.ts.
 * Cópia do painel-admin/lib/contato-unificado.ts — mudou lá, muda aqui.
 */

export interface ContatoGhl {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export type DecisaoContato =
  | { tipo: 'upsert' }
  | {
      tipo: 'atualizar';
      contatoId: string;
      /** Campos a gravar no contato (vazio = só tags/campos personalizados). */
      patch: { email?: string; phone?: string; name?: string };
      nota: string | null;
    }
  | {
      tipo: 'conflito';
      contatoId: string;
      outroContatoId: string;
      patch: { name?: string };
      nota: string;
      notaOutro: string;
    };

function mesmoEmail(a?: string | null, b?: string | null): boolean {
  return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
}

/** Compara pelos dígitos, ignorando o 55 do Brasil quando só um lado tem. */
function digitosTelefone(t?: string | null): string {
  const d = (t ?? '').replace(/\D/g, '');
  return d.startsWith('55') && d.length >= 12 ? d.slice(2) : d;
}

export function mesmoTelefone(a?: string | null, b?: string | null): boolean {
  const x = digitosTelefone(a);
  return x !== '' && x === digitosTelefone(b);
}

export function decidirUnificacao(
  entrada: { name?: string; email?: string; phone?: string },
  porEmail: ContatoGhl | null,
  porTelefone: ContatoGhl | null
): DecisaoContato {
  if (!porEmail && !porTelefone) return { tipo: 'upsert' };

  const nomeNovo = entrada.name?.trim() || undefined;

  if (porEmail && porTelefone && porEmail.id !== porTelefone.id) {
    return {
      tipo: 'conflito',
      contatoId: porEmail.id,
      outroContatoId: porTelefone.id,
      patch: !porEmail.name?.trim() && nomeNovo ? { name: nomeNovo } : {},
      nota:
        `⚠️ Possível cadastro duplicado: um novo contato chegou com este e-mail e com o telefone ${entrada.phone}, ` +
        `que pertence a outro contato do CRM (${porTelefone.name?.trim() || 'sem nome'}, id ${porTelefone.id}). ` +
        `O lead foi registrado aqui. Se for a mesma pessoa, mescle os dois contatos.`,
      notaOutro:
        `⚠️ Possível cadastro duplicado: este telefone chegou num novo contato junto com o e-mail ${entrada.email}, ` +
        `que pertence a outro contato do CRM (${porEmail.name?.trim() || 'sem nome'}, id ${porEmail.id}). ` +
        `O lead foi registrado lá. Se for a mesma pessoa, mescle os dois contatos.`,
    };
  }

  const alvo = (porEmail ?? porTelefone)!;
  const patch: { email?: string; phone?: string; name?: string } = {};
  const anteriores: string[] = [];

  if (entrada.email && !mesmoEmail(alvo.email, entrada.email)) {
    patch.email = entrada.email.trim();
    if (alvo.email?.trim()) anteriores.push(`e-mail anterior: ${alvo.email.trim()}`);
  }
  if (entrada.phone && !mesmoTelefone(alvo.phone, entrada.phone)) {
    patch.phone = entrada.phone;
    if (alvo.phone?.trim()) anteriores.push(`telefone anterior: ${alvo.phone.trim()}`);
  }
  // Nome só preenche vazio: o contato existente pode ter o nome completo e o
  // lead novo só o primeiro nome (ou o nome do cônjuge que usa o mesmo e-mail).
  if (!alvo.name?.trim() && nomeNovo) patch.name = nomeNovo;

  const nota = anteriores.length
    ? `Dados de contato atualizados por um novo lead — ${anteriores.join('; ')}. ` +
      `O histórico de conversas continua neste contato.`
    : null;

  return { tipo: 'atualizar', contatoId: alvo.id, patch, nota };
}
