import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api.service';

// Fix del ícono default de Leaflet, que no carga bien con bundlers como Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FontaneroDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const irARegistrarLectura = (matricula) => navigate(`/lecturas?buscar=${encodeURIComponent(matricula)}`);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/asociados/estadisticas-lecturas');
      setStats(data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cargar tus estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  const prediosConGPS = stats?.prediosPendientes?.filter((p) => p.latitud && p.longitud) || [];

  const centroMapa =
    prediosConGPS.length > 0
      ? [prediosConGPS[0].latitud, prediosConGPS[0].longitud]
      : [2.196, -75.63]; // Garzón, Huila — centro por defecto si no hay predios con GPS.

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-[#1D4ED8]">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-body">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">route</span>
          <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
            Mi Ruta y Avance de Campo
          </h1>
        </div>
        <p className="text-slate-500 text-xs font-body capitalize">
          Ciclo vigente: {stats?.periodo}. Predios pendientes de lectura este mes.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-red-700 text-xs font-headline shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg">error</span>
            <p className="font-semibold">{error}</p>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-70">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Avance del Ciclo</span>
          <p className="text-3xl font-extrabold text-[#1D4ED8] font-headline">{stats?.porcentajeAvance || 0}%</p>
          <p className="text-[11px] text-slate-500">{stats?.registrados || 0} de {stats?.totalConMedidor || 0} predios</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Predios Pendientes</span>
          <p className="text-3xl font-extrabold text-amber-600 font-headline">{stats?.pendientes || 0}</p>
          <p className="text-[11px] text-slate-500">Por visitar este mes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Predios Registrados</span>
          <p className="text-3xl font-extrabold text-emerald-600 font-headline">{stats?.registrados || 0}</p>
          <p className="text-[11px] text-slate-500">Lectura ya tomada</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Consumo Registrado</span>
          <p className="text-3xl font-extrabold text-[#1D4ED8] font-headline">{(stats?.consumoTotalRegistrado || 0).toLocaleString()} m³</p>
          <p className="text-[11px] text-slate-500">Total del ciclo hasta ahora</p>
        </div>
      </div>

      {/* Mapa de predios pendientes */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1D4ED8]">map</span>
            <h2 className="text-base font-extrabold text-slate-800 font-headline">Mapa de Predios Pendientes</h2>
          </div>
          <span className="text-xs text-[#1D4ED8] font-mono font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {prediosConGPS.length} con GPS
          </span>
        </div>

        {prediosConGPS.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2 bg-slate-50">
            <span className="material-symbols-outlined text-4xl text-slate-300">location_off</span>
            <p className="text-sm font-headline font-bold text-slate-600">
              {stats?.pendientes === 0 ? '¡Ya registraste todas las lecturas de este ciclo!' : 'Ningún predio pendiente tiene coordenadas GPS registradas aún.'}
            </p>
          </div>
        ) : (
          <div style={{ height: '420px' }}>
            <MapContainer center={centroMapa} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {prediosConGPS.map((p) => (
                <Marker key={p._id} position={[p.latitud, p.longitud]}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{p.nombres} {p.apellidos}</p>
                      <p>Matrícula: {p.matricula}</p>
                      <p>Medidor: {p.numeroMedidor}</p>
                      <p>{p.vereda}</p>
                      <button
                        type="button"
                        onClick={() => irARegistrarLectura(p.matricula)}
                        className="mt-1 w-full bg-[#1D4ED8] text-white font-bold text-[11px] py-1.5 rounded-lg cursor-pointer"
                      >
                        Registrar lectura
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Listado completo de pendientes (con y sin GPS) — el mapa arriba
          solo ubica visualmente a los que sí tienen coordenadas, pero el
          fontanero necesita ver TODO su trabajo pendiente como texto, no
          solo los que caben en el mapa. */}
      {stats?.prediosPendientes?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-headline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">checklist</span>
            Predios Pendientes de Lectura ({stats.prediosPendientes.length})
          </h3>
          <div className="space-y-2">
            {stats.prediosPendientes.map((p) => {
              const tieneGps = Boolean(p.latitud && p.longitud);
              return (
                <button
                  type="button"
                  key={p._id}
                  onClick={() => irARegistrarLectura(p.matricula)}
                  title="Ir a registrar la lectura de este predio"
                  className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl px-4 py-3 flex items-center justify-between text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        tieneGps ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}
                      title={tieneGps ? 'Con GPS registrado' : 'Sin GPS registrado'}
                    >
                      <span className="material-symbols-outlined text-sm">{tieneGps ? 'location_on' : 'location_off'}</span>
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{p.nombres} {p.apellidos}</p>
                      <p className="text-slate-500">{p.matricula} • {p.vereda || 'Sin vereda registrada'}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">Medidor {p.numeroMedidor}</span>
                    <span className="material-symbols-outlined text-[#1D4ED8] text-base">arrow_forward</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontaneroDashboardPage;
