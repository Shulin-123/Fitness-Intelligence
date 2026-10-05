import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  LineChart,
  User,
  Scan,
  LogOut,
  Zap,
} from 'lucide-react';
import { OfflineBanner } from '../ui/OfflineBanner';
import { WhyDrawer } from '../drawers/WhyDrawer';
import { CookieConsent } from '../ui/CookieConsent';
import { AICopilotDrawer } from '../ai/AICopilotDrawer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SpringBootStatusBadge } from '../ui/SpringBootStatusBadge';
import { services } from '../../services/registry';
import { useToast } from '../../context/ToastContext';

export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isDemo = services.auth.isDemoMode();

  const handleExitDemo = async () => {
    await services.auth.exitDemoMode();
    showToast('Exited demo mode. Back to your local storage session.', 'info');
    navigate('/');
    window.location.reload();
  };

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/workout', label: 'Workout', icon: Dumbbell },
    { to: '/form-checker', label: 'Form AI', icon: Scan },
    { to: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
    { to: '/progress', label: 'Progress', icon: LineChart },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname.startsWith('/onboarding') ||
    location.pathname === '/login' ||
    location.pathname === '/assessment';

  if (isPublicPage) {
    return (
      <div className="min-h-screen app-atmosphere text-[var(--text)] flex flex-col relative selection:bg-[#FF6B1A] selection:text-[#0F0B09]">
        <div className="grain-overlay" aria-hidden="true" />
        <OfflineBanner />
        <WhyDrawer />
        <CookieConsent />
        <AICopilotDrawer />
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-atmosphere text-[var(--text)] flex flex-col md:flex-row relative selection:bg-[#FF6B1A] selection:text-[#0F0B09]">
      <div className="grain-overlay" aria-hidden="true" />
      <OfflineBanner />
      <WhyDrawer />
      <CookieConsent />
      <AICopilotDrawer />

      {/* Demo Mode Ribbon */}
      {isDemo && (
        <div className="fixed top-0 inset-x-0 z-40 bg-[#FF6B1A] text-[#0F0B09] px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F0B09] animate-pulse" />
            <span>DEMO MODE ACTIVE • 3-Week Historical Seed Loaded (Isolated Namespace)</span>
          </div>
          <button
            onClick={handleExitDemo}
            className="px-2.5 py-0.5 bg-[#0F0B09] text-[#FF6B1A] rounded text-[11px] font-bold hover:bg-[#1F1814] transition-colors cursor-pointer"
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* Desktop Slim Left Icon Rail (>= 1024px) */}
      <aside
        className={`hidden md:flex flex-col items-center justify-between w-20 py-6 bg-[var(--surface)] border-r border-[var(--border)] shrink-0 z-30 fixed inset-y-0 left-0 ${
          isDemo ? 'top-8' : 'top-0'
        }`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo Mark */}
          <NavLink
            to="/dashboard"
            className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[#FF6B1A] hover:border-[#FF6B1A] transition-colors"
            title="Fitness Intelligence"
          >
            <Zap className="w-5 h-5 fill-current" />
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all min-h-[44px] min-w-[44px] ${
                      isActive
                        ? 'bg-[#FF6B1A] text-[#0F0B09] font-bold shadow-[0_0_15px_rgba(255,107,26,0.35)]'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                    }`
                  }
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] tracking-tight mt-1 font-medium scale-90">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility: Theme mode toggle and Exit demo */}
        <div className="flex flex-col items-center gap-3">
          <ThemeToggle className="w-9 h-9" />
          {isDemo && (
            <button
              onClick={handleExitDemo}
              className="p-2.5 text-[var(--muted)] hover:text-[#F87171] rounded-xl hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              title="Exit Demo Mode"
              aria-label="Exit Demo Mode"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col md:pl-20 min-h-screen relative z-10 ${
          isDemo ? 'pt-8' : ''
        }`}
      >
        {/* Top utility bar */}
        <div className="flex items-center justify-end gap-3 px-4 pt-3 pb-1 md:px-8 max-w-7xl w-full mx-auto">
          <SpringBootStatusBadge />
        </div>

        <main className="flex-1 pb-24 md:pb-12 max-w-7xl w-full mx-auto p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (< 1024px, 375px mobile-first) */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center p-1.5 rounded-lg min-w-[50px] min-h-[44px] transition-colors ${
                    isActive
                      ? 'text-[#FF6B1A] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight mt-1 font-medium">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
