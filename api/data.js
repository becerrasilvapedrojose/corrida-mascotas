const { db, TABLE, auth } = require('./_lib');

module.exports = async (req, res) => {
  if (!auth(req, res)) return;
  try {
    let rows = [], from = 0;
    for (;;) {
      const { data, error } = await db.from(TABLE).select('*').order('id').range(from, from + 999);
      if (error) throw error;
      rows = rows.concat(data);
      if (data.length < 1000) break;
      from += 1000;
    }
    const { data: c, error: e2 } = await db.from('polera_contador').select('restantes').eq('id', 1).single();
    if (e2) throw e2;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ rows, restantes: c.restantes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
