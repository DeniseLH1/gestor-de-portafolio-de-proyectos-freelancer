import inquirer from 'inquirer';

export async function preguntarFecha(etiqueta) {
  const { dia, mes, anio } = await inquirer.prompt([
    {
      type: 'input',
      name: 'dia',
      message: `Día de ${etiqueta} (1-31):`,
      validate: (v) => {
        const num = Number(v);
        return (Number.isInteger(num) && num >= 1 && num <= 31) || 'Ingresa un día válido, entre 1 y 31.';
      },
    },
    {
      type: 'input',
      name: 'mes',
      message: `Mes de ${etiqueta} (1-12):`,
      validate: (v) => {
        const num = Number(v);
        return (Number.isInteger(num) && num >= 1 && num <= 12) || 'Ingresa un mes válido, entre 1 y 12.';
      },
    },
    {
      type: 'input',
      name: 'anio',
      message: `Año de ${etiqueta} (ej. 2026):`,
      validate: (v) => {
        const num = Number(v);
        return (Number.isInteger(num) && num >= 2000 && num <= 2100) || 'Ingresa un año válido.';
      },
    },
  ]);

  const diaTexto = String(Number(dia)).padStart(2, '0');
  const mesTexto = String(Number(mes)).padStart(2, '0');
  return `${anio}-${mesTexto}-${diaTexto}`;
}

export function validarMonto(valor) {
  if (valor === undefined || valor === null || Number.isNaN(valor) || valor <= 0) {
    return 'El monto ingresado no es válido. Debe ser un número mayor a 0.';
  }
  return true;
}