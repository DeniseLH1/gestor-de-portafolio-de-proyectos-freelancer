import inquirer from 'inquirer';

export async function preguntarFecha(etiqueta) {
  const { dia, mes, anio } = await inquirer.prompt([
    {
      type: 'number',
      name: 'dia',
      message: `Día de ${etiqueta} (1-31):`,
      validate: (v) => (v >= 1 && v <= 31) || 'Ingresa un día válido, entre 1 y 31.',
    },
    {
      type: 'number',
      name: 'mes',
      message: `Mes de ${etiqueta} (1-12):`,
      validate: (v) => (v >= 1 && v <= 12) || 'Ingresa un mes válido, entre 1 y 12.',
    },
    {
      type: 'number',
      name: 'anio',
      message: `Año de ${etiqueta} (ej. 2026):`,
      validate: (v) => (v >= 2000 && v <= 2100) || 'Ingresa un año válido.',
    },
  ]);

  const diaTexto = String(dia).padStart(2, '0');
  const mesTexto = String(mes).padStart(2, '0');
  return `${anio}-${mesTexto}-${diaTexto}`;
}

export function validarMonto(valor) {
  if (valor === undefined || valor === null || Number.isNaN(valor) || valor <= 0) {
    return 'El monto ingresado no es válido. Debe ser un número mayor a 0.';
  }
  return true;
}