/**
 * Checks do vídeo do imóvel (lib/property-video).
 * Puro — não toca banco. Rodar: npx tsx scripts/check-property-video.ts
 *
 * Os casos vêm de dados REAIS de produção (19/ago/2026), não inventados.
 */
import { youtubeIdFrom, youtubeEmbedUrl, propertyVideoEmbed, VIDEOS_GENERICOS } from '../lib/property-video';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; }
  else { failed++; console.error(`✗ ${name}`); }
}

// ── youtubeIdFrom: formatos que existem no banco ──
check('youtu.be simples', youtubeIdFrom('https://youtu.be/e578hOJAv3Q') === 'e578hOJAv3Q');
check('youtu.be com ?si=', youtubeIdFrom('https://youtu.be/e578hOJAv3Q?si=2195PRobRP5QkLu2') === 'e578hOJAv3Q');
check(
  'texto colado com canal ANTES do vídeo pega o vídeo',
  youtubeIdFrom('Corretores Independence Canal YouTube: https://www.youtube.com/@independenceimoveis-sjc Institucional: https://youtu.be/e578hOJAv3Q?si=2195PRobRP5QkLu2') === 'e578hOJAv3Q'
);
check(
  'watch com v= fora da primeira posição',
  youtubeIdFrom('https://www.youtube.com/watch?si=FuqNAic9N93uqUox&v=n1Jp65BH8aY&feature=youtu.be') === 'n1Jp65BH8aY'
);
check('watch clássico', youtubeIdFrom('https://www.youtube.com/watch?v=n1Jp65BH8aY') === 'n1Jp65BH8aY');
check('shorts', youtubeIdFrom('https://www.youtube.com/shorts/NGoC241qhao') === 'NGoC241qhao');
check('embed (o formato que o cadastro dos lançamentos usa)', youtubeIdFrom('https://youtube.com/embed/NGoC241qhao') === 'NGoC241qhao');
check('só o canal → null', youtubeIdFrom('https://www.youtube.com/@independenceimoveis-sjc') === null);
check('vazio → null', youtubeIdFrom('') === null);
check('null → null', youtubeIdFrom(null) === null);
check('texto sem link → null', youtubeIdFrom('vídeo será gravado semana que vem') === null);
check('id com hífen e underscore preservados', youtubeIdFrom('https://youtu.be/VzOq-_Aw85k') === 'VzOq-_Aw85k');

// ── embed ──
check('embed é nocookie', youtubeEmbedUrl('abc12345678') === 'https://www.youtube-nocookie.com/embed/abc12345678');

// ── política de exibição ──
check('vídeo exclusivo aparece', propertyVideoEmbed('https://youtu.be/NGoC241qhao') === 'https://www.youtube-nocookie.com/embed/NGoC241qhao');
check('institucional NÃO aparece', propertyVideoEmbed('https://youtu.be/e578hOJAv3Q?si=x') === null);
check('genérico em texto colado NÃO aparece', propertyVideoEmbed('Canal: https://www.youtube.com/@x Institucional: https://youtu.be/VzOq-_Aw85k') === null);
check('campo só com canal NÃO aparece', propertyVideoEmbed('https://www.youtube.com/@independenceimoveis-sjc') === null);
check('campo vazio NÃO aparece', propertyVideoEmbed(null) === null);
check('lista de genéricos tem 6 ids', VIDEOS_GENERICOS.size === 6);
check('todo id genérico tem 11 caracteres', [...VIDEOS_GENERICOS].every((id) => id.length === 11));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
