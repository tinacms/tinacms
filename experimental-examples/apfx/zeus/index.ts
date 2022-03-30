/* eslint-disable */

import { AllTypesProps, ReturnTypes } from './const'
type ZEUS_INTERFACES =
  | GraphQLTypes['Node']
  | GraphQLTypes['Document']
  | GraphQLTypes['Connection']
type ZEUS_UNIONS =
  | GraphQLTypes['DocumentNode']
  | GraphQLTypes['NavigationItemsPage']
  | GraphQLTypes['PageBlocksNewsNewsItemsArticle']
  | GraphQLTypes['PageBlocksComparisonTableItemsMeta']
  | GraphQLTypes['PageBlocks']

export type ValueTypes = {
  /** References another document, used as a foreign key */
  ['Reference']: unknown
  ['JSON']: unknown
  ['SystemInfo']: AliasType<{
    filename?: boolean
    basename?: boolean
    breadcrumbs?: [{ excludeExtension?: boolean | null }, boolean]
    path?: boolean
    relativePath?: boolean
    extension?: boolean
    template?: boolean
    collection?: ValueTypes['Collection']
    __typename?: boolean
  }>
  ['PageInfo']: AliasType<{
    hasPreviousPage?: boolean
    hasNextPage?: boolean
    startCursor?: boolean
    endCursor?: boolean
    __typename?: boolean
  }>
  ['Node']: AliasType<{
    id?: boolean
    ['...on LocaleInfo']?: Omit<
      ValueTypes['LocaleInfo'],
      keyof ValueTypes['Node']
    >
    ['...on News']?: Omit<ValueTypes['News'], keyof ValueTypes['Node']>
    ['...on Footer']?: Omit<ValueTypes['Footer'], keyof ValueTypes['Node']>
    ['...on Theme']?: Omit<ValueTypes['Theme'], keyof ValueTypes['Node']>
    ['...on Navigation']?: Omit<
      ValueTypes['Navigation'],
      keyof ValueTypes['Node']
    >
    ['...on Page']?: Omit<ValueTypes['Page'], keyof ValueTypes['Node']>
    __typename?: boolean
  }>
  ['Document']: AliasType<{
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    ['...on LocaleInfo']?: Omit<
      ValueTypes['LocaleInfo'],
      keyof ValueTypes['Document']
    >
    ['...on News']?: Omit<ValueTypes['News'], keyof ValueTypes['Document']>
    ['...on Footer']?: Omit<ValueTypes['Footer'], keyof ValueTypes['Document']>
    ['...on Theme']?: Omit<ValueTypes['Theme'], keyof ValueTypes['Document']>
    ['...on Navigation']?: Omit<
      ValueTypes['Navigation'],
      keyof ValueTypes['Document']
    >
    ['...on Page']?: Omit<ValueTypes['Page'], keyof ValueTypes['Document']>
    __typename?: boolean
  }>
  /** A relay-compliant pagination connection */
  ['Connection']: AliasType<{
    totalCount?: boolean
    pageInfo?: ValueTypes['PageInfo']
    ['...on DocumentConnection']?: Omit<
      ValueTypes['DocumentConnection'],
      keyof ValueTypes['Connection']
    >
    ['...on LocaleInfoConnection']?: Omit<
      ValueTypes['LocaleInfoConnection'],
      keyof ValueTypes['Connection']
    >
    ['...on NewsConnection']?: Omit<
      ValueTypes['NewsConnection'],
      keyof ValueTypes['Connection']
    >
    ['...on FooterConnection']?: Omit<
      ValueTypes['FooterConnection'],
      keyof ValueTypes['Connection']
    >
    ['...on ThemeConnection']?: Omit<
      ValueTypes['ThemeConnection'],
      keyof ValueTypes['Connection']
    >
    ['...on NavigationConnection']?: Omit<
      ValueTypes['NavigationConnection'],
      keyof ValueTypes['Connection']
    >
    ['...on PageConnection']?: Omit<
      ValueTypes['PageConnection'],
      keyof ValueTypes['Connection']
    >
    __typename?: boolean
  }>
  ['Query']: AliasType<{
    getOptimizedQuery?: [{ queryString: string }, boolean]
    collection?: [{ collection?: string | null }, ValueTypes['Collection']]
    collections?: ValueTypes['Collection']
    node?: [{ id?: string | null }, ValueTypes['Node']]
    document?: [
      { collection?: string | null; relativePath?: string | null },
      ValueTypes['DocumentNode']
    ]
    documentConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['DocumentFilter'] | null
      },
      ValueTypes['DocumentConnection']
    ]
    localeInfo?: [{ relativePath?: string | null }, ValueTypes['LocaleInfo']]
    localeInfoConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['LocaleInfoFilter'] | null
      },
      ValueTypes['LocaleInfoConnection']
    ]
    news?: [{ relativePath?: string | null }, ValueTypes['News']]
    newsConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['NewsFilter'] | null
      },
      ValueTypes['NewsConnection']
    ]
    footer?: [{ relativePath?: string | null }, ValueTypes['Footer']]
    footerConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['FooterFilter'] | null
      },
      ValueTypes['FooterConnection']
    ]
    theme?: [{ relativePath?: string | null }, ValueTypes['Theme']]
    themeConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['ThemeFilter'] | null
      },
      ValueTypes['ThemeConnection']
    ]
    navigation?: [{ relativePath?: string | null }, ValueTypes['Navigation']]
    navigationConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['NavigationFilter'] | null
      },
      ValueTypes['NavigationConnection']
    ]
    page?: [{ relativePath?: string | null }, ValueTypes['Page']]
    pageConnection?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['PageFilter'] | null
      },
      ValueTypes['PageConnection']
    ]
    __typename?: boolean
  }>
  ['StringFilter']: {
    startsWith?: string | null
    eq?: string | null
    exists?: boolean | null
    in?: (string | undefined | null)[]
  }
  ['LocaleInfoAuFilter']: {
    tel?: ValueTypes['StringFilter'] | null
    signUpLink?: ValueTypes['StringFilter'] | null
    signUpLinkPersonal?: ValueTypes['StringFilter'] | null
    signInLink?: ValueTypes['StringFilter'] | null
  }
  ['LocaleInfoUsFilter']: {
    tel?: ValueTypes['StringFilter'] | null
    signUpLink?: ValueTypes['StringFilter'] | null
    signUpLinkPersonal?: ValueTypes['StringFilter'] | null
    signInLink?: ValueTypes['StringFilter'] | null
  }
  ['LocaleInfoGbFilter']: {
    tel?: ValueTypes['StringFilter'] | null
    signUpLink?: ValueTypes['StringFilter'] | null
    signUpLinkPersonal?: ValueTypes['StringFilter'] | null
    signInLink?: ValueTypes['StringFilter'] | null
  }
  ['LocaleInfoFilter']: {
    au?: ValueTypes['LocaleInfoAuFilter'] | null
    us?: ValueTypes['LocaleInfoUsFilter'] | null
    gb?: ValueTypes['LocaleInfoGbFilter'] | null
  }
  ['DatetimeFilter']: {
    after?: string | null
    before?: string | null
    eq?: string | null
    exists?: boolean | null
    in?: (string | undefined | null)[]
  }
  ['RichTextFilter']: {
    startsWith?: string | null
    eq?: string | null
    exists?: boolean | null
  }
  ['NewsFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    image?: ValueTypes['StringFilter'] | null
    publishDate?: ValueTypes['DatetimeFilter'] | null
    category?: ValueTypes['StringFilter'] | null
    body?: ValueTypes['RichTextFilter'] | null
  }
  ['FooterOfficesFilter']: {
    location?: ValueTypes['StringFilter'] | null
    address?: ValueTypes['StringFilter'] | null
    phone?: ValueTypes['StringFilter'] | null
  }
  ['FooterDisclaimersFilter']: {
    body?: ValueTypes['RichTextFilter'] | null
  }
  ['FooterFilter']: {
    offices?: ValueTypes['FooterOfficesFilter'] | null
    disclaimers?: ValueTypes['FooterDisclaimersFilter'] | null
  }
  ['ThemeFilter']: {
    displayFont?: ValueTypes['StringFilter'] | null
    colorMode?: ValueTypes['StringFilter'] | null
  }
  ['PageSeoFilter']: {
    title?: ValueTypes['StringFilter'] | null
    image?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksNewsNewsItemsArticleFilter']: {
    news?: ValueTypes['NewsFilter'] | null
  }
  ['PageBlocksNewsNewsItemsFilter']: {
    article?: ValueTypes['PageBlocksNewsNewsItemsArticleFilter'] | null
  }
  ['PageBlocksNewsFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    newsItems?: ValueTypes['PageBlocksNewsNewsItemsFilter'] | null
  }
  ['PageBlocksStatsWithImageStatsFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
  }
  ['PageBlocksStatsWithImageFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    image?: ValueTypes['StringFilter'] | null
    stats?: ValueTypes['PageBlocksStatsWithImageStatsFilter'] | null
  }
  ['ImageFilter']: {
    startsWith?: string | null
    eq?: string | null
    exists?: boolean | null
    in?: (string | undefined | null)[]
  }
  ['PageBlocksHeroActionFilter']: {
    callToAction?: ValueTypes['StringFilter'] | null
    linkText?: ValueTypes['StringFilter'] | null
    link?: ValueTypes['StringFilter'] | null
    linkOverride?: ValueTypes['StringFilter'] | null
    secondaryText?: ValueTypes['StringFilter'] | null
    secondaryLink?: ValueTypes['StringFilter'] | null
    secondaryLinkOverride?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksHeroFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    image?: ValueTypes['ImageFilter'] | null
    action?: ValueTypes['PageBlocksHeroActionFilter'] | null
  }
  ['PageBlocksSlideshowItemsActionFilter']: {
    callToAction?: ValueTypes['StringFilter'] | null
    linkText?: ValueTypes['StringFilter'] | null
    link?: ValueTypes['StringFilter'] | null
    linkOverride?: ValueTypes['StringFilter'] | null
    secondaryText?: ValueTypes['StringFilter'] | null
    secondaryLink?: ValueTypes['StringFilter'] | null
    secondaryLinkOverride?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksSlideshowItemsOverlayFilter']: {
    image?: ValueTypes['ImageFilter'] | null
    overlayColor?: ValueTypes['StringFilter'] | null
    overlayOpacity?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksSlideshowItemsFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    action?: ValueTypes['PageBlocksSlideshowItemsActionFilter'] | null
    overlay?: ValueTypes['PageBlocksSlideshowItemsOverlayFilter'] | null
  }
  ['PageBlocksSlideshowFilter']: {
    items?: ValueTypes['PageBlocksSlideshowItemsFilter'] | null
  }
  ['PageBlocksComparisonTableItemsMetaAFilter']: {
    aOne?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksComparisonTableItemsMetaBFilter']: {
    bOne?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksComparisonTableItemsMetaFilter']: {
    a?: ValueTypes['PageBlocksComparisonTableItemsMetaAFilter'] | null
    b?: ValueTypes['PageBlocksComparisonTableItemsMetaBFilter'] | null
  }
  ['PageBlocksComparisonTableItemsFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    bulletPoints?: ValueTypes['StringFilter'] | null
    meta?: ValueTypes['PageBlocksComparisonTableItemsMetaFilter'] | null
  }
  ['PageBlocksComparisonTableActionFilter']: {
    callToAction?: ValueTypes['StringFilter'] | null
    linkText?: ValueTypes['StringFilter'] | null
    link?: ValueTypes['StringFilter'] | null
    linkOverride?: ValueTypes['StringFilter'] | null
    secondaryText?: ValueTypes['StringFilter'] | null
    secondaryLink?: ValueTypes['StringFilter'] | null
    secondaryLinkOverride?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksComparisonTableFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    items?: ValueTypes['PageBlocksComparisonTableItemsFilter'] | null
    action?: ValueTypes['PageBlocksComparisonTableActionFilter'] | null
  }
  ['PageBlocksFeatureFeaturesFilter']: {
    icon?: ValueTypes['StringFilter'] | null
    name?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
  }
  ['PageBlocksFeatureOverlayFilter']: {
    image?: ValueTypes['ImageFilter'] | null
    overlayColor?: ValueTypes['StringFilter'] | null
    overlayOpacity?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksFeatureFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    featureStyle?: ValueTypes['StringFilter'] | null
    features?: ValueTypes['PageBlocksFeatureFeaturesFilter'] | null
    overlay?: ValueTypes['PageBlocksFeatureOverlayFilter'] | null
  }
  ['PageBlocksFullScreenLogoOverlayFilter']: {
    image?: ValueTypes['ImageFilter'] | null
    overlayColor?: ValueTypes['StringFilter'] | null
    overlayOpacity?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksFullScreenLogoFilter']: {
    slogan?: ValueTypes['StringFilter'] | null
    link?: ValueTypes['StringFilter'] | null
    overlay?: ValueTypes['PageBlocksFullScreenLogoOverlayFilter'] | null
  }
  ['PageBlocksFullScreenHeaderActionFilter']: {
    callToAction?: ValueTypes['StringFilter'] | null
    linkText?: ValueTypes['StringFilter'] | null
    link?: ValueTypes['StringFilter'] | null
    linkOverride?: ValueTypes['StringFilter'] | null
    secondaryText?: ValueTypes['StringFilter'] | null
    secondaryLink?: ValueTypes['StringFilter'] | null
    secondaryLinkOverride?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksFullScreenHeaderOverlayFilter']: {
    image?: ValueTypes['ImageFilter'] | null
    overlayColor?: ValueTypes['StringFilter'] | null
    overlayOpacity?: ValueTypes['StringFilter'] | null
  }
  ['PageBlocksFullScreenHeaderFilter']: {
    title?: ValueTypes['StringFilter'] | null
    subTitle?: ValueTypes['StringFilter'] | null
    description?: ValueTypes['RichTextFilter'] | null
    action?: ValueTypes['PageBlocksFullScreenHeaderActionFilter'] | null
    overlay?: ValueTypes['PageBlocksFullScreenHeaderOverlayFilter'] | null
  }
  ['PageBlocksFilter']: {
    news?: ValueTypes['PageBlocksNewsFilter'] | null
    statsWithImage?: ValueTypes['PageBlocksStatsWithImageFilter'] | null
    hero?: ValueTypes['PageBlocksHeroFilter'] | null
    slideshow?: ValueTypes['PageBlocksSlideshowFilter'] | null
    comparisonTable?: ValueTypes['PageBlocksComparisonTableFilter'] | null
    feature?: ValueTypes['PageBlocksFeatureFilter'] | null
    fullScreenLogo?: ValueTypes['PageBlocksFullScreenLogoFilter'] | null
    fullScreenHeader?: ValueTypes['PageBlocksFullScreenHeaderFilter'] | null
  }
  ['PageFilter']: {
    title?: ValueTypes['StringFilter'] | null
    link?: ValueTypes['StringFilter'] | null
    seo?: ValueTypes['PageSeoFilter'] | null
    blocks?: ValueTypes['PageBlocksFilter'] | null
  }
  ['NavigationItemsPageFilter']: {
    page?: ValueTypes['PageFilter'] | null
  }
  ['NavigationItemsFilter']: {
    page?: ValueTypes['NavigationItemsPageFilter'] | null
  }
  ['NavigationFilter']: {
    items?: ValueTypes['NavigationItemsFilter'] | null
  }
  ['DocumentFilter']: {
    localeInfo?: ValueTypes['LocaleInfoFilter'] | null
    news?: ValueTypes['NewsFilter'] | null
    footer?: ValueTypes['FooterFilter'] | null
    theme?: ValueTypes['ThemeFilter'] | null
    navigation?: ValueTypes['NavigationFilter'] | null
    page?: ValueTypes['PageFilter'] | null
  }
  ['DocumentConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['DocumentNode']
    __typename?: boolean
  }>
  ['DocumentConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['DocumentConnectionEdges']
    __typename?: boolean
  }>
  ['Collection']: AliasType<{
    name?: boolean
    slug?: boolean
    label?: boolean
    path?: boolean
    format?: boolean
    matches?: boolean
    templates?: boolean
    fields?: boolean
    documents?: [
      {
        before?: string | null
        after?: string | null
        first?: number | null
        last?: number | null
        sort?: string | null
        filter?: ValueTypes['DocumentFilter'] | null
      },
      ValueTypes['DocumentConnection']
    ]
    __typename?: boolean
  }>
  ['DocumentNode']: AliasType<{
    ['...on LocaleInfo']: ValueTypes['LocaleInfo']
    ['...on News']: ValueTypes['News']
    ['...on Footer']: ValueTypes['Footer']
    ['...on Theme']: ValueTypes['Theme']
    ['...on Navigation']: ValueTypes['Navigation']
    ['...on Page']: ValueTypes['Page']
    __typename?: boolean
  }>
  ['LocaleInfoAu']: AliasType<{
    tel?: boolean
    signUpLink?: boolean
    signUpLinkPersonal?: boolean
    signInLink?: boolean
    __typename?: boolean
  }>
  ['LocaleInfoUs']: AliasType<{
    tel?: boolean
    signUpLink?: boolean
    signUpLinkPersonal?: boolean
    signInLink?: boolean
    __typename?: boolean
  }>
  ['LocaleInfoGb']: AliasType<{
    tel?: boolean
    signUpLink?: boolean
    signUpLinkPersonal?: boolean
    signInLink?: boolean
    __typename?: boolean
  }>
  ['LocaleInfo']: AliasType<{
    au?: ValueTypes['LocaleInfoAu']
    us?: ValueTypes['LocaleInfoUs']
    gb?: ValueTypes['LocaleInfoGb']
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    __typename?: boolean
  }>
  ['LocaleInfoConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['LocaleInfo']
    __typename?: boolean
  }>
  ['LocaleInfoConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['LocaleInfoConnectionEdges']
    __typename?: boolean
  }>
  ['News']: AliasType<{
    title?: boolean
    subTitle?: boolean
    image?: boolean
    publishDate?: boolean
    category?: boolean
    body?: boolean
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    __typename?: boolean
  }>
  ['NewsConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['News']
    __typename?: boolean
  }>
  ['NewsConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['NewsConnectionEdges']
    __typename?: boolean
  }>
  ['FooterOffices']: AliasType<{
    location?: boolean
    address?: boolean
    phone?: boolean
    __typename?: boolean
  }>
  ['FooterDisclaimers']: AliasType<{
    body?: boolean
    __typename?: boolean
  }>
  ['Footer']: AliasType<{
    offices?: ValueTypes['FooterOffices']
    disclaimers?: ValueTypes['FooterDisclaimers']
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    __typename?: boolean
  }>
  ['FooterConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['Footer']
    __typename?: boolean
  }>
  ['FooterConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['FooterConnectionEdges']
    __typename?: boolean
  }>
  ['Theme']: AliasType<{
    displayFont?: boolean
    colorMode?: boolean
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    __typename?: boolean
  }>
  ['ThemeConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['Theme']
    __typename?: boolean
  }>
  ['ThemeConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['ThemeConnectionEdges']
    __typename?: boolean
  }>
  ['NavigationItemsPage']: AliasType<{
    ['...on Page']: ValueTypes['Page']
    __typename?: boolean
  }>
  ['NavigationItems']: AliasType<{
    page?: ValueTypes['NavigationItemsPage']
    __typename?: boolean
  }>
  ['Navigation']: AliasType<{
    items?: ValueTypes['NavigationItems']
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    __typename?: boolean
  }>
  ['NavigationConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['Navigation']
    __typename?: boolean
  }>
  ['NavigationConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['NavigationConnectionEdges']
    __typename?: boolean
  }>
  ['PageSeo']: AliasType<{
    title?: boolean
    image?: boolean
    description?: boolean
    __typename?: boolean
  }>
  ['PageBlocksNewsNewsItemsArticle']: AliasType<{
    ['...on News']: ValueTypes['News']
    __typename?: boolean
  }>
  ['PageBlocksNewsNewsItems']: AliasType<{
    article?: ValueTypes['PageBlocksNewsNewsItemsArticle']
    __typename?: boolean
  }>
  ['PageBlocksNews']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    newsItems?: ValueTypes['PageBlocksNewsNewsItems']
    __typename?: boolean
  }>
  ['PageBlocksStatsWithImageStats']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    __typename?: boolean
  }>
  ['PageBlocksStatsWithImage']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    image?: boolean
    stats?: ValueTypes['PageBlocksStatsWithImageStats']
    __typename?: boolean
  }>
  ['PageBlocksHeroAction']: AliasType<{
    callToAction?: boolean
    linkText?: boolean
    link?: boolean
    linkOverride?: boolean
    secondaryText?: boolean
    secondaryLink?: boolean
    secondaryLinkOverride?: boolean
    __typename?: boolean
  }>
  ['PageBlocksHero']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    image?: boolean
    action?: ValueTypes['PageBlocksHeroAction']
    __typename?: boolean
  }>
  ['PageBlocksSlideshowItemsAction']: AliasType<{
    callToAction?: boolean
    linkText?: boolean
    link?: boolean
    linkOverride?: boolean
    secondaryText?: boolean
    secondaryLink?: boolean
    secondaryLinkOverride?: boolean
    __typename?: boolean
  }>
  ['PageBlocksSlideshowItemsOverlay']: AliasType<{
    image?: boolean
    overlayColor?: boolean
    overlayOpacity?: boolean
    __typename?: boolean
  }>
  ['PageBlocksSlideshowItems']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    action?: ValueTypes['PageBlocksSlideshowItemsAction']
    overlay?: ValueTypes['PageBlocksSlideshowItemsOverlay']
    __typename?: boolean
  }>
  ['PageBlocksSlideshow']: AliasType<{
    items?: ValueTypes['PageBlocksSlideshowItems']
    __typename?: boolean
  }>
  ['PageBlocksComparisonTableItemsMetaA']: AliasType<{
    aOne?: boolean
    __typename?: boolean
  }>
  ['PageBlocksComparisonTableItemsMetaB']: AliasType<{
    bOne?: boolean
    __typename?: boolean
  }>
  ['PageBlocksComparisonTableItemsMeta']: AliasType<{
    ['...on PageBlocksComparisonTableItemsMetaA']: ValueTypes['PageBlocksComparisonTableItemsMetaA']
    ['...on PageBlocksComparisonTableItemsMetaB']: ValueTypes['PageBlocksComparisonTableItemsMetaB']
    __typename?: boolean
  }>
  ['PageBlocksComparisonTableItems']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    bulletPoints?: boolean
    meta?: ValueTypes['PageBlocksComparisonTableItemsMeta']
    __typename?: boolean
  }>
  ['PageBlocksComparisonTableAction']: AliasType<{
    callToAction?: boolean
    linkText?: boolean
    link?: boolean
    linkOverride?: boolean
    secondaryText?: boolean
    secondaryLink?: boolean
    secondaryLinkOverride?: boolean
    __typename?: boolean
  }>
  ['PageBlocksComparisonTable']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    items?: ValueTypes['PageBlocksComparisonTableItems']
    action?: ValueTypes['PageBlocksComparisonTableAction']
    __typename?: boolean
  }>
  ['PageBlocksFeatureFeatures']: AliasType<{
    icon?: boolean
    name?: boolean
    description?: boolean
    __typename?: boolean
  }>
  ['PageBlocksFeatureOverlay']: AliasType<{
    image?: boolean
    overlayColor?: boolean
    overlayOpacity?: boolean
    __typename?: boolean
  }>
  ['PageBlocksFeature']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    featureStyle?: boolean
    features?: ValueTypes['PageBlocksFeatureFeatures']
    overlay?: ValueTypes['PageBlocksFeatureOverlay']
    __typename?: boolean
  }>
  ['PageBlocksFullScreenLogoOverlay']: AliasType<{
    image?: boolean
    overlayColor?: boolean
    overlayOpacity?: boolean
    __typename?: boolean
  }>
  ['PageBlocksFullScreenLogo']: AliasType<{
    slogan?: boolean
    link?: boolean
    overlay?: ValueTypes['PageBlocksFullScreenLogoOverlay']
    __typename?: boolean
  }>
  ['PageBlocksFullScreenHeaderAction']: AliasType<{
    callToAction?: boolean
    linkText?: boolean
    link?: boolean
    linkOverride?: boolean
    secondaryText?: boolean
    secondaryLink?: boolean
    secondaryLinkOverride?: boolean
    __typename?: boolean
  }>
  ['PageBlocksFullScreenHeaderOverlay']: AliasType<{
    image?: boolean
    overlayColor?: boolean
    overlayOpacity?: boolean
    __typename?: boolean
  }>
  ['PageBlocksFullScreenHeader']: AliasType<{
    title?: boolean
    subTitle?: boolean
    description?: boolean
    action?: ValueTypes['PageBlocksFullScreenHeaderAction']
    overlay?: ValueTypes['PageBlocksFullScreenHeaderOverlay']
    __typename?: boolean
  }>
  ['PageBlocks']: AliasType<{
    ['...on PageBlocksNews']: ValueTypes['PageBlocksNews']
    ['...on PageBlocksStatsWithImage']: ValueTypes['PageBlocksStatsWithImage']
    ['...on PageBlocksHero']: ValueTypes['PageBlocksHero']
    ['...on PageBlocksSlideshow']: ValueTypes['PageBlocksSlideshow']
    ['...on PageBlocksComparisonTable']: ValueTypes['PageBlocksComparisonTable']
    ['...on PageBlocksFeature']: ValueTypes['PageBlocksFeature']
    ['...on PageBlocksFullScreenLogo']: ValueTypes['PageBlocksFullScreenLogo']
    ['...on PageBlocksFullScreenHeader']: ValueTypes['PageBlocksFullScreenHeader']
    __typename?: boolean
  }>
  ['Page']: AliasType<{
    title?: boolean
    link?: boolean
    seo?: ValueTypes['PageSeo']
    blocks?: ValueTypes['PageBlocks']
    id?: boolean
    _sys?: ValueTypes['SystemInfo']
    _values?: boolean
    __typename?: boolean
  }>
  ['PageConnectionEdges']: AliasType<{
    cursor?: boolean
    node?: ValueTypes['Page']
    __typename?: boolean
  }>
  ['PageConnection']: AliasType<{
    pageInfo?: ValueTypes['PageInfo']
    totalCount?: boolean
    edges?: ValueTypes['PageConnectionEdges']
    __typename?: boolean
  }>
  ['Mutation']: AliasType<{
    addPendingDocument?: [
      { collection: string; relativePath: string; template?: string | null },
      ValueTypes['DocumentNode']
    ]
    updateDocument?: [
      {
        collection?: string | null
        relativePath: string
        params: ValueTypes['DocumentMutation']
      },
      ValueTypes['DocumentNode']
    ]
    createDocument?: [
      {
        collection?: string | null
        relativePath: string
        params: ValueTypes['DocumentMutation']
      },
      ValueTypes['DocumentNode']
    ]
    updateLocaleInfo?: [
      { relativePath: string; params: ValueTypes['LocaleInfoMutation'] },
      ValueTypes['LocaleInfo']
    ]
    createLocaleInfo?: [
      { relativePath: string; params: ValueTypes['LocaleInfoMutation'] },
      ValueTypes['LocaleInfo']
    ]
    updateNews?: [
      { relativePath: string; params: ValueTypes['NewsMutation'] },
      ValueTypes['News']
    ]
    createNews?: [
      { relativePath: string; params: ValueTypes['NewsMutation'] },
      ValueTypes['News']
    ]
    updateFooter?: [
      { relativePath: string; params: ValueTypes['FooterMutation'] },
      ValueTypes['Footer']
    ]
    createFooter?: [
      { relativePath: string; params: ValueTypes['FooterMutation'] },
      ValueTypes['Footer']
    ]
    updateTheme?: [
      { relativePath: string; params: ValueTypes['ThemeMutation'] },
      ValueTypes['Theme']
    ]
    createTheme?: [
      { relativePath: string; params: ValueTypes['ThemeMutation'] },
      ValueTypes['Theme']
    ]
    updateNavigation?: [
      { relativePath: string; params: ValueTypes['NavigationMutation'] },
      ValueTypes['Navigation']
    ]
    createNavigation?: [
      { relativePath: string; params: ValueTypes['NavigationMutation'] },
      ValueTypes['Navigation']
    ]
    updatePage?: [
      { relativePath: string; params: ValueTypes['PageMutation'] },
      ValueTypes['Page']
    ]
    createPage?: [
      { relativePath: string; params: ValueTypes['PageMutation'] },
      ValueTypes['Page']
    ]
    __typename?: boolean
  }>
  ['DocumentMutation']: {
    localeInfo?: ValueTypes['LocaleInfoMutation'] | null
    news?: ValueTypes['NewsMutation'] | null
    footer?: ValueTypes['FooterMutation'] | null
    theme?: ValueTypes['ThemeMutation'] | null
    navigation?: ValueTypes['NavigationMutation'] | null
    page?: ValueTypes['PageMutation'] | null
  }
  ['LocaleInfoAuMutation']: {
    tel?: string | null
    signUpLink?: string | null
    signUpLinkPersonal?: string | null
    signInLink?: string | null
  }
  ['LocaleInfoUsMutation']: {
    tel?: string | null
    signUpLink?: string | null
    signUpLinkPersonal?: string | null
    signInLink?: string | null
  }
  ['LocaleInfoGbMutation']: {
    tel?: string | null
    signUpLink?: string | null
    signUpLinkPersonal?: string | null
    signInLink?: string | null
  }
  ['LocaleInfoMutation']: {
    au?: ValueTypes['LocaleInfoAuMutation'] | null
    us?: ValueTypes['LocaleInfoUsMutation'] | null
    gb?: ValueTypes['LocaleInfoGbMutation'] | null
  }
  ['NewsMutation']: {
    title?: string | null
    subTitle?: string | null
    image?: string | null
    publishDate?: string | null
    category?: string | null
    body?: ValueTypes['JSON'] | null
  }
  ['FooterOfficesMutation']: {
    location?: string | null
    address?: string | null
    phone?: string | null
  }
  ['FooterDisclaimersMutation']: {
    body?: ValueTypes['JSON'] | null
  }
  ['FooterMutation']: {
    offices?: (ValueTypes['FooterOfficesMutation'] | undefined | null)[]
    disclaimers?: (ValueTypes['FooterDisclaimersMutation'] | undefined | null)[]
  }
  ['ThemeMutation']: {
    displayFont?: string | null
    colorMode?: string | null
  }
  ['NavigationItemsMutation']: {
    page?: string | null
  }
  ['NavigationMutation']: {
    items?: (ValueTypes['NavigationItemsMutation'] | undefined | null)[]
  }
  ['PageSeoMutation']: {
    title?: string | null
    image?: string | null
    description?: string | null
  }
  ['PageBlocksNewsNewsItemsMutation']: {
    article?: string | null
  }
  ['PageBlocksNewsMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    newsItems?: (
      | ValueTypes['PageBlocksNewsNewsItemsMutation']
      | undefined
      | null
    )[]
  }
  ['PageBlocksStatsWithImageStatsMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
  }
  ['PageBlocksStatsWithImageMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    image?: string | null
    stats?: (
      | ValueTypes['PageBlocksStatsWithImageStatsMutation']
      | undefined
      | null
    )[]
  }
  ['PageBlocksHeroActionMutation']: {
    callToAction?: string | null
    linkText?: string | null
    link?: string | null
    linkOverride?: string | null
    secondaryText?: string | null
    secondaryLink?: string | null
    secondaryLinkOverride?: string | null
  }
  ['PageBlocksHeroMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    image?: string | null
    action?: ValueTypes['PageBlocksHeroActionMutation'] | null
  }
  ['PageBlocksSlideshowItemsActionMutation']: {
    callToAction?: string | null
    linkText?: string | null
    link?: string | null
    linkOverride?: string | null
    secondaryText?: string | null
    secondaryLink?: string | null
    secondaryLinkOverride?: string | null
  }
  ['PageBlocksSlideshowItemsOverlayMutation']: {
    image?: string | null
    overlayColor?: string | null
    overlayOpacity?: string | null
  }
  ['PageBlocksSlideshowItemsMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    action?: ValueTypes['PageBlocksSlideshowItemsActionMutation'] | null
    overlay?: ValueTypes['PageBlocksSlideshowItemsOverlayMutation'] | null
  }
  ['PageBlocksSlideshowMutation']: {
    items?: (
      | ValueTypes['PageBlocksSlideshowItemsMutation']
      | undefined
      | null
    )[]
  }
  ['PageBlocksComparisonTableItemsMetaAMutation']: {
    aOne?: string | null
  }
  ['PageBlocksComparisonTableItemsMetaBMutation']: {
    bOne?: string | null
  }
  ['PageBlocksComparisonTableItemsMetaMutation']: {
    a?: ValueTypes['PageBlocksComparisonTableItemsMetaAMutation'] | null
    b?: ValueTypes['PageBlocksComparisonTableItemsMetaBMutation'] | null
  }
  ['PageBlocksComparisonTableItemsMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    bulletPoints?: (string | undefined | null)[]
    meta?: (
      | ValueTypes['PageBlocksComparisonTableItemsMetaMutation']
      | undefined
      | null
    )[]
  }
  ['PageBlocksComparisonTableActionMutation']: {
    callToAction?: string | null
    linkText?: string | null
    link?: string | null
    linkOverride?: string | null
    secondaryText?: string | null
    secondaryLink?: string | null
    secondaryLinkOverride?: string | null
  }
  ['PageBlocksComparisonTableMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    items?: (
      | ValueTypes['PageBlocksComparisonTableItemsMutation']
      | undefined
      | null
    )[]
    action?: ValueTypes['PageBlocksComparisonTableActionMutation'] | null
  }
  ['PageBlocksFeatureFeaturesMutation']: {
    icon?: string | null
    name?: string | null
    description?: ValueTypes['JSON'] | null
  }
  ['PageBlocksFeatureOverlayMutation']: {
    image?: string | null
    overlayColor?: string | null
    overlayOpacity?: string | null
  }
  ['PageBlocksFeatureMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    featureStyle?: string | null
    features?: (
      | ValueTypes['PageBlocksFeatureFeaturesMutation']
      | undefined
      | null
    )[]
    overlay?: ValueTypes['PageBlocksFeatureOverlayMutation'] | null
  }
  ['PageBlocksFullScreenLogoOverlayMutation']: {
    image?: string | null
    overlayColor?: string | null
    overlayOpacity?: string | null
  }
  ['PageBlocksFullScreenLogoMutation']: {
    slogan?: string | null
    link?: string | null
    overlay?: ValueTypes['PageBlocksFullScreenLogoOverlayMutation'] | null
  }
  ['PageBlocksFullScreenHeaderActionMutation']: {
    callToAction?: string | null
    linkText?: string | null
    link?: string | null
    linkOverride?: string | null
    secondaryText?: string | null
    secondaryLink?: string | null
    secondaryLinkOverride?: string | null
  }
  ['PageBlocksFullScreenHeaderOverlayMutation']: {
    image?: string | null
    overlayColor?: string | null
    overlayOpacity?: string | null
  }
  ['PageBlocksFullScreenHeaderMutation']: {
    title?: string | null
    subTitle?: string | null
    description?: ValueTypes['JSON'] | null
    action?: ValueTypes['PageBlocksFullScreenHeaderActionMutation'] | null
    overlay?: ValueTypes['PageBlocksFullScreenHeaderOverlayMutation'] | null
  }
  ['PageBlocksMutation']: {
    news?: ValueTypes['PageBlocksNewsMutation'] | null
    statsWithImage?: ValueTypes['PageBlocksStatsWithImageMutation'] | null
    hero?: ValueTypes['PageBlocksHeroMutation'] | null
    slideshow?: ValueTypes['PageBlocksSlideshowMutation'] | null
    comparisonTable?: ValueTypes['PageBlocksComparisonTableMutation'] | null
    feature?: ValueTypes['PageBlocksFeatureMutation'] | null
    fullScreenLogo?: ValueTypes['PageBlocksFullScreenLogoMutation'] | null
    fullScreenHeader?: ValueTypes['PageBlocksFullScreenHeaderMutation'] | null
  }
  ['PageMutation']: {
    title?: string | null
    link?: string | null
    seo?: ValueTypes['PageSeoMutation'] | null
    blocks?: (ValueTypes['PageBlocksMutation'] | undefined | null)[]
  }
}

