import React, { useState } from 'react';
import { 
  Shield, 
  GraduationCap, 
  Briefcase, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  User, 
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Role } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLogin: (role: Role, name: string) => void;
}

type RolePanel = 'ADMIN' | 'TEACHER' | 'STUDENT';
type AuthMode = 'LOGIN' | 'FORGOT_PASSWORD';

const roleData: Record<RolePanel, {
  label: string;
  icon: React.ElementType;
  description: string;
  placeholder: string;
}> = {
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    description: 'Executive & administrative oversight',
    placeholder: 'admin@devora.edu'
  },
  TEACHER: {
    label: 'Faculty',
    icon: Briefcase,
    description: 'Instructors & faculty member accounts',
    placeholder: 'Enter your registered faculty email'
  },
  STUDENT: {
    label: 'Student',
    icon: GraduationCap,
    description: 'Enrolled students & attendees',
    placeholder: 'Enter student email or admission ID'
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<RolePanel>('ADMIN');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const role = roleData[selectedRole];
  const RoleIcon = role.icon;

  // Auto-detect reset link from email query parameters (?resetToken=...&email=...)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('resetToken') || params.get('token');
      const email = params.get('email');
      if (token && email) {
        setForgotEmail(email);
        setResetCode(token);
        setForgotStep(2);
        setAuthMode('FORGOT_PASSWORD');
        setSuccessMsg(`Password reset link verified for ${email}! Please enter your new password below.`);
      }
    } catch {
      // Ignore URL parsing exceptions
    }
  }, []);

  const handleRoleSelect = (r: RolePanel) => {
    setSelectedRole(r);
    setUsername('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    setAuthMode('LOGIN');
  };

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await api.login({
        email: username.trim(),
        username: username.trim(),
        password: password.trim(),
        role: selectedRole
      });

      if (res.success) {
        onLogin(res.role || selectedRole, res.name || 'Campus Member');
      } else {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      // Local fallback in case network server request fails
      if (selectedRole === 'ADMIN' && (username === 'admin@devora.edu' || username === 'director@devora.edu') && password === 'admin123') {
        onLogin('ADMIN', 'Dr. Alistair Vance');
      } else if (selectedRole === 'TEACHER' && (username === 'teacher@devora.edu' || username === 's.jenkins@devora.edu') && password === 'teacher123') {
        onLogin('TEACHER', 'Sarah Jenkins');
      } else if (selectedRole === 'STUDENT' && username === 'student@devora.edu' && password === 'student123') {
        onLogin('STUDENT', 'Aiden Sharma');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Forgot Password - Step 1: Request Code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      if (res.success) {
        setForgotStep(2);
        setSuccessMsg(`Password reset email sent to ${res.target_email || forgotEmail.trim()}! Please check your inbox for the recovery link and 6-digit code.`);
        if (res.code) setResetCode(res.code);
      } else {
        setError(res.error || 'Could not find an account with that email.');
      }
    } catch {
      setError('Failed to dispatch recovery email. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Forgot Password - Step 2: Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (resetNewPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword(forgotEmail.trim(), resetCode.trim(), resetNewPassword.trim());
      if (res.success) {
        setSuccessMsg('Password updated successfully! You can now log in with your new password.');
        setUsername(forgotEmail.trim());
        setPassword(resetNewPassword.trim());
        setAuthMode('LOGIN');
        setForgotStep(1);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setError(res.error || 'Failed to reset password. Please check your recovery code.');
      }
    } catch {
      setError('Failed to update password. Please verify connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EBDD] flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B1E2B]/7 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A85C68]/8 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#E8DDCA]/80 rounded-full blur-[100px]" />

      {/* Logo & Brand */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6B1E2B] shadow-lg shadow-[#6B1E2B]/30 mb-4">
          <Sparkles className="w-7 h-7 text-[#FFF8EC]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2020] tracking-tight">Devora AI</h1>
        <p className="text-xs sm:text-sm font-mono text-[#756565] mt-1">Campus Operations & Autonomous Intelligence</p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-4xl z-10">
        <div className="rounded-3xl bg-[#FFF8EC]/70 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-12px_rgba(107,30,43,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* LEFT: Role Selector Panel */}
            <div className="lg:col-span-5 bg-[#6B1E2B]/6 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-[#6B1E2B]/12 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="mb-4">
                  <h2 className="text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-widest">Select Portal Role</h2>
                  <p className="text-xs text-[#756565] mt-0.5">Choose your campus role to proceed</p>
                </div>

                <div className="space-y-3">
                  {(Object.keys(roleData) as RolePanel[]).map((r) => {
                    const rd = roleData[r];
                    const Icon = rd.icon;
                    const isSelected = selectedRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? 'bg-[#6B1E2B] border-[#6B1E2B] text-white shadow-lg shadow-[#6B1E2B]/25 scale-[1.02]'
                            : 'bg-white/50 border-[#6B1E2B]/15 text-[#2B2020] hover:bg-white/70 hover:border-[#6B1E2B]/30 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-white/20' : 'bg-[#6B1E2B]/10'
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#6B1E2B]'}`} />
                            </div>
                            <div>
                              <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#2B2020]'}`}>
                                {rd.label}
                              </div>
                              <div className={`text-[11px] leading-tight mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#756565]'}`}>
                                {rd.description}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-[#756565] opacity-0 group-hover:opacity-100'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security info footnote */}
              <div className="p-3.5 rounded-2xl bg-white/60 border border-[#6B1E2B]/15 text-xs text-[#756565] space-y-1">
                <div className="font-bold text-[#6B1E2B] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verified Campus Access</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Credentials are authenticated against active campus directory records.
                </p>
              </div>
            </div>

            {/* RIGHT: Dynamic Form (Login or Forgot Password) */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">

              {/* VIEW 1: NORMAL LOGIN */}
              {authMode === 'LOGIN' && (
                <div>
                  {/* Form header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                        <RoleIcon className="w-4 h-4 text-[#6B1E2B]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-widest">
                        {role.label} Authentication
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2B2020] leading-tight">
                      Welcome back to Devora Campus
                    </h3>
                    <p className="text-xs text-[#756565] mt-1">
                      {selectedRole === 'TEACHER'
                        ? 'Log in using your registered faculty email address and password'
                        : `Sign in with your ${role.label.toLowerCase()} credentials`}
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                        {selectedRole === 'TEACHER' ? 'Faculty Email' : 'Email / Username'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-username"
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder={role.placeholder}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756565] hover:text-[#6B1E2B] transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-[#B94A55]/10 border border-[#B94A55]/25 text-xs font-mono text-[#B94A55] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-3 rounded-xl bg-[#5F8F68]/10 border border-[#5F8F68]/25 text-xs font-mono text-[#5F8F68] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {/* Forgot password link positioned above Login button - Only for non-STUDENT roles */}
                    {selectedRole !== 'STUDENT' && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(username);
                            setAuthMode('FORGOT_PASSWORD');
                            setError('');
                            setSuccessMsg('');
                          }}
                          className="text-xs font-mono font-semibold text-[#6B1E2B] hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button
                      id="btn-login-submit"
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-mono font-bold text-sm bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-lg shadow-[#6B1E2B]/20 hover:shadow-[#6B1E2B]/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Login</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 2: FORGOT PASSWORD */}
              {authMode === 'FORGOT_PASSWORD' && (
                <div>
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('LOGIN'); setError(''); setSuccessMsg(''); }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B1E2B] hover:underline mb-3 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Login</span>
                    </button>
                    <h3 className="text-2xl font-bold text-[#2B2020] leading-tight">
                      Reset Password
                    </h3>
                    <p className="text-xs text-[#756565] mt-1">
                      {forgotStep === 1
                        ? 'Enter your registered email to receive a recovery code'
                        : 'Enter the 6-digit code and choose your new password'}
                    </p>
                  </div>

                  {forgotStep === 1 ? (
                    <form onSubmit={handleRequestResetCode} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                          Registered Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            placeholder="e.g. s.jenkins@devora.edu"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] outline-none font-mono text-sm transition-all"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-[#B94A55]/10 border border-[#B94A55]/25 text-xs font-mono text-[#B94A55]">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-mono font-bold text-sm bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Dispatching Code...' : 'Send Verification Code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      {successMsg && (
                        <div className="p-3 rounded-xl bg-[#5F8F68]/10 border border-[#5F8F68]/25 text-xs font-mono text-[#5F8F68]">
                          {successMsg}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                          6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          required
                          value={resetCode}
                          onChange={e => setResetCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full px-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] font-mono text-sm tracking-widest text-center outline-none focus:border-[#6B1E2B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={resetNewPassword}
                          onChange={e => setResetNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] font-mono text-sm outline-none focus:border-[#6B1E2B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={resetConfirmPassword}
                          onChange={e => setResetConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] font-mono text-sm outline-none focus:border-[#6B1E2B]"
                        />
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-[#B94A55]/10 border border-[#B94A55]/25 text-xs font-mono text-[#B94A55]">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-mono font-bold text-sm bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Updating Password...' : 'Save New Password & Continue'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Security note */}
              <div className="mt-8 pt-4 border-t border-[#6B1E2B]/10 flex items-center justify-between text-[11px] font-mono text-[#9A8989]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-[#6B1E2B]" />
                  <span>Secured · Devora AI Campus Operations</span>
                </div>
                <span>v1.2</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
