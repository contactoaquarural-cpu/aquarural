import { useState } from 'react';

const Contacto = () => {
  const [nombre, setNombre] = useState('');
  const [acueducto, setAcueducto] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [celular, setCelular] = useState('');
  const [suscriptores, setSuscriptores] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);

    const msg = encodeURIComponent(
      `Hola! Soy ${nombre} del ${acueducto} (${municipio}). Tenemos aprox. ${suscriptores} suscriptores y me gustaría agendar una demo de AquaRural Pro. Celular: ${celular}`
    );
    window.open(`https://wa.me/573166160377?text=${msg}`, '_blank');
  };

  return (
    <section id="contacto" className="py-20 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Info Comercial Izquierda */}
          <div className="lg:col-span-6 space-y-6">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-4 py-1.5 rounded-full font-headline">
              Contacto Comercial B2B
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-headline leading-tight">
              ¿Listo para Digitalizar el Recaudo de tu Acueducto Veredal?
            </h2>

            <p className="text-slate-400 text-sm md:text-base font-body leading-relaxed">
              Déjanos los datos de tu comunidad o escríbenos directamente por WhatsApp. Te ayudamos a configurar tu acueducto e importar tu plantilla de Excel sin costo inicial.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">call</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-headline">Línea Directa & WhatsApp</p>
                  <p className="text-base font-bold text-slate-100 font-headline">+57 316 616 0377</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-headline">Correo Electrónico</p>
                  <p className="text-base font-bold text-slate-100 font-headline">contactoaquarural@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario Derecha */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-100 font-headline mb-4">Solicitar Demostración y Asesoria</h3>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1 font-headline">Tu Nombre</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Julián Trujillo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1 font-headline">Nombre del Acueducto</label>
                  <input
                    type="text"
                    required
                    value={acueducto}
                    onChange={(e) => setAcueducto(e.target.value)}
                    placeholder="ej. Acueducto La Argentina"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1 font-headline">Municipio / Departamento</label>
                  <input
                    type="text"
                    required
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="ej. Garzón, Huila"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1 font-headline">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="3166160377"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1 font-headline">N° Aproximado de Suscriptores</label>
                  <input
                    type="text"
                    required
                    value={suscriptores}
                    onChange={(e) => setSuscriptores(e.target.value)}
                    placeholder="ej. 150 usuarios"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                <span>Enviar y Agendar Demo por WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
