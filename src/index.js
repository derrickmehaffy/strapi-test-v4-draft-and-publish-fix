'use strict';

const draftAndPublishSync = require('@strapi/strapi/lib/migrations/draft-publish');
const { hasDraftAndPublish } = require('@strapi/utils').contentTypes;

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Disable the default hook
    strapi.hook('strapi::content-types.beforeSync').delete(draftAndPublishSync.disable);

    // Add a replacement hook and adjust what data is set
    strapi
      .hook('strapi::content-types.beforeSync')
      .register(async function test({ oldContentTypes, contentTypes }) {
        if (!oldContentTypes) {
          return;
        }

        for (const uid in contentTypes) {
          if (!oldContentTypes[uid]) {
            continue;
          }

          const oldContentType = oldContentTypes[uid];
          const contentType = contentTypes[uid];

          // if d&p was disabled remove unpublish content before sync
          if (hasDraftAndPublish(oldContentType) && !hasDraftAndPublish(contentType)) {
            await strapi.db
              .queryBuilder(uid)
              .update({ published_at: new Date().toISOString().slice(0, 19).replace('T', ' ') })
              .where({ published_at: null })
              .execute();
          }
        }
      });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {},

  /**
   * An asynchronous destroy function that runs before
   * your application gets shut down.
   *
   * This gives you an opportunity to gracefully stop services you run.
   */
  destroy({ strapi }) {},
};
