export const validarDia = (v) => {
  const n = Number(v);
  return (Number.isInteger(n) && n >= 1 && n <= 31) || 'Ingresa un día válido, entre 1 y 31.';
};

export const validarMes = (v) => {
  const n = Number(v);
  return (Number.isInteger(n) && n >= 1 && n <= 12) || 'Ingresa un mes válido, entre 1 y 12.';
};

export const validarAnio = (v) => {
  const n = Number(v);
  return (Number.isInteger(n) && n >= 2000 && n <= 2100) || 'Ingresa un año válido.';
};

export const armarFecha = (dia, mes, anio) =>
  `${anio}-${String(Number(mes)).padStart(2, '0')}-${String(Number(dia)).padStart(2, '0')}`;

export function preguntasFecha(etiqueta, prefijo) {
  return [
    { type: 'input', name: `${prefijo}Dia`, message: `Día de ${etiqueta} (1-31):`, validate: validarDia },
    { type: 'input', name: `${prefijo}Mes`, message: `Mes de ${etiqueta} (1-12):`, validate: validarMes },
    { type: 'input', name: `${prefijo}Anio`, message: `Año de ${etiqueta} (ej. 2026):`, validate: validarAnio },
  ];
}

export function validarMonto(valor) {
  if (valor === undefined || valor === null || Number.isNaN(valor) || valor <= 0) {
    return 'El monto ingresado no es válido. Debe ser un número mayor a 0.';
  }
  return true;
}