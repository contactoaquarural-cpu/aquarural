import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';
import api from '../../services/api.service';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const nombreAsociacion = useConfigStore((s) => s.nombreAsociacion);

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
      if (!data.data.asociado.esAdmin) {
        setError('No tienes permisos de administrador.');
        return;
      }
      login(data.data.asociado, data.data.accessToken, data.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background h-screen flex flex-col overflow-hidden">
      <main className="w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full py-8">

        {/* Columna izquierda — Editorial */}
        <div className="hidden md:flex flex-col h-full py-4 relative overflow-hidden">
          <div className="absolute -top-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            {/* Badge */}
            <div className="inline-flex self-start items-center gap-2 px-4 py-2 bg-secondary-container rounded-full text-on-secondary-container font-medium text-sm tracking-wide mb-6">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
              Gestión Segura
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold text-primary leading-[1.1] tracking-tighter font-headline mb-6">
              El futuro de la <br />
              <span className="text-on-primary-container">ganadería digital.</span>
            </h1>

            {/* Logo central */}
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden bg-surface-container-low mb-6">
              <img src="/logo.png" alt="GanaderoPro" className="w-full h-full object-contain p-8" />
            </div>

            {/* Stats */}
            <div className="flex gap-10">
              <div>
                <p className="text-primary font-extrabold text-2xl font-headline">Garzón</p>
                <p className="text-on-surface-variant text-sm font-medium">Huila, Colombia</p>
              </div>
              <div>
                <p className="text-primary font-extrabold text-2xl font-headline">100%</p>
                <p className="text-on-surface-variant text-sm font-medium">Digital</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha — Login */}
        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-md p-8 md:p-0">

            {/* Brand */}
            <div className="flex flex-col items-center md:items-start mb-12">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2 font-headline">
                  Plataforma Digital Ganadera
                </h2>
                <p className="text-on-surface-variant font-medium">
                  Bienvenido al panel administrativo de {nombreAsociacion}.
                </p>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-container/20 border border-error/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-lg">error</span>
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-primary ml-1" htmlFor="cedula">
                  Cédula
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                    person
                  </span>
                  <input
                    id="cedula"
                    type="text"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    placeholder="Ej: 000000001"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-surface-container transition-all text-on-surface placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-primary" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs font-semibold text-on-primary-container hover:text-primary transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-surface-container transition-all text-on-surface placeholder:text-outline-variant"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed font-headline"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Ingresando...
                    </>
                  ) : (
                    <span>Ingresar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-6 text-center w-full pointer-events-none opacity-40">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          {nombreAsociacion} • Seguridad Certificada • MetaDevelopment Ltd
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
