import type { Media, MediaListOffset } from '@toolkit/core/media';
import { isImage, isVideo } from '../../media/utils';
import { TinaCMS } from '@tinacms/toolkit';
import { MEDIA_USAGE_THUMBNAIL_SIZE } from './media-usage-thumbnails';

//Represents a reference to a document where a media item is used
export interface DocumentReference {
  collectionName: string;
  collectionLabel: string;
  breadcrumbs: string[];
  editUrl: string;
}

//Represents a media item and the documents it is used in.
export interface MediaUsage {
  media: Media;
  type: 'image' | 'video' | 'other';
  usedIn: DocumentReference[];
}

// Represents the structure of a GraphQL document node returned from TinaCMS, as fetched in the media usage scanning process.
// _sys is a superset of the base Document type (for ui.router compatibility), extended with a `collection` block for scanner routing and labelling.
interface GraphQLDocumentNode {
  _sys: {
    relativePath: string;
    filename: string;
    basename: string;
    path: string;
    breadcrumbs: string[];
    extension: string;
    template: string;
    title?: string;
    hasReferences?: boolean;
    collection: {
      name: string;
      label?: string;
      path: string;
      format: string;
    };
  };
  _values: Record<string, unknown>;
}

// Represents the full response structure of a GraphQL query fetching a collection connection, as fetched in the media usage scanning process.
interface CollectionConnectionResponse {
  collectionConnection: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: GraphQLDocumentNode;
    }[];
  };
}

/**
 * Helper function to construct the edit URL for a given document.
 * @param cms - The TinaCMS instance to use for fetching collection definitions
 * @param document - A TinaCMS Document (GraphQLDocumentNode) for which to construct the edit URL
 * @return A Promise that resolves to the edit URL for the document. (Preview URL if tina-preview flag is enabled, otherwise the default edit URL)
 */
const getDocumentEditUrl = async (
  cms: TinaCMS,
  document: GraphQLDocumentNode
): Promise<string> => {
  const collectionName = document._sys.collection.name;

  // Default edit URL pattern based on collection name and document breadcrumbs
  const breadcrumbsDerivedPath = document._sys.breadcrumbs.join('/');
  let editUrl = `#/collections/edit/${collectionName}/~/${breadcrumbsDerivedPath}`;

  // Check for custom router function in collection UI configuration
  try {
    const collection = cms.api.tina.schema.getCollection(collectionName);
    if (collection?.ui?.router) {
      let customPath = await collection.ui.router({
        document: document,
        collection: collection,
      });
      if (customPath) {
        // Ensure the custom route does not have a leading slash
        customPath = customPath.startsWith('/')
          ? customPath.slice(1)
          : customPath;

        // Construct the URL for the Tina preview based on the custom route and the tina-basepath flag
        const tinaBasePath = cms.flags.get('tina-basepath');
        const tinaPreviewIsSet = cms.flags.get('tina-preview');
        // Without tina-preview, ui.router returns a live page path, not a valid CMS edit URL.
        if (tinaPreviewIsSet) {
          if (tinaBasePath) {
            editUrl = `#/~/${tinaBasePath}/${customPath}`;
          } else {
            editUrl = `#/~/${customPath}`;
          }
        }
      }
    }
  } catch (e) {
    // Fail silently in case the custom router function throws an error, and fall back to the default edit URL
    console.error(
      'Unable to determine custom edit URL for document. Falling back to default edit URL.',
      e
    );
  }

  return editUrl;
};

/**
 * Helper function to scan a document's _values payload for references to media items based on their src paths.
 * @param documentContent - The stringified _values payload from the GraphQL document node
 * @param mediaUsages - Pre-calculated array of media usage objects for reference scanning
 * @returns A Set of media src values referenced in the document
 */
const scanDocumentForMedia = (
  documentContent: string,
  mediaUsages: MediaUsage[]
): Set<string> => {
  // Set to avoid counting multiple occurrences of the same media item in a single document more than once
  const matchedSrcs = new Set<string>();

  for (const mediaUsage of mediaUsages) {
    // JSON.stringify the src so its escaping matches the stringified document content
    // (e.g. quotes become \", backslashes become \\)
    const src = JSON.stringify(mediaUsage.media.src).slice(1, -1);

    let index = documentContent.indexOf(src);

    while (index !== -1) {
      // Evaluate characters before and after to check false positives (e.g. 'img1.png' should not match 'big-img1.png' or 'img1.png2')
      const prevChar = documentContent[index - 1];
      const nextChar = documentContent[index + src.length];

      // A match is valid if the character before and after the src is NOT a valid filename/URL character
      const isPrevValid = !prevChar || !/[a-zA-Z0-9_.%~+-]/.test(prevChar);
      const isNextValid = !nextChar || !/[a-zA-Z0-9_.%~+-]/.test(nextChar);

      if (isPrevValid && isNextValid) {
        matchedSrcs.add(mediaUsage.media.src);
        break;
      }

      // False positive, continue searching (-1 if not found)
      index = documentContent.indexOf(src, index + 1);
    }
  }

  return matchedSrcs;
};

// Note: in local mode, the media store does not generate actual thumbnails, it returns the full
// resolution image src regardless of the requested size.
const THUMBNAIL_SIZES = [MEDIA_USAGE_THUMBNAIL_SIZE];
const BATCH_SIZE = 100;
const UI_YIELD_INTERVAL = 50;

/**
 * Helper function to recursively collect all media files from the CMS.
 *
 * @param cms - The CMS instance to use for fetching media
 * @param mediaSrcToUsageMap - Media usage map to initialize while fetching (in-place)
 * @param currentDirectory - The directory to fetch media from
 * @returns A Promise that resolves when all media items in the directory have been fetched and indexed
 */
