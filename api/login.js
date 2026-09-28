const { sign } = require('./_lib');

const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { user = '', pass = '' } = req.body || {};
  const okU = norm(user) === norm(process.env.APP_USER || 'fundación');
  const okP = pass === (process.env.APP_PASS || 'rescate2026');
  if (!okU || !okP) return res.status(401).json({ error: 'Usuario o clave incorrectos' });
  res.json({ token: sign() });
};
