module.exports = {
  async up(knex) {
    const inferPlatform = (title) => {
      const text = String(title || '').toLowerCase();

      if (text.includes('youtube') || /\byt\b/.test(text)) {
        return 'YT';
      }
      if (text.includes('tiktok') || text.includes('tik tok') || /\btk\b/.test(text)) {
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
      return;
    }

    const rows = await knex('rankings').select(['id', 'title']);

    await Promise.all(
      rows.map((row) =>
        knex('rankings')
          .where({ id: row.id })
          .update({ platform: inferPlatform(row.title) })
      )
    );
  },
};
