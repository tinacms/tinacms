export const sample = `# Blueprint
# getLocaleInfoDocument
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================
# getLocaleInfoDocument.data.au
# getLocaleInfoDocument.data.au.signInLink
# getLocaleInfoDocument.data.au.signUpLink
# getLocaleInfoDocument.data.au.signUpLinkPersonal
# getLocaleInfoDocument.data.au.tel
# getLocaleInfoDocument.data.gb
# getLocaleInfoDocument.data.gb.signInLink
# getLocaleInfoDocument.data.gb.signUpLink
# getLocaleInfoDocument.data.gb.signUpLinkPersonal
# getLocaleInfoDocument.data.gb.tel
# getLocaleInfoDocument.data.us
# getLocaleInfoDocument.data.us.signInLink
# getLocaleInfoDocument.data.us.signUpLink
# getLocaleInfoDocument.data.us.signUpLinkPersonal
# getLocaleInfoDocument.data.us.tel

# Blueprint
# getNavigationDocument
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================
# getNavigationDocument.data.items.[]
# getNavigationDocument.data.items.[].page

# Blueprint
# getNavigationDocument.data.items.[].page
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================
# getNavigationDocument.data.items.[].page.data.title
# getNavigationDocument.data.items.[].page.data.link

# Blueprint
# getFooterDocument
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================
# getFooterDocument.data.offices.[]
# getFooterDocument.data.offices.[].address
# getFooterDocument.data.offices.[].location
# getFooterDocument.data.offices.[].phone
# getFooterDocument.data.disclaimers.[]
# getFooterDocument.data.disclaimers.[].body

# Blueprint
# getThemeDocument
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================

# Blueprint
# getPageDocument
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================
# getPageDocument.data.title
# getPageDocument.data.seo
# getPageDocument.data.seo.title
# getPageDocument.data.seo.description
# getPageDocument.data.seo.image
# getPageDocument.data.blocks.[]
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.title
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.subTitle
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.description
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.callToAction
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.link
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.linkText
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.linkOverride
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.secondaryLink
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.secondaryText
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.action.secondaryLinkOverride
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[]
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].title
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].subTitle
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].description
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].bulletPoints.[]
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].meta.[]
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].meta.[].PageBlocksComparisonTableItemsMetaA.aOne
# getPageDocument.data.blocks.[].PageBlocksComparisonTable.items.[].meta.[].PageBlocksComparisonTableItemsMetaB.bOne
# getPageDocument.data.blocks.[].PageBlocksHero.title
# getPageDocument.data.blocks.[].PageBlocksHero.description
# getPageDocument.data.blocks.[].PageBlocksHero.image
# getPageDocument.data.blocks.[].PageBlocksHero.action
# getPageDocument.data.blocks.[].PageBlocksHero.action.callToAction
# getPageDocument.data.blocks.[].PageBlocksHero.action.link
# getPageDocument.data.blocks.[].PageBlocksHero.action.linkText
# getPageDocument.data.blocks.[].PageBlocksHero.action.linkOverride
# getPageDocument.data.blocks.[].PageBlocksHero.action.secondaryLink
# getPageDocument.data.blocks.[].PageBlocksHero.action.secondaryText
# getPageDocument.data.blocks.[].PageBlocksHero.action.secondaryLinkOverride
# getPageDocument.data.blocks.[].PageBlocksFeature.title
# getPageDocument.data.blocks.[].PageBlocksFeature.description
# getPageDocument.data.blocks.[].PageBlocksFeature.subTitle
# getPageDocument.data.blocks.[].PageBlocksFeature.featureStyle
# getPageDocument.data.blocks.[].PageBlocksFeature.features.[]
# getPageDocument.data.blocks.[].PageBlocksFeature.features.[].icon
# getPageDocument.data.blocks.[].PageBlocksFeature.features.[].name
# getPageDocument.data.blocks.[].PageBlocksFeature.features.[].description
# getPageDocument.data.blocks.[].PageBlocksFeature.overlay
# getPageDocument.data.blocks.[].PageBlocksFeature.overlay.image
# getPageDocument.data.blocks.[].PageBlocksFeature.overlay.overlayColor
# getPageDocument.data.blocks.[].PageBlocksFeature.overlay.overlayOpacity
# getPageDocument.data.blocks.[].PageBlocksNews.title
# getPageDocument.data.blocks.[].PageBlocksNews.subTitle
# getPageDocument.data.blocks.[].PageBlocksNews.newsItems.[]
# getPageDocument.data.blocks.[].PageBlocksNews.newsItems.[].article
# getPageDocument.data.blocks.[].PageBlocksFullScreenLogo.slogan
# getPageDocument.data.blocks.[].PageBlocksFullScreenLogo.link
# getPageDocument.data.blocks.[].PageBlocksFullScreenLogo.overlay
# getPageDocument.data.blocks.[].PageBlocksFullScreenLogo.overlay.image
# getPageDocument.data.blocks.[].PageBlocksFullScreenLogo.overlay.overlayColor
# getPageDocument.data.blocks.[].PageBlocksFullScreenLogo.overlay.overlayOpacity
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.title
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.subTitle
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.description
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.overlay
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.overlay.image
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.overlay.overlayColor
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.overlay.overlayOpacity
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.action
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.action.link
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.action.linkText
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.action.secondaryLink
# getPageDocument.data.blocks.[].PageBlocksFullScreenHeader.action.secondaryText
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.title
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.description
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.image
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.subTitle
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.stats.[]
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.stats.[].title
# getPageDocument.data.blocks.[].PageBlocksStatsWithImage.stats.[].description
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[]
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].title
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].description
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].action
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].action.link
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].action.linkText
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].action.secondaryLink
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].action.secondaryText
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].overlay
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].overlay.image
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].overlay.overlayColor
# getPageDocument.data.blocks.[].PageBlocksSlideshow.items.[].overlay.overlayOpacity

# Blueprint
# getPageDocument.data.blocks.[].newsItems.[].article
#
# Documents for blueprint
# ================
#
# Field blueprints
# ================
# getPageDocument.data.blocks.[].PageBlocksNews.newsItems.[].article.data.title
# getPageDocument.data.blocks.[].PageBlocksNews.newsItems.[].article.data.image
# getPageDocument.data.blocks.[].PageBlocksNews.newsItems.[].article.data.subTitle


query{getLocaleInfoDocument(relativePath:"main.md"){data{au{signInLink signUpLink signUpLinkPersonal tel} gb{signInLink signUpLink signUpLinkPersonal tel} us{signInLink signUpLink signUpLinkPersonal tel}}} getNavigationDocument(relativePath:"main.md"){data{items{page{...on PageDocument{data{title link}}}}}} getFooterDocument(relativePath:"main.md"){data{offices{address location phone} disclaimers{body}}} getThemeDocument(relativePath:"main.json"){dataJSON} getPageDocument(relativePath:"dummy.md"){id data{title seo{title description image} blocks{__typename ...on PageBlocksComparisonTable{title subTitle description action{callToAction link linkText linkOverride secondaryLink secondaryText secondaryLinkOverride} items{title subTitle description bulletPoints meta{__typename ...on PageBlocksComparisonTableItemsMetaA{aOne} ...on PageBlocksComparisonTableItemsMetaB{bOne}}}} ...on PageBlocksHero{title description image action{callToAction link linkText linkOverride secondaryLink secondaryText secondaryLinkOverride}} ...on PageBlocksFeature{title description subTitle featureStyle features{icon name description} overlay{image overlayColor overlayOpacity}} ...on PageBlocksNews{title subTitle newsItems{article{...on NewsDocument{data{title image subTitle} sys{filename}}}}} ...on PageBlocksFullScreenLogo{slogan link overlay{image overlayColor overlayOpacity}} ...on PageBlocksFullScreenHeader{title subTitle description overlay{image overlayColor overlayOpacity} action{link linkText secondaryLink secondaryText}} ...on PageBlocksStatsWithImage{title description image subTitle stats{title description}} ...on PageBlocksSlideshow{items{title description action{link linkText secondaryLink secondaryText} overlay{image overlayColor overlayOpacity}}}}}}}`
