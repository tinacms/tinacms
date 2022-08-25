require('dotenv').config()

import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch'

import { fetchRelevantBlogs as fetchBlogs } from '../data-api/fetchBlogs'
import fetchSearchableDocs from '../data-api/fetchDocs'
import fetchGuides from '../data-api/fetchGuides'
import { stripMarkdown } from '../utils/blog_helpers'

const mapContentToIndex = async ({
  content,
  ...obj
}: Partial<{ data: { slug: string }; content: string }>): Promise<
  {
    excerpt: string
    objectID: string
    slug: string
  }[]
> => {
  //Break up the indexes to keep them within the algolia size limit
  //TODO, a smarter regex might be better here, but this seems to work.
  const paragraphs = (content || '')
    .replaceAll('## ', '__BREAKINDEX__')
    .split('__BREAKINDEX__')

  return Promise.all(
    paragraphs.map(async (paragraph, i) => {
      const excerpt = await stripMarkdown(paragraph)
      if (excerpt) {
        return {
          ...obj.data,
          excerpt,
          objectID: obj.data.slug + `_${i}`,
        }
      }
    })
  )
}

const saveIndex = async (
  client: SearchClient,
  indexName: string,
  data: any
) => {
  try {
    const index = client.initIndex(indexName)
    await index.setSettings({
      attributesToSnippet: ['excerpt:50'],
      attributeForDistinct: 'slug',
      distinct: 1,
    })
    const result = await index.saveObjects(data)
    console.log(
      `${indexName}: added/updated ${result.objectIDs.length} entries`
    )
    const numRemoved = await cleanupIndex(index, data)
    if (numRemoved > 0) {
      console.log(`${indexName}: removed ${numRemoved} entries`)
    }
  } catch (error) {
    console.log(error)
  }
}

const cleanupIndex = async (index: SearchIndex, currentData: any) => {
  let currentObjects: Set<string> = new Set()
  let objectsToDelete: Set<string> = new Set()
  let numRemoved = 0
  currentData.map((item) => {
    currentObjects.add(item.objectID)
  })
  await index.browseObjects({
    batch: (hits) => {
      hits.forEach((hit) => {
        if (!currentObjects.has(hit.objectID)) {
          objectsToDelete.add(hit.objectID)
        }
      })
    },
  })
  await Promise.all(
    Array.from(objectsToDelete).map(async (objectID) => {
      await index.deleteObject(objectID)
      numRemoved++
    })
  )
  return numRemoved
}

const createIndices = async () => {
  const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
  )
  const docs = await fetchSearchableDocs()

  await saveIndex(
    client,
    'Tina-Docs-Next',
    (await Promise.all(docs.map(mapContentToIndex))).flat()
  )

  const blogs = await fetchBlogs()
  await saveIndex(
    client,
    'Tina-Blogs-Next',
    (await Promise.all(blogs.map(mapContentToIndex))).flat()
  )

  const guides = await fetchGuides()
  await saveIndex(
    client,
    'Tina-Guides-Next',
    (await Promise.all(guides.map(mapContentToIndex))).flat()
  )
}

createIndices()
  .then(() => {
    console.log('indices created')
  })
  .catch((e) => {
    console.error(e)
    process.kill(1)
  })