export type ModelTypes = {
  /** References another document, used as a foreign key */
  ['Reference']: any
  ['JSON']: any
  ['SystemInfo']: {
    filename: string
    basename: string
    breadcrumbs: string[]
    path: string
    relativePath: string
    extension: string
    template: string
    collection: ModelTypes['Collection']
  }
  ['PageInfo']: {
    hasPreviousPage: boolean
    hasNextPage: boolean
    startCursor: string
    endCursor: string
  }
  ['Node']:
    | ModelTypes['LocaleInfo']
    | ModelTypes['News']
    | ModelTypes['Footer']
    | ModelTypes['Theme']
    | ModelTypes['Navigation']
    | ModelTypes['Page']
  ['Document']:
    | ModelTypes['LocaleInfo']
    | ModelTypes['News']
    | ModelTypes['Footer']
    | ModelTypes['Theme']
    | ModelTypes['Navigation']
    | ModelTypes['Page']
  /** A relay-compliant pagination connection */
  ['Connection']:
    | ModelTypes['DocumentConnection']
    | ModelTypes['LocaleInfoConnection']
    | ModelTypes['NewsConnection']
    | ModelTypes['FooterConnection']
    | ModelTypes['ThemeConnection']
    | ModelTypes['NavigationConnection']
    | ModelTypes['PageConnection']
  ['Query']: {
    getOptimizedQuery?: string
    collection: ModelTypes['Collection']
    collections: ModelTypes['Collection'][]
    node: ModelTypes['Node']
    document: ModelTypes['DocumentNode']
    documentConnection: ModelTypes['DocumentConnection']
    localeInfo: ModelTypes['LocaleInfo']
    localeInfoConnection: ModelTypes['LocaleInfoConnection']
    news: ModelTypes['News']
    newsConnection: ModelTypes['NewsConnection']
    footer: ModelTypes['Footer']
    footerConnection: ModelTypes['FooterConnection']
    theme: ModelTypes['Theme']
    themeConnection: ModelTypes['ThemeConnection']
    navigation: ModelTypes['Navigation']
    navigationConnection: ModelTypes['NavigationConnection']
    page: ModelTypes['Page']
    pageConnection: ModelTypes['PageConnection']
  }
  ['StringFilter']: GraphQLTypes['StringFilter']
  ['LocaleInfoAuFilter']: GraphQLTypes['LocaleInfoAuFilter']
  ['LocaleInfoUsFilter']: GraphQLTypes['LocaleInfoUsFilter']
  ['LocaleInfoGbFilter']: GraphQLTypes['LocaleInfoGbFilter']
  ['LocaleInfoFilter']: GraphQLTypes['LocaleInfoFilter']
  ['DatetimeFilter']: GraphQLTypes['DatetimeFilter']
  ['RichTextFilter']: GraphQLTypes['RichTextFilter']
  ['NewsFilter']: GraphQLTypes['NewsFilter']
  ['FooterOfficesFilter']: GraphQLTypes['FooterOfficesFilter']
  ['FooterDisclaimersFilter']: GraphQLTypes['FooterDisclaimersFilter']
  ['FooterFilter']: GraphQLTypes['FooterFilter']
  ['ThemeFilter']: GraphQLTypes['ThemeFilter']
  ['PageSeoFilter']: GraphQLTypes['PageSeoFilter']
  ['PageBlocksNewsNewsItemsArticleFilter']: GraphQLTypes['PageBlocksNewsNewsItemsArticleFilter']
  ['PageBlocksNewsNewsItemsFilter']: GraphQLTypes['PageBlocksNewsNewsItemsFilter']
  ['PageBlocksNewsFilter']: GraphQLTypes['PageBlocksNewsFilter']
  ['PageBlocksStatsWithImageStatsFilter']: GraphQLTypes['PageBlocksStatsWithImageStatsFilter']
  ['PageBlocksStatsWithImageFilter']: GraphQLTypes['PageBlocksStatsWithImageFilter']
  ['ImageFilter']: GraphQLTypes['ImageFilter']
  ['PageBlocksHeroActionFilter']: GraphQLTypes['PageBlocksHeroActionFilter']
  ['PageBlocksHeroFilter']: GraphQLTypes['PageBlocksHeroFilter']
  ['PageBlocksSlideshowItemsActionFilter']: GraphQLTypes['PageBlocksSlideshowItemsActionFilter']
  ['PageBlocksSlideshowItemsOverlayFilter']: GraphQLTypes['PageBlocksSlideshowItemsOverlayFilter']
  ['PageBlocksSlideshowItemsFilter']: GraphQLTypes['PageBlocksSlideshowItemsFilter']
  ['PageBlocksSlideshowFilter']: GraphQLTypes['PageBlocksSlideshowFilter']
  ['PageBlocksComparisonTableItemsMetaAFilter']: GraphQLTypes['PageBlocksComparisonTableItemsMetaAFilter']
  ['PageBlocksComparisonTableItemsMetaBFilter']: GraphQLTypes['PageBlocksComparisonTableItemsMetaBFilter']
  ['PageBlocksComparisonTableItemsMetaFilter']: GraphQLTypes['PageBlocksComparisonTableItemsMetaFilter']
  ['PageBlocksComparisonTableItemsFilter']: GraphQLTypes['PageBlocksComparisonTableItemsFilter']
  ['PageBlocksComparisonTableActionFilter']: GraphQLTypes['PageBlocksComparisonTableActionFilter']
  ['PageBlocksComparisonTableFilter']: GraphQLTypes['PageBlocksComparisonTableFilter']
  ['PageBlocksFeatureFeaturesFilter']: GraphQLTypes['PageBlocksFeatureFeaturesFilter']
  ['PageBlocksFeatureOverlayFilter']: GraphQLTypes['PageBlocksFeatureOverlayFilter']
  ['PageBlocksFeatureFilter']: GraphQLTypes['PageBlocksFeatureFilter']
  ['PageBlocksFullScreenLogoOverlayFilter']: GraphQLTypes['PageBlocksFullScreenLogoOverlayFilter']
  ['PageBlocksFullScreenLogoFilter']: GraphQLTypes['PageBlocksFullScreenLogoFilter']
  ['PageBlocksFullScreenHeaderActionFilter']: GraphQLTypes['PageBlocksFullScreenHeaderActionFilter']
  ['PageBlocksFullScreenHeaderOverlayFilter']: GraphQLTypes['PageBlocksFullScreenHeaderOverlayFilter']
  ['PageBlocksFullScreenHeaderFilter']: GraphQLTypes['PageBlocksFullScreenHeaderFilter']
  ['PageBlocksFilter']: GraphQLTypes['PageBlocksFilter']
  ['PageFilter']: GraphQLTypes['PageFilter']
  ['NavigationItemsPageFilter']: GraphQLTypes['NavigationItemsPageFilter']
  ['NavigationItemsFilter']: GraphQLTypes['NavigationItemsFilter']
  ['NavigationFilter']: GraphQLTypes['NavigationFilter']
  ['DocumentFilter']: GraphQLTypes['DocumentFilter']
  ['DocumentConnectionEdges']: {
    cursor: string
    node?: ModelTypes['DocumentNode']
  }
  ['DocumentConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['DocumentConnectionEdges'] | undefined)[]
  }
  ['Collection']: {
    name: string
    slug: string
    label?: string
    path: string
    format?: string
    matches?: string
    templates?: (ModelTypes['JSON'] | undefined)[]
    fields?: (ModelTypes['JSON'] | undefined)[]
    documents: ModelTypes['DocumentConnection']
  }
  ['DocumentNode']:
    | ModelTypes['LocaleInfo']
    | ModelTypes['News']
    | ModelTypes['Footer']
    | ModelTypes['Theme']
    | ModelTypes['Navigation']
    | ModelTypes['Page']
  ['LocaleInfoAu']: {
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoUs']: {
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoGb']: {
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfo']: {
    au?: ModelTypes['LocaleInfoAu']
    us?: ModelTypes['LocaleInfoUs']
    gb?: ModelTypes['LocaleInfoGb']
    id: string
    _sys: ModelTypes['SystemInfo']
    _values: ModelTypes['JSON']
  }
  ['LocaleInfoConnectionEdges']: {
    cursor: string
    node?: ModelTypes['LocaleInfo']
  }
  ['LocaleInfoConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['LocaleInfoConnectionEdges'] | undefined)[]
  }
  ['News']: {
    title: string
    subTitle?: string
    image?: string
    publishDate?: string
    category?: string
    body?: ModelTypes['JSON']
    id: string
    _sys: ModelTypes['SystemInfo']
    _values: ModelTypes['JSON']
  }
  ['NewsConnectionEdges']: {
    cursor: string
    node?: ModelTypes['News']
  }
  ['NewsConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['NewsConnectionEdges'] | undefined)[]
  }
  ['FooterOffices']: {
    location: string
    address: string
    phone: string
  }
  ['FooterDisclaimers']: {
    body?: ModelTypes['JSON']
  }
  ['Footer']: {
    offices?: (ModelTypes['FooterOffices'] | undefined)[]
    disclaimers: ModelTypes['FooterDisclaimers'][]
    id: string
    _sys: ModelTypes['SystemInfo']
    _values: ModelTypes['JSON']
  }
  ['FooterConnectionEdges']: {
    cursor: string
    node?: ModelTypes['Footer']
  }
  ['FooterConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['FooterConnectionEdges'] | undefined)[]
  }
  ['Theme']: {
    displayFont?: string
    colorMode?: string
    id: string
    _sys: ModelTypes['SystemInfo']
    _values: ModelTypes['JSON']
  }
  ['ThemeConnectionEdges']: {
    cursor: string
    node?: ModelTypes['Theme']
  }
  ['ThemeConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['ThemeConnectionEdges'] | undefined)[]
  }
  ['NavigationItemsPage']: ModelTypes['Page']
  ['NavigationItems']: {
    page?: ModelTypes['NavigationItemsPage']
  }
  ['Navigation']: {
    items: ModelTypes['NavigationItems'][]
    id: string
    _sys: ModelTypes['SystemInfo']
    _values: ModelTypes['JSON']
  }
  ['NavigationConnectionEdges']: {
    cursor: string
    node?: ModelTypes['Navigation']
  }
  ['NavigationConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['NavigationConnectionEdges'] | undefined)[]
  }
  ['PageSeo']: {
    title?: string
    image?: string
    description: string
  }
  ['PageBlocksNewsNewsItemsArticle']: ModelTypes['News']
  ['PageBlocksNewsNewsItems']: {
    article: ModelTypes['PageBlocksNewsNewsItemsArticle']
  }
  ['PageBlocksNews']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    newsItems: ModelTypes['PageBlocksNewsNewsItems'][]
  }
  ['PageBlocksStatsWithImageStats']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
  }
  ['PageBlocksStatsWithImage']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    image?: string
    stats?: (ModelTypes['PageBlocksStatsWithImageStats'] | undefined)[]
  }
  ['PageBlocksHeroAction']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksHero']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    image?: string
    action?: ModelTypes['PageBlocksHeroAction']
  }
  ['PageBlocksSlideshowItemsAction']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksSlideshowItemsOverlay']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksSlideshowItems']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    action?: ModelTypes['PageBlocksSlideshowItemsAction']
    overlay?: ModelTypes['PageBlocksSlideshowItemsOverlay']
  }
  ['PageBlocksSlideshow']: {
    items?: (ModelTypes['PageBlocksSlideshowItems'] | undefined)[]
  }
  ['PageBlocksComparisonTableItemsMetaA']: {
    aOne?: string
  }
  ['PageBlocksComparisonTableItemsMetaB']: {
    bOne?: string
  }
  ['PageBlocksComparisonTableItemsMeta']:
    | ModelTypes['PageBlocksComparisonTableItemsMetaA']
    | ModelTypes['PageBlocksComparisonTableItemsMetaB']
  ['PageBlocksComparisonTableItems']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    bulletPoints?: (string | undefined)[]
    meta?: (ModelTypes['PageBlocksComparisonTableItemsMeta'] | undefined)[]
  }
  ['PageBlocksComparisonTableAction']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksComparisonTable']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    items?: (ModelTypes['PageBlocksComparisonTableItems'] | undefined)[]
    action?: ModelTypes['PageBlocksComparisonTableAction']
  }
  ['PageBlocksFeatureFeatures']: {
    icon: string
    name: string
    description: ModelTypes['JSON']
  }
  ['PageBlocksFeatureOverlay']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFeature']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    featureStyle?: string
    features: ModelTypes['PageBlocksFeatureFeatures'][]
    overlay?: ModelTypes['PageBlocksFeatureOverlay']
  }
  ['PageBlocksFullScreenLogoOverlay']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFullScreenLogo']: {
    slogan?: string
    link?: string
    overlay?: ModelTypes['PageBlocksFullScreenLogoOverlay']
  }
  ['PageBlocksFullScreenHeaderAction']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksFullScreenHeaderOverlay']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFullScreenHeader']: {
    title: string
    subTitle?: string
    description: ModelTypes['JSON']
    action?: ModelTypes['PageBlocksFullScreenHeaderAction']
    overlay?: ModelTypes['PageBlocksFullScreenHeaderOverlay']
  }
  ['PageBlocks']:
    | ModelTypes['PageBlocksNews']
    | ModelTypes['PageBlocksStatsWithImage']
    | ModelTypes['PageBlocksHero']
    | ModelTypes['PageBlocksSlideshow']
    | ModelTypes['PageBlocksComparisonTable']
    | ModelTypes['PageBlocksFeature']
    | ModelTypes['PageBlocksFullScreenLogo']
    | ModelTypes['PageBlocksFullScreenHeader']
  ['Page']: {
    title: string
    link: string
    seo?: ModelTypes['PageSeo']
    blocks?: (ModelTypes['PageBlocks'] | undefined)[]
    id: string
    _sys: ModelTypes['SystemInfo']
    _values: ModelTypes['JSON']
  }
  ['PageConnectionEdges']: {
    cursor: string
    node?: ModelTypes['Page']
  }
  ['PageConnection']: {
    pageInfo: ModelTypes['PageInfo']
    totalCount: number
    edges?: (ModelTypes['PageConnectionEdges'] | undefined)[]
  }
  ['Mutation']: {
    addPendingDocument: ModelTypes['DocumentNode']
    updateDocument: ModelTypes['DocumentNode']
    createDocument: ModelTypes['DocumentNode']
    updateLocaleInfo: ModelTypes['LocaleInfo']
    createLocaleInfo: ModelTypes['LocaleInfo']
    updateNews: ModelTypes['News']
    createNews: ModelTypes['News']
    updateFooter: ModelTypes['Footer']
    createFooter: ModelTypes['Footer']
    updateTheme: ModelTypes['Theme']
    createTheme: ModelTypes['Theme']
    updateNavigation: ModelTypes['Navigation']
    createNavigation: ModelTypes['Navigation']
    updatePage: ModelTypes['Page']
    createPage: ModelTypes['Page']
  }
  ['DocumentMutation']: GraphQLTypes['DocumentMutation']
  ['LocaleInfoAuMutation']: GraphQLTypes['LocaleInfoAuMutation']
  ['LocaleInfoUsMutation']: GraphQLTypes['LocaleInfoUsMutation']
  ['LocaleInfoGbMutation']: GraphQLTypes['LocaleInfoGbMutation']
  ['LocaleInfoMutation']: GraphQLTypes['LocaleInfoMutation']
  ['NewsMutation']: GraphQLTypes['NewsMutation']
  ['FooterOfficesMutation']: GraphQLTypes['FooterOfficesMutation']
  ['FooterDisclaimersMutation']: GraphQLTypes['FooterDisclaimersMutation']
  ['FooterMutation']: GraphQLTypes['FooterMutation']
  ['ThemeMutation']: GraphQLTypes['ThemeMutation']
  ['NavigationItemsMutation']: GraphQLTypes['NavigationItemsMutation']
  ['NavigationMutation']: GraphQLTypes['NavigationMutation']
  ['PageSeoMutation']: GraphQLTypes['PageSeoMutation']
  ['PageBlocksNewsNewsItemsMutation']: GraphQLTypes['PageBlocksNewsNewsItemsMutation']
  ['PageBlocksNewsMutation']: GraphQLTypes['PageBlocksNewsMutation']
  ['PageBlocksStatsWithImageStatsMutation']: GraphQLTypes['PageBlocksStatsWithImageStatsMutation']
  ['PageBlocksStatsWithImageMutation']: GraphQLTypes['PageBlocksStatsWithImageMutation']
  ['PageBlocksHeroActionMutation']: GraphQLTypes['PageBlocksHeroActionMutation']
  ['PageBlocksHeroMutation']: GraphQLTypes['PageBlocksHeroMutation']
  ['PageBlocksSlideshowItemsActionMutation']: GraphQLTypes['PageBlocksSlideshowItemsActionMutation']
  ['PageBlocksSlideshowItemsOverlayMutation']: GraphQLTypes['PageBlocksSlideshowItemsOverlayMutation']
  ['PageBlocksSlideshowItemsMutation']: GraphQLTypes['PageBlocksSlideshowItemsMutation']
  ['PageBlocksSlideshowMutation']: GraphQLTypes['PageBlocksSlideshowMutation']
  ['PageBlocksComparisonTableItemsMetaAMutation']: GraphQLTypes['PageBlocksComparisonTableItemsMetaAMutation']
  ['PageBlocksComparisonTableItemsMetaBMutation']: GraphQLTypes['PageBlocksComparisonTableItemsMetaBMutation']
  ['PageBlocksComparisonTableItemsMetaMutation']: GraphQLTypes['PageBlocksComparisonTableItemsMetaMutation']
  ['PageBlocksComparisonTableItemsMutation']: GraphQLTypes['PageBlocksComparisonTableItemsMutation']
  ['PageBlocksComparisonTableActionMutation']: GraphQLTypes['PageBlocksComparisonTableActionMutation']
  ['PageBlocksComparisonTableMutation']: GraphQLTypes['PageBlocksComparisonTableMutation']
  ['PageBlocksFeatureFeaturesMutation']: GraphQLTypes['PageBlocksFeatureFeaturesMutation']
  ['PageBlocksFeatureOverlayMutation']: GraphQLTypes['PageBlocksFeatureOverlayMutation']
  ['PageBlocksFeatureMutation']: GraphQLTypes['PageBlocksFeatureMutation']
  ['PageBlocksFullScreenLogoOverlayMutation']: GraphQLTypes['PageBlocksFullScreenLogoOverlayMutation']
  ['PageBlocksFullScreenLogoMutation']: GraphQLTypes['PageBlocksFullScreenLogoMutation']
  ['PageBlocksFullScreenHeaderActionMutation']: GraphQLTypes['PageBlocksFullScreenHeaderActionMutation']
  ['PageBlocksFullScreenHeaderOverlayMutation']: GraphQLTypes['PageBlocksFullScreenHeaderOverlayMutation']
  ['PageBlocksFullScreenHeaderMutation']: GraphQLTypes['PageBlocksFullScreenHeaderMutation']
  ['PageBlocksMutation']: GraphQLTypes['PageBlocksMutation']
  ['PageMutation']: GraphQLTypes['PageMutation']
}

