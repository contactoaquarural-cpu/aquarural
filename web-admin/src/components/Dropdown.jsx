import { useState, useRef, useEffect } from 'react';

// Dropdown propio (no <select> nativo) — el control del sistema operativo
// desentona con el resto del panel (tarjetas, botones y paneles custom con
// bordes redondeados y hover azul). Reemplaza cualquier <select> del panel
// con este mismo patrón: botón con el valor actual + flecha, panel flotante
// con las opciones como filas clicables, cierre al hacer clic fuera.
//
// options: [{ value, label, icon? }]
// compact: true reduce el padding vertical del botón (py-1.5 en vez de
// py-2.5) para alinear con controles más bajos de la misma fila, como los
// botones tipo pill de filtros (ver LecturasPage.jsx).
const Dropdown = ({ value, options, onChange, placeholder = 'Seleccionar', disabled, className = '', align = 'left', compact = false }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const actual = options.find((o) => o.value === value);

  useEffect(() => {
    const alClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', alClickFuera);
    return () => document.removeEventListener('mousedown', alClickFuera);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-headline font-bold rounded-2xl px-3 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          compact ? 'py-1.5' : 'py-2.5'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {actual?.icon && <span className="material-symbols-outlined text-base shrink-0">{actual.icon}</span>}
          <span className="truncate">{actual?.label ?? placeholder}</span>
        </span>
        <span className="material-symbols-outlined text-lg text-slate-400 shrink-0">
          {abierto ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {abierto && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 min-w-full w-max max-w-xs bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setAbierto(false);
                if (opt.value !== value) onChange(opt.value);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-blue-50 whitespace-nowrap ${
                opt.value === value ? 'bg-blue-50 text-[#1D4ED8]' : 'text-slate-600'
              }`}
            >
              {opt.icon && <span className="material-symbols-outlined text-base">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
