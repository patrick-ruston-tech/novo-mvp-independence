'use client';

import { useState, useTransition, useMemo } from 'react';
import { Check, Camera, X, Loader2 } from 'lucide-react';
import StepIndicator from '@/components/StepIndicator';
import { submitPropertyAction } from '@/lib/actions';
import type { Neighborhood } from '@/types/property';

// ============================================================
// MÁSCARAS E VALIDAÇÕES
// ============================================================

/** Máscara de telefone: (12) 99999-9999 */
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Máscara de moeda: 1.500.000 */
function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return num.toLocaleString('pt-BR');
}

/** Remove máscara de moeda e retorna número */
function unmaskCurrency(value: string): string {
  return value.replace(/\D/g, '');
}

/** Valida email básico */
function isValidEmail(email: string): boolean {
  if (!email) return true; // opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Valida telefone (mínimo 10 dígitos com DDD) */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

// ============================================================
// CIDADES
// ============================================================

const CITIES = [
  'São José dos Campos',
  'Jacareí',
  'Caçapava',
  'Jambeiro',
];

// ============================================================
// COMPONENTE
// ============================================================

export default function AnunciarClient({ bairros }: { bairros: Neighborhood[] }) {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [finalidade, setFinalidade] = useState<'venda' | 'locacao' | null>(null);
  const [tipo, setTipo] = useState('');
  const [cidade, setCidade] = useState('São José dos Campos');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  
  const [quartos, setQuartos] = useState(1);
  const [suites, setSuites] = useState(0);
  const [banheiros, setBanheiros] = useState(1);
  const [vagas, setVagas] = useState(1);
  const [metragem, setMetragem] = useState('');
  const [valorPretendido, setValorPretendido] = useState('');
  const [condominio, setCondominio] = useState('');
  const [iptu, setIptu] = useState('');
  
  const [comodidades, setComodidades] = useState<string[]>([]);
  const [descricao, setDescricao] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [errorUpdate, setErrorUpdate] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Filtra bairros pela cidade selecionada
  const bairrosFiltrados = useMemo(() => {
    return bairros.filter(b => b.city === cidade);
  }, [bairros, cidade]);

  // Reset bairro quando muda cidade
  const handleCidadeChange = (novaCidade: string) => {
    setCidade(novaCidade);
    setBairro('');
  };

  const handleNext = () => {
    setErrorUpdate(null);
    setFieldErrors({});

    // Validação Step 1
    if (step === 1 && !finalidade) {
      setErrorUpdate('Selecione a finalidade.');
      return;
    }

    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setErrorUpdate(null);
    setFieldErrors({});
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleComodidadeToggle = (comodidade: string) => {
    if (comodidades.includes(comodidade)) {
      setComodidades(comodidades.filter(c => c !== comodidade));
    } else {
      setComodidades([...comodidades, comodidade]);
    }
  };

  const handleSubmit = () => {
    setErrorUpdate(null);
    const errors: Record<string, string> = {};

    if (!nome.trim()) errors.nome = 'Nome é obrigatório.';
    if (!telefone || !isValidPhone(telefone)) errors.telefone = 'Telefone inválido. Use (99) 99999-9999.';
    if (email && !isValidEmail(email)) errors.email = 'E-mail inválido.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('owner_name', nome.trim());
      if (email) formData.append('owner_email', email.trim());
      formData.append('owner_phone', telefone);
      if (tipo) formData.append('property_type', tipo);
      
      const transactionTypeValue = finalidade === 'venda' ? 'sale' : finalidade === 'locacao' ? 'rent' : '';
      if (transactionTypeValue) formData.append('transaction_type', transactionTypeValue);
      
      if (bairro) formData.append('neighborhood', bairro);
      formData.append('city', cidade);
      
      if (quartos) formData.append('bedrooms', quartos.toString());
      if (banheiros) formData.append('bathrooms', banheiros.toString());
      if (vagas) formData.append('garages', vagas.toString());
      if (metragem) formData.append('living_area', metragem);
      
      const rawPrice = unmaskCurrency(valorPretendido);
      if (rawPrice) formData.append('price_estimate', rawPrice);

      let fullDescription = descricao;
      
      const extraInfo = [];
      if (endereco) extraInfo.push(`Endereço: ${endereco}${numero ? `, ${numero}` : ''}${complemento ? ` - ${complemento}` : ''}`);
      if (suites > 0) extraInfo.push(`Suítes: ${suites}`);
      if (condominio) extraInfo.push(`Condomínio: R$ ${condominio}`);
      if (iptu) extraInfo.push(`IPTU: R$ ${iptu}`);
      if (comodidades.length > 0) extraInfo.push(`Comodidades: ${comodidades.join(', ')}`);

      if (extraInfo.length > 0) {
        fullDescription += `\n\n=== INFORMAÇÕES ADICIONAIS ===\n${extraInfo.join('\n')}`;
      }
      
      if (fullDescription) formData.append('description', fullDescription);

      const result = await submitPropertyAction(formData);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrorUpdate(result.error || 'Ocorreu um erro ao enviar.');
      }
    });
  };

  const addSimulatedPhoto = () => {
    if (fotos.length < 20) {
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      setFotos([...fotos, randomColor]);
    }
  };

  const removePhoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  // Estilo compartilhado dos inputs
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black";
  const inputErrorClass = "w-full border border-red-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none text-black";
  const selectClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black bg-white";

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-black">Anúncio enviado!</h2>
        <p className="text-gray-500 mt-2 text-base">
          Nossa equipe analisará as informações e entrará em contato em até 24 horas.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="text-brand-red font-medium mt-8 hover:underline"
        >
          Voltar para a página inicial
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-black">Anuncie seu imóvel</h1>
        <p className="text-base text-gray-500 mt-2">
          Cadastre em poucos minutos e nossa equipe entrará em contato
        </p>
      </div>

      <StepIndicator currentStep={step} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mt-8">
        
        {/* STEP 1 — Dados do Imóvel */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Qual a finalidade?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFinalidade('venda')}
                  className={`border-2 rounded-xl p-6 text-center transition-all ${
                    finalidade === 'venda' 
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-semibold text-black">Quero vender</div>
                </button>
                <button
                  onClick={() => setFinalidade('locacao')}
                  className={`border-2 rounded-xl p-6 text-center transition-all ${
                    finalidade === 'locacao' 
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🔑</div>
                  <div className="font-semibold text-black">Quero alugar</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de imóvel</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass}>
                <option value="">Selecione...</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Sobrado">Sobrado</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Terreno">Terreno</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>

            {/* Cidade + Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <select value={cidade} onChange={(e) => handleCidadeChange(e.target.value)} className={selectClass}>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                <select value={bairro} onChange={(e) => setBairro(e.target.value)} className={selectClass}>
                  <option value="">Selecione o bairro...</option>
                  {bairrosFiltrados.map(b => (
                    <option key={b.slug} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input value={endereco} onChange={(e) => setEndereco(e.target.value)} type="text" placeholder="Rua, Avenida..." className={inputClass} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                <input value={numero} onChange={(e) => setNumero(e.target.value)} type="text" placeholder="Ex: 123" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input value={complemento} onChange={(e) => setComplemento(e.target.value)} type="text" placeholder="Apto, Bloco, Casa..." className={inputClass} />
            </div>

            {errorUpdate && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium border border-red-200 rounded-xl">
                {errorUpdate}
              </div>
            )}

            <button 
              onClick={handleNext}
              disabled={!finalidade}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors mt-6"
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 2 — Detalhes e Valores */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-black">Ambientes</h3>
              
              {[
                { label: 'Quartos', val: quartos, set: setQuartos },
                { label: 'Suítes', val: suites, set: setSuites },
                { label: 'Banheiros', val: banheiros, set: setBanheiros },
                { label: 'Vagas', val: vagas, set: setVagas },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => item.set(Math.max(0, item.val - 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-8 text-center text-black">{item.val}</span>
                    <button 
                      onClick={() => item.set(item.val + 1)}
                      className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-black">Valores e Metragem</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metragem (m²)</label>
                  <input 
                    value={metragem} 
                    onChange={(e) => setMetragem(e.target.value.replace(/\D/g, ''))} 
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 120" 
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor pretendido (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                    <input 
                      value={valorPretendido} 
                      onChange={(e) => setValorPretendido(maskCurrency(e.target.value))} 
                      type="text"
                      inputMode="numeric"
                      placeholder="1.500.000" 
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condomínio (R$) <span className="text-gray-400 font-normal">opcional</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                    <input 
                      value={condominio} 
                      onChange={(e) => setCondominio(maskCurrency(e.target.value))} 
                      type="text"
                      inputMode="numeric"
                      placeholder="800" 
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IPTU anual (R$) <span className="text-gray-400 font-normal">opcional</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                    <input 
                      value={iptu} 
                      onChange={(e) => setIptu(maskCurrency(e.target.value))} 
                      type="text"
                      inputMode="numeric"
                      placeholder="1.200" 
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-black">Comodidades</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Varanda', 'Churrasqueira', 'Piscina', 'Academia', 'Portaria 24h', 'Elevador', 'Armários', 'Ar-condicionado', 'Aquecimento', 'Pet friendly', 'Mobiliado', 'Sol da manhã'].map(com => (
                  <label key={com} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-black has-[:checked]:bg-black/5">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-black focus:ring-black"
                      checked={comodidades.includes(com)}
                      onChange={() => handleComodidadeToggle(com)}
                    />
                    <span className="text-sm text-gray-700">{com}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handlePrev}
                className="w-1/3 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handleNext}
                className="w-2/3 bg-black hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Fotos e Descrição */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            
            <div>
              <h3 className="font-heading font-bold text-lg text-black mb-4">Fotos do imóvel</h3>
              <div 
                onClick={addSimulatedPhoto}
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 sm:p-16 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center"
              >
                <Camera className="w-10 h-10 text-gray-400 mb-4" />
                <p className="text-sm font-medium text-black">Arraste ou clique para adicionar fotos</p>
                <p className="text-xs text-gray-400 mt-1">Mínimo 5, máximo 20</p>
              </div>

              {fotos.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Fotos adicionadas</span>
                    <span className="text-xs text-gray-400">{fotos.length}/20</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {fotos.map((foto, idx) => (
                      <div key={idx} className="aspect-square rounded-lg relative group overflow-hidden">
                        <div className="w-full h-full" style={{ backgroundColor: foto }}></div>
                        <button 
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-100"></div>

            <div>
              <h3 className="font-heading font-bold text-lg text-black mb-4">Descrição</h3>
              <textarea 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value.slice(0, 2000))}
                placeholder="Conte um pouco sobre o imóvel. Destaque os pontos fortes, reformas recentes, vizinhança..." 
                className={`${inputClass} min-h-[200px] resize-none`}
              ></textarea>
              <div className="text-right text-xs text-gray-400 mt-2">{descricao.length}/2000</div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handlePrev}
                className="w-1/3 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handleNext}
                className="w-2/3 bg-black hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Contato e Envio */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            
            <div>
              <h3 className="font-heading font-bold text-lg text-black mb-4">Seus dados de contato</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                  <input 
                    value={nome} 
                    onChange={(e) => { setNome(e.target.value); setFieldErrors(prev => ({...prev, nome: ''})); }} 
                    type="text" 
                    placeholder="Seu nome"
                    className={fieldErrors.nome ? inputErrorClass : inputClass} 
                  />
                  {fieldErrors.nome && <p className="text-xs text-red-500 mt-1">{fieldErrors.nome}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone / WhatsApp *</label>
                  <input 
                    value={telefone} 
                    onChange={(e) => { setTelefone(maskPhone(e.target.value)); setFieldErrors(prev => ({...prev, telefone: ''})); }} 
                    type="tel"
                    inputMode="numeric"
                    placeholder="(12) 99999-9999"
                    maxLength={15}
                    className={fieldErrors.telefone ? inputErrorClass : inputClass} 
                  />
                  {fieldErrors.telefone && <p className="text-xs text-red-500 mt-1">{fieldErrors.telefone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <input 
                    value={email} 
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: ''})); }} 
                    type="email" 
                    placeholder="seu@email.com"
                    className={fieldErrors.email ? inputErrorClass : inputClass} 
                  />
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-black focus:ring-black" required />
                <span className="text-sm text-gray-600">Declaro que sou o proprietário ou representante legal deste imóvel.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-black focus:ring-black" required />
                <span className="text-sm text-gray-600">Aceito os Termos de Uso e a Política de Privacidade da Independence.</span>
              </label>
            </div>

            <div className="bg-brand-bg rounded-xl p-6 space-y-4 border border-gray-100">
              <h4 className="font-semibold text-black mb-2">Resumo do anúncio</h4>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Finalidade</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black capitalize">{finalidade || 'Não definido'}</span>
                  <button onClick={() => setStep(1)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Local</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black">{bairro ? `${bairro}, ${cidade}` : cidade}</span>
                  <button onClick={() => setStep(1)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Características</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black">{quartos}q · {suites}s · {banheiros}b · {vagas}v</span>
                  <button onClick={() => setStep(2)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                </div>
              </div>

              {valorPretendido && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Valor</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-black">R$ {valorPretendido}</span>
                    <button onClick={() => setStep(2)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fotos</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black">{fotos.length} fotos</span>
                  <button onClick={() => setStep(3)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                </div>
              </div>
            </div>

            {errorUpdate && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-medium border border-red-200 rounded-xl">
                {errorUpdate}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handlePrev}
                disabled={isPending}
                className="w-1/3 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isPending}
                className="w-2/3 bg-brand-red hover:bg-brand-dark-red text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                {isPending ? 'Enviando...' : 'Publicar anúncio'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
