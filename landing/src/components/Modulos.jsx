// Bento asimétrico: las dos capacidades que más pesan en la decisión de
// compra (cobrar y facturar) van destacadas en grande; el resto entra
// como soporte más pequeño alrededor. Rompe la grilla de 6 cajas iguales.
const DESTACADAS = [
  {
    icon: 'payments',
    titulo: 'Recaudo Electrónico Wompi',
    desc: 'Tus usuarios pagan desde el celular por Nequi, Bancolombia, PSE o Tarjeta de Crédito — sin ir a la oficina del acueducto.',
  },
  {
    icon: 'bolt',
    titulo: 'Facturación Masiva en 1-Clic',
    desc: 'Genera las cuentas de cobro del mes para todos los suscriptores activos en cuestión de segundos, no de días.',
  },
];

const SECUNDARIAS = [
  {
    icon: 'upload_file',
    titulo: 'Carga Masiva desde Excel',
    desc: 'Importa tu padrón oficial sin digitar fila por fila.',
  },
  {
    icon: 'location_on',
    titulo: 'Mapa GPS de Predios',
    desc: 'Estado moratorio de cada acometida, en el mapa.',
  },
  {
    icon: 'smartphone',
    titulo: 'App Móvil',
    desc: 'Saldo, pagos y avisos push para el suscriptor.',
  },
  {
    icon: 'verified_user',
    titulo: 'Seguridad Multi-Inquilino',
    desc: 'Llaves de recaudo cifradas y aisladas por acueducto.',
  },
];

const Modulos = () => {
  return (
    <section id="caracteristicas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-headline">
            Diseñado Exclusivamente para la Realidad del Campo Colombiano
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-body">
            Una suite completa de herramientas pensadas para simplificar el trabajo de las Juntas Administradoras de Agua Veredales.
          </p>
        </div>

        {/* Destacadas — las dos que más importan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {DESTACADAS.map((m, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-trust/50 transition-colors duration-200 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-tint-blue flex items-center justify-center text-trust mb-5 group-hover:bg-trust group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{m.icon}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-headline mb-2">
                {m.titulo}
              </h3>
              <p className="text-slate-500 text-sm font-body leading-relaxed max-w-md">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Secundarias — soporte, más compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SECUNDARIAS.map((m, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-trust/50 transition-colors duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-trust mb-3 group-hover:bg-tint-blue transition-colors">
                <span className="material-symbols-outlined text-xl">{m.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-headline mb-1">
                {m.titulo}
              </h3>
              <p className="text-slate-500 text-xs font-body leading-relaxed">
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
