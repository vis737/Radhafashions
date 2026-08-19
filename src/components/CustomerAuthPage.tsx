import React, { useEffect, useState } from 'react';
import { evaluatePasswordStrength } from '../utils/passwordValidator';

interface CustomerAuthPageProps {
  onLogin: (email: string, name: string) => void;
}

type AuthView = 'signin' | 'signup' | 'forgot';

const SakuraAccent = () => (
  <svg
    className="pointer-events-none absolute -right-7 top-8 w-20 h-20 drop-shadow-sm"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <g>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="40"
          cy="22"
          rx="9"
          ry="16"
          fill="#F4A7C1"
          opacity="0.95"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      <circle cx="40" cy="40" r="6" fill="#FCE7F3" />
      <circle cx="40" cy="40" r="3.2" fill="#E86A9A" />
    </g>
  </svg>
);

export default function CustomerAuthPage({ onLogin }: CustomerAuthPageProps) {
  const [view, setView] = useState<AuthView>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordHint, setPasswordHint] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetMessages = () => {
    setError('');
    setOtpHint('');
    setPasswordHint('');
  };

  const switchView = (next: AuthView) => {
    setView(next);
    setPassword('');
    setOtpCode('');
    setOtpStep('email');
    resetMessages();
  };

  const sendOtp = async (targetEmail: string) => {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Could not send reset code.');
    setOtpStep('code');
    setOtpHint(data.message || 'A one-time code was sent to your email.');
    setResendCooldown(60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (view === 'signin') {
        const loginId = username.trim();
        if (!loginId || !password.trim()) {
          setError('Please enter your username and password.');
          return;
        }
        if (!loginId.includes('@')) {
          setError('Please enter the email you used as your username.');
          return;
        }
        const res = await fetch('/api/login-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginId, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials.');
        onLogin(data.customer.email, data.customer.name);
        return;
      }

      if (view === 'signup') {
        const displayName = username.trim();
        const mail = email.trim();
        if (!displayName || !mail || !password.trim()) {
          setError('Please fill in username, email, and password.');
          return;
        }
        const validation = evaluatePasswordStrength(password);
        if (!validation.valid) {
          setPasswordHint(validation.errors[0]);
          setError('Please choose a stronger password.');
          return;
        }
        const res = await fetch('/api/register-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: mail, name: displayName, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create account.');
        onLogin(mail, displayName);
        return;
      }

      const mail = email.trim();
      if (!mail.includes('@')) {
        setError('Please enter the email on your account.');
        return;
      }
      if (otpStep === 'email') {
        await sendOtp(mail);
        return;
      }
      if (otpCode.trim().length < 4) {
        setError('Enter the 4-digit code from your email.');
        return;
      }
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Invalid code.');
      onLogin(mail, data.name || mail.split('@')[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const title = view === 'signup' ? 'Sign Up' : view === 'forgot' ? 'Reset' : 'Sign In';
  const buttonLabel =
    loading
      ? 'Please wait...'
      : view === 'signup'
        ? 'Create account'
        : view === 'forgot'
          ? otpStep === 'email'
            ? 'Send code'
            : 'Verify'
          : 'Login';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 pt-16 pb-8">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/sakura-auth-bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-rose-200/25 via-transparent to-fuchsia-900/20" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[340px] rounded-md px-9 py-10 shadow-[0_18px_50px_rgba(80,20,50,0.28)]"
        style={{
          background: 'rgba(232, 214, 220, 0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.35)',
        }}
      >
        <SakuraAccent />

        <h1 className="text-center text-[28px] font-bold text-black tracking-tight mb-7 font-sans">
          {title}
        </h1>

        {error && (
          <p className="mb-4 text-center text-[11px] font-medium text-red-700 bg-white/50 rounded px-2 py-1.5">
            {error}
          </p>
        )}
        {otpHint && view === 'forgot' && (
          <p className="mb-4 text-center text-[11px] font-medium text-emerald-800 bg-white/50 rounded px-2 py-1.5">
            {otpHint}
          </p>
        )}

        {view !== 'forgot' && (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete={view === 'signup' ? 'name' : 'username'}
            className="w-full mb-4 h-11 rounded-md bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-white/80 shadow-inner focus:ring-2 focus:ring-black/10"
          />
        )}

        {(view === 'signup' || view === 'forgot') && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={view === 'forgot' ? 'Email' : 'Email'}
            autoComplete="email"
            className="w-full mb-4 h-11 rounded-md bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-white/80 shadow-inner focus:ring-2 focus:ring-black/10"
          />
        )}

        {view === 'forgot' && otpStep === 'code' && (
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="4-digit code"
            className="w-full mb-4 h-11 rounded-md bg-white px-4 text-sm text-center tracking-[0.4em] font-semibold text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal outline-none border border-white/80 shadow-inner focus:ring-2 focus:ring-black/10"
          />
        )}

        {view !== 'forgot' && (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (view === 'signup' && e.target.value) {
                  const v = evaluatePasswordStrength(e.target.value);
                  setPasswordHint(v.valid ? 'Strong password' : v.errors[0]);
                } else {
                  setPasswordHint('');
                }
              }}
              placeholder="Password"
              autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
              className="w-full mb-5 h-11 rounded-md bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-white/80 shadow-inner focus:ring-2 focus:ring-black/10"
            />
            {passwordHint && view === 'signup' && (
              <p className={`-mt-3 mb-4 text-[10px] ${passwordHint === 'Strong password' ? 'text-emerald-800' : 'text-gray-700'}`}>
                {passwordHint}
              </p>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-md bg-black text-white text-[15px] font-semibold tracking-wide hover:bg-neutral-900 transition disabled:opacity-60 cursor-pointer"
        >
          {buttonLabel}
        </button>

        {view === 'forgot' && otpStep === 'code' && (
          <button
            type="button"
            disabled={resendCooldown > 0 || loading}
            onClick={() => {
              resetMessages();
              sendOtp(email.trim()).catch((err) => setError(err.message));
            }}
            className="mt-3 w-full text-center text-[11px] text-neutral-700 hover:text-black disabled:text-gray-400 cursor-pointer"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </button>
        )}

        <div className="mt-8 flex items-center justify-between text-[13px] text-neutral-800">
          {view === 'signin' ? (
            <>
              <button type="button" onClick={() => switchView('forgot')} className="hover:text-black cursor-pointer">
                Forget Password?
              </button>
              <button type="button" onClick={() => switchView('signup')} className="hover:text-black cursor-pointer">
                Signup
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => switchView('signin')} className="hover:text-black cursor-pointer">
                {view === 'signup' ? 'Have an account?' : 'Back to login'}
              </button>
              <button
                type="button"
                onClick={() => switchView(view === 'signup' ? 'forgot' : 'signup')}
                className="hover:text-black cursor-pointer"
              >
                {view === 'signup' ? 'Forget Password?' : 'Signup'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
