import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { services } from '../../services/registry';
import { useToast } from '../../context/ToastContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await services.auth.login(email, password, name);
        showToast('Signed in successfully!', 'success');
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        localStorage.removeItem('fitness_onboarding_draft');
        await services.auth.signup({ email, password, name: name || email.split('@')[0] }, password);
        showToast('Account created successfully! Welcome to Fitness Intelligence.', 'success');
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = async () => {
    setDemoLoading(true);
    try {
      await services.auth.enableDemoMode();
      showToast('Loaded 3-week Demo Persona (Alex Morgan, 28yo).', 'success');
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch {
      showToast('Could not enable demo mode', 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      showToast('Enter your email to receive a local password reset link.', 'info');
    } else {
      showToast(`Password reset link sent to ${email} (Local session simulated).`, 'success');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--text)]">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B1A] flex items-center justify-center text-white font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 id="signin-modal-title" className="text-base font-bold tracking-tight">
                {mode === 'signin' ? 'Sign In to Fitness Intelligence' : 'Create Free Account'}
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                Local-first • Client-side biomechanics & storage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface-2)]/50 p-1 m-4 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[var(--surface)] text-[#FF6B1A] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--surface)] text-[#FF6B1A] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo 1-Click Button */}
        <div className="px-6 mb-4">
          <button
            type="button"
            onClick={handle1ClickDemo}
            disabled={demoLoading}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-[#FF6B1A]/15 via-[#FFB547]/10 to-[#FF6B1A]/15 border border-[#FF6B1A]/30 hover:border-[#FF6B1A] text-[var(--text)] text-xs font-semibold flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B1A] animate-pulse" />
              <div className="text-left">
                <span className="font-bold text-[#FF6B1A] block">1-Click Instant Demo</span>
                <span className="text-[11px] text-[var(--muted)]">Alex Morgan (28yo, 3-week history)</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#FF6B1A] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="px-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
            Or with credentials
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus:border-[#FF6B1A] text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus:border-[#FF6B1A] text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--muted)]">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#FF6B1A] hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus:border-[#FF6B1A] text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--muted)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#FF6B1A] rounded"
              />
              <span>Remember me</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-[#22C55E]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline safe</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full justify-center text-xs font-bold uppercase tracking-wider py-2.5 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-[var(--surface-2)] border-t border-[var(--border)] text-center text-[10px] text-[var(--muted)]">
          Encrypted & held in local browser memory. Zero external server transmissions.
        </div>
      </div>
    </div>
  );
};
