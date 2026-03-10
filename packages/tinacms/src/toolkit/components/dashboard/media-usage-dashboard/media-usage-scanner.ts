import type { Media, MediaListOffset } from '@toolkit/core/media';
import { isImage, isVideo } from '../../media/utils';

/**
 * Utility function to escape special characters in a string for use in a regular expression.
 * @param str - The input string to escape
 * @returns The escaped string safe for use in a regular expression
 */
const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Represents a reference to a document where a media item is used
 */
export interface DocumentReference {
  collection: string;
  relativePath: string;
  collectionLabel: string;
  editUrl: string;
}

/**
 * Represents a media item along with its usage count and the documents it is used in.
 */
export interface MediaUsage {
  media: Media;
  count: number;
  type: 'image' | 'video' | 'other';
  usedIn: DocumentReference[];
}

/**
 * Helper function to construct the edit URL for a given document node,
 * taking into account potential custom routing logic defined in the collection's UI configuration.
 * @param cms - The CMS instance to use for fetching collection definitions
 * @param collectionName - The name of the collection the document belongs to
 * @param documentNode - The document node, expected to include _sys breadcrumbs
 */
const getDocumentEditUrl = async (
  cms: any,
  collectionName: string,
  documentNode: { _sys: { breadcrumbs: string[] }; [key: string]: any }
): Promise<string> => {
  // Default edit URL pattern based on collection name and document breadcrumbs
  const breadcrumbsPath = documentNode._sys?.breadcrumbs?.join('/') || '';
  let editUrl = `#/collections/edit/${collectionName}/~/${breadcrumbsPath}`;

  // Check for custom router function in collection UI configuration to determine edit URL
  try {
    const collectionDef = cms.api.tina.schema.getCollection(collectionName);
    if (collectionDef?.ui?.router) {
      const routeOverride = await collectionDef.ui.router({
        document: documentNode,
        collection: collectionDef,
      });
      if (routeOverride) {
        const cleanRoute = routeOverride.startsWith('/')
          ? routeOverride.slice(1)
          : routeOverride;
        const basePath = cms.flags.get('tina-basepath');
        const tinaPreview = cms.flags.get('tina-preview');
        if (tinaPreview) {
          editUrl = `#/~${basePath ? `/${basePath}` : ''}/${cleanRoute}`;
        }
      }
    }
  } catch (e) {
    // Fail silently and use the default edit URL
  }

  return editUrl;
};

/**
 * Helper function to scan a document's values for media references by serializing
 * the entire _values blob to a string and checking whether each
 * media src path appears as a substring.
 *
 * @param values - The _values payload from the GraphQL document node
 * @param mediaUsages - Pre-calculated array of media usage objects for reference scanning
 * @returns A Set of media IDs referenced in the document
 */
const scanDocumentForMedia = (
  values: unknown,
  mediaUsages: MediaUsage[]
): Set<string> => {
  // Naive implementation: serialize the entire _values object and check for substring matches of each media src path.
  // Use a regex to ensure the match is not a partial substring (e.g. avoiding matching /img.png inside /img.png.webp)
  const matchedIds = new Set<string>();
  const serialized = JSON.stringify(values);

  for (const usage of mediaUsages) {
    const src = usage.media.src;
    if (!src) continue;
    const escapedSrc = escapeRegExp(src);
    // Ensure the src is not immediately followed by a character that could be part of a longer path
    const regex = new RegExp(`${escapedSrc}(?![a-zA-Z0-9._-])`);
    if (regex.test(serialized)) matchedIds.add(usage.media.id);
  }

  return matchedIds;
};

/**
 * Helper function to recursively fetch all media files from the CMS.
 *
 * @param cms - The CMS instance to use for fetching media
 * @param mediaIdToUsageMap - Media usage map to initialize while fetching
 * @param currentDirectory - The directory to fetch media from (used for recursion)
 * @returns A Promise that resolves when all media items in the directory have been fetched and indexed
 */
