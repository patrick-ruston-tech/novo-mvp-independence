export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
}

export const blogCategories = ['Todos', 'Mercado', 'Dicas', 'SJC', 'Investimento'];

export const blogPosts: BlogPost[] = [
  {
    slug: 'mercado-imobiliario-sjc-2024',
    title: 'O Mercado Imobiliário em São José dos Campos em 2024: O que esperar?',
    excerpt: 'Análise completa sobre as principais tendências, valorização de bairros e as melhores oportunidades de investimento no Vale do Paraíba para este ano.',
    content: `O cenário imobiliário de São José dos Campos atravessa um momento de transformação singular. Conhecida como o principal polo tecnológico da América Latina, a cidade tem atraído não apenas indústrias e talentos, mas também um volume recorde de investimentos em infraestrutura residencial de alto padrão.

## A Valorização do Eixo Noroeste

Dados recentes apontam para uma valorização de até 12% em bairros específicos como o Jardim Aquarius e Urbanova. A procura por espaços que integram o conceito de "casa inteligente" com áreas verdes preservadas tornou-se o principal motor de busca dos compradores em 2024.

> "São José dos Campos não é mais apenas uma cidade dormitório para o setor aeroespacial; tornou-se um destino de estilo de vida premium por direito próprio."
> — Relatório Anual de Tendências Urbanas

## O Impacto da Sustentabilidade

A sustentabilidade deixou de ser um diferencial para se tornar um requisito. Projetos que incluem painéis fotovoltaicos, reuso de água cinza e certificações de baixa emissão de carbono estão sendo comercializados 30% mais rápido do que construções convencionais.

Para o segundo semestre, espera-se o lançamento de três novos complexos de uso misto, que prometem revitalizar áreas centrais e reduzir a dependência de deslocamentos por automóveis, seguindo a tendência global das "cidades de 15 minutos".`,
    coverImage: '/hero/hero-1.jpg',
    category: 'Mercado',
    author: {
      name: 'Ricardo Alencar',
      role: 'Equipe Independence',
    },
    publishedAt: '12 de Março, 2024',
    readTime: '6 min de leitura',
    featured: true,
    tags: ['Imóveis', 'SJC', 'Tendências 2024', 'Arquitetura'],
  },
  {
    slug: '5-dicas-decorar-apartamento',
    title: '5 Dicas Infalíveis para decorar seu novo apartamento',
    excerpt: 'Transforme seu espaço com pouco investimento usando técnicas de design de interiores modernos e minimalistas.',
    content: `Mudar para um apartamento novo é uma experiência emocionante, mas também pode ser desafiadora quando se trata de decoração. Como transformar um espaço vazio em um lar que reflita sua personalidade?

## 1. Comece pela Paleta de Cores

Escolha no máximo três cores base para todo o apartamento. Isso cria unidade visual entre os ambientes. Tons neutros como cinza claro, bege e branco off-white são atemporais e permitem que você adicione cor através de acessórios.

## 2. Invista em Iluminação

A iluminação é o elemento mais subestimado da decoração. Prefira luz indireta e quente nos ambientes de descanso e luz branca focada nas áreas de trabalho. Luminárias pendentes sobre a mesa de jantar criam um ponto focal instantâneo.

## 3. Menos é Mais

O minimalismo não significa viver sem nada — significa viver apenas com o que importa. Cada peça deve ter uma função ou contar uma história. Evite acumular objetos decorativos que não trazem significado.

## 4. Plantas são Essenciais

Vegetação traz vida a qualquer ambiente. Plantas como espada-de-são-jorge e jiboia são resistentes e ideais para quem está começando. Posicione-as perto de janelas para resultados melhores.

## 5. Personalize com Arte

Quadros, fotografias e prints autorais transformam paredes brancas em galerias pessoais. Não precisa ser caro — imprima fotos de suas viagens e emoldure com molduras simples.`,
    coverImage: '/hero/hero-2.jpg',
    category: 'Dicas',
    author: {
      name: 'Ricardo Alencar',
      role: 'Equipe Independence',
    },
    publishedAt: '08 de Março, 2024',
    readTime: '4 min de leitura',
    tags: ['Decoração', 'Dicas', 'Apartamento'],
  },
  {
    slug: 'bairros-mais-valorizaram-sjc',
    title: 'Os 3 bairros que mais valorizaram no último semestre',
    excerpt: 'Uma análise profunda sobre o crescimento das zonas Oeste e Sul de São José dos Campos.',
    content: `O mercado imobiliário de São José dos Campos continua surpreendendo com números expressivos de valorização. Analisamos os dados do último semestre e identificamos os três bairros que mais se destacaram.

## 1. Urbanova — Valorização de 18%

Urbanova lidera o ranking com uma valorização impressionante de 18%. A combinação de condomínios fechados com infraestrutura completa, proximidade ao Parque Tecnológico e acesso rápido à Dutra tornam o bairro irresistível para famílias de classe média-alta.

## 2. Jardim Aquarius — Valorização de 14%

O Aquarius mantém sua posição como um dos bairros mais desejados da cidade. Novos empreendimentos de alto padrão e a proximidade ao CenterVale Shopping continuam atraindo investidores e moradores.

## 3. Bosque dos Eucaliptos — Valorização de 11%

Surpreendendo muitos analistas, o Bosque dos Eucaliptos emergiu como uma opção custo-benefício excepcional. Com preço médio por metro quadrado ainda acessível e infraestrutura em franca expansão, o bairro atrai especialmente jovens casais comprando o primeiro imóvel.`,
    coverImage: '/hero/hero-3.jpg',
    category: 'SJC',
    author: {
      name: 'Ricardo Alencar',
      role: 'Equipe Independence',
    },
    publishedAt: '05 de Março, 2024',
    readTime: '5 min de leitura',
    tags: ['SJC', 'Valorização', 'Investimento'],
  },
  {
    slug: 'vale-pena-investir-imoveis-planta',
    title: 'Vale a pena investir em imóveis na planta?',
    excerpt: 'Prós e contras de adquirir sua unidade ainda na fase de construção. Descubra como maximizar seu retorno.',
    content: `Comprar um imóvel na planta é uma das decisões financeiras mais significativas que alguém pode tomar. Mas será que vale a pena? Analisamos os principais fatores.

## As Vantagens

Imóveis na planta costumam ser 20% a 30% mais baratos que prontos. Além disso, as condições de pagamento durante a obra são mais flexíveis, com parcelas menores até a entrega das chaves. A valorização entre o lançamento e a entrega pode chegar a 40% em regiões de alta demanda.

## Os Riscos

O principal risco é o atraso na entrega. Pesquise o histórico da construtora antes de fechar negócio. Outro ponto é a diferença entre o projeto e o produto final — visite outros empreendimentos da mesma construtora para verificar o padrão de acabamento.

## Nossa Recomendação

Para quem tem horizonte de médio prazo (3-5 anos), imóveis na planta em São José dos Campos representam uma excelente oportunidade, especialmente nos eixos de expansão como a Zona Sudeste e os arredores do Parque Tecnológico.`,
    coverImage: '/hero/hero-1.jpg',
    category: 'Investimento',
    author: {
      name: 'Ricardo Alencar',
      role: 'Equipe Independence',
    },
    publishedAt: '28 de Fevereiro, 2024',
    readTime: '5 min de leitura',
    tags: ['Investimento', 'Na Planta', 'Finanças'],
  },
  {
    slug: 'vantagens-morar-condominio-fechado',
    title: 'Vantagens de morar em um condomínio fechado',
    excerpt: 'Segurança, lazer completo e qualidade de vida para sua família. O que levar em conta na escolha.',
    content: `Condomínios fechados se tornaram o formato residencial mais desejado em São José dos Campos. Entenda por quê.

## Segurança 24 Horas

A principal motivação para a maioria das famílias é a segurança. Portarias com controle de acesso, câmeras e rondas criam um ambiente protegido para crianças e idosos.

## Lazer Completo

Piscinas, academias, quadras, playgrounds, salões de festas — tudo sem sair de casa. Para famílias com crianças, isso representa economia de tempo e dinheiro com clubes e academias externas.

## Convivência e Comunidade

Morar em condomínio cria laços com vizinhos que compartilham valores semelhantes. Crianças crescem com amigos próximos e adultos constroem redes de apoio mútuo.

## O que Considerar

Avalie o valor do condomínio e o que ele inclui. Condomínios com muita infraestrutura de lazer tendem a ter taxas mais altas. Verifique também as regras internas — algumas são bastante restritivas.`,
    coverImage: '/hero/hero-2.jpg',
    category: 'Dicas',
    author: {
      name: 'Ricardo Alencar',
      role: 'Equipe Independence',
    },
    publishedAt: '25 de Fevereiro, 2024',
    readTime: '4 min de leitura',
    tags: ['Condomínio', 'Segurança', 'Família'],
  },
  {
    slug: 'aluguel-ou-financiamento',
    title: 'Aluguel ou Financiamento? A dúvida de milhões',
    excerpt: 'Com as novas taxas de juros, o cenário mudou. Veja a simulação real para decidir seu futuro.',
    content: `A eterna dúvida: continuar pagando aluguel ou dar o passo do financiamento? Com as mudanças recentes nas taxas de juros, é hora de refazer as contas.

## O Cenário Atual

Com a Selic em trajetória de queda, os bancos estão oferecendo taxas de financiamento mais competitivas. A Caixa Econômica Federal já opera com taxas a partir de 8,99% ao ano para imóveis dentro do programa Minha Casa Minha Vida.

## A Simulação

Para um imóvel de R$ 400.000 em São José dos Campos: o aluguel médio seria R$ 2.200/mês. Um financiamento de 30 anos com 20% de entrada resultaria em parcelas iniciais de R$ 2.800. A diferença de R$ 600 é o "custo" de construir patrimônio próprio.

## Nossa Análise

Se você planeja permanecer no mesmo local por mais de 5 anos, o financiamento tende a ser mais vantajoso. O imóvel valoriza, as parcelas diminuem em termos reais (inflação), e ao final você tem um patrimônio. Para quem valoriza mobilidade e flexibilidade, o aluguel ainda faz sentido.`,
    coverImage: '/hero/hero-3.jpg',
    category: 'Mercado',
    author: {
      name: 'Ricardo Alencar',
      role: 'Equipe Independence',
    },
    publishedAt: '20 de Fevereiro, 2024',
    readTime: '6 min de leitura',
    tags: ['Financiamento', 'Aluguel', 'Finanças'],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === 'Todos') return blogPosts;
  return blogPosts.filter(p => p.category === category);
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find(p => p.featured);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  return blogPosts.filter(p => p.slug !== currentSlug).slice(0, limit);
}
