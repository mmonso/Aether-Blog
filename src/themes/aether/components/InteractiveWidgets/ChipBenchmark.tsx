import React, { useState } from 'react';
import { Cpu, Zap, DollarSign, Clock } from 'lucide-react';

export const ChipBenchmark: React.FC<{ language?: 'pt' | 'en' }> = ({ language = 'pt' }) => {
  const [selectedArch, setSelectedArch] = useState<'photonic' | 'edge-npu' | 'gpu-cloud'>('edge-npu');

  const stats = {
    photonic: {
      name: language === 'pt' ? 'Processador Fotônico (Light)' : 'Photonic Processor (Light)',
      latency: '0.04 ms',
      power: '1.2 W',
      ops: '1200 TFLOPS',
      costPerMillion: '$0.002',
      color: 'from-cyan-500 to-blue-500',
      badgeColor: 'text-cyan-400 bg-cyan-950 border-cyan-800',
      latencyWidth: '5%',
      powerWidth: '10%'
    },
    'edge-npu': {
      name: language === 'pt' ? 'NPU Local em Unidade Borda (SLM)' : 'Local Edge NPU (SLM)',
      latency: '1.20 ms',
      power: '15 W',
      ops: '180 TFLOPS',
      costPerMillion: '$0.01',
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'text-emerald-400 bg-emerald-950 border-emerald-800',
      latencyWidth: '25%',
      powerWidth: '30%'
    },
    'gpu-cloud': {
      name: language === 'pt' ? 'Cluster GPU Tradicional em Nuvem' : 'Traditional Cloud GPU Cluster',
      latency: '140.0 ms',
      power: '700 W',
      ops: '80 TFLOPS',
      costPerMillion: '$0.80',
      color: 'from-amber-500 to-red-500',
      badgeColor: 'text-amber-400 bg-amber-950 border-amber-800',
      latencyWidth: '100%',
      powerWidth: '100%'
    }
  };

  const current = stats[selectedArch];

  return (
    <div className="my-8 rounded-2xl bg-neutral-950/80 border border-neutral-800 p-6 shadow-2xl backdrop-blur-md text-neutral-100 font-sans relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-amber-300">
              {language === 'pt' ? 'Comparativo de Arquiteturas Computacionais' : 'Compute Architecture Comparison'}
            </h4>
            <p className="text-xs text-neutral-400">
              {language === 'pt' ? 'Métricas de Latência, Eficiência Energética e Custo' : 'Latency, Power Efficiency & Cost Metrics'}
            </p>
          </div>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {(['edge-npu', 'photonic', 'gpu-cloud'] as const).map((arch) => (
          <button
            key={arch}
            onClick={() => setSelectedArch(arch)}
            className={`py-2.5 px-3 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
              selectedArch === arch 
                ? 'bg-neutral-800 border-neutral-600 text-white shadow-lg' 
                : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {arch === 'photonic' ? 'Fotônica' : arch === 'edge-npu' ? 'NPU Borda' : 'GPU Nuvem'}
          </button>
        ))}
      </div>

      {/* Metrics breakdown */}
      <div className="space-y-4 bg-neutral-900/80 p-5 rounded-xl border border-neutral-800">
        <div>
          <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Latência por Token</span>
            <span className="font-bold text-cyan-400">{current.latency}</span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${current.color} transition-all duration-500`} 
              style={{ width: current.latencyWidth }} 
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Consumo Térmico (Watts)</span>
            <span className="font-bold text-amber-400">{current.power}</span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${current.color} transition-all duration-500`} 
              style={{ width: current.powerWidth }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono border-t border-neutral-800">
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block mb-0.5">Capacidade Total</span>
            <span className="text-white font-bold">{current.ops}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block mb-0.5">Custo / 1M Infe.</span>
            <span className="text-emerald-400 font-bold">{current.costPerMillion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