const collectAllMedia = async (
  cms: TinaCMS,
  mediaSrcToUsageMap: Record<string, MediaUsage>,
  currentDirectory: string
): Promise<void> => {
  const subDirectories: string[] = [];
  let currentOffset: MediaListOffset | undefined = undefined;
  let moreOffsetsAvailable = true;

  // Fetch all pages / items in the current directory
  while (moreOffsetsAvailable) {
    const list = await cms.media.list({
      directory: currentDirectory,
      offset: currentOffset,
      thumbnailSizes: THUMBNAIL_SIZES,
    });

    // Separate files and directories
    for (const item of list.items) {
      if (item.type === 'file') {
        // Index media items by src with an empty usedIn array
        if (item.src) {
          const isImg = isImage(item.filename);
          const isVid = isVideo(item.filename);
          const type = isImg ? 'image' : isVid ? 'video' : 'other';
          mediaSrcToUsageMap[item.src] = {
            media: item,
            type,
            usedIn: [],
          };
        }
      } else if (item.type === 'dir') {
        // Removes any slashes from the start and end of item.filename
        const directorySegment = item.filename.replace(/^\/+|\/+$/g, '');
        subDirectories.push(
          currentDirectory
            ? `${currentDirectory}/${directorySegment}`
            : directorySegment
        );
      }
    }

    // Check if there are more items to fetch in the current directory based on the presence of a next offset
    currentOffset = list.nextOffset;
    if (!currentOffset) {
      moreOffsetsAvailable = false;
    }
  }

  // Recursively fetch all subdirectories in parallel, promise fails if any single directory fetch fails
  if (subDirectories.length > 0) {
    await Promise.all(
      subDirectories.map((dir) => collectAllMedia(cms, mediaSrcToUsageMap, dir))
    );
  }
};

/**
 * Process all documents in a collection and update the media usage map.
 *
 * @param cms - The CMS instance to use for fetching documents
 * @param collectionMeta - The name and optional label of the collection to process
 * @param mediaSrcToUsageMap - The media usage map to update with found references
 * @returns A Promise that resolves when the collection has been fully processed (mediaSrcToUsageMap will be updated in-place)
 */
const scanCollectionForMediaUsage = async (
  cms: TinaCMS,
  collectionMeta: { name: string; label?: string },
  mediaSrcToUsageMap: Record<string, MediaUsage>
) => {
  let hasNextPage: boolean = true;
  let after: string | undefined = undefined;

  // Pre-calculate the media usages array
  const mediaUsages = Object.values(mediaSrcToUsageMap);

  // Fetch _sys fully because `ui.router` could utilize any of them to construct a route
  const listQuery = `
    query($after: String, $first: Float) {
      collectionConnection: ${collectionMeta.name}Connection(first: $first, after: $after) {
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
                hasReferences
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

  // Paginate through all documents in the collection
  while (hasNextPage) {
    try {
      // Execute the GraphQL query to fetch a page of documents from the collection
      const res = (await cms.api.tina.request(listQuery, {
        variables: { after, first: BATCH_SIZE },
      })) as CollectionConnectionResponse;

      // Extract information from the connection response
      const connection = res.collectionConnection;
      const edges = connection?.edges || [];
      hasNextPage = connection?.pageInfo?.hasNextPage || false;
      after = connection?.pageInfo?.endCursor;

      // Extract document data from edges sequentially
      for (let i = 0; i < edges.length; i++) {
        // Yield to the main thread periodically to avoid freezing the UI on large datasets
        if (i > 0 && i % UI_YIELD_INTERVAL === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        const edge = edges[i];

        // Scan document values for media references
        const matchedSrcs = scanDocumentForMedia(
          JSON.stringify(edge.node._values),
          mediaUsages
        );

        if (matchedSrcs.size === 0) continue;

        const editUrl = await getDocumentEditUrl(cms, edge.node);

        // For each matched media src, add the document reference to the usedIn array
        matchedSrcs.forEach((mediaSrc) => {
          const usage = mediaSrcToUsageMap[mediaSrc];
          if (usage) {
            usage.usedIn.push({
              collectionName: collectionMeta.name,
              breadcrumbs: edge.node._sys.breadcrumbs,
              collectionLabel: collectionMeta.label || collectionMeta.name, // label is optional in the schema
              editUrl,
            });
          }
        });
      }
    } catch (e) {
      console.error(`Error processing collection ${collectionMeta.name}:`, e);
      throw e;
    }
  }
};

/**
 * Scans all media items in the CMS and counts their usage
 * (multiple occurrences in a single document counts as 1 occurrence) across all documents in all collections.
 * @param cms - The CMS instance
 * @param onProgress - Optional callback invoked with progress percentage (0–100) as collections are scanned
 * @returns A Promise resolving to an array of MediaItems with populated usage metrics
 */
export const scanAllMedia = async (
  cms: TinaCMS,
  onProgress?: (percent: number) => void
): Promise<MediaUsage[]> => {
  // Structure to hold media usage data
  const mediaSrcToUsageMap: Record<string, MediaUsage> = {};

  // Collect all media items from the CMS and populate the mediaSrcToUsageMap
  await collectAllMedia(cms, mediaSrcToUsageMap, '');

  // Get all schema collections
  const collectionMetas = cms.api.tina.schema.getCollections();

  // Process each collection for media references
  for (let i = 0; i < collectionMetas.length; i++) {
    await scanCollectionForMediaUsage(
      cms,
      collectionMetas[i],
      mediaSrcToUsageMap
    );
    onProgress?.(((i + 1) / collectionMetas.length) * 100);
  }

  // Return the media usage data as an array
  return Object.values(mediaSrcToUsageMap);
};
