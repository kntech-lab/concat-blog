module.exports = {
  async up(knex) {
    const hasRankingItems = await knex.schema.hasTable('ranking_items');

    if (!hasRankingItems) {
      return;
    }

    const hasType = await knex.schema.hasColumn('ranking_items', 'type');
    const hasTypeLabel = await knex.schema.hasColumn('ranking_items', 'type_label');
    const hasFollowerLabel = await knex.schema.hasColumn('ranking_items', 'follower_label');
    const hasGenderLabel = await knex.schema.hasColumn('ranking_items', 'gender_label');
    const hasProfilePlatform = await knex.schema.hasColumn('ranking_items', 'profile_platform');

    if (!hasType || !hasFollowerLabel || !hasGenderLabel || !hasProfilePlatform) {
      await knex.schema.alterTable('ranking_items', (table) => {
        if (!hasType) {
          table.string('type');
        }
        if (!hasFollowerLabel) {
          table.string('follower_label').defaultTo('Instagram Followers');
        }
        if (!hasGenderLabel) {
          table.string('gender_label').defaultTo('Gender');
        }
        if (!hasProfilePlatform) {
          table.string('profile_platform').defaultTo('instagram');
        }
      });
    }

    if (hasTypeLabel) {
      await knex('ranking_items')
        .whereNull('type')
        .whereNotNull('type_label')
        .update({ type: knex.ref('type_label') });

      await knex('ranking_items').whereNot('type_label', 'Type').orWhereNull('type_label').update({
        type_label: 'Type',
      });
    }

    await knex('ranking_items').whereNull('follower_label').update({
      follower_label: 'Instagram Followers',
    });
    await knex('ranking_items').whereNull('gender_label').update({ gender_label: 'Gender' });
    await knex('ranking_items').whereNull('profile_platform').update({
      profile_platform: 'instagram',
    });
  },
};
