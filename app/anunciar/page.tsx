'use client';

import { useState } from 'react';
import { Check, Camera, X } from 'lucide-react';
import StepIndicator from '@/components/StepIndicator';
import { bairros } from '@/data/bairros';

export default function AnunciarPage() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [finalidade, setFinalidade] = useState<'venda' | 'locacao' | null>(null);
  const [quartos, setQuartos] = useState(1);
  const [suites, setSuites] = useState(0);
  const [banheiros, setBanheiros] = useState(1);
  const [vagas, setVagas] = useState(1);
  const [fotos, setFotos] = useState<string[]>([]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = () => setIsSuccess(true);

  const addSimulatedPhoto = () => {
    if (fotos.length < 20) {
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      setFotos([...fotos, randomColor]);
    }
  };

  const removePhoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

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
        
        {/* STEP 1 */}
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
              <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black bg-white">
                <option value="">Selecione...</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="cobertura">Cobertura</option>
                <option value="comercial">Comercial</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
              <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black bg-white">
                <option value="">Selecione o bairro...</option>
                {bairros.map(b => (
                  <option key={b.slug} value={b.slug}>{b.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input type="text" placeholder="Rua, Avenida..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                <input type="text" placeholder="Ex: 123" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input type="text" placeholder="Apto, Bloco, Casa..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
            </div>

            <button 
              onClick={handleNext}
              disabled={!finalidade}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors mt-6"
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 2 */}
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
                  <input type="number" placeholder="Ex: 120" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor pretendido (R$)</label>
                  <input type="text" placeholder="Ex: 1.500.000" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condomínio (R$)</label>
                  <input type="text" placeholder="Opcional" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IPTU (R$)</label>
                  <input type="text" placeholder="Opcional" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-black">Comodidades</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Varanda', 'Churrasqueira', 'Piscina', 'Academia', 'Portaria 24h', 'Elevador', 'Armários', 'Ar-condicionado', 'Aquecimento', 'Pet friendly', 'Mobiliado', 'Sol da manhã'].map(com => (
                  <label key={com} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-black has-[:checked]:bg-black/5">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
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

        {/* STEP 3 */}
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
                placeholder="Conte um pouco sobre o imóvel. Destaque os pontos fortes, reformas recentes, vizinhança..." 
                className="w-full min-h-[200px] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black resize-none"
              ></textarea>
              <div className="text-right text-xs text-gray-400 mt-2">0/2000</div>
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

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            
            <div>
              <h3 className="font-heading font-bold text-lg text-black mb-4">Seus dados de contato</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone / WhatsApp</label>
                  <input type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none text-black" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-black focus:ring-black" />
                <span className="text-sm text-gray-600">Declaro que sou o proprietário ou representante legal deste imóvel.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-black focus:ring-black" />
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
                <span className="text-sm text-gray-500">Características</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black">{quartos}q · {suites}s · {banheiros}b · {vagas}v</span>
                  <button onClick={() => setStep(2)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fotos</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-black">{fotos.length} fotos</span>
                  <button onClick={() => setStep(3)} className="text-xs text-brand-red font-medium hover:underline">Editar</button>
                </div>
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
                onClick={handleSubmit}
                className="w-2/3 bg-brand-red hover:bg-brand-dark-red text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Publicar anúncio
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
