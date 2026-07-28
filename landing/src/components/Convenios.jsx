const Convenios = ({ convenios }) => {
  if (!convenios?.length) return null;

  return (
    <section id="convenios" className="section-pad max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-primary text-sm font-semibold uppercase tracking-widest">Beneficios</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Convenios exclusivos</h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">Como asociado accedes a descuentos y beneficios especiales en establecimientos aliados.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {convenios.map((c) => (
          <div key={c._id} className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary/40 transition-all">
            {c.logo && (
              <img src={c.logo} alt={c.nombre} className="h-12 object-contain mb-4" />
            )}
            <h3 className="text-base font-bold text-white mb-1">{c.nombre}</h3>
            {c.categoria && (
              <span className="text-xs text-primary font-semibold">{c.categoria}</span>
            )}
            <p className="text-sm text-gray-400 mt-2 line-clamp-3">{c.descripcion}</p>
            {c.descuento && (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-sm font-bold px-3 py-1.5 rounded-lg">
                🏷️ {c.descuento}% de descuento
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Convenios;
