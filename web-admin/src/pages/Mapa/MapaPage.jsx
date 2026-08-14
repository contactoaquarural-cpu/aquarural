const MapaPage = () => {
  const puntosGPS = [
    {
      id: '1',
      suscriptor: 'José Donaldo Gómez Murcia',
      matricula: 'ACU-0101',
      vereda: 'La Argentina - Sector El Mirador',
      latitud: 2.198421,
      longitud: -75.623412,
      estado: 'AL_DIA',
    },
    {
      id: '2',
      suscriptor: 'María Eudoxia Rojas de Trujillo',
      matricula: 'ACU-0102',
      vereda: 'La Argentina - Sector Bajo',
      latitud: 2.199105,
      longitud: -75.624001,
      estado: 'EN_MORA',
    },
    {
      id: '3',
      suscriptor: 'Hernando Parra Lasso',
      matricula: 'ACU-0103',
      vereda: 'La Argentina - Alto del Tabaco',
      latitud: 2.19785,
      longitud: -75.62198,
      estado: 'AL_DIA',
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-headline">Mapa GPS de Predios & Viviendas</h1>
          <p className="text-slate-400 text-sm font-body">
            Geolocalización satelital de acometidas y tomas de agua en la zona veredal.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-headline">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Al Día
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            En Mora / Corte
          </span>
        </div>
      </div>

      {/* Contenedor del Mapa / Mock Map View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-[500px] flex flex-col justify-between shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Simulador de Pins en el Mapa */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="absolute top-1/4 left-1/3 bg-slate-950/90 border border-emerald-500/50 p-3 rounded-2xl shadow-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-2xl animate-bounce">location_on</span>
            <div>
              <p className="text-xs font-bold text-slate-100 font-headline">José Donaldo Gómez</p>
              <p className="text-[10px] text-emerald-400 font-mono">ACU-0101 (2.1984, -75.6234)</p>
            </div>
          </div>

          <div className="absolute bottom-1/3 right-1/4 bg-slate-950/90 border border-amber-500/50 p-3 rounded-2xl shadow-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl animate-bounce">location_on</span>
            <div>
              <p className="text-xs font-bold text-slate-100 font-headline">María Eudoxia Rojas</p>
              <p className="text-[10px] text-amber-400 font-mono">ACU-0102 (2.1991, -75.6240)</p>
            </div>
          </div>

          <div className="absolute bottom-1/4 left-1/4 bg-slate-950/90 border border-emerald-500/50 p-3 rounded-2xl shadow-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-2xl animate-bounce">location_on</span>
            <div>
              <p className="text-xs font-bold text-slate-100 font-headline">Hernando Parra Lasso</p>
              <p className="text-[10px] text-emerald-400 font-mono">ACU-0103 (2.1978, -75.6219)</p>
            </div>
          </div>

          <div className="text-center space-y-2 pointer-events-none opacity-20">
            <span className="material-symbols-outlined text-8xl text-slate-400">map</span>
            <p className="text-sm font-headline text-slate-400">Google Maps API Component Integrated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaPage;
