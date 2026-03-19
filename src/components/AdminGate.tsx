import { useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AdminGateProps {
  children: ReactNode;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

export function AdminGate({ children }: AdminGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('jogeda_admin_authed') === 'true';
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(null);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('jogeda_admin_authed', 'true');
      }
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl border border-zinc-100">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jogeda-green mb-2">
          Admin Access
        </p>
        <h1 className="text-2xl font-display font-black uppercase text-jogeda-dark mb-4">
          Attendee Dashboard
        </h1>
        <p className="text-xs text-zinc-500 mb-6">
          This area is restricted to authorised conference staff. Enter the admin password to
          continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium outline-none focus:border-jogeda-green transition-colors"
                placeholder="Enter password"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-jogeda-dark transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-jogeda-dark text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

