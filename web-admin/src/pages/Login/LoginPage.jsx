import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';
import { useTheme } from '../../utils/ThemeContext';
import api from '../../services/api.service';

const LoginPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');

  const user = useAuthStore((s) => s.user);
  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.correo === 'contactoaquarural@gmail.com';

  const [form, setForm] = useState({ cedula: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para recuperación de contraseña
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [correoRecuperar, setCorreoRecuperar] = useState('');
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);
  const [msgRecuperar, setMsgRecuperar] = useState('');
  const [errorRecuperar, setErrorRecuperar] = useState('');

  if (isAuthenticated) {
    return <Navigate to={esSuperAdmin ? "/superadmin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cedulaClean = form.cedula.trim();
    const passClean = form.password.trim();

    // Autenticación 100% real contra el backend (incluye SUPERADMIN, sembrado
    // vía `npm run seed:superadmin` — ya no existe bypass del lado del cliente).
    try {
      const res = await api.post('/auth/login', {
        cedula: cedulaClean,
        email: cedulaClean,
        correo: cedulaClean,
        password: passClean,
      });

      const data = res?.data;
      if (data && (data.success || data.ok)) {
        const usuario = data.data?.usuario || data.data?.asociado || data.data?.user || data.usuario;
        const accessToken = data.data?.accessToken || data.accessToken || 'token_session';
        const refreshToken = data.data?.refreshToken || data.refreshToken || 'token_refresh';
        
        localStorage.removeItem('aquarural-acueductos-saas-v1');
        localStorage.removeItem('aquarural-config-form-v1');
        localStorage.removeItem('aquarural-config');
        login(usuario, accessToken, refreshToken);

        // Cargar inmediatamente la configuración real del acueducto autenticado
        try {
          useConfigStore.getState().resetConfig();
          await useConfigStore.getState().cargarConfig();
        } catch (e) {}

        setLoading(false);
        navigate(usuario.rol === 'SUPERADMIN' ? '/superadmin' : '/dashboard');
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.mensaje || 'Cédula o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarPassword = async (e) => {
    e.preventDefault();
    setErrorRecuperar('');
    setMsgRecuperar('');
    setLoadingRecuperar(true);
    try {
      const { data } = await api.post('/auth/recuperar', { correo: correoRecuperar });
      setMsgRecuperar(data.message || 'Si el correo está registrado, recibirás un enlace de recuperación.');
    } catch (err) {
      setErrorRecuperar(err.response?.data?.message || 'Error al procesar la solicitud de recuperación.');
    } finally {
      setLoadingRecuperar(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between items-center p-6 relative overflow-hidden font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Ambient Hydro-Tech Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Spacing top */}
      <div className="pt-4" />

      {/* Main Centered Login Card — Ultra-Clean, Compact & Perfectly Proportionate */}
      <main className="w-full max-w-[420px] mx-auto my-auto relative z-10">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-4">

          {/* Logo Oficial Compacto (Aumentado 20% adicional) */}
          <div className="flex flex-col items-center justify-center text-center pb-1">
            <img
              src={isDark ? '/logo.png' : '/logo-light.png'}
              alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
              className="h-[106px] sm:h-[122px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(6,182,212,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="border-t border-slate-800/80 pt-3 text-center">
            <h2 className="text-base font-extrabold text-slate-100 font-headline tracking-tight">
              Acceso Administrativo
            </h2>
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
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecuperar(true);
                    setErrorRecuperar('');
                    setMsgRecuperar('');
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-headline font-semibold transition-colors"
                >
                  ¿Olvidaste tu contraseña?
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

      {/* Modal de Recuperar Contraseña */}
      {showRecuperar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">lock_reset</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">
                  Recuperar Contraseña
                </h3>
              </div>
              <button
                onClick={() => setShowRecuperar(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-body">
              Ingresa el correo electrónico asociado a tu cuenta de administración. Te enviaremos un enlace seguro para restablecer tu contraseña.
            </p>

            {errorRecuperar && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-center gap-2 text-red-400 text-xs font-headline">
                <span className="material-symbols-outlined text-base">error</span>
                <p>{errorRecuperar}</p>
              </div>
            )}

            {msgRecuperar ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-4 text-center space-y-3">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                <p className="text-xs font-headline text-emerald-300">{msgRecuperar}</p>
                <button
                  onClick={() => setShowRecuperar(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold font-headline py-2.5 rounded-xl transition-all mt-2"
                >
                  Volver al Inicio de Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecuperarPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block font-headline">
                    Correo Electrónico Registrado
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-slate-500 text-sm">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={correoRecuperar}
                      onChange={(e) => setCorreoRecuperar(e.target.value)}
                      placeholder="admin@tuacueducto.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecuperar(false)}
                    className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3 rounded-2xl text-xs transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingRecuperar}
                    className="w-1/2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-cyan-500/20 text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {loadingRecuperar ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        <span>Enviar Enlace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
