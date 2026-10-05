import React, { useEffect, useState } from 'react';
import { Server, Activity, Database, CheckCircle, AlertTriangle, RefreshCw, X, FlaskConical } from 'lucide-react';
import { pingBackendHealth, type BackendHealthStatus, BACKEND_URL } from '../../services/springBootApi';
import { BiomechanicsLabModal } from './BiomechanicsLabModal';

export const SpringBootStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [health, setHealth] = useState<BackendHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    const status = await pingBackendHealth();
    setHealth(status);
    setLoading(false);
  };

  useEffect(() => {
    checkConnection();
    // Re-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = health?.connected ?? false;
  const isHosted =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('github.io') || window.location.protocol === 'https:');

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
          isConnected
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
            : isHosted
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
        } ${className}`}
        title={`Spring Boot Backend: ${isConnected ? 'Connected' : isHosted ? 'Runs on local PC (Port 8080)' : 'Offline'}`}
        aria-label="Spring Boot Backend Status"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span className="hidden sm:inline font-mono">
          {loading
            ? 'Spring Boot...'
            : isConnected
            ? `Spring Boot 8080 (${health?.latencyMs}ms)`
            : isHosted
            ? 'Spring Boot (Local PC)'
            : 'Spring Boot Offline'}
        </span>
        <span className="sm:hidden font-mono">
          {isConnected ? `${health?.latencyMs}ms` : isHosted ? 'Local PC' : 'Offline'}
        </span>
      </button>

      {/* Backend Details Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B1A]/10 border border-[#FF6B1A]/20 flex items-center justify-center text-[#FF6B1A]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">Spring Boot Backend</h3>
                  <p className="text-xs text-[var(--muted)]">Java 22 • Spring Boot 3.3.4 • H2 JPA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Card */}
            <div className="mt-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#FF6B1A]" /> Connection Status:
                </span>
                <span className={`font-semibold flex items-center gap-1 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> LIVE ({health?.latencyMs}ms)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> UNREACHABLE
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#22C55E]" /> Database Engine:
                </span>
                <span className="font-mono text-[var(--text)] font-semibold">
                  H2 In-Memory (JPA)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">API Base URL:</span>
                <span className="font-mono text-xs text-[#FF6B1A] font-semibold">{BACKEND_URL}</span>
              </div>
            </div>

            {/* Hosted vs Local Explanation Banner */}
            {isHosted && !isConnected && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-500">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Public Web Deployment (GitHub Pages)</span>
                </div>
                <p className="text-[var(--text)] text-[11px] leading-relaxed">
                  You are viewing the public cloud deployment on GitHub Pages. The Spring Boot backend runs locally on your PC (port 8080).
                </p>
                <div className="pt-1 flex flex-col gap-1.5 text-[11px] text-[var(--muted)]">
                  <div>
                    • <strong>To run with Spring Boot live:</strong> Open the app on this computer at{' '}
                    <a href="http://localhost:5173" className="text-[#FF6B1A] underline font-mono font-semibold">
                      http://localhost:5173
                    </a>
                    .
                  </div>
                  <div>
                    • <strong>Full client-side autonomy:</strong> All workouts, nutrition logs, calculations, and AI form checks run 100% in your browser.
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Active REST Endpoints:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`${BACKEND_URL}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors text-[var(--text)] flex items-center justify-between font-mono text-[11px]"
                >
                  <span>/api/health</span>
                  <span className="text-[#FF6B1A]">↗</span>
                </a>
                <a
                  href={`${BACKEND_URL}/database/preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors text-[var(--text)] flex items-center justify-between font-mono text-[11px]"
                >
                  <span>/database/preview</span>
                  <span className="text-[#FF6B1A]">↗</span>
                </a>
                <a
                  href={`${BACKEND_URL}/engine/demo-assessment`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors text-[var(--text)] flex items-center justify-between font-mono text-[11px]"
                >
                  <span>/engine/assessment</span>
                  <span className="text-[#FF6B1A]">↗</span>
                </a>
                <a
                  href={`${BACKEND_URL}/workouts`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors text-[var(--text)] flex items-center justify-between font-mono text-[11px]"
                >
                  <span>/api/workouts</span>
                  <span className="text-[#FF6B1A]">↗</span>
                </a>
              </div>
            </div>

            {/* Launch Lab Button */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setLabOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#FF853E] text-[#0F0B09] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shadow-md"
              >
                <FlaskConical className="w-4 h-4" />
                Launch Live Biomechanics & Science Lab
              </button>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={checkConnection}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Re-check Ping
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] font-semibold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Biomechanics Lab Modal */}
      <BiomechanicsLabModal isOpen={labOpen} onClose={() => setLabOpen(false)} />
    </>
  );
};