export type GraphQLTypes = {
  // DO NOT MODIFY THIS FILE. This file is automatically generated by Tina;
  /** References another document, used as a foreign key */
  ['Reference']: any
  ['JSON']: any
  ['SystemInfo']: {
    __typename: 'SystemInfo'
    filename: string
    basename: string
    breadcrumbs: Array<string>
    path: string
    relativePath: string
    extension: string
    template: string
    collection: GraphQLTypes['Collection']
  }
  ['PageInfo']: {
    __typename: 'PageInfo'
    hasPreviousPage: boolean
    hasNextPage: boolean
    startCursor: string
    endCursor: string
  }
  ['Node']: {
    __typename:
      | 'LocaleInfo'
      | 'News'
      | 'Footer'
      | 'Theme'
      | 'Navigation'
      | 'Page'
    id: string
    ['...on LocaleInfo']: '__union' & GraphQLTypes['LocaleInfo']
    ['...on News']: '__union' & GraphQLTypes['News']
    ['...on Footer']: '__union' & GraphQLTypes['Footer']
    ['...on Theme']: '__union' & GraphQLTypes['Theme']
    ['...on Navigation']: '__union' & GraphQLTypes['Navigation']
    ['...on Page']: '__union' & GraphQLTypes['Page']
  }
  ['Document']: {
    __typename:
      | 'LocaleInfo'
      | 'News'
      | 'Footer'
      | 'Theme'
      | 'Navigation'
      | 'Page'
    id: string
    _sys?: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
    ['...on LocaleInfo']: '__union' & GraphQLTypes['LocaleInfo']
    ['...on News']: '__union' & GraphQLTypes['News']
    ['...on Footer']: '__union' & GraphQLTypes['Footer']
    ['...on Theme']: '__union' & GraphQLTypes['Theme']
    ['...on Navigation']: '__union' & GraphQLTypes['Navigation']
    ['...on Page']: '__union' & GraphQLTypes['Page']
  }
  /** A relay-compliant pagination connection */
  ['Connection']: {
    __typename:
      | 'DocumentConnection'
      | 'LocaleInfoConnection'
      | 'NewsConnection'
      | 'FooterConnection'
      | 'ThemeConnection'
      | 'NavigationConnection'
      | 'PageConnection'
    totalCount: number
    pageInfo: GraphQLTypes['PageInfo']
    ['...on DocumentConnection']: '__union' & GraphQLTypes['DocumentConnection']
    ['...on LocaleInfoConnection']: '__union' &
      GraphQLTypes['LocaleInfoConnection']
    ['...on NewsConnection']: '__union' & GraphQLTypes['NewsConnection']
    ['...on FooterConnection']: '__union' & GraphQLTypes['FooterConnection']
    ['...on ThemeConnection']: '__union' & GraphQLTypes['ThemeConnection']
    ['...on NavigationConnection']: '__union' &
      GraphQLTypes['NavigationConnection']
    ['...on PageConnection']: '__union' & GraphQLTypes['PageConnection']
  }
  ['Query']: {
    __typename: 'Query'
    getOptimizedQuery?: string
    collection: GraphQLTypes['Collection']
    collections: Array<GraphQLTypes['Collection']>
    node: GraphQLTypes['Node']
    document: GraphQLTypes['DocumentNode']
    documentConnection: GraphQLTypes['DocumentConnection']
    localeInfo: GraphQLTypes['LocaleInfo']
    localeInfoConnection: GraphQLTypes['LocaleInfoConnection']
    news: GraphQLTypes['News']
    newsConnection: GraphQLTypes['NewsConnection']
    footer: GraphQLTypes['Footer']
    footerConnection: GraphQLTypes['FooterConnection']
    theme: GraphQLTypes['Theme']
    themeConnection: GraphQLTypes['ThemeConnection']
    navigation: GraphQLTypes['Navigation']
    navigationConnection: GraphQLTypes['NavigationConnection']
    page: GraphQLTypes['Page']
    pageConnection: GraphQLTypes['PageConnection']
  }
  ['StringFilter']: {
    startsWith?: string
    eq?: string
    exists?: boolean
    in?: Array<string | undefined>
  }
  ['LocaleInfoAuFilter']: {
    tel?: GraphQLTypes['StringFilter']
    signUpLink?: GraphQLTypes['StringFilter']
    signUpLinkPersonal?: GraphQLTypes['StringFilter']
    signInLink?: GraphQLTypes['StringFilter']
  }
  ['LocaleInfoUsFilter']: {
    tel?: GraphQLTypes['StringFilter']
    signUpLink?: GraphQLTypes['StringFilter']
    signUpLinkPersonal?: GraphQLTypes['StringFilter']
    signInLink?: GraphQLTypes['StringFilter']
  }
  ['LocaleInfoGbFilter']: {
    tel?: GraphQLTypes['StringFilter']
    signUpLink?: GraphQLTypes['StringFilter']
    signUpLinkPersonal?: GraphQLTypes['StringFilter']
    signInLink?: GraphQLTypes['StringFilter']
  }
  ['LocaleInfoFilter']: {
    au?: GraphQLTypes['LocaleInfoAuFilter']
    us?: GraphQLTypes['LocaleInfoUsFilter']
    gb?: GraphQLTypes['LocaleInfoGbFilter']
  }
  ['DatetimeFilter']: {
    after?: string
    before?: string
    eq?: string
    exists?: boolean
    in?: Array<string | undefined>
  }
  ['RichTextFilter']: {
    startsWith?: string
    eq?: string
    exists?: boolean
  }
  ['NewsFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    image?: GraphQLTypes['StringFilter']
    publishDate?: GraphQLTypes['DatetimeFilter']
    category?: GraphQLTypes['StringFilter']
    body?: GraphQLTypes['RichTextFilter']
  }
  ['FooterOfficesFilter']: {
    location?: GraphQLTypes['StringFilter']
    address?: GraphQLTypes['StringFilter']
    phone?: GraphQLTypes['StringFilter']
  }
  ['FooterDisclaimersFilter']: {
    body?: GraphQLTypes['RichTextFilter']
  }
  ['FooterFilter']: {
    offices?: GraphQLTypes['FooterOfficesFilter']
    disclaimers?: GraphQLTypes['FooterDisclaimersFilter']
  }
  ['ThemeFilter']: {
    displayFont?: GraphQLTypes['StringFilter']
    colorMode?: GraphQLTypes['StringFilter']
  }
  ['PageSeoFilter']: {
    title?: GraphQLTypes['StringFilter']
    image?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksNewsNewsItemsArticleFilter']: {
    news?: GraphQLTypes['NewsFilter']
  }
  ['PageBlocksNewsNewsItemsFilter']: {
    article?: GraphQLTypes['PageBlocksNewsNewsItemsArticleFilter']
  }
  ['PageBlocksNewsFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    newsItems?: GraphQLTypes['PageBlocksNewsNewsItemsFilter']
  }
  ['PageBlocksStatsWithImageStatsFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
  }
  ['PageBlocksStatsWithImageFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    image?: GraphQLTypes['StringFilter']
    stats?: GraphQLTypes['PageBlocksStatsWithImageStatsFilter']
  }
  ['ImageFilter']: {
    startsWith?: string
    eq?: string
    exists?: boolean
    in?: Array<string | undefined>
  }
  ['PageBlocksHeroActionFilter']: {
    callToAction?: GraphQLTypes['StringFilter']
    linkText?: GraphQLTypes['StringFilter']
    link?: GraphQLTypes['StringFilter']
    linkOverride?: GraphQLTypes['StringFilter']
    secondaryText?: GraphQLTypes['StringFilter']
    secondaryLink?: GraphQLTypes['StringFilter']
    secondaryLinkOverride?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksHeroFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    image?: GraphQLTypes['ImageFilter']
    action?: GraphQLTypes['PageBlocksHeroActionFilter']
  }
  ['PageBlocksSlideshowItemsActionFilter']: {
    callToAction?: GraphQLTypes['StringFilter']
    linkText?: GraphQLTypes['StringFilter']
    link?: GraphQLTypes['StringFilter']
    linkOverride?: GraphQLTypes['StringFilter']
    secondaryText?: GraphQLTypes['StringFilter']
    secondaryLink?: GraphQLTypes['StringFilter']
    secondaryLinkOverride?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksSlideshowItemsOverlayFilter']: {
    image?: GraphQLTypes['ImageFilter']
    overlayColor?: GraphQLTypes['StringFilter']
    overlayOpacity?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksSlideshowItemsFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    action?: GraphQLTypes['PageBlocksSlideshowItemsActionFilter']
    overlay?: GraphQLTypes['PageBlocksSlideshowItemsOverlayFilter']
  }
  ['PageBlocksSlideshowFilter']: {
    items?: GraphQLTypes['PageBlocksSlideshowItemsFilter']
  }
  ['PageBlocksComparisonTableItemsMetaAFilter']: {
    aOne?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksComparisonTableItemsMetaBFilter']: {
    bOne?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksComparisonTableItemsMetaFilter']: {
    a?: GraphQLTypes['PageBlocksComparisonTableItemsMetaAFilter']
    b?: GraphQLTypes['PageBlocksComparisonTableItemsMetaBFilter']
  }
  ['PageBlocksComparisonTableItemsFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    bulletPoints?: GraphQLTypes['StringFilter']
    meta?: GraphQLTypes['PageBlocksComparisonTableItemsMetaFilter']
  }
  ['PageBlocksComparisonTableActionFilter']: {
    callToAction?: GraphQLTypes['StringFilter']
    linkText?: GraphQLTypes['StringFilter']
    link?: GraphQLTypes['StringFilter']
    linkOverride?: GraphQLTypes['StringFilter']
    secondaryText?: GraphQLTypes['StringFilter']
    secondaryLink?: GraphQLTypes['StringFilter']
    secondaryLinkOverride?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksComparisonTableFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    items?: GraphQLTypes['PageBlocksComparisonTableItemsFilter']
    action?: GraphQLTypes['PageBlocksComparisonTableActionFilter']
  }
  ['PageBlocksFeatureFeaturesFilter']: {
    icon?: GraphQLTypes['StringFilter']
    name?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
  }
  ['PageBlocksFeatureOverlayFilter']: {
    image?: GraphQLTypes['ImageFilter']
    overlayColor?: GraphQLTypes['StringFilter']
    overlayOpacity?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksFeatureFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    featureStyle?: GraphQLTypes['StringFilter']
    features?: GraphQLTypes['PageBlocksFeatureFeaturesFilter']
    overlay?: GraphQLTypes['PageBlocksFeatureOverlayFilter']
  }
  ['PageBlocksFullScreenLogoOverlayFilter']: {
    image?: GraphQLTypes['ImageFilter']
    overlayColor?: GraphQLTypes['StringFilter']
    overlayOpacity?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksFullScreenLogoFilter']: {
    slogan?: GraphQLTypes['StringFilter']
    link?: GraphQLTypes['StringFilter']
    overlay?: GraphQLTypes['PageBlocksFullScreenLogoOverlayFilter']
  }
  ['PageBlocksFullScreenHeaderActionFilter']: {
    callToAction?: GraphQLTypes['StringFilter']
    linkText?: GraphQLTypes['StringFilter']
    link?: GraphQLTypes['StringFilter']
    linkOverride?: GraphQLTypes['StringFilter']
    secondaryText?: GraphQLTypes['StringFilter']
    secondaryLink?: GraphQLTypes['StringFilter']
    secondaryLinkOverride?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksFullScreenHeaderOverlayFilter']: {
    image?: GraphQLTypes['ImageFilter']
    overlayColor?: GraphQLTypes['StringFilter']
    overlayOpacity?: GraphQLTypes['StringFilter']
  }
  ['PageBlocksFullScreenHeaderFilter']: {
    title?: GraphQLTypes['StringFilter']
    subTitle?: GraphQLTypes['StringFilter']
    description?: GraphQLTypes['RichTextFilter']
    action?: GraphQLTypes['PageBlocksFullScreenHeaderActionFilter']
    overlay?: GraphQLTypes['PageBlocksFullScreenHeaderOverlayFilter']
  }
  ['PageBlocksFilter']: {
    news?: GraphQLTypes['PageBlocksNewsFilter']
    statsWithImage?: GraphQLTypes['PageBlocksStatsWithImageFilter']
    hero?: GraphQLTypes['PageBlocksHeroFilter']
    slideshow?: GraphQLTypes['PageBlocksSlideshowFilter']
    comparisonTable?: GraphQLTypes['PageBlocksComparisonTableFilter']
    feature?: GraphQLTypes['PageBlocksFeatureFilter']
    fullScreenLogo?: GraphQLTypes['PageBlocksFullScreenLogoFilter']
    fullScreenHeader?: GraphQLTypes['PageBlocksFullScreenHeaderFilter']
  }
  ['PageFilter']: {
    title?: GraphQLTypes['StringFilter']
    link?: GraphQLTypes['StringFilter']
    seo?: GraphQLTypes['PageSeoFilter']
    blocks?: GraphQLTypes['PageBlocksFilter']
  }
  ['NavigationItemsPageFilter']: {
    page?: GraphQLTypes['PageFilter']
  }
  ['NavigationItemsFilter']: {
    page?: GraphQLTypes['NavigationItemsPageFilter']
  }
  ['NavigationFilter']: {
    items?: GraphQLTypes['NavigationItemsFilter']
  }
  ['DocumentFilter']: {
    localeInfo?: GraphQLTypes['LocaleInfoFilter']
    news?: GraphQLTypes['NewsFilter']
    footer?: GraphQLTypes['FooterFilter']
    theme?: GraphQLTypes['ThemeFilter']
    navigation?: GraphQLTypes['NavigationFilter']
    page?: GraphQLTypes['PageFilter']
  }
  ['DocumentConnectionEdges']: {
    __typename: 'DocumentConnectionEdges'
    cursor: string
    node?: GraphQLTypes['DocumentNode']
  }
  ['DocumentConnection']: {
    __typename: 'DocumentConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['DocumentConnectionEdges'] | undefined>
  }
  ['Collection']: {
    __typename: 'Collection'
    name: string
    slug: string
    label?: string
    path: string
    format?: string
    matches?: string
    templates?: Array<GraphQLTypes['JSON'] | undefined>
    fields?: Array<GraphQLTypes['JSON'] | undefined>
    documents: GraphQLTypes['DocumentConnection']
  }
  ['DocumentNode']: {
    __typename:
      | 'LocaleInfo'
      | 'News'
      | 'Footer'
      | 'Theme'
      | 'Navigation'
      | 'Page'
    ['...on LocaleInfo']: '__union' & GraphQLTypes['LocaleInfo']
    ['...on News']: '__union' & GraphQLTypes['News']
    ['...on Footer']: '__union' & GraphQLTypes['Footer']
    ['...on Theme']: '__union' & GraphQLTypes['Theme']
    ['...on Navigation']: '__union' & GraphQLTypes['Navigation']
    ['...on Page']: '__union' & GraphQLTypes['Page']
  }
  ['LocaleInfoAu']: {
    __typename: 'LocaleInfoAu'
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoUs']: {
    __typename: 'LocaleInfoUs'
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoGb']: {
    __typename: 'LocaleInfoGb'
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfo']: {
    __typename: 'LocaleInfo'
    au?: GraphQLTypes['LocaleInfoAu']
    us?: GraphQLTypes['LocaleInfoUs']
    gb?: GraphQLTypes['LocaleInfoGb']
    id: string
    _sys: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
  }
  ['LocaleInfoConnectionEdges']: {
    __typename: 'LocaleInfoConnectionEdges'
    cursor: string
    node?: GraphQLTypes['LocaleInfo']
  }
  ['LocaleInfoConnection']: {
    __typename: 'LocaleInfoConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['LocaleInfoConnectionEdges'] | undefined>
  }
  ['News']: {
    __typename: 'News'
    title: string
    subTitle?: string
    image?: string
    publishDate?: string
    category?: string
    body?: GraphQLTypes['JSON']
    id: string
    _sys: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
  }
  ['NewsConnectionEdges']: {
    __typename: 'NewsConnectionEdges'
    cursor: string
    node?: GraphQLTypes['News']
  }
  ['NewsConnection']: {
    __typename: 'NewsConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['NewsConnectionEdges'] | undefined>
  }
  ['FooterOffices']: {
    __typename: 'FooterOffices'
    location: string
    address: string
    phone: string
  }
  ['FooterDisclaimers']: {
    __typename: 'FooterDisclaimers'
    body?: GraphQLTypes['JSON']
  }
  ['Footer']: {
    __typename: 'Footer'
    offices?: Array<GraphQLTypes['FooterOffices'] | undefined>
    disclaimers: Array<GraphQLTypes['FooterDisclaimers']>
    id: string
    _sys: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
  }
  ['FooterConnectionEdges']: {
    __typename: 'FooterConnectionEdges'
    cursor: string
    node?: GraphQLTypes['Footer']
  }
  ['FooterConnection']: {
    __typename: 'FooterConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['FooterConnectionEdges'] | undefined>
  }
  ['Theme']: {
    __typename: 'Theme'
    displayFont?: string
    colorMode?: string
    id: string
    _sys: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
  }
  ['ThemeConnectionEdges']: {
    __typename: 'ThemeConnectionEdges'
    cursor: string
    node?: GraphQLTypes['Theme']
  }
  ['ThemeConnection']: {
    __typename: 'ThemeConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['ThemeConnectionEdges'] | undefined>
  }
  ['NavigationItemsPage']: {
    __typename: 'Page'
    ['...on Page']: '__union' & GraphQLTypes['Page']
  }
  ['NavigationItems']: {
    __typename: 'NavigationItems'
    page?: GraphQLTypes['NavigationItemsPage']
  }
  ['Navigation']: {
    __typename: 'Navigation'
    items: Array<GraphQLTypes['NavigationItems']>
    id: string
    _sys: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
  }
  ['NavigationConnectionEdges']: {
    __typename: 'NavigationConnectionEdges'
    cursor: string
    node?: GraphQLTypes['Navigation']
  }
  ['NavigationConnection']: {
    __typename: 'NavigationConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['NavigationConnectionEdges'] | undefined>
  }
  ['PageSeo']: {
    __typename: 'PageSeo'
    title?: string
    image?: string
    description: string
  }
  ['PageBlocksNewsNewsItemsArticle']: {
    __typename: 'News'
    ['...on News']: '__union' & GraphQLTypes['News']
  }
  ['PageBlocksNewsNewsItems']: {
    __typename: 'PageBlocksNewsNewsItems'
    article: GraphQLTypes['PageBlocksNewsNewsItemsArticle']
  }
  ['PageBlocksNews']: {
    __typename: 'PageBlocksNews'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    newsItems: Array<GraphQLTypes['PageBlocksNewsNewsItems']>
  }
  ['PageBlocksStatsWithImageStats']: {
    __typename: 'PageBlocksStatsWithImageStats'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
  }
  ['PageBlocksStatsWithImage']: {
    __typename: 'PageBlocksStatsWithImage'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    image?: string
    stats?: Array<GraphQLTypes['PageBlocksStatsWithImageStats'] | undefined>
  }
  ['PageBlocksHeroAction']: {
    __typename: 'PageBlocksHeroAction'
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksHero']: {
    __typename: 'PageBlocksHero'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    image?: string
    action?: GraphQLTypes['PageBlocksHeroAction']
  }
  ['PageBlocksSlideshowItemsAction']: {
    __typename: 'PageBlocksSlideshowItemsAction'
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksSlideshowItemsOverlay']: {
    __typename: 'PageBlocksSlideshowItemsOverlay'
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksSlideshowItems']: {
    __typename: 'PageBlocksSlideshowItems'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    action?: GraphQLTypes['PageBlocksSlideshowItemsAction']
    overlay?: GraphQLTypes['PageBlocksSlideshowItemsOverlay']
  }
  ['PageBlocksSlideshow']: {
    __typename: 'PageBlocksSlideshow'
    items?: Array<GraphQLTypes['PageBlocksSlideshowItems'] | undefined>
  }
  ['PageBlocksComparisonTableItemsMetaA']: {
    __typename: 'PageBlocksComparisonTableItemsMetaA'
    aOne?: string
  }
  ['PageBlocksComparisonTableItemsMetaB']: {
    __typename: 'PageBlocksComparisonTableItemsMetaB'
    bOne?: string
  }
  ['PageBlocksComparisonTableItemsMeta']: {
    __typename:
      | 'PageBlocksComparisonTableItemsMetaA'
      | 'PageBlocksComparisonTableItemsMetaB'
    ['...on PageBlocksComparisonTableItemsMetaA']: '__union' &
      GraphQLTypes['PageBlocksComparisonTableItemsMetaA']
    ['...on PageBlocksComparisonTableItemsMetaB']: '__union' &
      GraphQLTypes['PageBlocksComparisonTableItemsMetaB']
  }
  ['PageBlocksComparisonTableItems']: {
    __typename: 'PageBlocksComparisonTableItems'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    bulletPoints?: Array<string | undefined>
    meta?: Array<GraphQLTypes['PageBlocksComparisonTableItemsMeta'] | undefined>
  }
  ['PageBlocksComparisonTableAction']: {
    __typename: 'PageBlocksComparisonTableAction'
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksComparisonTable']: {
    __typename: 'PageBlocksComparisonTable'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    items?: Array<GraphQLTypes['PageBlocksComparisonTableItems'] | undefined>
    action?: GraphQLTypes['PageBlocksComparisonTableAction']
  }
  ['PageBlocksFeatureFeatures']: {
    __typename: 'PageBlocksFeatureFeatures'
    icon: string
    name: string
    description: GraphQLTypes['JSON']
  }
  ['PageBlocksFeatureOverlay']: {
    __typename: 'PageBlocksFeatureOverlay'
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFeature']: {
    __typename: 'PageBlocksFeature'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    featureStyle?: string
    features: Array<GraphQLTypes['PageBlocksFeatureFeatures']>
    overlay?: GraphQLTypes['PageBlocksFeatureOverlay']
  }
  ['PageBlocksFullScreenLogoOverlay']: {
    __typename: 'PageBlocksFullScreenLogoOverlay'
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFullScreenLogo']: {
    __typename: 'PageBlocksFullScreenLogo'
    slogan?: string
    link?: string
    overlay?: GraphQLTypes['PageBlocksFullScreenLogoOverlay']
  }
  ['PageBlocksFullScreenHeaderAction']: {
    __typename: 'PageBlocksFullScreenHeaderAction'
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksFullScreenHeaderOverlay']: {
    __typename: 'PageBlocksFullScreenHeaderOverlay'
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFullScreenHeader']: {
    __typename: 'PageBlocksFullScreenHeader'
    title: string
    subTitle?: string
    description: GraphQLTypes['JSON']
    action?: GraphQLTypes['PageBlocksFullScreenHeaderAction']
    overlay?: GraphQLTypes['PageBlocksFullScreenHeaderOverlay']
  }
  ['PageBlocks']: {
    __typename:
      | 'PageBlocksNews'
      | 'PageBlocksStatsWithImage'
      | 'PageBlocksHero'
      | 'PageBlocksSlideshow'
      | 'PageBlocksComparisonTable'
      | 'PageBlocksFeature'
      | 'PageBlocksFullScreenLogo'
      | 'PageBlocksFullScreenHeader'
    ['...on PageBlocksNews']: '__union' & GraphQLTypes['PageBlocksNews']
    ['...on PageBlocksStatsWithImage']: '__union' &
      GraphQLTypes['PageBlocksStatsWithImage']
    ['...on PageBlocksHero']: '__union' & GraphQLTypes['PageBlocksHero']
    ['...on PageBlocksSlideshow']: '__union' &
      GraphQLTypes['PageBlocksSlideshow']
    ['...on PageBlocksComparisonTable']: '__union' &
      GraphQLTypes['PageBlocksComparisonTable']
    ['...on PageBlocksFeature']: '__union' & GraphQLTypes['PageBlocksFeature']
    ['...on PageBlocksFullScreenLogo']: '__union' &
      GraphQLTypes['PageBlocksFullScreenLogo']
    ['...on PageBlocksFullScreenHeader']: '__union' &
      GraphQLTypes['PageBlocksFullScreenHeader']
  }
  ['Page']: {
    __typename: 'Page'
    title: string
    link: string
    seo?: GraphQLTypes['PageSeo']
    blocks?: Array<GraphQLTypes['PageBlocks'] | undefined>
    id: string
    _sys: GraphQLTypes['SystemInfo']
    _values: GraphQLTypes['JSON']
  }
  ['PageConnectionEdges']: {
    __typename: 'PageConnectionEdges'
    cursor: string
    node?: GraphQLTypes['Page']
  }
  ['PageConnection']: {
    __typename: 'PageConnection'
    pageInfo: GraphQLTypes['PageInfo']
    totalCount: number
    edges?: Array<GraphQLTypes['PageConnectionEdges'] | undefined>
  }
  ['Mutation']: {
    __typename: 'Mutation'
    addPendingDocument: GraphQLTypes['DocumentNode']
    updateDocument: GraphQLTypes['DocumentNode']
    createDocument: GraphQLTypes['DocumentNode']
    updateLocaleInfo: GraphQLTypes['LocaleInfo']
    createLocaleInfo: GraphQLTypes['LocaleInfo']
    updateNews: GraphQLTypes['News']
    createNews: GraphQLTypes['News']
    updateFooter: GraphQLTypes['Footer']
    createFooter: GraphQLTypes['Footer']
    updateTheme: GraphQLTypes['Theme']
    createTheme: GraphQLTypes['Theme']
    updateNavigation: GraphQLTypes['Navigation']
    createNavigation: GraphQLTypes['Navigation']
    updatePage: GraphQLTypes['Page']
    createPage: GraphQLTypes['Page']
  }
  ['DocumentMutation']: {
    localeInfo?: GraphQLTypes['LocaleInfoMutation']
    news?: GraphQLTypes['NewsMutation']
    footer?: GraphQLTypes['FooterMutation']
    theme?: GraphQLTypes['ThemeMutation']
    navigation?: GraphQLTypes['NavigationMutation']
    page?: GraphQLTypes['PageMutation']
  }
  ['LocaleInfoAuMutation']: {
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoUsMutation']: {
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoGbMutation']: {
    tel?: string
    signUpLink?: string
    signUpLinkPersonal?: string
    signInLink?: string
  }
  ['LocaleInfoMutation']: {
    au?: GraphQLTypes['LocaleInfoAuMutation']
    us?: GraphQLTypes['LocaleInfoUsMutation']
    gb?: GraphQLTypes['LocaleInfoGbMutation']
  }
  ['NewsMutation']: {
    title?: string
    subTitle?: string
    image?: string
    publishDate?: string
    category?: string
    body?: GraphQLTypes['JSON']
  }
  ['FooterOfficesMutation']: {
    location?: string
    address?: string
    phone?: string
  }
  ['FooterDisclaimersMutation']: {
    body?: GraphQLTypes['JSON']
  }
  ['FooterMutation']: {
    offices?: Array<GraphQLTypes['FooterOfficesMutation'] | undefined>
    disclaimers?: Array<GraphQLTypes['FooterDisclaimersMutation'] | undefined>
  }
  ['ThemeMutation']: {
    displayFont?: string
    colorMode?: string
  }
  ['NavigationItemsMutation']: {
    page?: string
  }
  ['NavigationMutation']: {
    items?: Array<GraphQLTypes['NavigationItemsMutation'] | undefined>
  }
  ['PageSeoMutation']: {
    title?: string
    image?: string
    description?: string
  }
  ['PageBlocksNewsNewsItemsMutation']: {
    article?: string
  }
  ['PageBlocksNewsMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    newsItems?: Array<
      GraphQLTypes['PageBlocksNewsNewsItemsMutation'] | undefined
    >
  }
  ['PageBlocksStatsWithImageStatsMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
  }
  ['PageBlocksStatsWithImageMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    image?: string
    stats?: Array<
      GraphQLTypes['PageBlocksStatsWithImageStatsMutation'] | undefined
    >
  }
  ['PageBlocksHeroActionMutation']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksHeroMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    image?: string
    action?: GraphQLTypes['PageBlocksHeroActionMutation']
  }
  ['PageBlocksSlideshowItemsActionMutation']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksSlideshowItemsOverlayMutation']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksSlideshowItemsMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    action?: GraphQLTypes['PageBlocksSlideshowItemsActionMutation']
    overlay?: GraphQLTypes['PageBlocksSlideshowItemsOverlayMutation']
  }
  ['PageBlocksSlideshowMutation']: {
    items?: Array<GraphQLTypes['PageBlocksSlideshowItemsMutation'] | undefined>
  }
  ['PageBlocksComparisonTableItemsMetaAMutation']: {
    aOne?: string
  }
  ['PageBlocksComparisonTableItemsMetaBMutation']: {
    bOne?: string
  }
  ['PageBlocksComparisonTableItemsMetaMutation']: {
    a?: GraphQLTypes['PageBlocksComparisonTableItemsMetaAMutation']
    b?: GraphQLTypes['PageBlocksComparisonTableItemsMetaBMutation']
  }
  ['PageBlocksComparisonTableItemsMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    bulletPoints?: Array<string | undefined>
    meta?: Array<
      GraphQLTypes['PageBlocksComparisonTableItemsMetaMutation'] | undefined
    >
  }
  ['PageBlocksComparisonTableActionMutation']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksComparisonTableMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    items?: Array<
      GraphQLTypes['PageBlocksComparisonTableItemsMutation'] | undefined
    >
    action?: GraphQLTypes['PageBlocksComparisonTableActionMutation']
  }
  ['PageBlocksFeatureFeaturesMutation']: {
    icon?: string
    name?: string
    description?: GraphQLTypes['JSON']
  }
  ['PageBlocksFeatureOverlayMutation']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFeatureMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    featureStyle?: string
    features?: Array<
      GraphQLTypes['PageBlocksFeatureFeaturesMutation'] | undefined
    >
    overlay?: GraphQLTypes['PageBlocksFeatureOverlayMutation']
  }
  ['PageBlocksFullScreenLogoOverlayMutation']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFullScreenLogoMutation']: {
    slogan?: string
    link?: string
    overlay?: GraphQLTypes['PageBlocksFullScreenLogoOverlayMutation']
  }
  ['PageBlocksFullScreenHeaderActionMutation']: {
    callToAction?: string
    linkText?: string
    link?: string
    linkOverride?: string
    secondaryText?: string
    secondaryLink?: string
    secondaryLinkOverride?: string
  }
  ['PageBlocksFullScreenHeaderOverlayMutation']: {
    image?: string
    overlayColor?: string
    overlayOpacity?: string
  }
  ['PageBlocksFullScreenHeaderMutation']: {
    title?: string
    subTitle?: string
    description?: GraphQLTypes['JSON']
    action?: GraphQLTypes['PageBlocksFullScreenHeaderActionMutation']
    overlay?: GraphQLTypes['PageBlocksFullScreenHeaderOverlayMutation']
  }
  ['PageBlocksMutation']: {
    news?: GraphQLTypes['PageBlocksNewsMutation']
    statsWithImage?: GraphQLTypes['PageBlocksStatsWithImageMutation']
    hero?: GraphQLTypes['PageBlocksHeroMutation']
    slideshow?: GraphQLTypes['PageBlocksSlideshowMutation']
    comparisonTable?: GraphQLTypes['PageBlocksComparisonTableMutation']
    feature?: GraphQLTypes['PageBlocksFeatureMutation']
    fullScreenLogo?: GraphQLTypes['PageBlocksFullScreenLogoMutation']
    fullScreenHeader?: GraphQLTypes['PageBlocksFullScreenHeaderMutation']
  }
  ['PageMutation']: {
    title?: string
    link?: string
    seo?: GraphQLTypes['PageSeoMutation']
    blocks?: Array<GraphQLTypes['PageBlocksMutation'] | undefined>
  }
}

