export const COLUMNS = {
  cxc: ['id', 'ruc', 'entidad', 'documento', 'fecha_emision', 'fecha_vencimiento', 'monto', 'tipo_moneda', 'cuenta_contable', 'saldo', 'categoria', 'proyecto_id'],
  cxp: ['id', 'ruc', 'entidad', 'documento', 'fecha_emision', 'fecha_vencimiento', 'moneda', 'saldo', 'categoria', 'proyecto_id'],
  proj: ['proyecto_id', 'entidad', 'proyecto', 'fecha', 'factura', 'sub_total', 'igv', 'total', 'detraccion', 'presupuesto_neto', 'garantias', 'gastado', 'avance', 'saldo', 'estado', 'etapa']
};

export const ALIASES = {
  monto: ['monto', 'total', 'importe', 'importe_mn'],
  saldo: ['saldo', 'pendiente', 'saldo_mn'],
  entidad: ['entidad', 'cliente', 'proveedor', 'anexo', 'razon_social'],
  fecha_vencimiento: ['fecha_vencimiento', 'vcto', 'vencimiento', 'f_venc'],
  proyecto_id: ['proyecto_id', 'cod_proyecto', 'id_proyecto'],
  fecha: ['fecha', 'f_inicio', 'fecha_inicio']
};

export const cleanNum = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/[S/$,\s]/g, '').replace(/,/g, '')) || 0;
};

export const parseExDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date((val - 25569) * 86400 * 1000);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export const getAgingBucket = (days) => {
  if (days <= 0) return 'Por Vencer';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '+90';
};
