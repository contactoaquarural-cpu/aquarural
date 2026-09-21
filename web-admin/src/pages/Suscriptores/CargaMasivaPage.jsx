import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../services/api.service';

// Flujo de 3 pasos: subir el archivo, revisar fila por fila qué se va a
// crear/omitir/rechazar (sin tocar la BD todavía), y solo entonces confirmar
// la carga real. Antes era un modal que subía directo sin vista previa —
// se volvió página propia porque el contenido (tabla de resultados) es
// potencialmente largo y el flujo tiene pasos, no cabe bien en un modal.
const CargaMasivaPage = () => {
  const navigate = useNavigate();
  const [archivo, setArchivo] = useState(null);
  const [previsualizando, setPrevisualizando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [filasPreview, setFilasPreview] = useState(null);
  const [error, setError] = useState('');
  const [resultadoFinal, setResultadoFinal] = useState(null);

  const handleDescargarPlantilla = () => {
    // El backend (multer fileFilter) solo acepta .xlsx/.xls, nunca .csv.
    // Solo se piden los mismos campos que el modal manual "Registrar Nuevo
    // Suscriptor" (nombres y apellidos van juntos, sin correo/dirección) para
    // que ambos caminos de alta sean coherentes. La matrícula no va aquí: el
    // backend asigna el siguiente consecutivo (MAT-####) si falta.
    // "lecturaInicial" es la lectura de arranque de un medidor YA instalado
    // (no nuevo): vacía o 0 = medidor nuevo, arranca en 0; con un número =
    // esa es su lectura real de arranque. Sin esto, un medidor con consumo
    // previo quedaría guardado en 0 como si fuera nuevo.
    const filas = [
      ['cedula', 'nombres', 'telefono', 'vereda', 'numeroMedidor', 'lecturaInicial'],
      ['1075234891', 'Carlos Trujillo Morales', '3124567890', 'Sector El Mirador', 'S/N', ''],
      ['36304582', 'Maria Rojas de Trujillo', '3159876543', 'Sector Bajo', 'MED-90813', '45'],
    ];
    const hoja = XLSX.utils.aoa_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Suscriptores');
    XLSX.writeFile(libro, 'Plantilla_Suscriptores_AquaRural.xlsx');
  };

  const handleSeleccionarArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    setError('');
    setResultadoFinal(null);
    setFilasPreview(null);

    const formData = new FormData();
    formData.append('archivo', file);

    setPrevisualizando(true);
    try {
      const { data } = await api.post('/asociados/cargar-excel/previsualizar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFilasPreview(data.data.filas);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo leer el archivo.');
      setArchivo(null);
    } finally {
      setPrevisualizando(false);
    }
  };

  const handleConfirmarCarga = async () => {
    if (!archivo) return;
    setConfirmando(true);
    setError('');

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const { data } = await api.post('/asociados/cargar-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultadoFinal(data.data);
      setFilasPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo procesar la carga.');
    } finally {
      setConfirmando(false);
    }
  };

  const handleReiniciar = () => {
    setArchivo(null);
    setFilasPreview(null);
    setResultadoFinal(null);
    setError('');
  };

  const totalCrear = filasPreview?.filter((f) => f.accion === 'CREAR').length || 0;
  const totalOmitir = filasPreview?.filter((f) => f.accion === 'OMITIR').length || 0;
  const totalError = filasPreview?.filter((f) => f.accion === 'ERROR').length || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 font-body">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <button
          onClick={() => navigate('/asociados')}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors"
          title="Volver a Suscriptores"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">file_upload</span>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
            Cargar Suscriptores desde Excel
          </h1>
          <p className="text-xs text-slate-500">Revisa el resultado antes de confirmar — nada se guarda hasta el último paso.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-red-700 text-xs font-headline shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg">error</span>
            <p className="font-semibold">{error}</p>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-70">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* PASO 1: Plantilla + Dropzone (solo si no hay preview ni resultado aún) */}
      {!filasPreview && !resultadoFinal && (
        <>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">description</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-headline">Plantilla Oficial Estructurada</h4>
                <p className="text-[11px] text-slate-500 font-body">Descarga el formato exacto con los campos que espera el sistema.</p>
              </div>
            </div>
            <button
              onClick={handleDescargarPlantilla}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-headline font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Descargar Plantilla (.xlsx)</span>
            </button>
          </div>

          {/* Explica las 3 reglas implícitas de numeroMedidor/lecturaInicial
              (se infieren de si la celda está vacía, no de un campo literal
              "SI/NO" como en el modal manual) — sin esto, quien llena el
              Excel a mano puede no saber que dejar una celda vacía cambia
              el resultado (tarifa fija vs. medidor nuevo vs. ya instalado). */}
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-[#1D4ED8] font-headline flex items-center gap-1.5 mb-3">
              <span className="material-symbols-outlined text-base">info</span>
              Cómo diligenciar las columnas de medidor
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-700">
              <div className="bg-white border border-blue-100 rounded-2xl p-3">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#1D4ED8]">home</span>
                  Sin medidor (tarifa fija)
                </p>
                <p>Deja <code className="bg-slate-100 px-1 rounded">numeroMedidor</code> y <code className="bg-slate-100 px-1 rounded">lecturaInicial</code> vacíos.</p>
              </div>
              <div className="bg-white border border-blue-100 rounded-2xl p-3">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#1D4ED8]">fiber_new</span>
                  Medidor nuevo
                </p>
                <p>Escribe el <code className="bg-slate-100 px-1 rounded">numeroMedidor</code> y deja <code className="bg-slate-100 px-1 rounded">lecturaInicial</code> vacío o en 0 — arranca en 0 m³.</p>
              </div>
              <div className="bg-white border border-blue-100 rounded-2xl p-3">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#1D4ED8]">history</span>
                  Medidor ya instalado
                </p>
                <p>Escribe el <code className="bg-slate-100 px-1 rounded">numeroMedidor</code> y el número real en <code className="bg-slate-100 px-1 rounded">lecturaInicial</code> (ej. 45).</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="relative border-2 border-dashed border-slate-300 hover:border-[#1D4ED8]/50 rounded-2xl p-8 text-center space-y-2 cursor-pointer transition-colors bg-slate-50">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleSeleccionarArchivo}
                disabled={previsualizando}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-wait"
              />
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center mx-auto pointer-events-none">
                <span className="material-symbols-outlined text-2xl">{previsualizando ? 'progress_activity' : 'upload_file'}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 font-headline pointer-events-none">
                {previsualizando ? 'Leyendo archivo...' : 'Arrastra tu archivo aquí o haz clic para examinar'}
              </p>
              <p className="text-[11px] text-slate-500 font-body pointer-events-none">
                Los suscriptores con cédula ya registrada se marcarán para omitir, no se duplican.
              </p>
            </div>
          </div>
        </>
      )}

      {/* PASO 2: Vista previa fila por fila, antes de confirmar */}
      {filasPreview && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-700 font-mono">{totalCrear}</p>
              <p className="text-[11px] text-emerald-700 font-headline font-bold uppercase">Se crearán</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-700 font-mono">{totalOmitir}</p>
              <p className="text-[11px] text-amber-700 font-headline font-bold uppercase">Se omitirán</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-red-700 font-mono">{totalError}</p>
              <p className="text-[11px] text-red-700 font-headline font-bold uppercase">Con error</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center gap-4 px-6 py-5 border-b border-gray-100">
              <p className="text-xs text-gray-400">Vista previa fila por fila antes de confirmar la carga</p>
              <span className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                Total Filas: {filasPreview.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-headline uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="py-3 px-4">Fila</th>
                    <th className="py-3 px-4">Cédula</th>
                    <th className="py-3 px-4">Nombres</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Vereda</th>
                    <th className="py-3 px-4">Medidor</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-6">Detalle</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-body text-gray-700">
                  {filasPreview.map((f, i) => {
                    const tieneMedidor = Boolean(f.datos.numeroMedidor) && f.datos.numeroMedidor !== 'S/N';
                    return (
                    <tr key={i} className={`border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}>
                      <td className="py-3 px-4 font-mono text-gray-500">{f.fila}</td>
                      <td className="py-3 px-4 font-mono">{f.datos.cedula || '—'}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">{f.datos.nombres || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{f.datos.telefono || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{f.datos.vereda || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {tieneMedidor
                          ? `${f.datos.numeroMedidor} (arranca en ${f.datos.lecturaAnterior ?? 0} m³)`
                          : 'Sin medidor'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold whitespace-nowrap ${
                            f.accion === 'CREAR'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : f.accion === 'OMITIR'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {f.accion === 'CREAR' ? 'Se creará' : f.accion === 'OMITIR' ? 'Se omite' : 'Error'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-500">{f.motivo || '—'}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReiniciar}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
            >
              Elegir otro archivo
            </button>
            <button
              onClick={handleConfirmarCarga}
              disabled={confirmando || totalCrear === 0}
              style={{ color: '#ffffff' }}
              className="flex-1 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{confirmando ? 'Guardando...' : `Confirmar y Crear ${totalCrear} Suscriptores`}</span>
            </button>
          </div>
        </>
      )}

      {/* PASO 3: Resultado final de la carga confirmada */}
      {resultadoFinal && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 font-headline">Carga completada</h3>
            <p className="text-sm text-slate-600 mt-1">
              {resultadoFinal.creados} suscriptores creados
              {resultadoFinal.omitidos ? `, ${resultadoFinal.omitidos} omitidos` : ''}
              {resultadoFinal.errores?.length ? `, ${resultadoFinal.errores.length} con error` : ''}.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={handleReiniciar}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-2.5 px-5 rounded-2xl text-xs transition-all cursor-pointer"
            >
              Cargar otro archivo
            </button>
            <button
              onClick={() => navigate('/asociados')}
              style={{ color: '#ffffff' }}
              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-2.5 px-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer text-xs"
            >
              Ver Suscriptores
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargaMasivaPage;
