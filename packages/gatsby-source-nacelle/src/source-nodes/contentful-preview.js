const { nacelleClient } = require('../services');
const { replaceKeys } = require('../utils');

module.exports = async function (gatsbyApi, pluginOptions) {
  const { actions, createNodeId, createContentDigest } = gatsbyApi;
  const { createNode } = actions;

  const {
    nacelleSpaceId,
    nacelleGraphqlToken,
    contentfulPreviewSpaceId,
    contentfulPreviewApiToken
  } = pluginOptions;

  const client = nacelleClient({
    previewMode: true,
    nacelleSpaceId,
    nacelleGraphqlToken,
    contentfulPreviewSpaceId,
    contentfulPreviewApiToken
  });

  try {
    const contentData = await client.data
      .allContent()
      .then((
        content // change name of reserved keys
      ) => replaceKeys(content, { id: 'remoteId', fields: 'remoteFields' }))
      .catch((err) => {
        throw new Error(
          `Problem fetching content:\n\n${JSON.stringify(err, null, 2)}`
        );
      });

    contentData.forEach((entry) => {
      const nodeMeta = {
        id: createNodeId(`NacelleContent-${entry.cmsSyncSourceContentId}`),
        parent: null,
        children: [],
        internal: {
          type: 'NacelleContent',
          contentDigest: createContentDigest(entry)
        }
      };
      const node = Object.assign({}, entry, nodeMeta);
      createNode(node);
    });
  } catch (err) {
    throw new Error(
      `Problem sourcing content from Contentful Preview API:\n\n${err}`
    );
  }
};