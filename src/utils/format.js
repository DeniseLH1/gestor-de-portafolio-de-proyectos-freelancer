import chalk from 'chalk';
import dayjs from 'dayjs';

const COLORES_ESTADO = {
  activo: chalk.green,
  aprobado: chalk.green,
  entregado: chalk.green,
  finalizado: chalk.green,
  pendiente: chalk.yellow,
  borrador: chalk.yellow,
  inactivo: chalk.gray,
  cancelado: chalk.red,
  rechazado: chalk.red,
};

export function formatEstado(estado) {
  const color = COLORES_ESTADO[estado] ?? chalk.white;
  return color(estado);
}

export function formatFecha(fecha) {
  return dayjs(fecha).format('DD/MM/YYYY');
}

export function formatMoneda(monto) {
  return chalk.cyan(`Q${Number(monto).toFixed(2)}`);
}

export function exito(mensaje) {
  return chalk.green.bold(`✔ ${mensaje}`);
}

export function error(mensaje) {
  return chalk.red.bold(`✖ ${mensaje}`);
}