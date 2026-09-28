const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});
const TABLE = process.env.SUPABASE_TABLE || 'inscripciones';
const SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_KEY || 'cambiar';

const hmac = (p) => crypto.createHmac('sha256', SECRET).update(p).digest('hex');

function sign() {
  const exp = String(Date.now() + 12 * 3600 * 1000); // dura 12 horas
  return exp + '.' + hmac(exp);
}

function auth(req, res) {
  const tok = (req.headers.authorization || '').replace('Bearer ', '');
  const [exp, sig] = tok.split('.');
  const ok =
    exp && sig &&
    Number(exp) > Date.now() &&
    sig.length === 64 &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(hmac(exp)));
  if (!ok) res.status(401).json({ error: 'Sesión no válida' });
  return ok;
}

module.exports = { db, TABLE, sign, auth };
