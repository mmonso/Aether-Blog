import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Play, Pause, RefreshCw } from 'lucide-react';

export const NeuralVisualizer: React.FC<{ language?: 'pt' | 'en' }> = ({ language = 'pt' }) => {
  const [stimulationHz, setStimulationHz] = useState(40);
  const [isPlaying, setIsPlaying] = useState(true);
  const [spikeCount, setSpikeCount] = useState(1420);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate random nodes representing neurons
    const numNeurons = 28;
    const nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number; lastFired: number }> = [];

    for (let i = 0; i < numNeurons; i++) {
      nodes.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2.5,
        lastFired: 0
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.fillStyle = 'rgba(10, 10, 12, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        // Update nodes and draw connections
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 10 || node.x > canvas.width - 10) node.vx *= -1;
          if (node.y < 10 || node.y > canvas.height - 10) node.vy *= -1;

          // Random spike event based on stimulation frequency
          if (Math.random() < stimulationHz / 800) {
            node.lastFired = frame;
            setSpikeCount((prev) => prev + 1);
          }

          // Draw synapses
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const dist = Math.hypot(node.x - other.x, node.y - other.y);
            if (dist < 80) {
              const alpha = (1 - dist / 80) * 0.4;
              const isRecentSpike = (frame - node.lastFired < 10) || (frame - other.lastFired < 10);
              ctx.strokeStyle = isRecentSpike ? `rgba(16, 185, 129, ${alpha + 0.5})` : `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = isRecentSpike ? 1.8 : 0.8;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }

          // Draw neuron node
          const timeSinceSpike = frame - node.lastFired;
          const isSpiking = timeSinceSpike < 12;

          ctx.beginPath();
          ctx.arc(node.x, node.y, isSpiking ? node.radius * 1.8 : node.radius, 0, Math.PI * 2);
          ctx.fillStyle = isSpiking ? '#10b981' : '#38bdf8';
          ctx.shadowBlur = isSpiking ? 12 : 0;
          ctx.shadowColor = '#10b981';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stimulationHz, isPlaying]);

  return (
    <div className="my-8 rounded-2xl bg-neutral-950/80 border border-neutral-800 p-6 shadow-2xl backdrop-blur-md text-neutral-100 font-sans relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-emerald-300">
              {language === 'pt' ? 'Rede Neural Organóide em Tempo Real' : 'Real-Time Organoid Neural Network'}
            </h4>
            <p className="text-xs text-neutral-400">
              {language === 'pt' ? 'Monitor de Potencial de Ação Sináptico (MEAs 64 Ch)' : 'Synaptic Action Potential Monitor (64 Ch MEA)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
            {spikeCount} {language === 'pt' ? 'Disparos' : 'Spikes'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Canvas Display */}
        <div className="relative bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center min-h-[220px]">
          <canvas 
            ref={canvasRef} 
            width={340} 
            height={200} 
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-neutral-950/80 px-2.5 py-1 rounded-lg backdrop-blur">
            <span>PEDOT:PSS Sensor Array</span>
            <span className="text-emerald-400">36.8°C Fluidic Sync</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1.5">
              <span>{language === 'pt' ? 'Frequência de Estímulo elétrico' : 'Electrical Stim Frequency'}</span>
              <span className="text-emerald-400 font-bold">{stimulationHz} Hz</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="120" 
              value={stimulationHz} 
              onChange={(e) => setStimulationHz(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Plasticidade (HEBB):</span>
              <span className="text-emerald-400">+14.2%</span>
            </div>
            <div className="flex justify-between">
              <span>Energia por Sinal:</span>
              <span className="text-neutral-400">0.02 fJ/spike</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? (language === 'pt' ? 'Pausar Estímulo' : 'Pause Stimulus') : (language === 'pt' ? 'Iniciar Estímulo' : 'Start Stimulus')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
