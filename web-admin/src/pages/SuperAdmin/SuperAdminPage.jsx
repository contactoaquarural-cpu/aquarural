import { useState } from 'react';

const SuperAdminPage = () => {
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);

  const acueductos = [
    {
      id: '1',
      nombre: 'Acueducto Veredal La Argentina',
      nit: '891100234-5',
      municipio: 'Garzón, Huila',
      planSaaS: 'ESTANDAR',
      costoMensualSaaS: 80000,
      suscriptores: 150,
      estado: 'ACTIVO',
    },
    {
      id: '2',
      nombre: 'Acueducto Comunitario El Agrado',
      nit: '891100555-8',
      municipio: 'El Agrado, Huila',
      planSaaS: 'BASICO',
      costoMensualSaaS: 50000,
      suscriptores: 85,
      estado: 'ACTIVO',
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header SaaS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold px-3 py-1 rounded-full font-headline">
              Plataforma SaaS AquaRural
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-headline">Gestión Multi-Acueductos Veredales</h1>
          <p className="text-slate-400 text-sm font-body">
            Control de organizaciones comunitarias afiliadas, planes SaaS y llaves de recaudo cifradas Wompi.
          </p>
        </div>

        <button
          onClick={() => setMostrarModalNuevo(true)}
          className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 px-5 py-2.5 rounded-2xl font-headline font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add_business</span>
          <span>Registrar Nuevo Acueducto</span>
        </button>
      </div>

      {/* Tabla Acueductos */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-headline uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Acueducto Veredal</th>
                <th className="py-4 px-4">NIT</th>
                <th className="py-4 px-4">Municipio / Dpto</th>
                <th className="py-4 px-4">Plan SaaS</th>
                <th className="py-4 px-4">Tarifa Mensual</th>
                <th className="py-4 px-4">Suscriptores</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-body text-slate-200">
              {acueductos.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-100">{a.nombre}</td>
                  <td className="py-4 px-4 font-mono text-slate-400">{a.nit}</td>
                  <td className="py-4 px-4 text-slate-300">{a.municipio}</td>
                  <td className="py-4 px-4 font-semibold text-cyan-400 font-headline">{a.planSaaS}</td>
                  <td className="py-4 px-4 font-semibold text-slate-200">${a.costoMensualSaaS.toLocaleString()} /mes</td>
                  <td className="py-4 px-4 font-bold text-slate-100">{a.suscriptores} usuarios</td>
                  <td className="py-4 px-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-headline font-bold">
                      {a.estado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-800 rounded-lg">
                      <span className="material-symbols-outlined text-lg">vpn_key</span>
                    </button>
                    <button className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-800 rounded-lg">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Acueducto Veredal */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 font-headline">Registrar Nuevo Acueducto Veredal</h3>
              <button onClick={() => setMostrarModalNuevo(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block font-headline">Nombre del Acueducto</label>
                <input
                  type="text"
                  placeholder="ej. Acueducto Veredal El Carmelo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block font-headline">NIT</label>
                <input
                  type="text"
                  placeholder="ej. 891100999-1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block font-headline">Municipio</label>
                <input
                  type="text"
                  placeholder="Garzón"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block font-headline">Plan SaaS</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500">
                  <option value="BASICO">Básico (Hasta 100 usuarios)</option>
                  <option value="ESTANDAR">Estándar (101 - 500 usuarios)</option>
                  <option value="EMPRESARIAL">Empresarial (Más de 500)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 font-semibold mb-1 block font-headline">Llave Pública Wompi</label>
                <input
                  type="text"
                  placeholder="pub_test_XXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 font-semibold mb-1 block font-headline">Llave Privada Wompi (Se cifrará AES-256)</label>
                <input
                  type="password"
                  placeholder="prv_test_XXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-headline"
              >
                Cancelar
              </button>
              <button className="bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold px-6 py-2 rounded-xl text-sm font-headline">
                Guardar y Cifrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
