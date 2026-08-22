const MODULOS_AQUARURAL = [
  {
    icon: 'bolt',
    titulo: 'Facturación Masiva en 1-Clic',
    desc: 'Genera las cuentas de cobro del mes para todos los suscriptores activos en cuestión de segundos.',
  },
  {
    icon: 'payments',
    titulo: 'Recaudo Electrónico Wompi',
    desc: 'Tus usuarios pagan desde el celular por Nequi, Bancolombia, PSE o Tarjeta de Crédito.',
  },
  {
    icon: 'upload_file',
    titulo: 'Carga Masiva desde Excel (.xlsx)',
    desc: 'Importa tu padrón oficial de usuarios desde plantillas de Excel sin digitar fila por fila.',
  },
  {
    icon: 'location_on',
    titulo: 'Mapa GPS de Predios & Viviendas',
    desc: 'Visualización satelital de cada acometida de agua con estado moratorio en tiempo real.',
  },
  {
    icon: 'smartphone',
    titulo: 'App Móvil',
    desc: 'App para suscriptores con consulta de saldo, pagos en línea, avisos push y respuestas a convocatorias.',
  },
  {
    icon: 'verified_user',
    titulo: 'Seguridad Multi-Inquilino & Cifrado',
    desc: 'Cada acueducto administra sus llaves de recaudo cifradas de forma completamente aislada.',
  },
];

const Modulos = () => {
  return (
    <section id="caracteristicas" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-4 py-1.5 rounded-full font-headline">
            Tecnología Hydro-Tech
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-headline">
            Diseñado Exclusivamente para la Realidad del Campo Colombiano
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-body">
            Una suite completa de herramientas pensadas para simplificar el trabajo de las Juntas Administradoras de Agua Veredales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MODULOS_AQUARURAL.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{m.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-headline group-hover:text-cyan-300 transition-colors">
                {m.titulo}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm font-body leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modulos;
