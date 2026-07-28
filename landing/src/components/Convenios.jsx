const TIPO_CONFIG = {
  AGROPECUARIO: { icon: '🌾', label: 'Agropecuario',  color: 'text-primary',      bg: 'bg-primary/10 border-primary/30' },
  VETERINARIA:  { icon: '🐾', label: 'Veterinaria',   color: 'text-amber-400',    bg: 'bg-amber-400/10 border-amber-400/30' },
  INSUMOS:      { icon: '🧪', label: 'Insumos',       color: 'text-sky-400',      bg: 'bg-sky-400/10 border-sky-400/30' },
  OTRO:         { icon: '🤝', label: 'Otro',          color: 'text-gray-400',     bg: 'bg-gray-400/10 border-gray-400/30' },
};

const Convenios = ({ convenios }) => {
  if (!convenios?.length) return (
    <section id="convenios" className="section-pad max-w-7xl mx-auto">
      <div className="text-center">
        <span className="text-primary text-sm font-semibold uppercase tracking-widest">Beneficios</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Convenios exclusivos</h2>
        <p className="text-gray-500 mt-6">Próximamente convenios disponibles para asociados.</p>
      </div>
    </section>
  );

  return (
    <section id="convenios" className="section-pad max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-primary text-sm font-semibold uppercase tracking-widest">Beneficios</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Convenios exclusivos</h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">Como asociado accedes a descuentos y beneficios especiales en establecimientos aliados.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {convenios.map((c) => {
          const cfg = TIPO_CONFIG[c.tipo] || TIPO_CONFIG.OTRO;
          return (
            <div key={c._id} className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary/40 transition-all flex flex-col gap-3">
              {/* Header: icono + badges */}
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${cfg.bg}`}>
                  {cfg.icon}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {c.descuentoPorcentaje > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                      🏷️ {c.descuentoPorcentaje}% dto.
                    </span>
                  )}
                </div>
              </div>

              {/* Nombre */}
              <h3 className="text-base font-bold text-white">{c.nombre}</h3>

              {/* Descripción */}
              {c.descripcion && (
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{c.descripcion}</p>
              )}

              {/* Contacto */}
              {(c.telefono || c.direccion) && (
                <div className="border-t border-dark-border pt-3 mt-auto flex flex-col gap-1.5">
                  {c.telefono && (
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      📞 <span>{c.telefono}</span>
                    </span>
                  )}
                  {c.direccion && (
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      📍 <span className="line-clamp-1">{c.direccion}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Convenios;
