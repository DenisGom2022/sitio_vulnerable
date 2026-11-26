const express = require('express');
const { waitForDb } = require('./lib/db');
const { loadSession } = require('./lib/session');
const { sameOrigin, corsAccount, securityHeaders } = require('./lib/security');
const catalogo = require('./routes/catalogo');
const auth = require('./routes/auth');
const cuenta = require('./routes/cuenta');
const pedidos = require('./routes/pedidos');
const admin = require('./routes/admin');
const profesionales = require('./routes/profesionales');
const varios = require('./routes/varios');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback, uniquelocal');
app.use(securityHeaders);
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use('/api', corsAccount);
app.use('/api', loadSession);
app.use('/api', cuenta.sinProteccion);
app.use('/api', sameOrigin);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', catalogo);
app.use('/api/auth', auth.router);
app.use('/api', cuenta.router);
app.use('/api', pedidos);
app.use('/api/admin', admin);
app.use('/api/admin', varios.admin);
app.use('/api', profesionales);
app.use('/api', varios.router);

app.use('/api', (req, res) => res.status(404).json({ error: 'No encontrado' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Petición mal formada' });
  console.error(err);
  res.status(500).json({
    error: err.message,
    code: err.code,
    sql: err.sql,
    stack: err.stack,
    config: {
      db_host: process.env.DB_HOST,
      db_user: process.env.DB_USER,
      db_name: process.env.DB_NAME,
      node: process.version,
    },
  });
});

const PORT = Number(process.env.PORT || 4000);

waitForDb()
  .then(() => app.listen(PORT, () => console.log(`API de Tornillo Mayor en el puerto ${PORT}`)))
  .catch((err) => {
    console.error('No se pudo conectar con MySQL:', err.message);
    process.exit(1);
  });
