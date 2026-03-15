import { Check } from 'lucide-react';

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, label: 'Imóvel' },
    { id: 2, label: 'Detalhes' },
    { id: 3, label: 'Fotos' },
    { id: 4, label: 'Contato' },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mb-12">
      <div className="flex items-center justify-center w-full">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step.id < currentStep
                    ? 'bg-black text-white'
                    : step.id === currentStep
                    ? 'bg-black text-white ring-4 ring-gray-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span
                className={`absolute top-12 text-xs font-medium whitespace-nowrap ${
                  step.id <= currentStep ? 'text-black' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`h-px w-10 sm:w-16 mx-2 transition-colors ${
                  step.id < currentStep ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
