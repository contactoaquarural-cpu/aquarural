import { create } from 'zustand';
import api from '../services/api.service';

const CONFIG_KEY = 'aquarural-config';
const FORM_KEY = 'aquarural-config-form-v1';

const defaultVals = {
  nombreAcueducto: 'AquaRural',
  nit: '',
  departamento: 'Huila',
  municipio: 'Garzón',
  telefonoContacto: '',
  planSaaS: 'CAUDAL',
  frecuenciaPagoSaaS: 'MENSUAL',
  costoMensualSaaS: 100000,
};

const esNombreValido = (n) => n && typeof n === 'string' && !n.toUpperCase().includes('DFDFDF') && n.trim().length > 2;

const cargarCache = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && esNombreValido(p.nombreAcueducto)) return p;
    }
    return null;
  } catch { return null; }
};

const cache = cargarCache();

export const useConfigStore = create((set) => ({
  nombreAcueducto:  cache?.nombreAcueducto  || defaultVals.nombreAcueducto,
  nit:              cache?.nit              || defaultVals.nit,
  departamento:     cache?.departamento     || defaultVals.departamento,
  municipio:        cache?.municipio        || defaultVals.municipio,
  telefonoContacto: cache?.telefonoContacto || defaultVals.telefonoContacto,
  planSaaS:         cache?.planSaaS         || defaultVals.planSaaS,
  frecuenciaPagoSaaS: cache?.frecuenciaPagoSaaS || defaultVals.frecuenciaPagoSaaS,
  costoMensualSaaS: cache?.costoMensualSaaS  || defaultVals.costoMensualSaaS,
  fechaInicioLicencia: cache?.fechaInicioLicencia || '',
  fechaVencimientoGratis: cache?.fechaVencimientoGratis || '',
  fechaVencimientoMembresia: cache?.fechaVencimientoMembresia || '',
  fechaInicioMembresia: cache?.fechaInicioMembresia || '',
  fechaFinCicloVigente: cache?.fechaFinCicloVigente || '',
  costoSaaSVigente: cache?.costoSaaSVigente || 0,
  historialPagosSaaS: cache?.historialPagosSaaS || [],
  estadoPagoSaaS: cache?.estadoPagoSaaS || 'AL_DIA',

  // Tarifas de agua (acueducto -> asociado), editables por el propio admin.
  tipoTarifa: cache?.tipoTarifa || 'HIBRIDO',
  tarifaBaseMensual: cache?.tarifaBaseMensual || 0,
  cargoFijoMensual: cache?.cargoFijoMensual || 0,
  valorMetroCubico: cache?.valorMetroCubico || 0,
  consumoBasicoIncluido: cache?.consumoBasicoIncluido || 0,
  montoRecargoMora: cache?.montoRecargoMora || 0,
  diaLimitePago: cache?.diaLimitePago || 15,

  resetConfig: () => {
    try {
      localStorage.removeItem(CONFIG_KEY);
      localStorage.removeItem(FORM_KEY);
      localStorage.removeItem('aquarural-acueductos-saas-v1');
    } catch (e) {}
    set(defaultVals);
  },

  guardarConfig: (nuevosDatos) => {
    const nombreFinal = esNombreValido(nuevosDatos.nombre || nuevosDatos.nombreAcueducto)
      ? (nuevosDatos.nombre || nuevosDatos.nombreAcueducto)
      : 'AquaRural Pro';

    const vals = {
      nombreAcueducto:  nombreFinal,
      nit:              nuevosDatos.nit || '',
      departamento:     nuevosDatos.departamento || 'Huila',
      municipio:        nuevosDatos.municipio || 'Garzón',
      telefonoContacto: nuevosDatos.telefono || nuevosDatos.telefonoContacto || '',
      planSaaS:         nuevosDatos.planSaaS || 'CAUDAL',
      frecuenciaPagoSaaS: nuevosDatos.frecuenciaPagoSaaS || 'MENSUAL',
      costoMensualSaaS: nuevosDatos.costoMensualSaaS || 100000,
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(vals));
    set(vals);
  },

  cargarConfig: async () => {
    try {
      const r = await api.get('/configuracion').catch(() => null);
      const d = r?.data?.data || r?.data;
      if (d && esNombreValido(d.nombre || d.nombreAcueducto)) {
        const vals = {
          nombreAcueducto:  d.nombre || d.nombreAcueducto,
          nit:              d.nit || '',
          departamento:     d.departamento     || 'Huila',
          municipio:        d.municipio        || 'Garzón',
          telefonoContacto: d.telefono || d.telefonoContacto || '',
          planSaaS:         d.planSaaS         || 'CAUDAL',
          frecuenciaPagoSaaS: d.frecuenciaPagoSaaS || 'MENSUAL',
          costoMensualSaaS: d.costoMensualSaaS || 100000,
          fechaInicioLicencia: d.fechaInicioLicencia || '',
          fechaVencimientoGratis: d.fechaVencimientoGratis || '',
          fechaVencimientoMembresia: d.fechaVencimientoMembresia || '',
          fechaInicioMembresia: d.fechaInicioMembresia || '',
          fechaFinCicloVigente: d.fechaFinCicloVigente || '',
          costoSaaSVigente: d.costoSaaSVigente || 0,
          historialPagosSaaS: Array.isArray(d.historialPagosSaaS) ? d.historialPagosSaaS : [],
          estadoPagoSaaS: d.estadoPagoSaaS || 'AL_DIA',
          tipoTarifa: d.tipoTarifa || 'HIBRIDO',
          tarifaBaseMensual: d.tarifaBaseMensual || 0,
          cargoFijoMensual: d.cargoFijoMensual || 0,
          valorMetroCubico: d.valorMetroCubico || 0,
          consumoBasicoIncluido: d.consumoBasicoIncluido || 0,
          montoRecargoMora: d.montoRecargoMora || 0,
          diaLimitePago: d.diaLimitePago || 15,
        };
        localStorage.setItem(CONFIG_KEY, JSON.stringify(vals));
        set(vals);
      }
    } catch (e) {}
  },
}));
