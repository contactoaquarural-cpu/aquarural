import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.service';

const CATEGORIAS = [
  { value: 'GANADO_CARNE', label: 'Ganado Carne', icon: 'lunch_dining' },
  { value: 'GANADO_LECHE', label: 'Ganado Leche', icon: 'water_drop' },
  { value: 'INSUMOS',      label: 'Insumos',      icon: 'agriculture' },
];

const EMPTY = { categoria: 'GANADO_CARNE', producto: '', unidad: 'kg', precio: '' };

const PreciosPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [error, setError]     = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['precios'],
    queryFn: () => api.get('/precios').then((r) => r.data.data),
  });

  const guardar = useMutation({
    mutationFn: (payload) =>
      editId
        ? api.put(`/precios/${editId}`, payload)
        : api.post('/precios', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['precios']);
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      setError('');
    },
    onError: (err) => setError(err.response?.data?.message || 'Error al guardar'),
  });

  const eliminar = useMutation({
    mutationFn: (id) => api.delete(`/precios/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['precios']),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.producto.trim() || !form.unidad.trim() || !form.precio) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    guardar.mutate({ ...form, precio: parseFloat(form.precio) });
  };

  const handleEdit = (p) => {
    setForm({ categoria: p.categoria, producto: p.producto, unidad: p.unidad, precio: String(p.precio) });
    setEditId(p._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este precio?')) eliminar.mutate(id);
  };

  const precios = data || [];

  return (
    <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">Precios de Referencia</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Estos precios se muestran en el inicio de la app móvil.
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(''); }}
          className="btn-cta flex items-center gap-2 px-4 py-2 rounded-xl font-semibold font-headline text-sm transition"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo precio
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-low rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="font-headline font-bold text-on-surface">
            {editId ? 'Editar precio' : 'Nuevo precio'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface text-sm outline-none"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Producto</label>
              <input
                value={form.producto}
                onChange={(e) => setForm({ ...form, producto: e.target.value })}
                placeholder="Ej: Novillo gordo"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio (COP)</label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="Ej: 6500000"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Unidad</label>
              <input
                value={form.unidad}
                onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                placeholder="Ej: cabeza, kg, bulto"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-error text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={guardar.isPending}
              className="px-6 py-2 rounded-xl bg-primary-container text-primary font-semibold font-headline text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {guardar.isPending ? 'Guardando...' : editId ? 'Actualizar' : 'Crear precio'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditId(null); setError(''); }}
              className="px-6 py-2 rounded-xl bg-surface-container-high text-on-surface-variant font-semibold font-headline text-sm hover:opacity-90 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista por categoría */}
      {isLoading ? (
        <div className="text-center py-16 text-on-surface-variant">Cargando precios...</div>
      ) : precios.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">trending_up</span>
          <p className="text-on-surface-variant">No hay precios registrados.</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">Crea el primero con el botón de arriba.</p>
        </div>
      ) : (
        CATEGORIAS.map(({ value, label, icon }) => {
          const items = precios.filter((p) => p.categoria === value);
          if (!items.length) return null;
          return (
            <div key={value} className="bg-surface-container-low rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
                <h3 className="font-headline font-bold text-on-surface">{label}</h3>
                <span className="ml-auto text-xs text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'precio' : 'precios'}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((p) => (
                  <div key={p._id} className="flex items-center justify-between py-3 border-b border-surface-container-high last:border-0">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{p.producto}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Actualizado: {new Date(p.updatedAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-primary">${p.precio.toLocaleString('es-CO')}</p>
                        <p className="text-xs text-on-surface-variant">/{p.unidad}</p>
                      </div>
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-on-surface-variant hover:text-primary transition"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-on-surface-variant hover:text-error transition"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PreciosPage;