export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('')
    console.error(response)
  }
  toString() {
    return 'GraphQL Response Error'
  }
}

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>
> = ZeusState<ReturnType<T>[N]>

type WithTypeNameValue<T> = T & {
  __typename?: boolean
}
type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>
}
export interface GraphQLResponse {
  data?: Record<string, any>
  errors?: Array<{
    message: string
  }>
}
type DeepAnify<T> = {
  [P in keyof T]?: any
}
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T
type IsArray<T, U> = T extends Array<infer R>
  ? InputType<R, U>[]
  : InputType<T, U>
type FlattenArray<T> = T extends Array<infer R> ? R : T

type IsInterfaced<SRC extends DeepAnify<DST>, DST> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<
              R,
              '__typename' extends keyof DST
                ? DST[P] & { __typename: true }
                : DST[P]
            >
          : {}
        : never
    }[keyof DST] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends boolean ? SRC[P] : IsArray<SRC[P], DST[P]>
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends boolean
        ? SRC[P]
        : IsArray<SRC[P], DST[P]>
    }

export type MapType<SRC, DST> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST>
  : never
export type InputType<SRC, DST> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P]>
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>>
  : MapType<SRC, IsPayLoad<DST>>
type Func<P extends any[], R> = (...args: P) => R
type AnyFunc = Func<any, any>
export type ArgsType<F extends AnyFunc> = F extends Func<infer P, any>
  ? P
  : never
