module.exports = {
  async up(knex) {
    const PLATFORM_ENUM = ['Ins', 'X', 'YT', 'TK'];

    const hasRankings = await knex.schema.hasTable('rankings');
    if (!hasRankings) {
      return;
    }

    const hasPlatform = await knex.schema.hasColumn('rankings', 'platform');
    if (!hasPlatform) {
      return;
    }

    const rows = await knex('rankings').select(['id', 'title', 'platform']);

    const toBackfill = rows.filter((row) => {
      const value = typeof row.platform === 'string' ? row.platform.trim() : '';

      if (!value) {
        return true;
      }

      if (!PLATFORM_ENUM.includes(value)) {
        return true;
      }

      // Historical records were commonly backfilled as Ins; re-distribute them.
      return value === 'Ins';
    });

    const pickPlatform = (row) => {
      const seed = `${String(row.id || '')}:${String(row.title || '')}`;
      let hash = 0;

      for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      }

      return PLATFORM_ENUM[hash % PLATFORM_ENUM.length];
    };

    await Promise.all(
      toBackfill.map((row) =>
        knex('rankings')
          .where({ id: row.id })
          .update({ platform: pickPlatform(row) })
      )
    );
  },
};
