const modulos = [
  { icon: '📱', titulo: 'App Móvil',         desc: 'Accede a todos los servicios desde tu celular. Disponible para iOS y Android.' },
  { icon: '💳', titulo: 'Carné QR Digital',  desc: 'Tu carné de asociado siempre disponible con código QR verificable.' },
  { icon: '💰', titulo: 'Pagos en Línea',    desc: 'Paga tus aportes mensuales con PSE, tarjeta de crédito o Nequi.' },
  { icon: '🤝', titulo: 'Convenios',         desc: 'Accede a descuentos exclusivos en veterinarias, agropecuarios y más.' },
  { icon: '📰', titulo: 'Noticias',          desc: 'Mantente informado sobre precios, sanidad animal y eventos del sector.' },
  { icon: '📺', titulo: 'Ganadero TV',       desc: 'Videos educativos y series sobre buenas prácticas ganaderas.' },
  { icon: '🐄', titulo: 'Mercado Ganadero',  desc: 'Publica y encuentra avisos de compraventa de ganado, fincas e insumos.' },
  { icon: '🔔', titulo: 'Notificaciones',    desc: 'Recibe alertas automáticas sobre pagos, noticias y aprobaciones.' },
];

const Modulos = () => (
  <section id="modulos" className="section-pad max-w-7xl mx-auto">
    <div className="text-center mb-14">
      <span className="text-primary text-sm font-semibold uppercase tracking-widest">Funcionalidades</span>
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Todo lo que necesitas en un solo lugar</h2>
      <p className="text-gray-400 mt-3 max-w-xl mx-auto">Una plataforma completa diseñada para modernizar la gestión de tu asociación ganadera.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {modulos.map((m) => (
        <div key={m.titulo} className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary/50 transition-all group">
          <div className="text-3xl mb-4">{m.icon}</div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">{m.titulo}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Modulos;
