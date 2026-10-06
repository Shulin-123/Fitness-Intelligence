import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Lock,
  ArrowRight,
  User,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { services } from '../services/registry';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await services.auth.login(email, password, name);
        showToast('Signed in successfully!', 'success');
        navigate('/dashboard');
      } else {
        localStorage.removeItem('fitness_onboarding_draft');
        await services.auth.signup(
          { email, password, name: name || email.split('@')[0] },
          password
        );
        showToast('Account created successfully! Welcome to Fitness Intelligence.', 'success');
        navigate('/onboarding');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B1A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#FF6B1A] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FF6B1A] flex items-center justify-center text-white font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-extrabold tracking-tight text-[var(--text)] pr-2 text-sm uppercase">
              Fitness Intelligence
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] pt-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Local Session'}
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Autonomous, explainable physical conditioning and dietary science.
          </p>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-amber-500/20 text-xs text-amber-700 dark:text-[#FACC15] flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 dark:text-[#FACC15] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-[var(--text)]">
              Client-Only Prototype Architecture
            </span>
            <span className="text-amber-800/80 dark:text-[#FACC15]/80 leading-relaxed text-[11px]">
              No remote database or cloud credentials required. Accounts and biometric logs persist exclusively in your device's browser localStorage.
            </span>
          </div>
        </div>

        {/* Form Card */}
        <Card variant="default" className="p-6 md:p-8 border-[var(--border)] space-y-6">
          <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] text-xs">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#FF6B1A] text-white font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              New Profile
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[#FF6B1A]"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[var(--muted)]" />
                <input
                  type="email"
                  placeholder="alex@athlete.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[#FF6B1A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[var(--muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-9 pr-10 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[#FF6B1A]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-[var(--muted)] mt-1 block">
                Minimum 6 characters with secure local hashing
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              <span className="flex items-center justify-center gap-1.5">
                {mode === 'login' ? 'Enter Local Session' : 'Create & Continue'}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </form>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-[var(--muted)]">
          <Link to="/onboarding" className="hover:text-[var(--text)] underline">
            Take the complete onboarding assessment →
          </Link>
        </div>
      </div>
    </div>
  );
};
