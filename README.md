# Disable Draft and Publish but not delete draft data

Steps to set draft data to published before it's deleted during the automation:

- (optional): If you are on v4.1.9 or below you will need to install [patch-package](https://www.npmjs.com/package/patch-package)
  - Setting the [postinstall script](./package.json#L11) in the `package.json`
  - Install both of the following packages: `patch-package` and `postinstall-postinstall`
  - Copy the `patches` directory which contains the needed fix here: https://github.com/strapi/strapi/pull/13277
- See the `src/index.js` file which contains the code that addresses the problem

The register function runs before the app is completely initialized, thus allowing for modifications of core functions, extending content-types, extending plugins, or loading env vars.

In the case of this example, we are modifying a core hook of the Strapi app related to the core Draft & Publish feature. This hooks checks when were are changes to a content-type (to disable D&P) and will trigger a knex function to delete all data when the `published_at` column is `null`. You can find this example for v4.1.9 [here](https://github.com/strapi/strapi/blob/0f9b69298b2d94b31b434bd7217060570ae89374/packages/core/strapi/lib/migrations/draft-publish.js#L30-L52).

In this example we take that default hook and modify it to fit our needs thus we need to delete the registered default hook and register our own modified version.
You can find this example in the [./src/index.js#L13-L43].

The end result is when you disable draft and publish on a content-type all of the published_at fields are set before the auto-migration kicks in to delete the column and your data is saved :) 
