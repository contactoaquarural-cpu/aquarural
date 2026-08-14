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
      const { data } = await api.post('/auth/login', form);
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
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between p-6 md:p-10 relative overflow-hidden font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Hydro-Tech Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Superior — Branding & Headline */}
      <header className="w-full max-w-6xl mx-auto space-y-3 relative z-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-cyan-400 font-semibold text-xs tracking-wide font-headline">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Gestión y Recaudo Digital para Acueductos Veredales
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-100 leading-tight font-headline tracking-tight">
          El futuro de la{' '}
          <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            gestión del agua rural.
          </span>
        </h1>

        <p className="text-slate-400 text-xs md:text-sm font-body max-w-2xl">
          Plataforma centralizada para facturación masiva en 1-clic, cobranza electrónica por Wompi (Nequi, PSE) y geolocalización GPS de predios.
        </p>
      </header>

      {/* Main Grid — 2 Contenedores Perfecamente Nivelados Lado a Lado */}
      <main className="w-full max-w-6xl mx-auto my-8 grid md:grid-cols-2 gap-8 items-stretch relative z-10">

        {/* Contenedor 1 (Izquierdo): Tarjeta de Marca con Logo Oficial */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between items-center hover:border-cyan-500/30 transition-all duration-300 group">
          <div className="w-full my-auto flex items-center justify-center p-2">
            <img
              src="/logo.png"
              alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
              className="w-full max-w-md h-auto object-contain rounded-2xl drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* Stats Bar Inferior del Contenedor 1 */}
          <div className="w-full pt-4 border-t border-slate-800/80 flex justify-around text-center">
            <div>
              <p className="text-cyan-400 font-extrabold text-sm font-headline">Garzón, Huila</p>
              <p className="text-slate-400 text-[11px] font-body">Colombia 🇨🇴</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-emerald-400 font-extrabold text-sm font-headline">100% Digital</p>
              <p className="text-slate-400 text-[11px] font-body">Recaudo por Wompi</p>
            </div>
          </div>
        </div>

        {/* Contenedor 2 (Derecho): Formulario de Login Nivelado */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4 md:hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 p-2 flex items-center justify-center">
                <img src="/favicon.svg" alt="AquaRural" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold font-headline text-slate-100">AquaRural Pro</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight font-headline">
              Iniciar Sesión
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-body">
              Accede al panel administrativo de <span className="text-cyan-400 font-semibold">{nombreAcueducto}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 my-auto py-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 text-red-400 text-xs font-headline">
                <span className="material-symbols-outlined text-base">error</span>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 font-headline">
                Cédula / Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  placeholder="Ej. 12203639"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 font-headline">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Ingresando...</span>
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
              Seguridad Certificada AES-256
            </span>
          </div>
        </div>

      </main>

      {/* Footer Inferior Oficial */}
      <footer className="w-full max-w-6xl mx-auto text-center pt-4 relative z-10">
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
