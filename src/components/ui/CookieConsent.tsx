import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Settings2, Lock } from 'lucide-react';
import { Button } from './Button';

interface CookiePreferences {
  essential: boolean;
  visionCache: boolean;
  chatMemory: boolean;
}

const STORAGE_KEY = 'fi_cookie_consent';

export const CookieConsent: React.FC<{
  isOpenDirectly?: boolean;
  onCloseDirectly?: () => void;
}> = ({ isOpenDirectly, onCloseDirectly }) => {
  const [hasInteracted, setHasInteracted] = useState(true); // default true to avoid flash
  const [modalOpen, setModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    visionCache: true,
    chatMemory: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setHasInteracted(false);
      } else {
        const parsed = JSON.parse(saved);
        if (parsed.preferences) {
          setPreferences(parsed.preferences);
        }
      }
    } catch {
      setHasInteracted(false);
    }
  }, []);

  // Synchronize when opened externally via tag/button
  useEffect(() => {
    if (isOpenDirectly !== undefined) {
      setModalOpen(isOpenDirectly);
    }
  }, [isOpenDirectly]);

  const saveConsent = (type: 'all' | 'essential' | 'custom', customPrefs?: CookiePreferences) => {
    const finalPrefs: CookiePreferences =
      type === 'all'
        ? { essential: true, visionCache: true, chatMemory: true }
        : type === 'essential'
        ? { essential: true, visionCache: false, chatMemory: false }
        : customPrefs || preferences;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: type,
          preferences: finalPrefs,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }

    setPreferences(finalPrefs);
    setHasInteracted(true);
    setModalOpen(false);
    if (onCloseDirectly) onCloseDirectly();
  };

  const handleAcceptAll = () => saveConsent('all');
  const handleEssentialOnly = () => saveConsent('essential');
  const handleSaveCustom = () => saveConsent('custom', preferences);

  return (
    <>
      {/* 1. Floating Bottom Banner for first-time visitors */}
      {!hasInteracted && !modalOpen && (
        <aside
          role="dialog"
          aria-label="Privacy & local storage choices"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 md:p-5 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-2xl text-[var(--text)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FF6B1A]/10 text-[#FF6B1A] shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-tight uppercase text-[#FF6B1A]">
                  Zero Cloud Trackers • Local Storage
                </h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Fitness Intelligence runs deterministically on your machine. We do not use advertising cookies. We only use local browser storage to compute your biomechanics offline and save workouts.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptAll}
              className="text-xs flex-1 min-w-[100px]"
            >
              Accept All
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEssentialOnly}
              className="text-xs flex-1 min-w-[100px]"
            >
              Essential Only
            </Button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs text-[var(--muted)] hover:text-[#FF6B1A] flex items-center gap-1 px-2 py-1 transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. Detailed Preferences Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--text)]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF6B1A]/10 text-[#FF6B1A]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="text-base font-bold tracking-tight">
                    Privacy & Local Storage Settings
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Configure device storage categories
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  if (onCloseDirectly) onCloseDirectly();
                }}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Fitness Intelligence adheres to zero-knowledge privacy. No video frames, health records, or biometric metrics are transmitted to any central cloud database.
              </p>

              {/* Item 1: Essential */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#FF6B1A]" />
                    <span className="text-xs font-bold">Essential Session & Math Storage</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FF6B1A]/15 text-[#FF6B1A]">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Saves your age, sex, weight, TDEE calibrations, and routine splits in your local browser so you can train offline.
                  </p>
                </div>
                <div className="p-1 text-[#22C55E]">
                  <Check className="w-5 h-5" />
                </div>
              </div>

              {/* Item 2: MediaPipe Vision Cache */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">PoseNet & Vision Model Cache</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Caches the 150KB local vision bundle in IndexedDB/cache so the webcam form checker opens instantly without re-downloading.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.visionCache}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, visionCache: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#FF6B1A] mt-1 cursor-pointer"
                />
              </div>

              {/* Item 3: AI Copilot Chat Memory */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">AI Coach Chat Memory</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Remembers your previous questions and workouts across sessions inside your device for tailored coaching.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.chatMemory}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, chatMemory: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#FF6B1A] mt-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEssentialOnly}
                className="text-xs"
              >
                Essential Only
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveCustom}
                  className="text-xs"
                >
                  Save Choices
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs bg-[#22C55E] hover:bg-[#16A34A] text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
