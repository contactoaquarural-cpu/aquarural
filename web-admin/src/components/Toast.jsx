import { useEffect } from 'react';

const VARIANTES = {
  exito: {
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#047857',
    icon: 'check_circle',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#dc2626',
    icon: 'error',
  },
};

// Notificación flotante que se autodescarta — para confirmar el resultado de
// una acción puntual (guardar, eliminar, activar/desactivar) sin empujar el
// contenido de la página ni requerir que el usuario la cierre manualmente.
const Toast = ({ mensaje, tipo = 'exito', onClose, duracionMs = 4000 }) => {
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(onClose, duracionMs);
    return () => clearTimeout(timer);
  }, [mensaje, onClose, duracionMs]);

  if (!mensaje) return null;
  const v = VARIANTES[tipo] || VARIANTES.exito;

  return (
    <div
      className="fixed top-20 right-6 z-[100] animate-fade-in"
      style={{ maxWidth: '380px' }}
    >
      <div
        style={{ backgroundColor: v.bg, borderColor: v.border, color: v.text }}
        className="border rounded-2xl px-4 py-3 shadow-lg flex items-start gap-3"
      >
        <span className="material-symbols-outlined text-xl shrink-0">{v.icon}</span>
        <p className="text-xs font-headline font-semibold flex-1">{mensaje}</p>
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