export type OperationOptions = {
  variables?: Record<string, any>
  operationName?: string
}
export type SubscriptionToGraphQL<Z, T> = {
  ws: WebSocket
  on: (fn: (args: InputType<T, Z>) => void) => void
  off: (
    fn: (e: {
      data?: InputType<T, Z>
      code?: number
      reason?: string
      message?: string
    }) => void
  ) => void
  error: (
    fn: (e: { data?: InputType<T, Z>; errors?: string[] }) => void
  ) => void
  open: () => void
}
export type SelectionFunction<V> = <T>(t: T | V) => T
export type fetchOptions = ArgsType<typeof fetch>
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }]
  | [fetchOptions[0]]
export type FetchFunction = (
  query: string,
  variables?: Record<string, any>
) => Promise<any>
export type SubscriptionFunction = (query: string) => any
type NotUndefined<T> = T extends undefined ? never : T
export type ResolverType<F> = NotUndefined<
  F extends [infer ARGS, any] ? ARGS : undefined
>

export const ZeusSelect = <T>() => ((t: any) => t) as SelectionFunction<T>

export const ScalarResolver = (scalar: string, value: any) => {
  switch (scalar) {
    case 'String':
      return `${JSON.stringify(value)}`
    case 'Int':
      return `${value}`
    case 'Float':
      return `${value}`
    case 'Boolean':
      return `${value}`
    case 'ID':
      return `"${value}"`
    case 'enum':
      return `${value}`
    case 'scalar':
      return `${value}`
    default:
      return false
  }
}

