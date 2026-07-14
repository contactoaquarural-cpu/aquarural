import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.service';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (password !== password2) return setError('Las contraseñas no coinciden.');
    setLoading(true);
    try {
      await api.post(`/auth/reset/${token}`, { passwordNuevo: password });
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace expiró o es inválido. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-low rounded-3xl p-10">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_reset
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface font-headline text-center">
            Nueva contraseña
          </h1>
          <p className="text-on-surface-variant text-sm text-center mt-1">
            Ingresa tu nueva contraseña para continuar.
          </p>
        </div>

        {exito ? (
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-primary text-5xl block" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="text-on-surface font-medium">¡Contraseña actualizada exitosamente!</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 btn-cta font-bold rounded-xl transition-all"
            >
              Ir al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error-container/20 border border-error/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-lg">error</span>
                <p className="text-error text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-primary ml-1">Nueva contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-surface-container border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-outline-variant"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-primary ml-1">Confirmar contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-outline-variant"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 btn-cta font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-headline"
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> Guardando...</>
              ) : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
