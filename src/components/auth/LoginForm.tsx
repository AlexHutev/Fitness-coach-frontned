'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowRight, Dumbbell } from 'lucide-react';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const success = await login(formData.email, formData.password);
      if (success) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            router.push(userData.role === 'client' ? '/client/dashboard' : '/dashboard');
          } catch {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } else {
        setErrors({ general: 'Invalid email or password.' });
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)',
      }}
    >
      {/* 3D floating shapes */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotateX(25deg) rotateY(-15deg); }
          50% { transform: translateY(-30px) rotateX(25deg) rotateY(-15deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotateX(-20deg) rotateY(25deg) rotateZ(10deg); }
          50% { transform: translateY(-40px) rotateX(-20deg) rotateY(25deg) rotateZ(10deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotateX(15deg) rotateY(35deg); }
          50% { transform: translateY(-20px) rotateX(15deg) rotateY(35deg); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px) rotateX(-30deg) rotateY(-20deg) rotateZ(-5deg); }
          50% { transform: translateY(-35px) rotateX(-30deg) rotateY(-20deg) rotateZ(-5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotateY(0deg) rotateX(20deg); }
          to { transform: rotateY(360deg) rotateX(20deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', animation: 'pulse-glow 6s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', animation: 'pulse-glow 8s ease-in-out infinite 2s' }} />

      {/* 3D Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1200px' }}>
        {/* Large rounded cube - top left */}
        <div className={`absolute top-[8%] left-[8%] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float1 8s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
          <div className="w-28 h-28 rounded-2xl border border-white/10 backdrop-blur-sm"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.05) 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }} />
        </div>

        {/* Sphere - top right */}
        <div className={`absolute top-[12%] right-[12%] transition-opacity duration-1000 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float2 10s ease-in-out infinite 1s', transformStyle: 'preserve-3d' }}>
          <div className="w-20 h-20 rounded-full"
            style={{ background: 'radial-gradient(circle at 35% 35%, rgba(96,165,250,0.3) 0%, rgba(37,99,235,0.1) 50%, rgba(30,58,95,0.2) 100%)', boxShadow: '0 15px 40px rgba(0,0,0,0.3), inset 0 -3px 10px rgba(0,0,0,0.2), inset 0 3px 10px rgba(255,255,255,0.1)' }} />
        </div>

        {/* Tilted card - bottom left */}
        <div className={`absolute bottom-[15%] left-[5%] transition-opacity duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float3 7s ease-in-out infinite 0.5s', transformStyle: 'preserve-3d' }}>
          <div className="w-36 h-24 rounded-xl border border-white/[0.08]"
            style={{ background: 'linear-gradient(160deg, rgba(59,130,246,0.12) 0%, rgba(30,58,95,0.08) 100%)', boxShadow: '0 25px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)' }} />
        </div>

        {/* Ring / torus - bottom right */}
        <div className={`absolute bottom-[10%] right-[8%] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float4 9s ease-in-out infinite 2s', transformStyle: 'preserve-3d' }}>
          <div className="w-24 h-24 rounded-full border-4 border-blue-500/20"
            style={{ boxShadow: '0 15px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(59,130,246,0.1)' }} />
        </div>

        {/* Small floating dots */}
        <div className={`absolute top-[45%] left-[15%] w-3 h-3 rounded-full bg-blue-400/30 transition-opacity duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float1 5s ease-in-out infinite 1s' }} />
        <div className={`absolute top-[30%] right-[25%] w-2 h-2 rounded-full bg-blue-300/20 transition-opacity duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float2 6s ease-in-out infinite 3s' }} />
        <div className={`absolute bottom-[35%] left-[30%] w-4 h-4 rounded-full bg-blue-500/15 transition-opacity duration-1000 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float3 7s ease-in-out infinite 2s' }} />

        {/* 3D spinning dumbbell icon - center left area */}
        <div className={`absolute top-[55%] left-[20%] transition-opacity duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'spin-slow 20s linear infinite', transformStyle: 'preserve-3d', perspective: '800px' }}>
          <Dumbbell className="w-10 h-10 text-blue-400/15" />
        </div>

        {/* Hexagon shape - mid right */}
        <div className={`absolute top-[40%] right-[5%] transition-opacity duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ animation: 'float2 11s ease-in-out infinite 1.5s', transformStyle: 'preserve-3d' }}>
          <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-20">
            <polygon points="30,2 55,17 55,43 30,58 5,43 5,17" fill="none" stroke="rgba(96,165,250,0.4)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Login Card with 3D effect */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Card with glassmorphism + 3D shadow stack */}
        <div className="relative">
          {/* Shadow layers for 3D depth */}
          <div className="absolute -bottom-3 left-4 right-4 h-full rounded-2xl bg-black/20 blur-xl" />
          <div className="absolute -bottom-1.5 left-2 right-2 h-full rounded-2xl bg-blue-900/30" />

          {/* Main card */}
          <div className="relative rounded-2xl border border-white/[0.12] overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
            }}>
            {/* Top accent line */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)' }} />

            <div className="p-8 sm:p-10">
              {/* Logo */}
              <div className={`flex flex-col items-center mb-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 10px 30px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
                <p className="text-blue-200/50 text-sm mt-1">Sign in to your FitnessCoach account</p>
              </div>

              {/* Error banner */}
              {errors.general && (
                <div className="mb-6 p-3.5 rounded-xl flex items-center gap-3 border border-red-400/20"
                  style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <label htmlFor="email" className="block text-xs font-semibold text-blue-200/60 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 text-sm text-white rounded-xl border transition-all duration-200 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      errors.email
                        ? 'border-red-400/40 bg-red-500/5'
                        : 'border-white/10 bg-white/5 hover:border-white/20 focus:border-blue-400/50'
                    }`}
                    style={{ backdropFilter: 'blur(10px)' }}
                    placeholder="trainer@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className={`transition-all duration-500 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <label htmlFor="password" className="block text-xs font-semibold text-blue-200/60 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 pr-11 text-sm text-white rounded-xl border transition-all duration-200 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                        errors.password
                          ? 'border-red-400/40 bg-red-500/5'
                          : 'border-white/10 bg-white/5 hover:border-white/20 focus:border-blue-400/50'
                      }`}
                      style={{ backdropFilter: 'blur(10px)' }}
                      placeholder="Enter your password"
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword
                        ? <EyeOff className="h-4 w-4 text-white/25 hover:text-white/50 transition-colors" />
                        : <Eye className="h-4 w-4 text-white/25 hover:text-white/50 transition-colors" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.password}
                    </p>
                  )}
                </div>

                {/* Remember + Forgot */}
                <div className={`flex items-center justify-between transition-all duration-500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0" />
                    <span className="text-xs text-white/40">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-400/60 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <div className={`transition-all duration-500 delay-[600ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <button type="submit" disabled={loading}
                    className="group w-full flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold rounded-xl text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 8px 24px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo credentials */}
              <div className={`mt-6 p-4 rounded-xl border border-white/[0.06] transition-all duration-500 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/30 mb-3">Demo Accounts</p>
                <div className="space-y-1.5 text-xs text-blue-100/40 font-mono">
                  <div className="flex justify-between"><span className="text-blue-300/25">Trainer</span><span>trainer@fitnesscoach.com / trainer123</span></div>
                  <div className="flex justify-between"><span className="text-blue-300/25">Client</span><span>john.smith@example.com / client123</span></div>
                  <div className="flex justify-between"><span className="text-blue-300/25">Admin</span><span>admin@fitnesscoach.com / admin123</span></div>
                </div>
              </div>

              {/* Sign up */}
              <p className={`mt-6 text-center text-sm text-white/30 transition-all duration-500 delay-[800ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trust bar */}
      <div className={`absolute bottom-6 left-0 right-0 flex justify-center gap-8 transition-all duration-700 delay-[900ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {['SSL Secured', 'GDPR Compliant', '99.9% Uptime'].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
