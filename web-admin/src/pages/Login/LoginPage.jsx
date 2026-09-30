import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';
import api from '../../services/api.service';

const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'tu acueducto');
  const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:5174';

  // Imagen del panel derecho, gestionable desde SuperAdmin > Apariencia de la
  // Plataforma. Si no hay ninguna configurada todavía, se usa la de por defecto
  // empaquetada en public/img/.
  const [imagenLogin, setImagenLogin] = useState('/img/login-agua.jpg');
  useEffect(() => {
    api.get('/superadmin/configuracion-global')
      .then(({ data }) => {
        if (data?.data?.loginImagenUrl) setImagenLogin(data.data.loginImagenUrl);
      })
      .catch(() => {});
  }, []);

  const user = useAuthStore((s) => s.user);
  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.correo === 'contactoaquarural@gmail.com';

  const [form, setForm] = useState({ cedula: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={esSuperAdmin ? "/superadmin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cedulaClean = form.cedula.trim();
    const passClean = form.password.trim();

    if (!cedulaClean || !passClean) {
      setError('Completa correo/cédula y contraseña para continuar.');
      return;
    }

    setLoading(true);

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

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row p-4 gap-4">
      {/* Panel Izquierdo — Formulario, siempre claro */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-slate-500 text-sm font-body">
              Ingresa tus datos para acceder al panel de {nombreAcueducto}.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-red-600 text-xs font-headline">
              <span className="material-symbols-outlined text-base">error</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-headline">
                Correo electrónico o cédula
              </label>
              <input
                type="text"
                autoComplete="username"
                value={form.cedula}
                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                placeholder="tu@correo.com"
                className="aq-input w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all font-body"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-headline">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="aq-input w-full bg-white border border-slate-200 rounded-xl pr-11 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="w-full bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-3 pt-2">
            <p className="text-[11px] text-slate-400 font-body">
              Conexión cifrada · Acceso restringido a personal autorizado
            </p>
            <a
              href={landingUrl}
              className="text-xs text-slate-500 hover:text-slate-700 font-headline font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver al sitio principal
            </a>
          </div>
        </div>
      </div>

      {/* Panel Derecho — Foto real + overlay, oculto en móvil */}
      <div className="hidden lg:block flex-1 relative rounded-3xl overflow-hidden">
        <img
          src={imagenLogin}
          alt="Agua en calma — el recurso que administra cada acueducto veredal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Tinte parejo + velo inferior. Usamos style inline (no clases
            bg-slate-950/text-white) porque este panel es siempre oscuro,
            independiente del tema del panel admin: las reglas globales
            html.light de index.css reescriben esas clases exactas y
            "aclaraban" la foto y volvían el texto ilegible. */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(2, 6, 23, 0.25)' }} />
        <div
          className="absolute inset-x-0 bottom-0 h-[60%]"
          style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.95), rgba(2,6,23,0.6), transparent)' }}
        />

        <div className="relative z-10 h-full flex flex-col justify-between p-10">
          <a
            href={landingUrl}
            className="text-lg font-extrabold font-headline tracking-tight hover:opacity-80 transition-opacity w-fit"
          >
            <span style={{ color: '#ffffff' }}>Aqua</span>
            <span style={{ color: '#1D4ED8' }}>Rural</span>
          </a>

          <div className="space-y-3 max-w-md">
            <h2 className="text-3xl font-extrabold font-headline tracking-tight leading-tight" style={{ color: '#ffffff' }}>
              Gestión y recaudo digital para tu acueducto veredal
            </h2>
            <p className="text-sm font-body leading-relaxed" style={{ color: '#e2e8f0' }}>
              Accede a tu panel para gestionar suscriptores, facturación y recaudo — todo en un solo lugar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