const fetchAllMedia = async (
  cms: any,
  mediaIdToUsageMap: Record<string, MediaUsage>,
  currentDirectory: string = ''
): Promise<void> => {
  const subDirectories: string[] = [];
  let currentOffset: MediaListOffset | undefined = undefined;
  let moreOffsetsAvailable = true;

  // Fetch all pages / items in the current directory
  while (moreOffsetsAvailable) {
    const list = await cms.media.list({
      directory: currentDirectory,
      offset: currentOffset,
      thumbnailSizes: [{ w: 75, h: 75 }],
    });

    // Separate files and directories
    for (const item of list.items) {
      if (item.type === 'file') {
        // Index media items by ID with initial usage count of 0 and empty usedIn array
        if (item.src) {
          const isImg = isImage(item.filename);
          const isVid = isVideo(item.filename);
          const type = isImg ? 'image' : isVid ? 'video' : 'other';
          mediaIdToUsageMap[item.id] = {
            media: item,
            type,
            count: 0,
            usedIn: [],
          };
        }
      } else if (item.type === 'dir') {
        subDirectories.push(
          currentDirectory
            ? `${currentDirectory}/${item.filename}`
            : item.filename
        );
      }
    }

    currentOffset = list.nextOffset;
    moreOffsetsAvailable = Boolean(currentOffset);
  }

  // Recursively fetch all subdirectories in parallel
  if (subDirectories.length > 0) {
    await Promise.all(
      subDirectories.map((dir) => fetchAllMedia(cms, mediaIdToUsageMap, dir))
    );
  }
};

/**
 * Process all documents in a collection and update the media usage map.
 *
 * @param cms - The CMS instance to use for fetching documents
 * @param collection - The collection definition to process
 * @param mediaIdToUsageMap - The media usage map to update with found references
 * @returns A Promise that resolves when the collection has been fully processed (mediaIdToUsageMap will be updated in-place)
 */
const scanCollectionForMedia = async (
  cms: any,
  collection: any,
  mediaIdToUsageMap: Record<string, MediaUsage>
) => {
  let hasNextPage = true;
  let after = undefined;

  // Pre-calculate the media usages array
  const mediaUsages = Object.values(mediaIdToUsageMap);

  // Paginate through all documents in the collection (cursor-based pagination)
  while (hasNextPage) {
    try {
      // Fetch comprehensively on _sys. Fetching all fields because a developer's custom `ui.router` function could use
      // any of them to construct a route.
      const listQuery = `
          query($after: String) {
            ${collection.name}Connection(first: 100, after: $after) {
              pageInfo { hasNextPage, endCursor }
              edges {
                node {
                  ... on Document {
                    _sys {
                      relativePath
                      filename
                      basename
                      path
                      breadcrumbs
                      extension
                      template
                      title
                      collection {
                        name
                        label
                        path
                        format
                      }
                    }
                    _values
                  }
                }
              }
            }
          }
        `;
      const res = (await cms.api.tina.request(listQuery, {
        variables: { after },
      })) as any;

      // Extract information from the connection response
      const connection = res[`${collection.name}Connection`];
      const edges = connection?.edges || [];
      hasNextPage = connection?.pageInfo?.hasNextPage || false;
      after = connection?.pageInfo?.endCursor;

      // Extract document data from edges sequentially
      for (const edge of edges) {
        // Yield to the main thread briefly to avoid freezing the UI on large datasets
        await new Promise((resolve) => setTimeout(resolve, 0));

        const documentNode = edge.node;
        const relativePath =
          documentNode._sys?.relativePath || 'Unknown relativePath';

        // Scan document values for media references via serialised substring match
        const matchedIds = scanDocumentForMedia(
          documentNode._values || documentNode,
          mediaUsages
        );

        if (matchedIds.size === 0) continue;

        const editUrl = await getDocumentEditUrl(
          cms,
          collection.name,
          documentNode
        );

        matchedIds.forEach((mediaId) => {
          const usage = mediaIdToUsageMap[mediaId];
          if (usage) {
            usage.count += 1;
            usage.usedIn.push({
              collection: collection.name,
              relativePath,
              collectionLabel: collection.label || collection.name,
              editUrl,
            });
          }
        });
      }
    } catch (e) {
      console.error(`Error processing collection ${collection.name}:`, e);
      throw e;
    }
  }
};

/**
 * Scans all media items in the CMS and counts their usage
 * (multiple occurrences in a single document counts as 1 occurrence) across all documents in all collections.
 * @param cms - The CMS instance
 * @returns A Promise resolving to an array of MediaItems with populated usage metrics
 */
export const scanAllMedia = async (cms: any): Promise<MediaUsage[]> => {
  // Structure to hold media usage data
  const mediaIdToUsageMap: Record<string, MediaUsage> = {};

  // Fetch all media items from the CMS and populate the mediaIdToUsageMap
  await fetchAllMedia(cms, mediaIdToUsageMap, '');

  // Fetch all schema collections
  const collectionsRes = (await cms.api.tina.request(
    `query { collections { name label } }`,
    { variables: {} }
  )) as any;
  const collections = collectionsRes?.collections || [];

  // Process each collection for media references
  for (const collection of collections) {
    await scanCollectionForMedia(cms, collection, mediaIdToUsageMap);
  }

  // Return the media usage data as an array
  return Object.values(mediaIdToUsageMap);
};
