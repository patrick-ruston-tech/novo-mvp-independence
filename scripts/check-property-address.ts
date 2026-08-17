/**
 * Checks da privacidade do endereço público (lib/property-address).
 * Puro — não toca banco. Rodar: npx tsx scripts/check-property-address.ts
 */
import {
  addressPrecision,
  publicAddressLabel,
  schemaStreetAddress,
  stripStreetNumber,
} from '../lib/property-address';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; }
  else { failed++; console.error(`✗ ${name}`); }
}

const oculto = {
  hide_address: true,
  street: 'R. Carlos Maria Auricchio',
  street_number: '137',
  neighborhood: 'Jardim Aquarius',
  city: 'São José dos Campos',
};
const visivel = {
  hide_address: false,
  street: 'Rua Terezina',
  street_number: '875',
  neighborhood: 'Parque Industrial',
  city: 'São José dos Campos',
};

// ── precisão ──
check('hide_address=true → bairro', addressPrecision(oculto) === 'neighborhood');
check('hide_address=false → rua', addressPrecision(visivel) === 'street');
check('hide_address null → rua (default)', addressPrecision({ hide_address: null }) === 'street');
check('input vazio não explode', addressPrecision(undefined) === 'street');

// ── label público ──
const labelOculto = publicAddressLabel(oculto);
check('oculto NÃO mostra rua', !/Auricchio/i.test(labelOculto));
check('oculto NÃO mostra número', !/137/.test(labelOculto));
check('oculto mostra bairro + cidade', labelOculto === 'Jardim Aquarius, São José dos Campos');

const labelVisivel = publicAddressLabel(visivel);
check('visível mostra a rua', /Terezina/.test(labelVisivel));
check('visível NUNCA mostra o número', !/875/.test(labelVisivel));
check('visível = rua, bairro, cidade', labelVisivel === 'Rua Terezina, Parque Industrial, São José dos Campos');

// address legado com número embutido (parte da base guarda "Rua X, 123")
check(
  'address legado tem número removido',
  publicAddressLabel({ hide_address: false, address: 'Rua Quero Quero, 450', neighborhood: 'Centro', city: 'Jacareí' })
    === 'Rua Quero Quero, Centro, Jacareí'
);
check(
  'oculto ignora address legado inteiro',
  publicAddressLabel({ hide_address: true, address: 'Rua Quero Quero, 450', neighborhood: 'Centro', city: 'Jacareí' })
    === 'Centro, Jacareí'
);
check('sem bairro/cidade → string vazia', publicAddressLabel({ hide_address: true }) === '');

// ── stripStreetNumber ──
check('", 123" removido', stripStreetNumber('Rua X, 123') === 'Rua X');
check('" 123" removido', stripStreetNumber('Rua X 123') === 'Rua X');
check('"nº 45 apto 2" removido', stripStreetNumber('Rua X, nº 45 apto 2') === 'Rua X');
check('"n° 45" removido', stripStreetNumber('Rua X n° 45') === 'Rua X');
check('número no MEIO do nome preservado', stripStreetNumber('Avenida 9 de Julho') === 'Avenida 9 de Julho');
check('rua sem número intacta', stripStreetNumber('R. Carlos Maria Auricchio') === 'R. Carlos Maria Auricchio');

// ── JSON-LD ──
check('schema omite rua quando oculto', schemaStreetAddress(oculto) === undefined);
check('schema publica rua sem número', schemaStreetAddress(visivel) === 'Rua Terezina');
check('schema sem logradouro → undefined', schemaStreetAddress({ hide_address: false, neighborhood: 'Centro' }) === undefined);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
