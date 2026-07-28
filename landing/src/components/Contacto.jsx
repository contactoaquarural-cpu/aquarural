import { useState } from 'react';

const Contacto = ({ config }) => {
  const telefono  = config?.telefonoContacto || '';
  const nombre    = config?.nombreAsociacion || 'la asociación';
  const municipio = config?.municipio || '';

  const [form, setForm]       = useState({ nombre: '', cedula: '', telefono: '', finca: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!telefono) return;
    setSending(true);

    const texto = encodeURIComponent(
      `*Solicitud de membresía — ${nombre}*\n\n` +
      `👤 Nombre: ${form.nombre}\n` +
      `🪪 Cédula: ${form.cedula}\n` +
      `📞 Teléfono: ${form.telefono}\n` +
      `🌾 Finca: ${form.finca}\n` +
      `💬 Mensaje: ${form.mensaje || 'Sin mensaje adicional'}`
    );

    const numero = telefono.replace(/\D/g, '');
    window.open(`https://wa.me/57${numero}?text=${texto}`, '_blank');
    setEnviado(true);
    setSending(false);
  };

  return (
    <section id="contacto" className="section-pad bg-dark-card border-t border-dark-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Únete</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Quiero asociarme</h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Completa el formulario y te contactaremos para iniciar tu proceso de vinculación
            {municipio ? ` a ${nombre}` : ''}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info de contacto */}
          <div className="space-y-6">
            <div className="bg-dark border border-dark-border rounded-2xl p-6 space-y-5">
              <h3 className="text-base font-bold text-white">Información de contacto</h3>

              {telefono && (
                <>
                  <a href={`tel:${telefono}`}
                    className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                      📞
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Llámanos</p>
                      <p className="font-semibold">{telefono}</p>
                    </div>
                  </a>

                  <a href={`https://wa.me/57${telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                      💬
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="font-semibold">{telefono}</p>
                    </div>
                  </a>
                </>
              )}

              {municipio && (
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    📍
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="font-semibold">{municipio}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5">
              <p className="text-sm text-primary font-semibold mb-1">¿Ya eres asociado?</p>
              <p className="text-sm text-gray-400">Descarga la app móvil y gestiona tu membresía desde tu celular.</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-dark border border-dark-border rounded-2xl p-6">
            {enviado ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-white mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-400 text-sm">Te redirigimos a WhatsApp. Pronto te contactaremos.</p>
                <button onClick={() => setEnviado(false)}
                  className="mt-6 text-sm text-primary hover:underline">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre completo *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required
                      placeholder="Juan Pérez"
                      className="mt-1 w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cédula *</label>
                    <input name="cedula" value={form.cedula} onChange={handleChange} required
                      placeholder="12345678"
                      className="mt-1 w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Teléfono *</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} required
                    placeholder="300 123 4567"
                    className="mt-1 w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre de la finca</label>
                  <input name="finca" value={form.finca} onChange={handleChange}
                    placeholder="El Paraíso"
                    className="mt-1 w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mensaje (opcional)</label>
                  <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={3}
                    placeholder="Cuéntanos un poco sobre tu finca..."
                    className="mt-1 w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-colors resize-none" />
                </div>

                <button type="submit" disabled={sending}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  💬 Enviar por WhatsApp
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Al enviar, serás redirigido a WhatsApp con tu información prellenada.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
