import { useEffect, useRef, useState } from 'react';

const datosDefault5Suscriptores = [];

const MapaPage = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [suscriptorSeleccionado, setSuscriptorSeleccionado] = useState(null);

  // Leer suscriptores dinámicos desde localStorage
  const [puntosGPS, setPuntosGPS] = useState(() => {
    const guardados = localStorage.getItem('aquarural-suscriptores-v3');
    if (guardados) {
      try {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => ({
            id: s.id,
            suscriptor: s.nombres,
            matricula: s.matricula,
            vereda: s.vereda,
            medidor: s.medidor,
            estado: s.estadoMoratorio || 'AL_DIA',
            latitud: s.latitud || 2.1984,
            longitud: s.longitud || -75.6234,
          }));
        }
      } catch (e) {}
    }
    return datosDefault5Suscriptores.map((s) => ({
      id: s.id,
      suscriptor: s.nombres,
      matricula: s.matricula,
      vereda: s.vereda,
      medidor: s.medidor,
      estado: s.estadoMoratorio,
      latitud: s.latitud,
      longitud: s.longitud,
    }));
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    if (!L) return;

    // Centrar mapa en Garzón, Huila
    const map = L.map(mapContainerRef.current).setView([2.198421, -75.623412], 16);
    mapInstanceRef.current = map;

    // Capa OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Iconos personalizados de AquaRural
    const greenIcon = L.divIcon({
      className: 'custom-pin-green',
      html: `<div style="background-color: #10b981; width: 32px; height: 32px; border: 3px solid #020617; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(16,185,129,0.8); cursor: pointer;"><span class="material-symbols-outlined" style="font-size: 18px; color: #020617; font-weight: 800;">water_drop</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const amberIcon = L.divIcon({
      className: 'custom-pin-amber',
      html: `<div style="background-color: #f59e0b; width: 32px; height: 32px; border: 3px solid #020617; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(245,158,11,0.8); cursor: pointer;"><span class="material-symbols-outlined" style="font-size: 18px; color: #020617; font-weight: 800;">warning</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Agregar Marcadores
    puntosGPS.forEach((p) => {
      const markerIcon = p.estado === 'AL_DIA' ? greenIcon : amberIcon;
      const marker = L.marker([p.latitud, p.longitud], { icon: markerIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; color: #0f172a; min-width: 180px;">
          <h4 style="margin: 0; font-weight: 800; font-size: 13px; color: #0f172a;">${p.suscriptor}</h4>
          <p style="margin: 3px 0; font-size: 11px; color: #475569;">Matrícula: <strong>${p.matricula}</strong> | Medidor: <strong>${p.medidor}</strong></p>
          <p style="margin: 2px 0 6px 0; font-size: 10px; color: #64748b;">${p.vereda}</p>
          <span style="background-color: ${p.estado === 'AL_DIA' ? '#dcfce7' : '#fef3c7'}; color: ${p.estado === 'AL_DIA' ? '#15803d' : '#b45309'}; padding: 3px 8px; border-radius: 9999px; font-weight: 800; font-size: 10px; display: inline-block;">
            ${p.estado === 'AL_DIA' ? '✓ AL DÍA ($25.000 COP)' : '⚠️ EN MORA DE PAGO'}
          </span>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSuscriptorSeleccionado(p);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [puntosGPS]);

  const centrarEnPredio = (p) => {
    setSuscriptorSeleccionado(p);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([p.latitud, p.longitud], 18, {
        duration: 1.5,
      });
    }
  };

  const alDiaCount = puntosGPS.filter((p) => p.estado === 'AL_DIA').length;
  const enMoraCount = puntosGPS.filter((p) => p.estado === 'EN_MORA').length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">map</span>
            <h1 className="text-2xl font-extrabold text-slate-100 font-headline">
              Mapa GPS de Predios & Acometidas Rurales
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-body">
            Geolocalización satelital interactiva en vivo de los {puntosGPS.length} suscriptores del acueducto veredal en Garzón, Huila.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-headline">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {alDiaCount} Al Día (Verde)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            {enMoraCount} En Mora (Amarillo)
          </span>
        </div>
      </div>

      {/* Main Grid: Mapa + Lista de Predios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenedor del Mapa Interactivo Leaflet (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-3 relative overflow-hidden h-[540px] shadow-2xl">
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-2xl z-0 filter brightness-95 contrast-110"
            style={{ minHeight: '100%' }}
          />
        </div>

        {/* Panel Lateral de Predios Veredales (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-100 font-headline mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">location_searching</span>
              <span>Predios Registrados ({puntosGPS.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">Haz clic en cualquier predio para centrar el mapa GPS.</p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {puntosGPS.map((p) => {
                const isSelected = suscriptorSeleccionado?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => centrarEnPredio(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-slate-100 font-headline">{p.suscriptor}</h4>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          p.estado === 'AL_DIA'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.estado === 'AL_DIA' ? 'AL DÍA' : 'EN MORA'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono">
                      Matrícula: <strong className="text-slate-200">{p.matricula}</strong> | Medidor: {p.medidor}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.vereda}</p>

                    <div className="mt-2.5 flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                      <span className="material-symbols-outlined text-xs">my_location</span>
                      <span>Lat: {p.latitud.toFixed(4)}, Lon: {p.longitud.toFixed(4)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-sm">info</span>
            <span>Ubicaciones GPS sincronizadas en tiempo real.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaPage;
