import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapsed }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const tipoTarifa = useConfigStore((s) => s.tipoTarifa);
  const tarifaBaseMensual = useConfigStore((s) => s.tarifaBaseMensual);
  const cargoFijoMensual = useConfigStore((s) => s.cargoFijoMensual);
  const valorMetroCubico = useConfigStore((s) => s.valorMetroCubico);

  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.correo === 'contactoaquarural@gmail.com';
  const esFontanero = user?.rol === 'FONTANERO';

  // Etiqueta de rol mostrada en el footer del sidebar — antes era un texto
  // fijo "Tesorero / Junta" sin importar el rol real (ADMIN_ACUEDUCTO,
  // TESORERO y FONTANERO se veían todos igual).
  const ETIQUETAS_ROL = {
    SUPERADMIN: 'Operador Global',
    ADMIN_ACUEDUCTO: 'Administrador',
    TESORERO: 'Tesorero',
    FONTANERO: 'Fontanero',
  };
  const etiquetaRol = ETIQUETAS_ROL[user?.rol] || 'Administrador';

  // Ícono + color de avatar por rol, mismo patrón visual de badges de
  // estado ya usado en el resto de la app (bg claro + texto de acento) —
  // antes todos los roles compartían el mismo cuadro azul con solo la
  // inicial del nombre, sin diferenciarse entre sí.
  const AVATAR_ROL = {
    SUPERADMIN: { icon: 'verified_user', bg: 'bg-indigo-600' },
    ADMIN_ACUEDUCTO: { icon: 'shield_person', bg: 'bg-[#1D4ED8]' },
    TESORERO: { icon: 'payments', bg: 'bg-emerald-600' },
    FONTANERO: { icon: 'plumbing', bg: 'bg-amber-600' },
  };
  const avatarRol = AVATAR_ROL[user?.rol] || AVATAR_ROL.ADMIN_ACUEDUCTO;

  // /configuracion es la base de todo el cálculo de facturación — sin
  // tarifas reales, el acueducto no puede operar aunque el resto del panel
  // "funcione". Se marca como pendiente si la modalidad de cobro activa
  // depende de un monto que sigue en 0 (valor por defecto, nunca tocado).
  const faltaTarifaFija = (tipoTarifa === 'TARIFA_FIJA' || tipoTarifa === 'HIBRIDO') && !tarifaBaseMensual;
  const faltaMedidor = (tipoTarifa === 'MEDIDOR' || tipoTarifa === 'HIBRIDO') && !cargoFijoMensual && !valorMetroCubico;
  const configuracionPendiente = faltaTarifaFija || faltaMedidor;

  // Menú exclusivo según el rol del usuario autenticado, agrupado por
  // secciones (como MENU/GENERAL en la referencia) para no leerse como una
  // lista plana de 6+ links sin jerarquía.
  const menuGroups = esSuperAdmin
    ? [
        {
          label: 'PLATAFORMA',
          items: [
            { to: '/superadmin', icon: 'dashboard', label: 'Dashboard' },
            { to: '/superadmin/acueductos', icon: 'water_drop', label: 'Acueductos Afiliados' },
            { to: '/superadmin/apariencia', icon: 'photo_camera', label: 'Apariencia de la Plataforma' },
          ],
        },
      ]
    : esFontanero
    ? [
        {
          label: 'MI TRABAJO',
          items: [
            { to: '/mi-ruta',  icon: 'route',    label: 'Mi Ruta y Avance' },
            { to: '/lecturas', icon: 'water_ec', label: 'Lecturas & Medidores (m³)' },
            { to: '/mapa',     icon: 'map',      label: 'Mapa GPS de Predios' },
          ],
        },
      ]
    : [
        {
          label: 'GESTIÓN',
          items: [
            { to: '/dashboard',   icon: 'dashboard',    label: 'Dashboard' },
            { to: '/asociados',   icon: 'groups',       label: 'Suscriptores Veredales' },
            { to: '/lecturas',    icon: 'water_ec',     label: 'Lecturas & Medidores (m³)' },
            { to: '/facturacion', icon: 'receipt_long', label: 'Facturación & Recaudo' },
            { to: '/reportes',    icon: 'monitoring',   label: 'Reportes & Morosos' },
            { to: '/mapa',        icon: 'map',          label: 'Mapa GPS de Predios' },
            { to: '/eventos',     icon: 'event',         label: 'Eventos & Convocatorias' },
          ],
        },
        {
          label: 'CUENTA',
          items: [
            { to: '/licencia',      icon: 'card_membership', label: 'Licencia & Cobro SaaS' },
            { to: '/configuracion', icon: 'settings',        label: 'Configuración Acueducto', alerta: configuracionPendiente },
            { to: '/mi-cuenta',     icon: 'account_circle',  label: 'Mi Cuenta' },
            { to: '/pagos-wompi',   icon: 'vpn_key',         label: 'Pasarela de Pagos Wompi' },
            { to: '/equipo',        icon: 'groups',          label: 'Equipo de Trabajo' },
          ],
        },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isItemActive = (item) => location.pathname === item.to;

  return (
    <>
      {/* Backdrop Overlay para Móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col py-6 z-50 shadow-sm transition-all duration-300 ${
        collapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className={`mb-8 flex items-center ${collapsed ? 'lg:justify-center lg:px-0 px-6' : 'justify-between px-6'}`}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">
                {esSuperAdmin ? 'verified_user' : 'water_drop'}
              </span>
            </div>
            <div className={`overflow-hidden ${collapsed ? 'lg:hidden' : ''}`}>
              <h1 className="text-base font-extrabold tracking-tight text-gray-900 font-headline whitespace-nowrap">
                AquaRural
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] font-headline truncate max-w-[130px]">
                {esSuperAdmin ? 'Plataforma SaaS' : nombreAcueducto}
              </p>
            </div>
          </div>

          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className={`lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 ${collapsed ? 'lg:hidden' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Botón colapsar/expandir — solo en desktop */}
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expandir menú' : 'Ocultar menú'}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-[#1D4ED8] hover:border-[#1D4ED8]/40 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Nav List — agrupada por sección */}
        <nav className="flex-1 space-y-5 px-3 overflow-y-auto overflow-x-hidden">
          {menuGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className={`px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-headline whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    title={collapsed ? `${item.label}${item.alerta ? ' — Configuración pendiente' : ''}` : undefined}
                    className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl font-headline text-sm font-semibold tracking-tight transition-colors duration-150 outline-none select-none whitespace-nowrap ${
                      collapsed ? 'lg:justify-center lg:px-0' : ''
                    } ${
                      active
                        ? 'bg-blue-50 text-[#1D4ED8]'
                        : 'text-gray-500 hover:text-[#1D4ED8] hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl shrink-0 relative">
                      {item.icon}
                      {item.alerta && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white ${collapsed ? '' : 'lg:hidden'}`} />
                      )}
                    </span>
                    <span className={`flex flex-col items-start gap-0.5 min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                      <span className="truncate">{item.label}</span>
                      {item.alerta && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-headline uppercase tracking-wide leading-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          Pendiente
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer User Info */}
        <div className="px-3 mt-auto">
          <div className={`bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center gap-3 ${collapsed ? 'lg:justify-center lg:p-2' : ''}`}>
            <div
              style={{ color: '#ffffff' }}
              className={`w-10 h-10 rounded-xl ${avatarRol.bg} flex items-center justify-center select-none shrink-0`}
            >
              <span className="material-symbols-outlined text-xl">{avatarRol.icon}</span>
            </div>
            <div className={`flex-1 overflow-hidden ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.nombre || (esSuperAdmin ? 'SuperAdmin SaaS' : etiquetaRol)}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {etiquetaRol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className={`text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg shrink-0 ${collapsed ? 'lg:hidden' : ''}`}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
