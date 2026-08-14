import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';
import api from '../../services/api.service';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'Acueducto Veredal La Argentina');

  const [form, setForm] = useState({ cedula: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        cedula: form.cedula,
        email: form.cedula,
        correo: form.cedula,
        password: form.password,
      });
      const user = data.data.asociado || data.data.usuario || data.data.user;
      login(user, data.data.accessToken, data.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between items-center p-4 md:p-8 relative overflow-hidden font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Ambient Hydro-Tech Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center relative z-10 my-auto py-4">
        {/* Master Glassmorphic Card — Split Layout Ultra-Premium */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden grid md:grid-cols-12 items-stretch">

          {/* Panel Izquierdo (5 cols) — Isotipo / Logo Oficial Transparente Flotante */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 p-8 flex flex-col justify-between items-center relative border-r border-slate-800/80 text-center">
            {/* Halo Glow detrás del Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-cyan-400 font-semibold text-[11px] tracking-wide font-headline relative z-10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Gestión & Recaudo Digital
            </div>

            {/* Logo Transparente Limpio */}
            <div className="my-auto py-6 relative z-10 w-full flex justify-center">
              <img
                src="/logo.png"
                alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
                className="w-full max-w-[280px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="w-full pt-4 border-t border-slate-800/60 relative z-10 flex justify-around text-center">
              <div>
                <p className="text-cyan-400 font-extrabold text-xs font-headline">Garzón, Huila</p>
                <p className="text-slate-400 text-[10px]">Colombia 🇨🇴</p>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <p className="text-emerald-400 font-extrabold text-xs font-headline">100% Digital</p>
                <p className="text-slate-400 text-[10px]">Wompi Nequi/PSE</p>
              </div>
            </div>
          </div>

          {/* Panel Derecho (7 cols) — Formulario de Acceso Administrativo */}
          <div className="md:col-span-7 bg-slate-950/80 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold text-[11px] rounded-lg font-headline uppercase tracking-wider mb-3">
                Acceso Administrativo
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-headline tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-body">
                Panel de control de <span className="text-slate-200 font-semibold">{nombreAcueducto}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 my-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 text-red-400 text-xs font-headline animate-shake">
                  <span className="material-symbols-outlined text-base">error</span>
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block font-headline">
                  Correo Electrónico / Usuario
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-slate-500 text-sm">
                    mail
                  </span>
                  <input
                    type="text"
                    required
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    placeholder="ej. admin@laargentina.org.co"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block font-headline">
                  Contraseña
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-slate-500 text-sm">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-extrabold font-headline py-3.5 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 mt-4 text-xs tracking-wide uppercase"
              >
                {loading ? (
                  <span>Ingresando al Panel...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">login</span>
                    <span>Ingresar al Panel Administrativo</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-headline">
              <span>Seguridad Certificada AES-256</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Servidor Activo
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Inferior Oficial */}
      <footer className="w-full max-w-5xl mx-auto text-center pt-3 relative z-10">
        <p className="text-xs text-slate-400 font-headline">
          © 2026 AquaRural Pro. Desarrollado por{' '}
          <a
            href="https://metadevelopment.co.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 font-semibold hover:underline transition-all"
          >
            MetaDevelopment Ltd
          </a>
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
