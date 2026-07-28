const CATEGORIA_LABEL = {
  GANADO_CARNE:  'Carne',
  GANADO_LECHE:  'Leche',
  INSUMOS:       'Insumos',
};

const Precios = ({ precios }) => {
  if (!precios?.length) return null;

  // El backend devuelve array plano: [{ producto, precio, unidad, categoria, updatedAt }]
  const masReciente = precios.reduce((a, b) =>
    new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
  );

  return (
    <section id="precios" className="section-pad bg-dark-card border-y border-dark-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Mercado</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Precios del ganado</h2>
          <p className="text-gray-400 mt-3">
            Actualizado el {new Date(masReciente.updatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {precios.map((p) => (
            <div key={p._id} className="bg-dark border border-dark-border rounded-2xl p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {CATEGORIA_LABEL[p.categoria] || p.categoria}
              </p>
              <p className="text-sm font-semibold text-white mb-2">{p.producto}</p>
              <p className="text-2xl font-extrabold text-primary">
                ${Number(p.precio).toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-500 mt-1">COP / {p.unidad || 'kg'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Precios;
