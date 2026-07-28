const Precios = ({ precios }) => {
  if (!precios?.length) return null;

  const ultimo = precios[0];

  return (
    <section className="section-pad bg-dark-card border-y border-dark-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Mercado</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Precios del ganado</h2>
          <p className="text-gray-400 mt-3">
            Actualizado el {new Date(ultimo.fecha || ultimo.updatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ultimo.productos?.map((p) => (
            <div key={p.nombre} className="bg-dark border border-dark-border rounded-2xl p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{p.nombre}</p>
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
