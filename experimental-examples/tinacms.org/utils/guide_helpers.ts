import { readFile } from './readFile'

const fg = require('fast-glob')
const path = require('path')
const captureGuideVars = /content\/guides\/(.+)\/(.+)\/meta\.json$/
const captureCategoryKey = /content\/guides\/(.+)\/meta\.json$/

export interface GuideStep {
  title: string
  id: string
  slug: string
  data: string
}

export interface GuideMeta {
  key: string
  category: string
  title: string
  steps: GuideStep[]
}

export interface GuideCategoryMeta {
  key: string
  title: string
  weight?: number
}

export interface GuideNavProps {
  [key: string]: {
    title: string
    guides: GuideMeta[]
  }
}

export const getAllGuides = async (): Promise<GuideMeta[]> => {
  // the glob SHOULD be /*/*/meta.json, but there is a bug in fast-glob preventing this form working.
  // until the bug is fixed there are some awkward hacks in here
  // to skip the captured category meta
  const guideFiles = await fg(
    `${path.resolve('./content/guides')}/**/meta.json`
  )

  const guides = await Promise.all(
    guideFiles.map(async (guideFile) => {
      const guide = await getGuideMeta(guideFile)
      if (guide) {
        return {
          ...guide,
        }
      }
    })
  )
  return guides.filter((guide) => !!guide) as GuideMeta[]
}

export const getGuideMeta = async (path: string): Promise<GuideMeta> => {
  const guideData = await readFile(path)
  try {
    const [, categoryKey, guideKey] = captureGuideVars.exec(path)
    return {
      ...JSON.parse(guideData),
      key: guideKey,
      category: categoryKey,
    }
  } catch {
    return null
  }
}

export const getGuideCategoryMeta = async (
  path: string
): Promise<GuideCategoryMeta> => {
  const [, categoryKey] = captureCategoryKey.exec(path)
  try {
    const categoryData = await readFile(path)
    return {
      ...JSON.parse(categoryData),
      key: categoryKey,
    }
  } catch {
    return {
      key: categoryKey,
      title: categoryKey,
    }
  }
}

export const getGuideNavProps = async (): Promise<any> => {
  const guides = await getAllGuides()

  const categories: string[] = Array.from(
    new Set(guides.reduce((acc, guide) => [...acc, guide.category], []))
  )

  return Promise.all(
    await categories.map(async (category) => {
      const categoryMeta = await getGuideCategoryMeta(
        path.resolve(`./content/guides/${category}/meta.json`)
      )
      return {
        weight: Number(categoryMeta.weight),
        id: categoryMeta.key,
        title: categoryMeta.title,
        collapsible: false,
        items: guides
          .filter(
            (guide) =>
              guide && guide.steps.length > 0 && guide.category === category
          )
          .map((guide) => {
            return {
              id: guide.key,
              title: guide.title,
              slug: guide.steps[0].slug || '',
            }
          }),
      }
    })
  )
}