export const TypesPropsResolver = ({
  value,
  type,
  name,
  key,
  blockArrays,
}: {
  value: any
  type: string
  name: string
  key?: string
  blockArrays?: boolean
}): string => {
  if (value === null) {
    return `null`
  }
  let resolvedValue = AllTypesProps[type][name]
  if (key) {
    resolvedValue = resolvedValue[key]
  }
  if (!resolvedValue) {
    throw new Error(`Cannot resolve ${type} ${name}${key ? ` ${key}` : ''}`)
  }
  const typeResolved = resolvedValue.type
  const isArray = resolvedValue.array
  const isArrayRequired = resolvedValue.arrayRequired
  if (typeof value === 'string' && value.startsWith(`ZEUS_VAR$`)) {
    const isRequired = resolvedValue.required ? '!' : ''
    let t = `${typeResolved}`
    if (isArray) {
      if (isRequired) {
        t = `${t}!`
      }
      t = `[${t}]`
      if (isArrayRequired) {
        t = `${t}!`
      }
    } else {
      if (isRequired) {
        t = `${t}!`
      }
    }
    return `\$${value.split(`ZEUS_VAR$`)[1]}__ZEUS_VAR__${t}`
  }
  if (isArray && !blockArrays) {
    return `[${value
      .map((v: any) =>
        TypesPropsResolver({ value: v, type, name, key, blockArrays: true })
      )
      .join(',')}]`
  }
  const reslovedScalar = ScalarResolver(typeResolved, value)
  if (!reslovedScalar) {
    const resolvedType = AllTypesProps[typeResolved]
    if (typeof resolvedType === 'object') {
      const argsKeys = Object.keys(resolvedType)
      return `{${argsKeys
        .filter((ak) => value[ak] !== undefined)
        .map(
          (ak) =>
            `${ak}:${TypesPropsResolver({
              value: value[ak],
              type: typeResolved,
              name: ak,
            })}`
        )}}`
    }
    return ScalarResolver(AllTypesProps[typeResolved], value) as string
  }
  return reslovedScalar
}

