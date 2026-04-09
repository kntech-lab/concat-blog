module.exports = {
  async up(knex) {
    const inferPlatform = (value) => {
      const text = String(value || '').toLowerCase();

      if (text.includes('youtube') || text.includes('yt')) {
        return 'YT';
      }
      if (text.includes('tiktok') || text.includes('tik tok') || text.includes('tk')) {
        return 'TK';
      }
      if (text.includes('twitter') || /\bx\b/.test(text)) {
        return 'X';
      }

      return 'Ins';
    };

    const hasRankings = await knex.schema.hasTable('rankings');

    if (!hasRankings) {
      return;
    }

    const hasPlatform = await knex.schema.hasColumn('rankings', 'platform');
    if (!hasPlatform) {
      await knex.schema.alterTable('rankings', (table) => {
        table.string('platform').defaultTo('Ins');
      });
    }

    const rows = await knex('rankings').select(['id', 'title']);

    await Promise.all(
      rows.map((row) =>
        knex('rankings')
          .where({ id: row.id })
          .where((builder) => {
            if (hasPlatform) {
              builder.whereNull('platform').orWhereNotIn('platform', ['Ins', 'X', 'YT', 'TK']);
            }
          })
          .update({ platform: inferPlatform(row.title) })
      )
    );
  },
};
