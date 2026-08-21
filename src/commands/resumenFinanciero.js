import fs from 'node:fs/promises';

export async function generarResumenFinancieroCliente() {
    try {
        const contenido = await fs.readFile('./pagos.json', 'utf-8');
        const pagos = JSON.parse(contenido);

        const resumen = pagos.reduce((acumulado, pago) => {
        const clienteId = pago.clienteId;
        const nombreCliente = pago.clienteNombre || `Cliente ID: ${clienteId}`;
        const monto = Number(pago.monto) || 0;

        if (!acumulado[clienteId]) {
            acumulado[clienteId] = {
            clienteId,
            nombre: nombreCliente,
            totalPagado: 0,
            totalTransacciones: 0,
            };
        }

        acumulado[clienteId].totalPagado += monto;
        acumulado[clienteId].totalTransacciones += 1;

        return acumulado;
    }, {});

    let reporteTexto = `===========================================\n`;
    reporteTexto += `     RESUMEN FINANCIERO POR CLIENTE        \n`;
    reporteTexto += `Fecha de emisión: ${new Date().toLocaleDateString()}\n`;
    reporteTexto += `===========================================\n\n`;

    Object.values(resumen).forEach((c) => {
        reporteTexto += `Cliente: ${c.nombre} (ID: ${c.clienteId})\n`;
        reporteTexto += `  - Total de Pagos: ${c.totalTransacciones}\n`;
        reporteTexto += `  - Monto Total Acumulado: $${c.totalPagado.toFixed(2)}\n`;
        reporteTexto += `-------------------------------------------\n`;
    });
    console.log(` --> El reporte financiero se ha creado con exito :)`);
    } catch (error) {
        console.log('Error el reporte no se ha podido generar')
    }
}

generarResumenFinancieroClientes();