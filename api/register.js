const { db, TABLE, auth } = require('./_lib');

const SYSTEM = ['id', 'created_at', 'asistencia_confirmada', 'polera_cantidad'];

module.exports = async (req, res) => {
  if (req.method !== 'POST' || !auth(req, res)) return;
  const { record = {}, cantidad = 0 } = req.body || {};
  const n = Math.max(0, parseInt(cantidad, 10) || 0);
  const row = {};
  for (const [k, v] of Object.entries(record)) {
    if (SYSTEM.includes(k)) continue;
    row[k] = v === '' || v === undefined ? null : v;
  }
  row.asistencia_confirmada = true;
  row.polera_cantidad = n;
  try {
    if (n > 0) {
      const { data: left, error } = await db.rpc('descontar_poleras', { n });
      if (error) throw error;
      if (left < 0) return res.status(409).json({ error: 'No quedan suficientes poleras' });
    }
    const { error } = await db.from(TABLE).insert(row);
    if (error) {
      if (n > 0) await db.rpc('devolver_poleras', { n });
      throw error;
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
