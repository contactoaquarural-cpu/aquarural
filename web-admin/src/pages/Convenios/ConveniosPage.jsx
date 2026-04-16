import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.service';

const TIPO_MAP = {
  AGROPECUARIO: { cls: 'bg-secondary-container/30 text-on-secondary-container', label: 'Agropecuario' },
  VETERINARIA:  { cls: 'bg-tertiary-container/30 text-tertiary',                label: 'Veterinaria' },
  INSUMOS:      { cls: 'bg-primary-container/30 text-on-primary-container',     label: 'Insumos' },
  OTRO:         { cls: 'bg-surface-container-highest text-on-surface-variant',  label: 'Otro' },
};

const FORM_INIT = { nombre: '', tipo: 'AGROPECUARIO', descuentoPorcentaje: '', descripcion: '', direccion: '', telefono: '' };

const ConveniosPage = () => {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(FORM_INIT);
  const [filterTipo, setFilterTipo] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['convenios', filterTipo],
    queryFn: () =>
      api.get('/convenios', { params: { tipo: filterTipo || undefined } }).then((r) => r.data),
  });

  const convenios = data?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editTarget
        ? api.put(`/convenios/${editTarget._id}`, payload)
        : api.post('/convenios', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['convenios']);
      closeDrawer();
    },
    onError: (err) => setError(err.response?.data?.message || 'Error al guardar el convenio.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/convenios/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries(['convenios']),
  });

  const openCreate = () => { setEditTarget(null); setForm(FORM_INIT); setError(''); setDrawerOpen(true); };
  const openEdit   = (c) => { setEditTarget(c); setForm({ ...c }); setError(''); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditTarget(null); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, descuentoPorcentaje: Number(form.descuentoPorcentaje) });
  };

  return (
    <div className="pt-8 pb-12 px-10 max-w-7xl mx-auto">

      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
            Configuración de Convenios
          </h2>
          <p className="text-on-surface-variant text-lg font-light leading-relaxed">
            Gestiona las alianzas estratégicas y beneficios exclusivos para los asociados de ASOGACENTRO.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Crear Nuevo Convenio
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 md:col-span-7 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">
              Resumen del Programa
            </span>
            <h3 className="text-2xl font-bold text-on-surface font-headline">Convenios Activos</h3>
          </div>
          <div className="flex items-baseline gap-4 mt-8">
            <span className="text-6xl font-extrabold text-primary tracking-tighter font-headline">
              {convenios.filter((c) => c.activo).length}
            </span>
            <span className="text-on-surface-variant font-medium">de {convenios.length} totales</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant text-sm font-medium">Categoría Líder</p>
              <p className="text-xl font-bold text-on-surface font-headline">Veterinaria</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-tertiary">pets</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant text-sm font-medium">Mayor Descuento</p>
              <p className="text-xl font-bold text-on-surface font-headline">
                {convenios.length > 0
                  ? `${Math.max(...convenios.map((c) => c.descuentoPorcentaje))}%`
                  : '—'}
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">trending_up</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        {[{ v: '', l: 'Todos' }, { v: 'AGROPECUARIO', l: 'Agropecuario' }, { v: 'VETERINARIA', l: 'Veterinaria' }, { v: 'INSUMOS', l: 'Insumos' }, { v: 'OTRO', l: 'Otro' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setFilterTipo(v)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filterTipo === v
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {convenios.map((c) => {
            const tipo = TIPO_MAP[c.tipo] ?? TIPO_MAP.OTRO;
            return (
              <div
                key={c._id}
                className={`group relative bg-surface-container-low rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 ${!c.activo ? 'opacity-50' : ''}`}
              >
                <div className="h-24 w-full bg-gradient-to-r from-primary-container/40 to-primary-container/20 relative">
                  <div className="absolute -bottom-6 left-6 w-14 h-14 bg-surface-container-lowest rounded-lg flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
                  </div>
                  {!c.activo && (
                    <span className="absolute top-3 right-3 bg-error-container/40 text-error text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="pt-10 pb-6 px-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-on-surface font-headline">{c.nombre}</h4>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${tipo.cls}`}>
                        {tipo.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-primary font-headline">{c.descuentoPorcentaje}%</span>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Descuento</p>
                    </div>
                  </div>
                  {c.descripcion && (
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-4 line-clamp-2">{c.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                    <button
                      onClick={() => toggleMutation.mutate(c._id)}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                        c.activo ? 'text-error hover:text-error/80' : 'text-primary hover:text-primary/80'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{c.activo ? 'toggle_on' : 'toggle_off'}</span>
                      {c.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      className="text-primary hover:text-on-primary-container text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      Editar
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Placeholder crear */}
          <button
            onClick={openCreate}
            className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-8 min-h-[300px] group cursor-pointer hover:bg-surface-container-low/50 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">add</span>
            </div>
            <p className="font-headline font-bold text-on-surface">Añadir Aliado</p>
            <p className="text-on-surface-variant text-xs text-center mt-2 max-w-[160px]">
              Registra una nueva empresa al programa de convenios
            </p>
          </button>
        </div>
      )}

      {/* Drawer lateral */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] flex justify-end">
          <div className="w-full max-w-lg bg-surface shadow-2xl h-full p-10 flex flex-col border-l border-outline-variant/20">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
                {editTarget ? 'Editar Convenio' : 'Nuevo Convenio'}
              </h3>
              <button onClick={closeDrawer} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-error-container/20 border border-error/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-1 no-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Nombre de la Empresa</label>
                <div className="bg-surface-container-low rounded-lg p-1">
                  <input
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Veterinaria San José"
                    className="w-full bg-transparent border-none focus:outline-none text-on-surface p-3 font-medium placeholder:text-outline/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Categoría</label>
                  <div className="bg-surface-container-low rounded-lg p-1">
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      className="w-full bg-transparent border-none focus:outline-none text-on-surface p-3 font-medium cursor-pointer"
                    >
                      <option value="AGROPECUARIO">Agropecuario</option>
                      <option value="VETERINARIA">Veterinaria</option>
                      <option value="INSUMOS">Insumos</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Descuento</label>
                  <div className="bg-surface-container-low rounded-lg p-1 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={form.descuentoPorcentaje}
                      onChange={(e) => setForm({ ...form, descuentoPorcentaje: e.target.value })}
                      placeholder="0"
                      className="w-full bg-transparent border-none focus:outline-none text-on-surface p-3 font-medium placeholder:text-outline/50 pr-8"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Descripción del Beneficio</label>
                <div className="bg-surface-container-low rounded-lg p-1">
                  <textarea
                    rows={4}
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Describe los términos y condiciones del convenio..."
                    className="w-full bg-transparent border-none focus:outline-none text-on-surface p-3 font-medium placeholder:text-outline/50 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Dirección</label>
                <div className="bg-surface-container-low rounded-lg p-1">
                  <input
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Dirección del establecimiento"
                    className="w-full bg-transparent border-none focus:outline-none text-on-surface p-3 font-medium placeholder:text-outline/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Teléfono de Contacto</label>
                <div className="bg-surface-container-low rounded-lg p-1">
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej: 3001234567"
                    className="w-full bg-transparent border-none focus:outline-none text-on-surface p-3 font-medium placeholder:text-outline/50"
                  />
                </div>
              </div>
            </form>

            <div className="pt-8 mt-auto flex gap-4 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 py-4 px-6 rounded-lg text-on-surface font-bold hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
                className="flex-[2] py-4 px-6 rounded-lg bg-primary text-on-primary font-headline font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Guardando...' : 'Guardar Convenio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConveniosPage;
