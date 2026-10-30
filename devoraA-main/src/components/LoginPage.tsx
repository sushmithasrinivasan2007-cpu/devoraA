import React, { useState, useEffect } from 'react';
import { Shield, GraduationCap, Briefcase, Eye, EyeOff, ArrowRight, Sparkles, Lock, User, ChevronRight, X, Mail, CheckCircle2, KeyRound } from 'lucide-react';
import { Role } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLogin: (role: Role, name: string, username?: string, password?: string) => void;
}

type RolePanel = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface CredentialItem {
  username: string;
  password: string;
  name: string;
}

const defaultRoleData: Record<RolePanel, {
  label: string;
  icon: React.ElementType;
  credentials: CredentialItem[];
}> = {
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    credentials: [{ username: 'admin@devora.edu', password: 'admin123', name: 'Dr. Alistair Vance' }]
  },
  TEACHER: {
    label: 'Staff',
    icon: Briefcase,
    credentials: [{ username: 'teacher@devora.edu', password: 'teacher123', name: 'Sarah Jenkins' }]
  },
  STUDENT: {
    label: 'Student',
    icon: GraduationCap,
    credentials: [
      { username: 'student@devora.edu', password: 'student123', name: 'ABHISHEK R' },
      { username: 'ajay@devora.edu', password: 'student123', name: 'AJAY PRASAD' }
    ]
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<RolePanel>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic credentials synced with backend & localStorage
  const [roleDataState, setRoleDataState] = useState(defaultRoleData);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string; tempPassword?: string; username?: string } | null>(null);

  useEffect(() => {
    // Fetch latest credentials from server (handles password created/changed in admin portal)
    const fetchCreds = async () => {
      try {
        const creds = await api.getCredentials();
        if (Array.isArray(creds) && creds.length > 0) {
          setRoleDataState(prev => {
            const next = { ...prev };
            creds.forEach((c: any) => {
              const roleKey = (c.role === 'TEACHER' ? 'TEACHER' : c.role === 'ADMIN' ? 'ADMIN' : 'STUDENT') as RolePanel;
              const existingIdx = next[roleKey].credentials.findIndex(
                item => item.username.toLowerCase() === c.username.toLowerCase()
              );
              if (existingIdx >= 0) {
                next[roleKey].credentials[existingIdx] = {
                  username: c.username,
                  password: c.password,
                  name: c.name || next[roleKey].credentials[existingIdx].name
                };
              } else {
                next[roleKey].credentials.push({
                  username: c.username,
                  password: c.password,
                  name: c.name || c.username
                });
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.warn('Could not fetch server credentials, using default store:', e);
      }
    };
    fetchCreds();
  }, []);

  const role = roleDataState[selectedRole];

  const handleRoleSelect = (r: RolePanel) => {
    setSelectedRole(r);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleAutoFill = () => {
    if (role.credentials.length > 0) {
      setUsername(role.credentials[0].username);
      setPassword(role.credentials[0].password);
      setError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 600));

    // Try matching in active credentials list
    const match = role.credentials.find(
      c => c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password
    );

    if (match) {
      onLogin(selectedRole, match.name, match.username, match.password);
    } else {
      // Check if user exists but wrong password or doesn't exist
      const userExists = role.credentials.some(c => c.username.toLowerCase() === username.trim().toLowerCase());
      if (userExists) {
        setError('Incorrect password. Click "Forgot password?" below to recover your access credentials.');
      } else {
        // Fallback: check if username has been created in credentials
        try {
          const allCreds = await api.getCredentials();
          const serverMatch = allCreds.find((c: any) => 
            c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password
          );
          if (serverMatch) {
            onLogin(serverMatch.role as Role || selectedRole, serverMatch.name || username, serverMatch.username, serverMatch.password);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error(err);
        }
        setError('Invalid credentials for this portal. Please check your username and password or use "Forgot password?".');
      }
    }
    setIsLoading(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    setForgotResult(null);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotResult({
        success: true,
        message: res.message || `Password recovery credentials dispatched to ${forgotEmail}.`,
        tempPassword: res.credential?.password,
        username: res.credential?.username
      });
    } catch (err: any) {
      setForgotResult({
        success: false,
        message: err.message || 'Unable to process recovery. Please contact your Campus Administrator.'
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const RoleIcon = role.icon;

  return (
    <div className="min-h-screen bg-[#F3EBDD] flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B1E2B]/7 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A85C68]/8 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#E8DDCA]/80 rounded-full blur-[100px]" />

      {/* Logo & Brand */}
      <div className="text-center mb-8 z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-1 border border-[#6B1E2B]/20 shadow-lg shadow-[#6B1E2B]/20 mb-3 overflow-hidden">
          <img src="/logo.jpg" alt="Devora AI Logo" className="w-full h-full object-contain rounded-xl" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2020] tracking-tight font-terminal">Devora AI</h1>
        <p className="text-xs font-mono text-[#756565] mt-1 tracking-wide">Intelligent Campus Operations Platform</p>
      </div>

      {/* Main login card */}
      <div className="w-full max-w-5xl z-10">
        <div className="rounded-3xl bg-[#FFF8EC]/70 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-12px_rgba(107,30,43,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* LEFT: Role Selector Panel */}
            <div className="lg:col-span-6 bg-[#6B1E2B]/6 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-[#6B1E2B]/12 p-6 sm:p-8 flex flex-col gap-4">
              <div className="mb-2">
                <h2 className="text-sm font-mono font-bold text-[#6B1E2B] uppercase tracking-widest">Select Portal</h2>
                <p className="text-xs text-[#756565] mt-0.5">Choose your role to access designated campus services</p>
              </div>

              {(Object.keys(roleDataState) as RolePanel[]).map((r) => {
                const rd = roleDataState[r];
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
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : 'bg-[#6B1E2B]/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#6B1E2B]'}`} />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#2B2020]'}`}>
                            {rd.label} Portal
                          </div>
                          <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#756565]'}`}>
                            {r === 'ADMIN' ? 'Executive Director & Operations' : r === 'TEACHER' ? 'Faculty & BCA Program Team' : 'Enrolled BCA Students'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-[#756565] opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  </button>
                );
              })}

              <div className="mt-4 p-4 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 text-xs text-[#756565] space-y-1">
                <div className="font-bold font-mono text-[#6B1E2B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Campus Direct Access</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Welcome email containing your verified credentials will be automatically dispatched upon signing in.
                </p>
              </div>
            </div>

            {/* RIGHT: Login Form */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                {/* Form header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                      <RoleIcon className="w-4 h-4 text-[#6B1E2B]" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-widest">
                      {role.label} Authentication
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2B2020] leading-tight">
                    Welcome to<br />Devora Campus OS
                  </h3>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                      Email / Username / Roll No
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-username"
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter email or username"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        id="btn-forgot-password"
                        onClick={() => {
                          setForgotEmail(username || role.credentials[0]?.username || '');
                          setForgotResult(null);
                          setShowForgotModal(true);
                        }}
                        className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
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

                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        className="text-[11px] font-mono text-[#756565] hover:text-[#6B1E2B] hover:underline cursor-pointer"
                      >
                        ⚡ Fill default credentials ({role.credentials[0]?.username})
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-[#B94A55]/10 border border-[#B94A55]/25 text-xs font-mono text-[#B94A55]">
                      {error}
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
                        <span>Signing In &amp; Sending Welcome Mail...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to {role.label} Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security note */}
              <div className="mt-8 pt-4 border-t border-[#6B1E2B]/10 flex items-center justify-center gap-2 text-[11px] font-mono text-[#9A8989]">
                <Lock className="w-3 h-3 text-[#6B1E2B]" />
                <span>Secured · Devora AI Campus Operations System · v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL (Available across all login portals) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFF8EC] border border-[#6B1E2B]/25 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-[#756565] hover:text-[#2B2020] hover:bg-[#6B1E2B]/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-[#6B1E2B]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2B2020]">Forgot Password</h3>
                <p className="text-xs font-mono text-[#756565]">{role.label} Portal Recovery</p>
              </div>
            </div>

            <p className="text-xs text-[#756565] leading-relaxed">
              Enter your registered campus email address or roll number. Our automated gateway will dispatch your access credentials directly to your mailbox.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                  Registered Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. user@devora.edu or student roll no"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3EBDD]/70 border border-[#6B1E2B]/20 text-[#2B2020] placeholder:text-[#9A8989] font-mono text-sm focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none"
                  />
                </div>
              </div>

              {forgotResult && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 ${
                  forgotResult.success
                    ? 'bg-[#5F8F68]/15 border-[#5F8F68]/30 text-[#2F5234]'
                    : 'bg-[#B94A55]/15 border-[#B94A55]/30 text-[#B94A55]'
                }`}>
                  <div className="flex items-start gap-2">
                    {forgotResult.success && <CheckCircle2 className="w-4 h-4 text-[#5F8F68] shrink-0 mt-0.5" />}
                    <span>{forgotResult.message}</span>
                  </div>
                  {forgotResult.tempPassword && (
                    <div className="bg-white/80 p-2.5 rounded-lg border border-[#5F8F68]/20 text-[#2B2020] space-y-1">
                      <div>Account: <strong className="font-mono text-[#6B1E2B]">{forgotResult.username}</strong></div>
                      <div>Password: <strong className="font-mono text-[#6B1E2B] text-sm">{forgotResult.tempPassword}</strong></div>
                      <button
                        type="button"
                        onClick={() => {
                          if (forgotResult.username) setUsername(forgotResult.username);
                          if (forgotResult.tempPassword) setPassword(forgotResult.tempPassword);
                          setShowForgotModal(false);
                        }}
                        className="mt-1 w-full py-1.5 rounded-md bg-[#6B1E2B] text-white font-mono font-bold text-[11px] hover:bg-[#42121C] cursor-pointer"
                      >
                        Apply &amp; Fill Sign In Form
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#756565] hover:bg-[#F3EBDD] border border-[#6B1E2B]/15 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isForgotLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Mail...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Recovery Mail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
