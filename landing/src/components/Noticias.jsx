const CATEGORIA_COLORS = {
  GOBIERNO:      'bg-blue-500/20 text-blue-400',
  SANIDAD:       'bg-red-500/20 text-red-400',
  PRECIOS:       'bg-yellow-500/20 text-yellow-400',
  EVENTO:        'bg-purple-500/20 text-purple-400',
  INSTITUCIONAL: 'bg-green-500/20 text-green-400',
};

const Noticias = ({ noticias }) => {
  if (!noticias?.length) return null;

  return (
    <section id="noticias" className="section-pad bg-dark-card border-y border-dark-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Actualidad</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Noticias del sector</h2>
          <p className="text-gray-400 mt-3">Información relevante para el ganadero colombiano.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {noticias.map((n) => (
            <article key={n._id} className="bg-dark border border-dark-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all">
              {n.imagen && (
                <img src={n.imagen} alt={n.titulo} className="w-full h-44 object-cover" />
              )}
              <div className="p-5">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${CATEGORIA_COLORS[n.categoria] || 'bg-gray-500/20 text-gray-400'}`}>
                  {n.categoria}
                </span>
                <h3 className="text-base font-bold text-white mt-3 mb-2 line-clamp-2">{n.titulo}</h3>
                <p className="text-sm text-gray-400 line-clamp-3">{n.contenido}</p>
                <p className="text-xs text-gray-600 mt-3">
                  {new Date(n.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Noticias;
