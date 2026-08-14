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
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between p-6 md:p-8 relative overflow-hidden font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Hydro-Tech Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Superior — Branding & Headline */}
      <header className="w-full max-w-5xl mx-auto space-y-2 relative z-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-cyan-400 font-semibold text-xs tracking-wide font-headline">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Panel Administrativo SaaS — AquaRural Pro
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-100 leading-tight font-headline tracking-tight">
          El futuro de la{' '}
          <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            gestión del agua rural.
          </span>
        </h1>
      </header>

      {/* Main Grid — 2 Contenedores Compactos Nivelados Lado a Lado */}
      <main className="w-full max-w-5xl mx-auto my-6 grid md:grid-cols-12 gap-6 items-stretch relative z-10">

        {/* Contenedor 1 (Izquierdo): Tarjeta de Marca con Isotipo Vectorial Transparente (7 Columnas) */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between items-center hover:border-cyan-500/30 transition-all duration-300 group">
          <div className="w-full my-auto flex flex-col items-center justify-center p-4 text-center">
            {/* Isotipo Vectorial Transparente con Resplandor */}
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-emerald-500 p-[3px] shadow-2xl shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[21px] flex items-center justify-center p-3">
                <img src="/favicon.svg" alt="AquaRural Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Tipografía Nítida Vectorial */}
            <h2 className="text-4xl font-black text-slate-100 font-headline tracking-tight mt-5">
              AquaRural
            </h2>
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest font-headline mt-1.5">
              Gestión y Recaudo para Acueductos Veredales
            </p>
          </div>

          {/* Stats Bar Inferior del Contenedor 1 */}
          <div className="w-full pt-3 border-t border-slate-800/80 flex justify-around text-center">
            <div>
              <p className="text-cyan-400 font-extrabold text-xs font-headline">Garzón, Huila</p>
              <p className="text-slate-400 text-[10px] font-body">Colombia 🇨🇴</p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <p className="text-emerald-400 font-extrabold text-xs font-headline">100% Digital</p>
              <p className="text-slate-400 text-[10px] font-body">Recaudo por Wompi</p>
            </div>
          </div>
        </div>

        {/* Contenedor 2 (Derecho): Formulario de Login Compacto y Ajustado (5 Columnas) */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-3 md:hidden">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 p-2 flex items-center justify-center">
                <img src="/favicon.svg" alt="AquaRural" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold font-headline text-slate-100">AquaRural Pro</span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight font-headline">
              Acceso Administrativo
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-body">
              {nombreAcueducto}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 my-auto py-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-red-400 text-xs font-headline">
                <span className="material-symbols-outlined text-sm">error</span>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-headline">
                Correo Electrónico / Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  mail
                </span>
                <input
                  type="text"
                  required
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  placeholder="ej. admin@laargentina.org.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-headline">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <span className="text-xs">Ingresando...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span className="text-xs">Ingresar al Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 font-headline uppercase tracking-wider">
              Seguridad Certificada AES-256
            </span>
          </div>
        </div>

      </main>

      {/* Footer Inferior Oficial */}
      <footer className="w-full max-w-5xl mx-auto text-center pt-2 relative z-10">
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