const isArrayFunction = (parent: string[], a: any[]) => {
  const [values, r] = a
  const [mainKey, key, ...keys] = parent
  const keyValues = Object.keys(values).filter(
    (k) => typeof values[k] !== 'undefined'
  )

  if (!keys.length) {
    return keyValues.length > 0
      ? `(${keyValues
          .map(
            (v) =>
              `${v}:${TypesPropsResolver({
                value: values[v],
                type: mainKey,
                name: key,
                key: v,
              })}`
          )
          .join(',')})${r ? traverseToSeekArrays(parent, r) : ''}`
      : traverseToSeekArrays(parent, r)
  }

  const [typeResolverKey] = keys.splice(keys.length - 1, 1)
  let valueToResolve = ReturnTypes[mainKey][key]
  for (const k of keys) {
    valueToResolve = ReturnTypes[valueToResolve][k]
  }

  const argumentString =
    keyValues.length > 0
      ? `(${keyValues
          .map(
            (v) =>
              `${v}:${TypesPropsResolver({
                value: values[v],
                type: valueToResolve,
                name: typeResolverKey,
                key: v,
              })}`
          )
          .join(',')})${r ? traverseToSeekArrays(parent, r) : ''}`
      : traverseToSeekArrays(parent, r)
  return argumentString
}

