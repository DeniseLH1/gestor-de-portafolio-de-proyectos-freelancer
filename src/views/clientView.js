import Table from 'cli-table3';
import chalk from 'chalk';

export function mostrarCliente(cliente) {
    const table = new Table({
        head: [chalk.cyan('Campo'), chalk.cyan('Valor')],
        wordWrap: true
    });

    table.push(
        { 'ID': cliente.id ?? cliente._id.toString() },
        { 'Nombre': cliente.nombre },
        { 'Email': cliente.email },
        { 'Teléfono': cliente.telefono },
        { 'DPI': cliente.dpi },
        { 'Empresa': cliente.empresa || chalk.gray('N/A') },
        { 'Estado': cliente.estado === 'activo' ? chalk.green('Activo') : chalk.red('Inactivo') },
        { 'Fecha Registro': cliente.fechaRegistro }
    );

    console.log(table.toString());
}