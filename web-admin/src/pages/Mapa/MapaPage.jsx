import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';

const MapaPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [suscriptorSeleccionado, setSuscriptorSeleccionado] = useState(null);
  const [puntosGPS, setPuntosGPS] = useState([]);
  const [totalSinGPS, setTotalSinGPS] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real desde el backend, aislado por acueductoId (tenantMiddleware).
  // tieneGPS=true filtra en el propio Mongo (no en el cliente) — necesario
  // para acueductos grandes: traer 2000 asociados al navegador solo para
  // descartar la mayoría con un .filter() no escala. limit=5000 porque el
  // mapa necesita TODOS los puntos con GPS para dibujarlos, no una página.
  // Los suscriptores sin GPS solo se cuentan aquí (total, sin traer la lista
  // completa) — la lista real vive en /mapa/sin-ubicacion, con paginación
  // propia, porque puede ser igual de grande que el total del acueducto.
  useEffect(() => {
    const cargarDesdeApi = async () => {
      setLoading(true);
      try {
        const [conGPSRes, sinGPSRes] = await Promise.all([
          api.get('/asociados', { params: { tieneGPS: 'true', limit: 5000 } }).catch(() => ({ data: null })),
          api.get('/asociados', { params: { tieneGPS: 'false', limit: 1 } }).catch(() => ({ data: null })),
        ]);

        const lista = Array.isArray(conGPSRes.data?.data?.asociados) ? conGPSRes.data.data.asociados : [];
        setTotalSinGPS(sinGPSRes.data?.data?.total || 0);

        setPuntosGPS(
          lista.map((s) => ({
            id: s._id || s.id,
            suscriptor: `${s.nombres} ${s.apellidos || ''}`.trim(),
            matricula: s.matricula,
            vereda: s.vereda,
            medidor: s.numeroMedidor,
            estado: s.estadoMoratorio || 'AL_DIA',
            latitud: s.latitud,
            longitud: s.longitud,
          }))
        );
      } catch (e) {
        setPuntosGPS([]);
        setTotalSinGPS(0);
      } finally {
        setLoading(false);
      }
    };
    cargarDesdeApi();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || loading) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    if (!L) return;

    // Centro por defecto: Garzón, Huila (usado solo si no hay ningún punto
    // real que centrar; con puntos reales el mapa se ajusta a ellos abajo).
    const centroDefault = [2.198421, -75.623412];
    const map = L.map(mapContainerRef.current).setView(centroDefault, 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

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

    const markers = [];
    puntosGPS.forEach((p) => {
      const markerIcon = p.estado === 'AL_DIA' ? greenIcon : amberIcon;
      const marker = L.marker([p.latitud, p.longitud], { icon: markerIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; color: #0f172a; min-width: 180px;">
          <h4 style="margin: 0; font-weight: 800; font-size: 13px; color: #0f172a;">${p.suscriptor}</h4>
          <p style="margin: 3px 0; font-size: 11px; color: #475569;">Matrícula: <strong>${p.matricula}</strong> | Medidor: <strong>${p.medidor}</strong></p>
          <p style="margin: 2px 0 6px 0; font-size: 10px; color: #64748b;">${p.vereda}</p>
          <span style="background-color: ${p.estado === 'AL_DIA' ? '#dcfce7' : '#fef3c7'}; color: ${p.estado === 'AL_DIA' ? '#15803d' : '#b45309'}; padding: 3px 8px; border-radius: 9999px; font-weight: 800; font-size: 10px; display: inline-block;">
            ${p.estado === 'AL_DIA' ? '✓ AL DÍA' : p.estado === 'EN_MORA' ? '⚠️ EN MORA' : '⛔ INACTIVO'}
          </span>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => setSuscriptorSeleccionado(p));
      markers.push(marker);
    });

    // Encuadra el mapa a los puntos reales, en vez de dejar siempre fijo el
    // centro de Garzón — así funciona igual para cualquier acueducto/vereda.
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [puntosGPS, loading]);

  const centrarEnPredio = (p) => {
    setSuscriptorSeleccionado(p);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([p.latitud, p.longitud], 18, { duration: 1.5 });
    }
  };

  const alDiaCount = puntosGPS.filter((p) => p.estado === 'AL_DIA').length;
  const enMoraCount = puntosGPS.filter((p) => p.estado !== 'AL_DIA').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">map</span>
            <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
              Mapa GPS de Predios & Acometidas Rurales
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-body">
            {loading
              ? 'Cargando ubicaciones...'
              : `Geolocalización de ${puntosGPS.length} suscriptores con GPS registrado${
                  totalSinGPS > 0 ? ` — ${totalSinGPS} sin ubicación aún` : ''
                }.`}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-headline">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {alDiaCount} Al Día (Verde)
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            {enMoraCount} En Mora (Amarillo)
          </span>
        </div>
      </div>

      {/* Main Grid: Mapa + Lista de Predios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenedor del Mapa Interactivo Leaflet (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-3 relative overflow-hidden h-[540px] shadow-sm">
          {!loading && puntosGPS.length === 0 ? (
            <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50">
              <span className="material-symbols-outlined text-4xl text-slate-300">location_off</span>
              <p className="text-xs font-headline">Ningún suscriptor tiene GPS registrado todavía.</p>
              <p className="text-[11px] text-slate-400 max-w-xs text-center">La ubicación se captura desde la app del suscriptor, aún pendiente de construir.</p>
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              className="w-full h-full rounded-2xl z-0"
              style={{ minHeight: '100%' }}
            />
          )}
        </div>

        {/* Panel Lateral de Predios Veredales (1 col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 font-headline mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1D4ED8]">location_searching</span>
              <span>Predios Registrados ({puntosGPS.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">Haz clic en cualquier predio para centrar el mapa GPS.</p>

            {puntosGPS.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <span className="material-symbols-outlined text-3xl text-slate-300">location_off</span>
                <p className="text-xs mt-2">Sin predios georreferenciados aún.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {puntosGPS.map((p) => {
                  const isSelected = suscriptorSeleccionado?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => centrarEnPredio(p)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-[#1D4ED8]/40 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-bold text-slate-800 font-headline">{p.suscriptor}</h4>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            p.estado === 'AL_DIA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.estado === 'AL_DIA' ? 'AL DÍA' : p.estado === 'EN_MORA' ? 'EN MORA' : 'INACTIVO'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-mono">
                        Matrícula: <strong className="text-slate-700">{p.matricula}</strong> | Medidor: {p.medidor}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.vereda}</p>

                      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#1D4ED8] font-mono">
                        <span className="material-symbols-outlined text-xs">my_location</span>
                        <span>Lat: {p.latitud.toFixed(4)}, Lon: {p.longitud.toFixed(4)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1D4ED8] text-sm">info</span>
            <span>Ubicaciones GPS cargadas desde el registro de cada suscriptor.</span>
          </div>
        </div>
      </div>

      {/* Suscriptores sin GPS: solo un resumen aquí + link a página propia
          (/mapa/sin-ubicacion). Con acueductos grandes (ej. 2000 suscriptores,
          1000 sin GPS) esa lista no cabe bien en el scroll de esta pantalla
          ni escala como tabla embebida — se maneja en una página aparte con
          paginación real del backend, igual que Suscriptores. */}
      {!loading && totalSinGPS > 0 && (
        <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-xl">location_off</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 font-headline">Sin Ubicación ({totalSinGPS})</h2>
              <p className="text-xs text-slate-500 mt-0.5">Suscriptores que aún no han registrado el GPS de su predio.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/mapa/sin-ubicacion')}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-headline font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Ver Lista Completa</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MapaPage;