const resolveKV = (
  k: string,
  v: boolean | string | { [x: string]: boolean | string }
) =>
  typeof v === 'boolean'
    ? k
    : typeof v === 'object'
    ? `${k}{${objectToTree(v)}}`
    : `${k}${v}`

const objectToTree = (o: { [x: string]: boolean | string }): string =>
  `{${Object.keys(o)
    .map((k) => `${resolveKV(k, o[k])}`)
    .join(' ')}}`

const traverseToSeekArrays = (parent: string[], a?: any): string => {
  if (!a) return ''
  if (Object.keys(a).length === 0) {
    return ''
  }
  let b: Record<string, any> = {}
  if (Array.isArray(a)) {
    return isArrayFunction([...parent], a)
  } else {
    if (typeof a === 'object') {
      Object.keys(a)
        .filter((k) => typeof a[k] !== 'undefined')
        .forEach((k) => {
          if (k === '__alias') {
            Object.keys(a[k]).forEach((aliasKey) => {
              const aliasOperations = a[k][aliasKey]
              const aliasOperationName = Object.keys(aliasOperations)[0]
              const aliasOperation = aliasOperations[aliasOperationName]
              b[
                `${aliasOperationName}__alias__${aliasKey}: ${aliasOperationName}`
              ] = traverseToSeekArrays(
                [...parent, aliasOperationName],
                aliasOperation
              )
            })
          } else {
            b[k] = traverseToSeekArrays([...parent, k], a[k])
          }
        })
    } else {
      return ''
    }
  }
  return objectToTree(b)
}

const buildQuery = (type: string, a?: Record<any, any>) =>
  traverseToSeekArrays([type], a)

const inspectVariables = (query: string) => {
  const regex = /\$\b\w*__ZEUS_VAR__\[?[^!^\]^\s^,^\)^\}]*[!]?[\]]?[!]?/g
  let result
  const AllVariables: string[] = []
  while ((result = regex.exec(query))) {
    if (AllVariables.includes(result[0])) {
      continue
    }
    AllVariables.push(result[0])
  }
  if (!AllVariables.length) {
    return query
  }
  let filteredQuery = query
  AllVariables.forEach((variable) => {
    while (filteredQuery.includes(variable)) {
      filteredQuery = filteredQuery.replace(
        variable,
        variable.split('__ZEUS_VAR__')[0]
      )
    }
  })
  return `(${AllVariables.map((a) => a.split('__ZEUS_VAR__'))
    .map(([variableName, variableType]) => `${variableName}:${variableType}`)
    .join(', ')})${filteredQuery}`
}

export const queryConstruct =
  (
    t: 'query' | 'mutation' | 'subscription',
    tName: string,
    operationName?: string
  ) =>
  (o: Record<any, any>) =>
    `${t.toLowerCase()}${
      operationName ? ' ' + operationName : ''
    }${inspectVariables(buildQuery(tName, o))}`

export const fullChainConstruct =
  (fn: FetchFunction) =>
  (t: 'query' | 'mutation' | 'subscription', tName: string) =>
  (o: Record<any, any>, options?: OperationOptions) =>
    fn(
      queryConstruct(t, tName, options?.operationName)(o),
      options?.variables
    ).then((r: any) => {
      seekForAliases(r)
      return r
    })

export const fullSubscriptionConstruct =
  (fn: SubscriptionFunction) =>
  (t: 'query' | 'mutation' | 'subscription', tName: string) =>
  (o: Record<any, any>, options?: OperationOptions) =>
    fn(queryConstruct(t, tName, options?.operationName)(o))

const seekForAliases = (response: any) => {
  const traverseAlias = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach(seekForAliases)
    } else {
      if (typeof value === 'object') {
        seekForAliases(value)
      }
    }
  }
  if (typeof response === 'object' && response) {
    const keys = Object.keys(response)
    if (keys.length < 1) {
      return
    }
    keys.forEach((k) => {
      const value = response[k]
      if (k.indexOf('__alias__') !== -1) {
        const [operation, alias] = k.split('__alias__')
        response[alias] = {
          [operation]: value,
        }
        delete response[k]
      }
      traverseAlias(value)
    })
  }
}

export const $ = (t: TemplateStringsArray): any => `ZEUS_VAR$${t.join('')}`

export const resolverFor = <
  X,
  T extends keyof ValueTypes,
  Z extends keyof ValueTypes[T]
>(
  type: T,
  field: Z,
  fn: (
    args: Required<ValueTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any
  ) => Z extends keyof ModelTypes[T]
    ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X
    : any
) => fn as (args?: any, source?: any) => any

const handleFetchResponse = (
  response: Parameters<
    Extract<Parameters<ReturnType<typeof fetch>['then']>[0], Function>
  >[0]
): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text))
          } catch (err) {
            reject(text)
          }
        })
        .catch(reject)
    })
  }
  return response.json()
}

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, any> = {}) => {
    let fetchFunction = fetch
    let queryString = query
    let fetchOptions = options[1] || {}
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      queryString = encodeURIComponent(query)
      return fetchFunction(`${options[0]}?query=${queryString}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response)
          }
          return response.data
        })
    }
    return fetchFunction(`${options[0]}`, {
      body: JSON.stringify({ query: queryString, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response)
        }
        return response.data
      })
  }

export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query)
    const wsString = queryString.replace('http', 'ws')
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString
    const webSocketOptions = options[1]?.websocket || [host]
    const ws = new WebSocket(...webSocketOptions)
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data)
            const data = parsed.data
            if (data) {
              seekForAliases(data)
            }
            return e(data)
          }
        }
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e
      },
      open: (e: () => void) => {
        ws.onopen = e
      },
    }
  } catch {
    throw new Error('No websockets implemented')
  }
}

const allOperations = {
  query: 'Query',
  mutation: 'Mutation',
}

export type GenericOperation<O> = O extends 'query'
  ? 'Query'
  : O extends 'mutation'
  ? 'Mutation'
  : never

export const Thunder =
  (fn: FetchFunction) =>
  <
    O extends 'query' | 'mutation',
    R extends keyof ValueTypes = GenericOperation<O>
  >(
    operation: O
  ) =>
  <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions) =>
    fullChainConstruct(fn)(operation, allOperations[operation])(
      o as any,
      ops
    ) as Promise<InputType<GraphQLTypes[R], Z>>

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options))

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <
    O extends 'query' | 'mutation',
    R extends keyof ValueTypes = GenericOperation<O>
  >(
    operation: O
  ) =>
  <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions) =>
    fullSubscriptionConstruct(fn)(operation, allOperations[operation])(
      o as any,
      ops
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R]>

export const Subscription = (...options: chainOptions) =>
  SubscriptionThunder(apiSubscription(options))
export const Zeus = <
  Z extends ValueTypes[R],
  O extends 'query' | 'mutation',
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
  o: Z | ValueTypes[R],
  operationName?: string
) =>
  queryConstruct(operation, allOperations[operation], operationName)(o as any)
export const Selector = <T extends keyof ValueTypes>(key: T) =>
  ZeusSelect<ValueTypes[T]>()
