const { db, TABLE, auth } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST' || !auth(req, res)) return;
  const { id, cantidad = 0 } = req.body || {};
  const n = Math.max(0, parseInt(cantidad, 10) || 0);
  try {
    // 1) marcar asistencia (solo si aún no estaba confirmada)
    const { data: upd, error } = await db.from(TABLE)
      .update({ asistencia_confirmada: true, polera_cantidad: n })
      .eq('id', id).eq('asistencia_confirmada', false).select('id');
    if (error) throw error;
    if (!upd.length) return res.status(409).json({ error: 'Este registro ya estaba confirmado' });

    // 2) descontar poleras del contador
    if (n > 0) {
      const { data: left, error: e2 } = await db.rpc('descontar_poleras', { n });
      if (e2 || left < 0) {
        await db.from(TABLE).update({ asistencia_confirmada: false, polera_cantidad: 0 }).eq('id', id);
        return res.status(409).json({ error: 'No quedan suficientes poleras' });
      }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
