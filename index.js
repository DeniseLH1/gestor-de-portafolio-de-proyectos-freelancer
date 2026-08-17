import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { mainMenu } from './src/submenus/mainMenu.js';

try {
  await mainMenu();
} catch (err) {
  console.error('\n✖ No se pudo iniciar la aplicación.\n');

  if (err.code === 'ENOTFOUND' || err.code === 'ETIMEOUT' || err.message?.includes('querySrv') || err.message?.includes('queryTxt')) {
    console.error('Parece un problema de conexión a internet o de resolución DNS con MongoDB Atlas.');
    console.error('Revisa lo siguiente:');
    console.error('  1. Que tengas conexión a internet.');
    console.error('  2. Que tu archivo .env tenga la cadena MONGODB_URI exacta y completa.');
    console.error('  3. Si tu red bloquea consultas DNS especiales, usa la cadena "estándar" (que empieza con mongodb://, no mongodb+srv://).');
  } else if (err.message?.includes('Falta la variable de entorno')) {
    console.error(err.message);
    console.error('Verifica que exista un archivo .env en la raíz del proyecto, con MONGODB_URI y DB_NAME configurados.');
  } else if (err.code === 8000 || err.codeName === 'AuthenticationFailed') {
    console.error('Usuario o contraseña de MongoDB Atlas incorrectos. Revisa tu MONGODB_URI en el archivo .env.');
  } else {
    console.error('Detalle técnico:', err.message);
  }

  process.exit(1);
}

process.exit(0);