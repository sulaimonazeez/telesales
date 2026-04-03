import { useState, FormEvent } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login, getMyCloser } from '@/services/api';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1 — Login to ERPNext
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || 'Wrong email or password. Please try again.');
        return;
      }

      // Step 2 — Use our own whitelisted API to get closer info
      // This confirms the session cookie is working and the user is a telesales rep
      const closer = await getMyCloser();

      // Step 3 — Redirect based on role
      if (closer) {
        navigate('/telesales', { replace: true });
      } else {
        // Logged in but not a telesales closer — redirect to home
        navigate('/', { replace: true });
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Could not connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg, #f4f4f4)' }}
    >
      <div className="w-full max-w-[360px] flex flex-col items-center gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-12 flex items-center justify-center text-[22px] font-bold"
            style={{ backgroundColor: '#00a846', color: '#fff' }}
          >
            VV
          </div>
          <span className="text-[18px] font-bold" style={{ color: '#111' }}>
            VitalVida
          </span>
          <span
            className="text-[13px] font-mono"
            style={{ color: '#666' }}
          >
            Staff Portal
          </span>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="w-full p-6 flex flex-col gap-4"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e2e2',
          }}
        >
          <div>
            <h1 className="text-[18px] font-bold" style={{ color: '#111' }}>
              Sign in
            </h1>
            <p className="text-[13px] mt-1" style={{ color: '#666' }}>
              Use your VitalVida account. You will be taken to your portal automatically.
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: '#111' }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@vitalvida.ng"
              style={{
                width: '100%',
                border: '1px solid #e2e2e2',
                padding: '10px 12px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f4f4f4',
                color: '#111',
                borderRadius: 0,
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = '#00a846')}
              onBlur={e => (e.target.style.borderColor = '#e2e2e2')}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: '#111' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  border: '1px solid #e2e2e2',
                  padding: '10px 40px 10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#f4f4f4',
                  color: '#111',
                  borderRadius: 0,
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = '#00a846')}
                onBlur={e => (e.target.style.borderColor = '#e2e2e2')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                border: '1px solid rgba(211,47,47,0.3)',
                backgroundColor: 'rgba(211,47,47,0.07)',
                color: '#d32f2f',
                padding: '10px 12px',
                fontSize: '13px',
                borderRadius: 0,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: loading ? '#aaa' : '#00a846',
              color: '#fff',
              border: 'none',
              borderRadius: 0,
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: '#aaa' }}>
          VitalVida Ltd · Internal use only
        </p>
      </div>
    </div>
  );
}
