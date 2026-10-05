import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { services } from '../../services/registry';
import { useToast } from '../../context/ToastContext';
import type { UserProfile } from '../../types';

export const UserMenu: React.FC<{
  user: UserProfile;
  onLogout?: () => void;
}> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    await services.auth.logout();
    showToast('Signed out of session.', 'info');
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
      window.location.reload();
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#FF6B1A] transition-all cursor-pointer text-xs"
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <div className="w-6 h-6 rounded-full bg-[#FF6B1A] text-white font-bold text-xs flex items-center justify-center relative">
          <span>{initial}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] absolute -bottom-0.5 -right-0.5 ring-1 ring-[var(--surface)]" />
        </div>
        <span className="font-semibold text-[var(--text)] max-w-[100px] truncate hidden sm:inline">
          {user.name || 'User'}
        </span>
        <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-2xl py-1.5 z-50 text-[var(--text)] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-xs font-bold truncate">{user.name || 'User'}</p>
            <p className="text-[10px] text-[var(--muted)] truncate">{user.email || 'local@offline.session'}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate('/dashboard');
              setMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface-2)] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#FF6B1A]" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate('/profile');
              setMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface-2)] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#FFB547]" />
            <span>Profile & Settings</span>
          </button>

          <div className="my-1 border-t border-[var(--border)]" />

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-xs text-[#F87171] hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
