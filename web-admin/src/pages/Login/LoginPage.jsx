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

      <main className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">

        {/* Columna izquierda — Branding Hydro-Tech */}
        <div className="hidden md:flex flex-col space-y-6">
          <div className="inline-flex self-start items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-cyan-400 font-semibold text-xs tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Gestión y Recaudo Digital
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-100 leading-tight font-headline tracking-tight">
            El futuro de la <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              gestión del agua rural.
            </span>
          </h1>

          <p className="text-slate-400 text-sm font-body leading-relaxed max-w-md">
            Plataforma centralizada para facturación masiva, cobranza electrónica con Wompi y geolocalización de suscriptores veredales.
          </p>

          {/* Tarjeta de Marca Oficial con Eslogan */}
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-900/90 p-2 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl group hover:border-cyan-500/50 transition-all">
            <img
              src="/logo.png"
              alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>

          {/* Stats Badges */}
          <div className="flex gap-8 pt-2">
            <div>
              <p className="text-cyan-400 font-extrabold text-xl font-headline">Garzón</p>
              <p className="text-slate-400 text-xs font-body">Huila, Colombia</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-emerald-400 font-extrabold text-xl font-headline">100%</p>
              <p className="text-slate-400 text-xs font-body">Recaudo Digital</p>
            </div>
          </div>
        </div>

        {/* Columna derecha — Formulario Login */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-4 md:hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">water_drop</span>
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

          <form onSubmit={handleSubmit} className="space-y-5">
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

          <p className="text-[11px] text-slate-500 text-center mt-6 font-body">
            • SEGURIDAD CERTIFICADA • METADEVELOPMENT LTD
          </p>
        </div>

      </main>
    </div>
  );
};

export default LoginPage;
