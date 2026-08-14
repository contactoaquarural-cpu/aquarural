import { useState } from 'react';

const SuscriptoresPage = () => {
  const [mostrarModalExcel, setMostrarModalExcel] = useState(false);
  const [buscar, setBuscar] = useState('');

  // Datos simulados o cargados desde backend
  const suscriptores = [
    {
      id: '1',
      matricula: 'ACU-0101',
      cedula: '1075234891',
      nombres: 'José Donaldo Gómez Murcia',
      vereda: 'La Argentina - Sector El Mirador',
      medidor: 'MED-90812',
      estadoMoratorio: 'AL_DIA',
      latitud: 2.198421,
      longitud: -75.623412,
    },
    {
      id: '2',
      matricula: 'ACU-0102',
      cedula: '36304582',
      nombres: 'María Eudoxia Rojas de Trujillo',
      vereda: 'La Argentina - Sector Bajo',
      medidor: 'MED-90813',
      estadoMoratorio: 'EN_MORA',
      latitud: 2.199105,
      longitud: -75.624001,
    },
    {
      id: '3',
      matricula: 'ACU-0103',
      cedula: '12245890',
      nombres: 'Hernando Parra Lasso',
      vereda: 'La Argentina - Alto del Tabaco',
      medidor: 'MED-90814',
      estadoMoratorio: 'AL_DIA',
      latitud: 2.197850,
      longitud: -75.621980,
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-headline">Gestión de Suscriptores</h1>
          <p className="text-slate-400 text-sm font-body">
            Padrón oficial de usuarios del servicio de agua, matrículas y coordenadas GPS del predio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarModalExcel(true)}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 px-5 py-2.5 rounded-2xl font-headline font-semibold text-sm flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-lg">upload_file</span>
            <span>Cargar Excel (.xlsx)</span>
          </button>
          <button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 px-5 py-2.5 rounded-2xl font-headline font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Nuevo Suscriptor</span>
          </button>
        </div>
      </div>

      {/* Bar de Búsqueda y Filtros */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            search
          </span>
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por cédula, matrícula o nombre..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-headline">
          <span>Filtrar estado:</span>
          <button className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-lg font-semibold">
            Todos
          </button>
          <button className="hover:bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">Al Día</button>
          <button className="hover:bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">En Mora</button>
        </div>
      </div>

      {/* Tabla de Suscriptores */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-headline uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Matrícula</th>
                <th className="py-4 px-4">Suscriptor / Cédula</th>
                <th className="py-4 px-4">Vereda / Sector</th>
                <th className="py-4 px-4">N° Medidor</th>
                <th className="py-4 px-4">GPS Finca</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-body text-slate-200">
              {suscriptores.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-cyan-400">{s.matricula}</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-100">{s.nombres}</p>
                    <p className="text-[11px] text-slate-400">C.C. {s.cedula}</p>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{s.vereda}</td>
                  <td className="py-4 px-4 font-mono text-slate-400">{s.medidor}</td>
                  <td className="py-4 px-4">
                    {s.latitud ? (
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Sin fijar</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold ${
                        s.estadoMoratorio === 'AL_DIA'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {s.estadoMoratorio === 'AL_DIA' ? 'AL DÍA' : 'EN MORA'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Carga Masiva Excel */}
      {mostrarModalExcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100 font-headline">Cargar Suscriptores desde Excel</h3>
              <button onClick={() => setMostrarModalExcel(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-colors bg-slate-950/40">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">upload_file</span>
              </div>
              <p className="text-sm font-semibold text-slate-200 font-headline">
                Arrastra tu archivo .xlsx aquí o haz clic para examinar
              </p>
              <p className="text-xs text-slate-400">Columnas requeridas: Matricula, Cedula, Nombres, Vereda, Medidor</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalExcel(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-headline"
              >
                Cancelar
              </button>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm font-headline">
                Procesar Archivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuscriptoresPage;
