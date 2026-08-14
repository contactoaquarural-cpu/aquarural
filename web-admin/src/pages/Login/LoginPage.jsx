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
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between items-center p-6 relative overflow-hidden font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Ambient Hydro-Tech Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Spacing top */}
      <div className="pt-4" />

      {/* Main Centered Login Card — Ultra-Clean & Perfectly Proportionate */}
      <main className="w-full max-w-[460px] mx-auto my-auto relative z-10">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-3.5">

          {/* Logo Oficial con Eslogan Transparente al Centro Superior */}
          <div className="flex flex-col items-center justify-center text-center pb-1">
            <img
              src="/logo-full.png"
              alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
              className="w-full max-w-[290px] sm:max-w-[325px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(6,182,212,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="border-t border-slate-800/80 pt-2.5 text-center">
            <h2 className="text-lg font-extrabold text-slate-100 font-headline tracking-tight">
              Acceso Administrativo
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 font-body">
              {nombreAcueducto}
            </p>
          </div>

          {/* Formulario Limpio */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 text-red-400 text-xs font-headline">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body"
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
                  <span>Ingresar al Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 font-headline uppercase tracking-wider">
              • SEGURIDAD CERTIFICADA AES-256 •
            </span>
          </div>

        </div>
      </main>

      {/* Footer Inferior Oficial */}
      <footer className="w-full max-w-md mx-auto text-center pb-4 relative z-10">
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
