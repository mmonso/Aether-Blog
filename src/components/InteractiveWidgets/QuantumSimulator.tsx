import React, { useState } from 'react';
import { Play, RotateCcw, Zap, Activity, Cpu } from 'lucide-react';

export const QuantumSimulator: React.FC<{ language?: 'pt' | 'en' }> = ({ language = 'pt' }) => {
  const [phaseAngle, setPhaseAngle] = useState(45);
  const [laserIntensity, setLaserIntensity] = useState(80);
  const [qubitState, setQubitState] = useState<'superposition' | 'collapsed-0' | 'collapsed-1'>('superposition');
  const [measuring, setMeasuring] = useState(false);

  const probabilityZero = Math.round(Math.pow(Math.cos((phaseAngle * Math.PI) / 180), 2) * 100);
  const probabilityOne = 100 - probabilityZero;

  const handleMeasure = () => {
    setMeasuring(true);
    setTimeout(() => {
      const outcome = Math.random() * 100 < probabilityZero ? 'collapsed-0' : 'collapsed-1';
      setQubitState(outcome);
      setMeasuring(false);
    }, 600);
  };

  const handleReset = () => {
    setQubitState('superposition');
  };

  return (
    <div className="my-8 rounded-2xl bg-neutral-950/80 border border-neutral-800 p-6 shadow-2xl backdrop-blur-md text-neutral-100 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-cyan-300">
              {language === 'pt' ? 'Simulador de Interferômetro Fotônico' : 'Photonic Interferometer Simulator'}
            </h4>
            <p className="text-xs text-neutral-400">
              {language === 'pt' ? 'Manipulação de Fase em Guias de Onda de Nitreto de Silício' : 'Phase Manipulation in Silicon Nitride Waveguides'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
            {qubitState === 'superposition' ? '|Ψ⟩ = α|0⟩ + β|1⟩' : qubitState === 'collapsed-0' ? '|0⟩ Collapsed' : '|1⟩ Collapsed'}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Waveguide Circuit */}
        <div className="relative bg-neutral-900/90 rounded-xl p-5 border border-neutral-800 flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-neutral-400">Laser In (1550nm)</span>
            <span className="text-xs font-mono text-cyan-400">{laserIntensity} mW</span>
          </div>

          {/* Laser beam animation */}
          <div className="w-full relative h-16 flex items-center justify-between px-2">
            {/* Splitter 1 */}
            <div className="w-3 h-12 bg-neutral-700 rounded border border-neutral-500 flex items-center justify-center text-[10px] font-mono text-neutral-300">
              BS1
            </div>

            {/* Arms */}
            <div className="flex-1 px-3 flex flex-col justify-between h-full relative">
              {/* Upper Waveguide Arm */}
              <div className="h-1.5 w-full bg-neutral-800 rounded-full relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${laserIntensity}%`, opacity: qubitState === 'collapsed-1' ? 0.2 : 1 }}
                />
              </div>

              {/* Phase Shifter Badge */}
              <div className="self-center px-3 py-1 bg-cyan-950 border border-cyan-500/40 rounded text-[11px] font-mono text-cyan-300">
                ΔΦ = {phaseAngle}°
              </div>

              {/* Lower Waveguide Arm */}
              <div className="h-1.5 w-full bg-neutral-800 rounded-full relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${laserIntensity * (phaseAngle / 180)}%`, opacity: qubitState === 'collapsed-0' ? 0.2 : 1 }}
                />
              </div>
            </div>

            {/* Splitter 2 */}
            <div className="w-3 h-12 bg-neutral-700 rounded border border-neutral-500 flex items-center justify-center text-[10px] font-mono text-neutral-300">
              BS2
            </div>
          </div>

          {/* Detector State Indicator */}
          <div className="w-full mt-4 flex items-center justify-around">
            <div className={`px-4 py-2 rounded-lg border font-mono text-xs transition-all ${
              qubitState === 'collapsed-0' ? 'bg-emerald-950 border-emerald-500 text-emerald-300 scale-105' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}>
              Detector A (|0⟩): {probabilityZero}%
            </div>
            <div className={`px-4 py-2 rounded-lg border font-mono text-xs transition-all ${
              qubitState === 'collapsed-1' ? 'bg-cyan-950 border-cyan-500 text-cyan-300 scale-105' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}>
              Detector B (|1⟩): {probabilityOne}%
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1.5">
              <span>{language === 'pt' ? 'Ângulo de Fase MZI (ΔΦ)' : 'MZI Phase Angle (ΔΦ)'}</span>
              <span className="text-cyan-400 font-bold">{phaseAngle}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="180" 
              value={phaseAngle} 
              onChange={(e) => {
                setPhaseAngle(Number(e.target.value));
                setQubitState('superposition');
              }}
              className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1.5">
              <span>{language === 'pt' ? 'Potência do Laser Pump' : 'Laser Pump Power'}</span>
              <span className="text-cyan-400 font-bold">{laserIntensity} mW</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={laserIntensity} 
              onChange={(e) => setLaserIntensity(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleMeasure}
              disabled={measuring}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {measuring ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {measuring 
                ? (language === 'pt' ? 'Medindo Estado...' : 'Measuring State...') 
                : (language === 'pt' ? 'Medir Qubit Fotônico' : 'Measure Photonic Qubit')}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs transition-all cursor-pointer"
              title={language === 'pt' ? 'Restaurar Superposição' : 'Restore Superposition'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
