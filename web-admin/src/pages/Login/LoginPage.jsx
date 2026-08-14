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
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid de 2 Contenedores Perfectamente Nivelados y Simétricos */}
      <main className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch relative z-10">

        {/* Contenedor Izquierdo — Marca & Logo Oficial */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between items-center text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-cyan-400 font-semibold text-xs tracking-wide font-headline">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Gestión y Recaudo Digital
          </div>

          {/* Logo Oficial Amplio */}
          <div className="w-full my-auto py-4 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
              className="w-full max-w-sm h-auto object-contain rounded-2xl drop-shadow-2xl"
            />
          </div>

          {/* Bottom Stats */}
          <div className="w-full pt-4 border-t border-slate-800/80 flex justify-around text-center">
            <div>
              <p className="text-cyan-400 font-extrabold text-sm font-headline">Garzón, Huila</p>
              <p className="text-slate-400 text-[11px] font-body">Colombia</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-emerald-400 font-extrabold text-sm font-headline">100% Digital</p>
              <p className="text-slate-400 text-[11px] font-body">Recaudo por Wompi</p>
            </div>
          </div>
        </div>

        {/* Contenedor Derecho — Formulario de Login Nivelado */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div className="mb-6">
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
              Accede al panel de administración de {nombreAcueducto}.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 my-auto">
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

          <p className="text-[11px] text-slate-500 text-center mt-6 pt-4 border-t border-slate-800/80 font-body">
            • SEGURIDAD CERTIFICADA • METADEVELOPMENT LTD
          </p>
        </div>

      </main>
    </div>
  );
};

export default LoginPage;
