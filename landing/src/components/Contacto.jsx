import { useState } from 'react';

const Contacto = () => {
  const [nombre, setNombre] = useState('');
  const [acueducto, setAcueducto] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [celular, setCelular] = useState('');
  const [suscriptores, setSuscriptores] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [popupBloqueado, setPopupBloqueado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const msg = encodeURIComponent(
      `Hola! Soy ${nombre} del ${acueducto} (${municipio}). Tenemos aprox. ${suscriptores} suscriptores y me gustaría agendar una demo de AquaRural Pro. Celular: ${celular}`
    );
    const url = `https://wa.me/573166160377?text=${msg}`;
    const ventana = window.open(url, '_blank');

    setWhatsappUrl(url);
    setEnviado(true);
    // El navegador puede bloquear el popup (frecuente en móvil): si ocurre,
    // window.open devuelve null o una referencia ya cerrada, y sin este
    // chequeo el usuario no tiene ninguna señal de que algo falló.
    setPopupBloqueado(!ventana || ventana.closed);
  };

  return (
    <section id="contacto" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Info Comercial Izquierda */}
          <div className="lg:col-span-6 space-y-6">
            <span className="bg-tint-blue text-trust border border-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full font-headline">
              Contacto Comercial B2B
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-headline leading-tight">
              ¿Listo para Digitalizar el Recaudo de tu Acueducto Veredal?
            </h2>

            <p className="text-slate-500 text-sm md:text-base font-body leading-relaxed">
              Déjanos los datos de tu comunidad o escríbenos directamente por WhatsApp. Te ayudamos a configurar tu acueducto e importar tu plantilla de Excel sin costo inicial.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-tint-blue text-trust flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">call</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-headline">Línea Directa & WhatsApp</p>
                  <p className="text-base font-bold text-slate-900 font-headline">+57 316 616 0377</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-tint-mint text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-headline">Correo Electrónico</p>
                  <p className="text-base font-bold text-slate-900 font-headline">contactoaquarural@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario Derecha */}
          <div className="lg:col-span-6">
            {enviado ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-xl bg-tint-mint text-emerald-600 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">
                    {popupBloqueado ? 'error' : 'check_circle'}
                  </span>
                </div>
                {popupBloqueado ? (
                  <>
                    <h3 className="text-lg font-bold text-slate-900 font-headline">
                      Tu navegador bloqueó la ventana de WhatsApp
                    </h3>
                    <p className="text-slate-500 text-sm font-body">
                      No perdiste tus datos. Toca el botón para abrir la conversación manualmente.
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold font-headline py-3.5 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">open_in_new</span>
                      <span>Abrir WhatsApp manualmente</span>
                    </a>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-900 font-headline">
                      ¡Listo, {nombre || 'gracias'}!
                    </h3>
                    <p className="text-slate-500 text-sm font-body">
                      Abrimos WhatsApp con tu mensaje para {acueducto || 'tu acueducto'}. Si no ves la ventana, revisa si tu navegador la bloqueó, o escríbenos directo al{' '}
                      <span className="text-slate-900 font-semibold">+57 316 616 0377</span>.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setEnviado(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-headline font-semibold underline transition-colors"
                >
                  Volver a editar mis datos
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 font-headline mb-4">Solicitar Demostración y Asesoria</h3>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1 font-headline">Tu Nombre</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Julián Trujillo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-trust focus:ring-1 focus:ring-trust"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1 font-headline">Nombre del Acueducto</label>
                  <input
                    type="text"
                    required
                    value={acueducto}
                    onChange={(e) => setAcueducto(e.target.value)}
                    placeholder="ej. Acueducto La Argentina"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-trust focus:ring-1 focus:ring-trust"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1 font-headline">Municipio / Departamento</label>
                  <input
                    type="text"
                    required
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="ej. Garzón, Huila"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-trust focus:ring-1 focus:ring-trust"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1 font-headline">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="3166160377"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-trust focus:ring-1 focus:ring-trust"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1 font-headline">N° Aproximado de Suscriptores</label>
                  <input
                    type="text"
                    required
                    value={suscriptores}
                    onChange={(e) => setSuscriptores(e.target.value)}
                    placeholder="ej. 150 usuarios"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-trust focus:ring-1 focus:ring-trust"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-trust hover:bg-trust-dark text-white font-extrabold font-headline py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                <span>Enviar y Agendar Demo por WhatsApp</span>
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
