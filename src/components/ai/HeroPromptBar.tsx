import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Shield, HeartPulse } from 'lucide-react';
import { useAICopilot } from '../../context/AICopilotContext';

export const HeroPromptBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [prompt, setPrompt] = useState('');
  const { openChat } = useAICopilot();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    openChat(prompt);
    setPrompt('');
  };

  const handleChipClick = (suggestion: string) => {
    openChat(suggestion);
  };

  const suggestions = [
    { text: 'How to break a bench press plateau?', icon: Zap },
    { text: 'Target protein & macros for muscle gain', icon: Shield },
    { text: 'Why does Zone 2 cardio increase longevity?', icon: HeartPulse },
    { text: 'Ankle mobility cues for deeper squats', icon: Sparkles },
  ];

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      {/* ChatGPT-style Prominent Prompt Input Box */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center w-full rounded-2xl bg-[var(--surface)]/95 border border-[var(--border-strong)] hover:border-[#FF6B1A]/60 focus-within:border-[#FF6B1A] shadow-2xl p-2 transition-all backdrop-blur-xl group"
      >
        <div className="pl-3 pr-2 text-[#FF6B1A]">
          <Sparkles className="w-5 h-5 fill-current animate-pulse" />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask our AI Coach anything live (e.g. bench plateau, macros, longevity)..."
          className="flex-1 bg-transparent py-2.5 px-2 text-xs sm:text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
        />

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6B1A] hover:bg-[#FF8A3D] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer group-hover:shadow-[0_0_15px_rgba(255,107,26,0.35)] shrink-0"
        >
          <span>Ask AI</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      {/* Suggestion Chips Row */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
        <span className="text-[11px] font-semibold text-[var(--muted)] shrink-0">Try asking:</span>
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(item.text)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-2)]/90 hover:bg-[#FF6B1A]/15 border border-[var(--border)] hover:border-[#FF6B1A]/40 text-[11px] text-[var(--muted)] hover:text-[#FF6B1A] transition-all cursor-pointer backdrop-blur-sm"
            >
              <Icon className="w-3 h-3 text-[#FF6B1A]" />
              <span className="truncate max-w-[200px] sm:max-w-none">{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
