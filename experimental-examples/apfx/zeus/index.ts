/* eslint-disable */

import { AllTypesProps, ReturnTypes } from './const';
type ZEUS_INTERFACES = GraphQLTypes["Node"] | GraphQLTypes["Document"] | GraphQLTypes["Connection"]
type ZEUS_UNIONS = GraphQLTypes["DocumentNode"] | GraphQLTypes["NavigationItemsPageDocument"] | GraphQLTypes["PageBlocksNewsNewsItemsArticleDocument"] | GraphQLTypes["PageBlocksComparisonTableItemsMeta"] | GraphQLTypes["PageBlocks"]

export type ValueTypes = {
    /** References another document, used as a foreign key */
["Reference"]:unknown;
	["JSON"]:unknown;
	["SystemInfo"]: AliasType<{
	filename?:boolean,
	basename?:boolean,
breadcrumbs?: [{	excludeExtension?:boolean | null},boolean],
	path?:boolean,
	relativePath?:boolean,
	extension?:boolean,
	template?:boolean,
	collection?:ValueTypes["Collection"],
		__typename?: boolean
}>;
	["PageInfo"]: AliasType<{
	hasPreviousPage?:boolean,
	hasNextPage?:boolean,
	startCursor?:boolean,
	endCursor?:boolean,
		__typename?: boolean
}>;
	["Node"]:AliasType<{
		id?:boolean;
		['...on LocaleInfoDocument']?: Omit<ValueTypes["LocaleInfoDocument"],keyof ValueTypes["Node"]>;
		['...on NewsDocument']?: Omit<ValueTypes["NewsDocument"],keyof ValueTypes["Node"]>;
		['...on FooterDocument']?: Omit<ValueTypes["FooterDocument"],keyof ValueTypes["Node"]>;
		['...on ThemeDocument']?: Omit<ValueTypes["ThemeDocument"],keyof ValueTypes["Node"]>;
		['...on NavigationDocument']?: Omit<ValueTypes["NavigationDocument"],keyof ValueTypes["Node"]>;
		['...on PageDocument']?: Omit<ValueTypes["PageDocument"],keyof ValueTypes["Node"]>;
		__typename?: boolean
}>;
	["Document"]:AliasType<{
		sys?:ValueTypes["SystemInfo"],
	id?:boolean,
	form?:boolean,
	values?:boolean;
		['...on LocaleInfoDocument']?: Omit<ValueTypes["LocaleInfoDocument"],keyof ValueTypes["Document"]>;
		['...on NewsDocument']?: Omit<ValueTypes["NewsDocument"],keyof ValueTypes["Document"]>;
		['...on FooterDocument']?: Omit<ValueTypes["FooterDocument"],keyof ValueTypes["Document"]>;
		['...on ThemeDocument']?: Omit<ValueTypes["ThemeDocument"],keyof ValueTypes["Document"]>;
		['...on NavigationDocument']?: Omit<ValueTypes["NavigationDocument"],keyof ValueTypes["Document"]>;
		['...on PageDocument']?: Omit<ValueTypes["PageDocument"],keyof ValueTypes["Document"]>;
		__typename?: boolean
}>;
	/** A relay-compliant pagination connection */
["Connection"]:AliasType<{
		totalCount?:boolean;
		['...on DocumentConnection']?: Omit<ValueTypes["DocumentConnection"],keyof ValueTypes["Connection"]>;
		['...on LocaleInfoConnection']?: Omit<ValueTypes["LocaleInfoConnection"],keyof ValueTypes["Connection"]>;
		['...on NewsConnection']?: Omit<ValueTypes["NewsConnection"],keyof ValueTypes["Connection"]>;
		['...on FooterConnection']?: Omit<ValueTypes["FooterConnection"],keyof ValueTypes["Connection"]>;
		['...on ThemeConnection']?: Omit<ValueTypes["ThemeConnection"],keyof ValueTypes["Connection"]>;
		['...on NavigationConnection']?: Omit<ValueTypes["NavigationConnection"],keyof ValueTypes["Connection"]>;
		['...on PageConnection']?: Omit<ValueTypes["PageConnection"],keyof ValueTypes["Connection"]>;
		__typename?: boolean
}>;
	["Query"]: AliasType<{
getOptimizedQuery?: [{	queryString:string},boolean],
getCollection?: [{	collection?:string | null},ValueTypes["Collection"]],
	getCollections?:ValueTypes["Collection"],
node?: [{	id?:string | null},ValueTypes["Node"]],
getDocument?: [{	collection?:string | null,	relativePath?:string | null},ValueTypes["DocumentNode"]],
getDocumentList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["DocumentConnection"]],
	getDocumentFields?:boolean,
getLocaleInfoDocument?: [{	relativePath?:string | null},ValueTypes["LocaleInfoDocument"]],
getLocaleInfoList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["LocaleInfoConnection"]],
getNewsDocument?: [{	relativePath?:string | null},ValueTypes["NewsDocument"]],
getNewsList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["NewsConnection"]],
getFooterDocument?: [{	relativePath?:string | null},ValueTypes["FooterDocument"]],
getFooterList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["FooterConnection"]],
getThemeDocument?: [{	relativePath?:string | null},ValueTypes["ThemeDocument"]],
getThemeList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["ThemeConnection"]],
getNavigationDocument?: [{	relativePath?:string | null},ValueTypes["NavigationDocument"]],
getNavigationList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["NavigationConnection"]],
getPageDocument?: [{	relativePath?:string | null},ValueTypes["PageDocument"]],
getPageList?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["PageConnection"]],
		__typename?: boolean
}>;
	["DocumentConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["DocumentNode"],
		__typename?: boolean
}>;
	["DocumentConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["DocumentConnectionEdges"],
		__typename?: boolean
}>;
	["Collection"]: AliasType<{
	name?:boolean,
	slug?:boolean,
	label?:boolean,
	path?:boolean,
	format?:boolean,
	matches?:boolean,
	templates?:boolean,
	fields?:boolean,
documents?: [{	before?:string | null,	after?:string | null,	first?:number | null,	last?:number | null},ValueTypes["DocumentConnection"]],
		__typename?: boolean
}>;
	["DocumentNode"]: AliasType<{		["...on LocaleInfoDocument"] : ValueTypes["LocaleInfoDocument"],
		["...on NewsDocument"] : ValueTypes["NewsDocument"],
		["...on FooterDocument"] : ValueTypes["FooterDocument"],
		["...on ThemeDocument"] : ValueTypes["ThemeDocument"],
		["...on NavigationDocument"] : ValueTypes["NavigationDocument"],
		["...on PageDocument"] : ValueTypes["PageDocument"]
		__typename?: boolean
}>;
	["LocaleInfoAu"]: AliasType<{
	tel?:boolean,
	signUpLink?:boolean,
	signUpLinkPersonal?:boolean,
	signInLink?:boolean,
		__typename?: boolean
}>;
	["LocaleInfoUs"]: AliasType<{
	tel?:boolean,
	signUpLink?:boolean,
	signUpLinkPersonal?:boolean,
	signInLink?:boolean,
		__typename?: boolean
}>;
	["LocaleInfoGb"]: AliasType<{
	tel?:boolean,
	signUpLink?:boolean,
	signUpLinkPersonal?:boolean,
	signInLink?:boolean,
		__typename?: boolean
}>;
	["LocaleInfo"]: AliasType<{
	au?:ValueTypes["LocaleInfoAu"],
	us?:ValueTypes["LocaleInfoUs"],
	gb?:ValueTypes["LocaleInfoGb"],
		__typename?: boolean
}>;
	["LocaleInfoDocument"]: AliasType<{
	id?:boolean,
	sys?:ValueTypes["SystemInfo"],
	data?:ValueTypes["LocaleInfo"],
	form?:boolean,
	values?:boolean,
	dataJSON?:boolean,
		__typename?: boolean
}>;
	["LocaleInfoConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["LocaleInfoDocument"],
		__typename?: boolean
}>;
	["LocaleInfoConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["LocaleInfoConnectionEdges"],
		__typename?: boolean
}>;
	["News"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	image?:boolean,
	body?:boolean,
		__typename?: boolean
}>;
	["NewsDocument"]: AliasType<{
	id?:boolean,
	sys?:ValueTypes["SystemInfo"],
	data?:ValueTypes["News"],
	form?:boolean,
	values?:boolean,
	dataJSON?:boolean,
		__typename?: boolean
}>;
	["NewsConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["NewsDocument"],
		__typename?: boolean
}>;
	["NewsConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["NewsConnectionEdges"],
		__typename?: boolean
}>;
	["FooterOffices"]: AliasType<{
	location?:boolean,
	address?:boolean,
	phone?:boolean,
		__typename?: boolean
}>;
	["FooterDisclaimers"]: AliasType<{
	body?:boolean,
		__typename?: boolean
}>;
	["Footer"]: AliasType<{
	offices?:ValueTypes["FooterOffices"],
	disclaimers?:ValueTypes["FooterDisclaimers"],
		__typename?: boolean
}>;
	["FooterDocument"]: AliasType<{
	id?:boolean,
	sys?:ValueTypes["SystemInfo"],
	data?:ValueTypes["Footer"],
	form?:boolean,
	values?:boolean,
	dataJSON?:boolean,
		__typename?: boolean
}>;
	["FooterConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["FooterDocument"],
		__typename?: boolean
}>;
	["FooterConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["FooterConnectionEdges"],
		__typename?: boolean
}>;
	["Theme"]: AliasType<{
	displayFont?:boolean,
	colorMode?:boolean,
		__typename?: boolean
}>;
	["ThemeDocument"]: AliasType<{
	id?:boolean,
	sys?:ValueTypes["SystemInfo"],
	data?:ValueTypes["Theme"],
	form?:boolean,
	values?:boolean,
	dataJSON?:boolean,
		__typename?: boolean
}>;
	["ThemeConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["ThemeDocument"],
		__typename?: boolean
}>;
	["ThemeConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["ThemeConnectionEdges"],
		__typename?: boolean
}>;
	["NavigationItemsPageDocument"]: AliasType<{		["...on PageDocument"] : ValueTypes["PageDocument"]
		__typename?: boolean
}>;
	["NavigationItems"]: AliasType<{
	page?:ValueTypes["NavigationItemsPageDocument"],
		__typename?: boolean
}>;
	["Navigation"]: AliasType<{
	items?:ValueTypes["NavigationItems"],
		__typename?: boolean
}>;
	["NavigationDocument"]: AliasType<{
	id?:boolean,
	sys?:ValueTypes["SystemInfo"],
	data?:ValueTypes["Navigation"],
	form?:boolean,
	values?:boolean,
	dataJSON?:boolean,
		__typename?: boolean
}>;
	["NavigationConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["NavigationDocument"],
		__typename?: boolean
}>;
	["NavigationConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["NavigationConnectionEdges"],
		__typename?: boolean
}>;
	["PageSeo"]: AliasType<{
	title?:boolean,
	image?:boolean,
	description?:boolean,
		__typename?: boolean
}>;
	["PageBlocksNewsNewsItemsArticleDocument"]: AliasType<{		["...on NewsDocument"] : ValueTypes["NewsDocument"]
		__typename?: boolean
}>;
	["PageBlocksNewsNewsItems"]: AliasType<{
	article?:ValueTypes["PageBlocksNewsNewsItemsArticleDocument"],
		__typename?: boolean
}>;
	["PageBlocksNews"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	newsItems?:ValueTypes["PageBlocksNewsNewsItems"],
		__typename?: boolean
}>;
	["PageBlocksStatsWithImageStats"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
		__typename?: boolean
}>;
	["PageBlocksStatsWithImage"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	image?:boolean,
	stats?:ValueTypes["PageBlocksStatsWithImageStats"],
		__typename?: boolean
}>;
	["PageBlocksHeroAction"]: AliasType<{
	callToAction?:boolean,
	linkText?:boolean,
	link?:boolean,
	linkOverride?:boolean,
	secondaryText?:boolean,
	secondaryLink?:boolean,
	secondaryLinkOverride?:boolean,
		__typename?: boolean
}>;
	["PageBlocksHero"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	image?:boolean,
	action?:ValueTypes["PageBlocksHeroAction"],
		__typename?: boolean
}>;
	["PageBlocksSlideshowItemsAction"]: AliasType<{
	callToAction?:boolean,
	linkText?:boolean,
	link?:boolean,
	linkOverride?:boolean,
	secondaryText?:boolean,
	secondaryLink?:boolean,
	secondaryLinkOverride?:boolean,
		__typename?: boolean
}>;
	["PageBlocksSlideshowItemsOverlay"]: AliasType<{
	image?:boolean,
	overlayColor?:boolean,
	overlayOpacity?:boolean,
		__typename?: boolean
}>;
	["PageBlocksSlideshowItems"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	action?:ValueTypes["PageBlocksSlideshowItemsAction"],
	overlay?:ValueTypes["PageBlocksSlideshowItemsOverlay"],
		__typename?: boolean
}>;
	["PageBlocksSlideshow"]: AliasType<{
	items?:ValueTypes["PageBlocksSlideshowItems"],
		__typename?: boolean
}>;
	["PageBlocksComparisonTableItemsMetaA"]: AliasType<{
	aOne?:boolean,
		__typename?: boolean
}>;
	["PageBlocksComparisonTableItemsMetaB"]: AliasType<{
	bOne?:boolean,
		__typename?: boolean
}>;
	["PageBlocksComparisonTableItemsMeta"]: AliasType<{		["...on PageBlocksComparisonTableItemsMetaA"] : ValueTypes["PageBlocksComparisonTableItemsMetaA"],
		["...on PageBlocksComparisonTableItemsMetaB"] : ValueTypes["PageBlocksComparisonTableItemsMetaB"]
		__typename?: boolean
}>;
	["PageBlocksComparisonTableItems"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	bulletPoints?:boolean,
	meta?:ValueTypes["PageBlocksComparisonTableItemsMeta"],
		__typename?: boolean
}>;
	["PageBlocksComparisonTableAction"]: AliasType<{
	callToAction?:boolean,
	linkText?:boolean,
	link?:boolean,
	linkOverride?:boolean,
	secondaryText?:boolean,
	secondaryLink?:boolean,
	secondaryLinkOverride?:boolean,
		__typename?: boolean
}>;
	["PageBlocksComparisonTable"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	items?:ValueTypes["PageBlocksComparisonTableItems"],
	action?:ValueTypes["PageBlocksComparisonTableAction"],
		__typename?: boolean
}>;
	["PageBlocksFeatureFeatures"]: AliasType<{
	icon?:boolean,
	name?:boolean,
	description?:boolean,
		__typename?: boolean
}>;
	["PageBlocksFeatureOverlay"]: AliasType<{
	image?:boolean,
	overlayColor?:boolean,
	overlayOpacity?:boolean,
		__typename?: boolean
}>;
	["PageBlocksFeature"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	featureStyle?:boolean,
	features?:ValueTypes["PageBlocksFeatureFeatures"],
	overlay?:ValueTypes["PageBlocksFeatureOverlay"],
		__typename?: boolean
}>;
	["PageBlocksFullScreenLogoOverlay"]: AliasType<{
	image?:boolean,
	overlayColor?:boolean,
	overlayOpacity?:boolean,
		__typename?: boolean
}>;
	["PageBlocksFullScreenLogo"]: AliasType<{
	slogan?:boolean,
	link?:boolean,
	overlay?:ValueTypes["PageBlocksFullScreenLogoOverlay"],
		__typename?: boolean
}>;
	["PageBlocksFullScreenHeaderAction"]: AliasType<{
	callToAction?:boolean,
	linkText?:boolean,
	link?:boolean,
	linkOverride?:boolean,
	secondaryText?:boolean,
	secondaryLink?:boolean,
	secondaryLinkOverride?:boolean,
		__typename?: boolean
}>;
	["PageBlocksFullScreenHeaderOverlay"]: AliasType<{
	image?:boolean,
	overlayColor?:boolean,
	overlayOpacity?:boolean,
		__typename?: boolean
}>;
	["PageBlocksFullScreenHeader"]: AliasType<{
	title?:boolean,
	subTitle?:boolean,
	description?:boolean,
	action?:ValueTypes["PageBlocksFullScreenHeaderAction"],
	overlay?:ValueTypes["PageBlocksFullScreenHeaderOverlay"],
		__typename?: boolean
}>;
	["PageBlocks"]: AliasType<{		["...on PageBlocksNews"] : ValueTypes["PageBlocksNews"],
		["...on PageBlocksStatsWithImage"] : ValueTypes["PageBlocksStatsWithImage"],
		["...on PageBlocksHero"] : ValueTypes["PageBlocksHero"],
		["...on PageBlocksSlideshow"] : ValueTypes["PageBlocksSlideshow"],
		["...on PageBlocksComparisonTable"] : ValueTypes["PageBlocksComparisonTable"],
		["...on PageBlocksFeature"] : ValueTypes["PageBlocksFeature"],
		["...on PageBlocksFullScreenLogo"] : ValueTypes["PageBlocksFullScreenLogo"],
		["...on PageBlocksFullScreenHeader"] : ValueTypes["PageBlocksFullScreenHeader"]
		__typename?: boolean
}>;
	["Page"]: AliasType<{
	title?:boolean,
	link?:boolean,
	seo?:ValueTypes["PageSeo"],
	blocks?:ValueTypes["PageBlocks"],
		__typename?: boolean
}>;
	["PageDocument"]: AliasType<{
	id?:boolean,
	sys?:ValueTypes["SystemInfo"],
	data?:ValueTypes["Page"],
	form?:boolean,
	values?:boolean,
	dataJSON?:boolean,
		__typename?: boolean
}>;
	["PageConnectionEdges"]: AliasType<{
	cursor?:boolean,
	node?:ValueTypes["PageDocument"],
		__typename?: boolean
}>;
	["PageConnection"]: AliasType<{
	pageInfo?:ValueTypes["PageInfo"],
	totalCount?:boolean,
	edges?:ValueTypes["PageConnectionEdges"],
		__typename?: boolean
}>;
	["Mutation"]: AliasType<{
addPendingDocument?: [{	collection:string,	relativePath:string,	template?:string | null},ValueTypes["DocumentNode"]],
updateDocument?: [{	collection?:string | null,	relativePath:string,	params:ValueTypes["DocumentMutation"]},ValueTypes["DocumentNode"]],
createDocument?: [{	collection?:string | null,	relativePath:string,	params:ValueTypes["DocumentMutation"]},ValueTypes["DocumentNode"]],
updateLocaleInfoDocument?: [{	relativePath:string,	params:ValueTypes["LocaleInfoMutation"]},ValueTypes["LocaleInfoDocument"]],
createLocaleInfoDocument?: [{	relativePath:string,	params:ValueTypes["LocaleInfoMutation"]},ValueTypes["LocaleInfoDocument"]],
updateNewsDocument?: [{	relativePath:string,	params:ValueTypes["NewsMutation"]},ValueTypes["NewsDocument"]],
createNewsDocument?: [{	relativePath:string,	params:ValueTypes["NewsMutation"]},ValueTypes["NewsDocument"]],
updateFooterDocument?: [{	relativePath:string,	params:ValueTypes["FooterMutation"]},ValueTypes["FooterDocument"]],
createFooterDocument?: [{	relativePath:string,	params:ValueTypes["FooterMutation"]},ValueTypes["FooterDocument"]],
updateThemeDocument?: [{	relativePath:string,	params:ValueTypes["ThemeMutation"]},ValueTypes["ThemeDocument"]],
createThemeDocument?: [{	relativePath:string,	params:ValueTypes["ThemeMutation"]},ValueTypes["ThemeDocument"]],
updateNavigationDocument?: [{	relativePath:string,	params:ValueTypes["NavigationMutation"]},ValueTypes["NavigationDocument"]],
createNavigationDocument?: [{	relativePath:string,	params:ValueTypes["NavigationMutation"]},ValueTypes["NavigationDocument"]],
updatePageDocument?: [{	relativePath:string,	params:ValueTypes["PageMutation"]},ValueTypes["PageDocument"]],
createPageDocument?: [{	relativePath:string,	params:ValueTypes["PageMutation"]},ValueTypes["PageDocument"]],
		__typename?: boolean
}>;
	["DocumentMutation"]: {
	localeInfo?:ValueTypes["LocaleInfoMutation"] | null,
	news?:ValueTypes["NewsMutation"] | null,
	footer?:ValueTypes["FooterMutation"] | null,
	theme?:ValueTypes["ThemeMutation"] | null,
	navigation?:ValueTypes["NavigationMutation"] | null,
	page?:ValueTypes["PageMutation"] | null
};
	["LocaleInfoAuMutation"]: {
	tel?:string | null,
	signUpLink?:string | null,
	signUpLinkPersonal?:string | null,
	signInLink?:string | null
};
	["LocaleInfoUsMutation"]: {
	tel?:string | null,
	signUpLink?:string | null,
	signUpLinkPersonal?:string | null,
	signInLink?:string | null
};
	["LocaleInfoGbMutation"]: {
	tel?:string | null,
	signUpLink?:string | null,
	signUpLinkPersonal?:string | null,
	signInLink?:string | null
};
	["LocaleInfoMutation"]: {
	au?:ValueTypes["LocaleInfoAuMutation"] | null,
	us?:ValueTypes["LocaleInfoUsMutation"] | null,
	gb?:ValueTypes["LocaleInfoGbMutation"] | null
};
	["NewsMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	image?:string | null,
	body?:ValueTypes["JSON"] | null
};
	["FooterOfficesMutation"]: {
	location?:string | null,
	address?:string | null,
	phone?:string | null
};
	["FooterDisclaimersMutation"]: {
	body?:ValueTypes["JSON"] | null
};
	["FooterMutation"]: {
	offices?:(ValueTypes["FooterOfficesMutation"] | undefined | null)[],
	disclaimers?:(ValueTypes["FooterDisclaimersMutation"] | undefined | null)[]
};
	["ThemeMutation"]: {
	displayFont?:string | null,
	colorMode?:string | null
};
	["NavigationItemsMutation"]: {
	page?:string | null
};
	["NavigationMutation"]: {
	items?:(ValueTypes["NavigationItemsMutation"] | undefined | null)[]
};
	["PageSeoMutation"]: {
	title?:string | null,
	image?:string | null,
	description?:string | null
};
	["PageBlocksNewsNewsItemsMutation"]: {
	article?:string | null
};
	["PageBlocksNewsMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	newsItems?:(ValueTypes["PageBlocksNewsNewsItemsMutation"] | undefined | null)[]
};
	["PageBlocksStatsWithImageStatsMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null
};
	["PageBlocksStatsWithImageMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	image?:string | null,
	stats?:(ValueTypes["PageBlocksStatsWithImageStatsMutation"] | undefined | null)[]
};
	["PageBlocksHeroActionMutation"]: {
	callToAction?:string | null,
	linkText?:string | null,
	link?:string | null,
	linkOverride?:string | null,
	secondaryText?:string | null,
	secondaryLink?:string | null,
	secondaryLinkOverride?:string | null
};
	["PageBlocksHeroMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	image?:string | null,
	action?:ValueTypes["PageBlocksHeroActionMutation"] | null
};
	["PageBlocksSlideshowItemsActionMutation"]: {
	callToAction?:string | null,
	linkText?:string | null,
	link?:string | null,
	linkOverride?:string | null,
	secondaryText?:string | null,
	secondaryLink?:string | null,
	secondaryLinkOverride?:string | null
};
	["PageBlocksSlideshowItemsOverlayMutation"]: {
	image?:string | null,
	overlayColor?:string | null,
	overlayOpacity?:string | null
};
	["PageBlocksSlideshowItemsMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	action?:ValueTypes["PageBlocksSlideshowItemsActionMutation"] | null,
	overlay?:ValueTypes["PageBlocksSlideshowItemsOverlayMutation"] | null
};
	["PageBlocksSlideshowMutation"]: {
	items?:(ValueTypes["PageBlocksSlideshowItemsMutation"] | undefined | null)[]
};
	["PageBlocksComparisonTableItemsMetaAMutation"]: {
	aOne?:string | null
};
	["PageBlocksComparisonTableItemsMetaBMutation"]: {
	bOne?:string | null
};
	["PageBlocksComparisonTableItemsMetaMutation"]: {
	a?:ValueTypes["PageBlocksComparisonTableItemsMetaAMutation"] | null,
	b?:ValueTypes["PageBlocksComparisonTableItemsMetaBMutation"] | null
};
	["PageBlocksComparisonTableItemsMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	bulletPoints?:(string | undefined | null)[],
	meta?:(ValueTypes["PageBlocksComparisonTableItemsMetaMutation"] | undefined | null)[]
};
	["PageBlocksComparisonTableActionMutation"]: {
	callToAction?:string | null,
	linkText?:string | null,
	link?:string | null,
	linkOverride?:string | null,
	secondaryText?:string | null,
	secondaryLink?:string | null,
	secondaryLinkOverride?:string | null
};
	["PageBlocksComparisonTableMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	items?:(ValueTypes["PageBlocksComparisonTableItemsMutation"] | undefined | null)[],
	action?:ValueTypes["PageBlocksComparisonTableActionMutation"] | null
};
	["PageBlocksFeatureFeaturesMutation"]: {
	icon?:string | null,
	name?:string | null,
	description?:ValueTypes["JSON"] | null
};
	["PageBlocksFeatureOverlayMutation"]: {
	image?:string | null,
	overlayColor?:string | null,
	overlayOpacity?:string | null
};
	["PageBlocksFeatureMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	featureStyle?:string | null,
	features?:(ValueTypes["PageBlocksFeatureFeaturesMutation"] | undefined | null)[],
	overlay?:ValueTypes["PageBlocksFeatureOverlayMutation"] | null
};
	["PageBlocksFullScreenLogoOverlayMutation"]: {
	image?:string | null,
	overlayColor?:string | null,
	overlayOpacity?:string | null
};
	["PageBlocksFullScreenLogoMutation"]: {
	slogan?:string | null,
	link?:string | null,
	overlay?:ValueTypes["PageBlocksFullScreenLogoOverlayMutation"] | null
};
	["PageBlocksFullScreenHeaderActionMutation"]: {
	callToAction?:string | null,
	linkText?:string | null,
	link?:string | null,
	linkOverride?:string | null,
	secondaryText?:string | null,
	secondaryLink?:string | null,
	secondaryLinkOverride?:string | null
};
	["PageBlocksFullScreenHeaderOverlayMutation"]: {
	image?:string | null,
	overlayColor?:string | null,
	overlayOpacity?:string | null
};
	["PageBlocksFullScreenHeaderMutation"]: {
	title?:string | null,
	subTitle?:string | null,
	description?:ValueTypes["JSON"] | null,
	action?:ValueTypes["PageBlocksFullScreenHeaderActionMutation"] | null,
	overlay?:ValueTypes["PageBlocksFullScreenHeaderOverlayMutation"] | null
};
	["PageBlocksMutation"]: {
	news?:ValueTypes["PageBlocksNewsMutation"] | null,
	statsWithImage?:ValueTypes["PageBlocksStatsWithImageMutation"] | null,
	hero?:ValueTypes["PageBlocksHeroMutation"] | null,
	slideshow?:ValueTypes["PageBlocksSlideshowMutation"] | null,
	comparisonTable?:ValueTypes["PageBlocksComparisonTableMutation"] | null,
	feature?:ValueTypes["PageBlocksFeatureMutation"] | null,
	fullScreenLogo?:ValueTypes["PageBlocksFullScreenLogoMutation"] | null,
	fullScreenHeader?:ValueTypes["PageBlocksFullScreenHeaderMutation"] | null
};
	["PageMutation"]: {
	title?:string | null,
	link?:string | null,
	seo?:ValueTypes["PageSeoMutation"] | null,
	blocks?:(ValueTypes["PageBlocksMutation"] | undefined | null)[]
}
  }

export type ModelTypes = {
    /** References another document, used as a foreign key */
["Reference"]:any;
	["JSON"]:any;
	["SystemInfo"]: {
		filename:string,
	basename:string,
	breadcrumbs:string[],
	path:string,
	relativePath:string,
	extension:string,
	template:string,
	collection:ModelTypes["Collection"]
};
	["PageInfo"]: {
		hasPreviousPage:boolean,
	hasNextPage:boolean,
	startCursor:string,
	endCursor:string
};
	["Node"]: ModelTypes["LocaleInfoDocument"] | ModelTypes["NewsDocument"] | ModelTypes["FooterDocument"] | ModelTypes["ThemeDocument"] | ModelTypes["NavigationDocument"] | ModelTypes["PageDocument"];
	["Document"]: ModelTypes["LocaleInfoDocument"] | ModelTypes["NewsDocument"] | ModelTypes["FooterDocument"] | ModelTypes["ThemeDocument"] | ModelTypes["NavigationDocument"] | ModelTypes["PageDocument"];
	/** A relay-compliant pagination connection */
["Connection"]: ModelTypes["DocumentConnection"] | ModelTypes["LocaleInfoConnection"] | ModelTypes["NewsConnection"] | ModelTypes["FooterConnection"] | ModelTypes["ThemeConnection"] | ModelTypes["NavigationConnection"] | ModelTypes["PageConnection"];
	["Query"]: {
		getOptimizedQuery?:string,
	getCollection:ModelTypes["Collection"],
	getCollections:ModelTypes["Collection"][],
	node:ModelTypes["Node"],
	getDocument:ModelTypes["DocumentNode"],
	getDocumentList:ModelTypes["DocumentConnection"],
	getDocumentFields:ModelTypes["JSON"],
	getLocaleInfoDocument:ModelTypes["LocaleInfoDocument"],
	getLocaleInfoList:ModelTypes["LocaleInfoConnection"],
	getNewsDocument:ModelTypes["NewsDocument"],
	getNewsList:ModelTypes["NewsConnection"],
	getFooterDocument:ModelTypes["FooterDocument"],
	getFooterList:ModelTypes["FooterConnection"],
	getThemeDocument:ModelTypes["ThemeDocument"],
	getThemeList:ModelTypes["ThemeConnection"],
	getNavigationDocument:ModelTypes["NavigationDocument"],
	getNavigationList:ModelTypes["NavigationConnection"],
	getPageDocument:ModelTypes["PageDocument"],
	getPageList:ModelTypes["PageConnection"]
};
	["DocumentConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["DocumentNode"]
};
	["DocumentConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["DocumentConnectionEdges"] | undefined)[]
};
	["Collection"]: {
		name:string,
	slug:string,
	label?:string,
	path:string,
	format?:string,
	matches?:string,
	templates?:(ModelTypes["JSON"] | undefined)[],
	fields?:(ModelTypes["JSON"] | undefined)[],
	documents:ModelTypes["DocumentConnection"]
};
	["DocumentNode"]:ModelTypes["LocaleInfoDocument"] | ModelTypes["NewsDocument"] | ModelTypes["FooterDocument"] | ModelTypes["ThemeDocument"] | ModelTypes["NavigationDocument"] | ModelTypes["PageDocument"];
	["LocaleInfoAu"]: {
		tel?:string,
	signUpLink?:string,
	signUpLinkPersonal?:string,
	signInLink?:string
};
	["LocaleInfoUs"]: {
		tel?:string,
	signUpLink?:string,
	signUpLinkPersonal?:string,
	signInLink?:string
};
	["LocaleInfoGb"]: {
		tel?:string,
	signUpLink?:string,
	signUpLinkPersonal?:string,
	signInLink?:string
};
	["LocaleInfo"]: {
		au?:ModelTypes["LocaleInfoAu"],
	us?:ModelTypes["LocaleInfoUs"],
	gb?:ModelTypes["LocaleInfoGb"]
};
	["LocaleInfoDocument"]: {
		id:string,
	sys:ModelTypes["SystemInfo"],
	data:ModelTypes["LocaleInfo"],
	form:ModelTypes["JSON"],
	values:ModelTypes["JSON"],
	dataJSON:ModelTypes["JSON"]
};
	["LocaleInfoConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["LocaleInfoDocument"]
};
	["LocaleInfoConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["LocaleInfoConnectionEdges"] | undefined)[]
};
	["News"]: {
		title:string,
	subTitle?:string,
	image?:string,
	body?:ModelTypes["JSON"]
};
	["NewsDocument"]: {
		id:string,
	sys:ModelTypes["SystemInfo"],
	data:ModelTypes["News"],
	form:ModelTypes["JSON"],
	values:ModelTypes["JSON"],
	dataJSON:ModelTypes["JSON"]
};
	["NewsConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["NewsDocument"]
};
	["NewsConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["NewsConnectionEdges"] | undefined)[]
};
	["FooterOffices"]: {
		location:string,
	address:string,
	phone:string
};
	["FooterDisclaimers"]: {
		body?:ModelTypes["JSON"]
};
	["Footer"]: {
		offices?:(ModelTypes["FooterOffices"] | undefined)[],
	disclaimers:ModelTypes["FooterDisclaimers"][]
};
	["FooterDocument"]: {
		id:string,
	sys:ModelTypes["SystemInfo"],
	data:ModelTypes["Footer"],
	form:ModelTypes["JSON"],
	values:ModelTypes["JSON"],
	dataJSON:ModelTypes["JSON"]
};
	["FooterConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["FooterDocument"]
};
	["FooterConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["FooterConnectionEdges"] | undefined)[]
};
	["Theme"]: {
		displayFont?:string,
	colorMode?:string
};
	["ThemeDocument"]: {
		id:string,
	sys:ModelTypes["SystemInfo"],
	data:ModelTypes["Theme"],
	form:ModelTypes["JSON"],
	values:ModelTypes["JSON"],
	dataJSON:ModelTypes["JSON"]
};
	["ThemeConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["ThemeDocument"]
};
	["ThemeConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["ThemeConnectionEdges"] | undefined)[]
};
	["NavigationItemsPageDocument"]:ModelTypes["PageDocument"];
	["NavigationItems"]: {
		page?:ModelTypes["NavigationItemsPageDocument"]
};
	["Navigation"]: {
		items:ModelTypes["NavigationItems"][]
};
	["NavigationDocument"]: {
		id:string,
	sys:ModelTypes["SystemInfo"],
	data:ModelTypes["Navigation"],
	form:ModelTypes["JSON"],
	values:ModelTypes["JSON"],
	dataJSON:ModelTypes["JSON"]
};
	["NavigationConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["NavigationDocument"]
};
	["NavigationConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["NavigationConnectionEdges"] | undefined)[]
};
	["PageSeo"]: {
		title?:string,
	image?:string,
	description:string
};
	["PageBlocksNewsNewsItemsArticleDocument"]:ModelTypes["NewsDocument"];
	["PageBlocksNewsNewsItems"]: {
		article:ModelTypes["PageBlocksNewsNewsItemsArticleDocument"]
};
	["PageBlocksNews"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	newsItems:ModelTypes["PageBlocksNewsNewsItems"][]
};
	["PageBlocksStatsWithImageStats"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"]
};
	["PageBlocksStatsWithImage"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	image?:string,
	stats?:(ModelTypes["PageBlocksStatsWithImageStats"] | undefined)[]
};
	["PageBlocksHeroAction"]: {
		callToAction?:string,
	linkText?:string,
	link?:string,
	linkOverride?:string,
	secondaryText?:string,
	secondaryLink?:string,
	secondaryLinkOverride?:string
};
	["PageBlocksHero"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	image?:string,
	action?:ModelTypes["PageBlocksHeroAction"]
};
	["PageBlocksSlideshowItemsAction"]: {
		callToAction?:string,
	linkText?:string,
	link?:string,
	linkOverride?:string,
	secondaryText?:string,
	secondaryLink?:string,
	secondaryLinkOverride?:string
};
	["PageBlocksSlideshowItemsOverlay"]: {
		image?:string,
	overlayColor?:string,
	overlayOpacity?:string
};
	["PageBlocksSlideshowItems"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	action?:ModelTypes["PageBlocksSlideshowItemsAction"],
	overlay?:ModelTypes["PageBlocksSlideshowItemsOverlay"]
};
	["PageBlocksSlideshow"]: {
		items?:(ModelTypes["PageBlocksSlideshowItems"] | undefined)[]
};
	["PageBlocksComparisonTableItemsMetaA"]: {
		aOne?:string
};
	["PageBlocksComparisonTableItemsMetaB"]: {
		bOne?:string
};
	["PageBlocksComparisonTableItemsMeta"]:ModelTypes["PageBlocksComparisonTableItemsMetaA"] | ModelTypes["PageBlocksComparisonTableItemsMetaB"];
	["PageBlocksComparisonTableItems"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	bulletPoints?:(string | undefined)[],
	meta?:(ModelTypes["PageBlocksComparisonTableItemsMeta"] | undefined)[]
};
	["PageBlocksComparisonTableAction"]: {
		callToAction?:string,
	linkText?:string,
	link?:string,
	linkOverride?:string,
	secondaryText?:string,
	secondaryLink?:string,
	secondaryLinkOverride?:string
};
	["PageBlocksComparisonTable"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	items?:(ModelTypes["PageBlocksComparisonTableItems"] | undefined)[],
	action?:ModelTypes["PageBlocksComparisonTableAction"]
};
	["PageBlocksFeatureFeatures"]: {
		icon:string,
	name:string,
	description:ModelTypes["JSON"]
};
	["PageBlocksFeatureOverlay"]: {
		image?:string,
	overlayColor?:string,
	overlayOpacity?:string
};
	["PageBlocksFeature"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	featureStyle?:string,
	features:ModelTypes["PageBlocksFeatureFeatures"][],
	overlay?:ModelTypes["PageBlocksFeatureOverlay"]
};
	["PageBlocksFullScreenLogoOverlay"]: {
		image?:string,
	overlayColor?:string,
	overlayOpacity?:string
};
	["PageBlocksFullScreenLogo"]: {
		slogan?:string,
	link?:string,
	overlay?:ModelTypes["PageBlocksFullScreenLogoOverlay"]
};
	["PageBlocksFullScreenHeaderAction"]: {
		callToAction?:string,
	linkText?:string,
	link?:string,
	linkOverride?:string,
	secondaryText?:string,
	secondaryLink?:string,
	secondaryLinkOverride?:string
};
	["PageBlocksFullScreenHeaderOverlay"]: {
		image?:string,
	overlayColor?:string,
	overlayOpacity?:string
};
	["PageBlocksFullScreenHeader"]: {
		title:string,
	subTitle?:string,
	description:ModelTypes["JSON"],
	action?:ModelTypes["PageBlocksFullScreenHeaderAction"],
	overlay?:ModelTypes["PageBlocksFullScreenHeaderOverlay"]
};
	["PageBlocks"]:ModelTypes["PageBlocksNews"] | ModelTypes["PageBlocksStatsWithImage"] | ModelTypes["PageBlocksHero"] | ModelTypes["PageBlocksSlideshow"] | ModelTypes["PageBlocksComparisonTable"] | ModelTypes["PageBlocksFeature"] | ModelTypes["PageBlocksFullScreenLogo"] | ModelTypes["PageBlocksFullScreenHeader"];
	["Page"]: {
		title:string,
	link:string,
	seo?:ModelTypes["PageSeo"],
	blocks?:(ModelTypes["PageBlocks"] | undefined)[]
};
	["PageDocument"]: {
		id:string,
	sys:ModelTypes["SystemInfo"],
	data:ModelTypes["Page"],
	form:ModelTypes["JSON"],
	values:ModelTypes["JSON"],
	dataJSON:ModelTypes["JSON"]
};
	["PageConnectionEdges"]: {
		cursor?:string,
	node?:ModelTypes["PageDocument"]
};
	["PageConnection"]: {
		pageInfo?:ModelTypes["PageInfo"],
	totalCount:number,
	edges?:(ModelTypes["PageConnectionEdges"] | undefined)[]
};
	["Mutation"]: {
		addPendingDocument:ModelTypes["DocumentNode"],
	updateDocument:ModelTypes["DocumentNode"],
	createDocument:ModelTypes["DocumentNode"],
	updateLocaleInfoDocument:ModelTypes["LocaleInfoDocument"],
	createLocaleInfoDocument:ModelTypes["LocaleInfoDocument"],
	updateNewsDocument:ModelTypes["NewsDocument"],
	createNewsDocument:ModelTypes["NewsDocument"],
	updateFooterDocument:ModelTypes["FooterDocument"],
	createFooterDocument:ModelTypes["FooterDocument"],
	updateThemeDocument:ModelTypes["ThemeDocument"],
	createThemeDocument:ModelTypes["ThemeDocument"],
	updateNavigationDocument:ModelTypes["NavigationDocument"],
	createNavigationDocument:ModelTypes["NavigationDocument"],
	updatePageDocument:ModelTypes["PageDocument"],
	createPageDocument:ModelTypes["PageDocument"]
};
	["DocumentMutation"]: GraphQLTypes["DocumentMutation"];
	["LocaleInfoAuMutation"]: GraphQLTypes["LocaleInfoAuMutation"];
	["LocaleInfoUsMutation"]: GraphQLTypes["LocaleInfoUsMutation"];
	["LocaleInfoGbMutation"]: GraphQLTypes["LocaleInfoGbMutation"];
	["LocaleInfoMutation"]: GraphQLTypes["LocaleInfoMutation"];
	["NewsMutation"]: GraphQLTypes["NewsMutation"];
	["FooterOfficesMutation"]: GraphQLTypes["FooterOfficesMutation"];
	["FooterDisclaimersMutation"]: GraphQLTypes["FooterDisclaimersMutation"];
	["FooterMutation"]: GraphQLTypes["FooterMutation"];
	["ThemeMutation"]: GraphQLTypes["ThemeMutation"];
	["NavigationItemsMutation"]: GraphQLTypes["NavigationItemsMutation"];
	["NavigationMutation"]: GraphQLTypes["NavigationMutation"];
	["PageSeoMutation"]: GraphQLTypes["PageSeoMutation"];
	["PageBlocksNewsNewsItemsMutation"]: GraphQLTypes["PageBlocksNewsNewsItemsMutation"];
	["PageBlocksNewsMutation"]: GraphQLTypes["PageBlocksNewsMutation"];
	["PageBlocksStatsWithImageStatsMutation"]: GraphQLTypes["PageBlocksStatsWithImageStatsMutation"];
	["PageBlocksStatsWithImageMutation"]: GraphQLTypes["PageBlocksStatsWithImageMutation"];
	["PageBlocksHeroActionMutation"]: GraphQLTypes["PageBlocksHeroActionMutation"];
	["PageBlocksHeroMutation"]: GraphQLTypes["PageBlocksHeroMutation"];
	["PageBlocksSlideshowItemsActionMutation"]: GraphQLTypes["PageBlocksSlideshowItemsActionMutation"];
	["PageBlocksSlideshowItemsOverlayMutation"]: GraphQLTypes["PageBlocksSlideshowItemsOverlayMutation"];
	["PageBlocksSlideshowItemsMutation"]: GraphQLTypes["PageBlocksSlideshowItemsMutation"];
	["PageBlocksSlideshowMutation"]: GraphQLTypes["PageBlocksSlideshowMutation"];
	["PageBlocksComparisonTableItemsMetaAMutation"]: GraphQLTypes["PageBlocksComparisonTableItemsMetaAMutation"];
	["PageBlocksComparisonTableItemsMetaBMutation"]: GraphQLTypes["PageBlocksComparisonTableItemsMetaBMutation"];
	["PageBlocksComparisonTableItemsMetaMutation"]: GraphQLTypes["PageBlocksComparisonTableItemsMetaMutation"];
	["PageBlocksComparisonTableItemsMutation"]: GraphQLTypes["PageBlocksComparisonTableItemsMutation"];
	["PageBlocksComparisonTableActionMutation"]: GraphQLTypes["PageBlocksComparisonTableActionMutation"];
	["PageBlocksComparisonTableMutation"]: GraphQLTypes["PageBlocksComparisonTableMutation"];
	["PageBlocksFeatureFeaturesMutation"]: GraphQLTypes["PageBlocksFeatureFeaturesMutation"];
	["PageBlocksFeatureOverlayMutation"]: GraphQLTypes["PageBlocksFeatureOverlayMutation"];
	["PageBlocksFeatureMutation"]: GraphQLTypes["PageBlocksFeatureMutation"];
	["PageBlocksFullScreenLogoOverlayMutation"]: GraphQLTypes["PageBlocksFullScreenLogoOverlayMutation"];
	["PageBlocksFullScreenLogoMutation"]: GraphQLTypes["PageBlocksFullScreenLogoMutation"];
	["PageBlocksFullScreenHeaderActionMutation"]: GraphQLTypes["PageBlocksFullScreenHeaderActionMutation"];
	["PageBlocksFullScreenHeaderOverlayMutation"]: GraphQLTypes["PageBlocksFullScreenHeaderOverlayMutation"];
	["PageBlocksFullScreenHeaderMutation"]: GraphQLTypes["PageBlocksFullScreenHeaderMutation"];
	["PageBlocksMutation"]: GraphQLTypes["PageBlocksMutation"];
	["PageMutation"]: GraphQLTypes["PageMutation"]
    }

export type GraphQLTypes = {
    // DO NOT MODIFY THIS FILE. This file is automatically generated by Tina;
	/** References another document, used as a foreign key */
["Reference"]:any;
	["JSON"]:any;
	["SystemInfo"]: {
	__typename: "SystemInfo",
	filename: string,
	basename: string,
	breadcrumbs: Array<string>,
	path: string,
	relativePath: string,
	extension: string,
	template: string,
	collection: GraphQLTypes["Collection"]
};
	["PageInfo"]: {
	__typename: "PageInfo",
	hasPreviousPage: boolean,
	hasNextPage: boolean,
	startCursor: string,
	endCursor: string
};
	["Node"]: {
	__typename:"LocaleInfoDocument" | "NewsDocument" | "FooterDocument" | "ThemeDocument" | "NavigationDocument" | "PageDocument",
	id: string
	['...on LocaleInfoDocument']: '__union' & GraphQLTypes["LocaleInfoDocument"];
	['...on NewsDocument']: '__union' & GraphQLTypes["NewsDocument"];
	['...on FooterDocument']: '__union' & GraphQLTypes["FooterDocument"];
	['...on ThemeDocument']: '__union' & GraphQLTypes["ThemeDocument"];
	['...on NavigationDocument']: '__union' & GraphQLTypes["NavigationDocument"];
	['...on PageDocument']: '__union' & GraphQLTypes["PageDocument"];
};
	["Document"]: {
	__typename:"LocaleInfoDocument" | "NewsDocument" | "FooterDocument" | "ThemeDocument" | "NavigationDocument" | "PageDocument",
	sys?: GraphQLTypes["SystemInfo"],
	id: string,
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"]
	['...on LocaleInfoDocument']: '__union' & GraphQLTypes["LocaleInfoDocument"];
	['...on NewsDocument']: '__union' & GraphQLTypes["NewsDocument"];
	['...on FooterDocument']: '__union' & GraphQLTypes["FooterDocument"];
	['...on ThemeDocument']: '__union' & GraphQLTypes["ThemeDocument"];
	['...on NavigationDocument']: '__union' & GraphQLTypes["NavigationDocument"];
	['...on PageDocument']: '__union' & GraphQLTypes["PageDocument"];
};
	/** A relay-compliant pagination connection */
["Connection"]: {
	__typename:"DocumentConnection" | "LocaleInfoConnection" | "NewsConnection" | "FooterConnection" | "ThemeConnection" | "NavigationConnection" | "PageConnection",
	totalCount: number
	['...on DocumentConnection']: '__union' & GraphQLTypes["DocumentConnection"];
	['...on LocaleInfoConnection']: '__union' & GraphQLTypes["LocaleInfoConnection"];
	['...on NewsConnection']: '__union' & GraphQLTypes["NewsConnection"];
	['...on FooterConnection']: '__union' & GraphQLTypes["FooterConnection"];
	['...on ThemeConnection']: '__union' & GraphQLTypes["ThemeConnection"];
	['...on NavigationConnection']: '__union' & GraphQLTypes["NavigationConnection"];
	['...on PageConnection']: '__union' & GraphQLTypes["PageConnection"];
};
	["Query"]: {
	__typename: "Query",
	getOptimizedQuery?: string,
	getCollection: GraphQLTypes["Collection"],
	getCollections: Array<GraphQLTypes["Collection"]>,
	node: GraphQLTypes["Node"],
	getDocument: GraphQLTypes["DocumentNode"],
	getDocumentList: GraphQLTypes["DocumentConnection"],
	getDocumentFields: GraphQLTypes["JSON"],
	getLocaleInfoDocument: GraphQLTypes["LocaleInfoDocument"],
	getLocaleInfoList: GraphQLTypes["LocaleInfoConnection"],
	getNewsDocument: GraphQLTypes["NewsDocument"],
	getNewsList: GraphQLTypes["NewsConnection"],
	getFooterDocument: GraphQLTypes["FooterDocument"],
	getFooterList: GraphQLTypes["FooterConnection"],
	getThemeDocument: GraphQLTypes["ThemeDocument"],
	getThemeList: GraphQLTypes["ThemeConnection"],
	getNavigationDocument: GraphQLTypes["NavigationDocument"],
	getNavigationList: GraphQLTypes["NavigationConnection"],
	getPageDocument: GraphQLTypes["PageDocument"],
	getPageList: GraphQLTypes["PageConnection"]
};
	["DocumentConnectionEdges"]: {
	__typename: "DocumentConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["DocumentNode"]
};
	["DocumentConnection"]: {
	__typename: "DocumentConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["DocumentConnectionEdges"] | undefined>
};
	["Collection"]: {
	__typename: "Collection",
	name: string,
	slug: string,
	label?: string,
	path: string,
	format?: string,
	matches?: string,
	templates?: Array<GraphQLTypes["JSON"] | undefined>,
	fields?: Array<GraphQLTypes["JSON"] | undefined>,
	documents: GraphQLTypes["DocumentConnection"]
};
	["DocumentNode"]:{
	__typename:"LocaleInfoDocument" | "NewsDocument" | "FooterDocument" | "ThemeDocument" | "NavigationDocument" | "PageDocument"
	['...on LocaleInfoDocument']: '__union' & GraphQLTypes["LocaleInfoDocument"];
	['...on NewsDocument']: '__union' & GraphQLTypes["NewsDocument"];
	['...on FooterDocument']: '__union' & GraphQLTypes["FooterDocument"];
	['...on ThemeDocument']: '__union' & GraphQLTypes["ThemeDocument"];
	['...on NavigationDocument']: '__union' & GraphQLTypes["NavigationDocument"];
	['...on PageDocument']: '__union' & GraphQLTypes["PageDocument"];
};
	["LocaleInfoAu"]: {
	__typename: "LocaleInfoAu",
	tel?: string,
	signUpLink?: string,
	signUpLinkPersonal?: string,
	signInLink?: string
};
	["LocaleInfoUs"]: {
	__typename: "LocaleInfoUs",
	tel?: string,
	signUpLink?: string,
	signUpLinkPersonal?: string,
	signInLink?: string
};
	["LocaleInfoGb"]: {
	__typename: "LocaleInfoGb",
	tel?: string,
	signUpLink?: string,
	signUpLinkPersonal?: string,
	signInLink?: string
};
	["LocaleInfo"]: {
	__typename: "LocaleInfo",
	au?: GraphQLTypes["LocaleInfoAu"],
	us?: GraphQLTypes["LocaleInfoUs"],
	gb?: GraphQLTypes["LocaleInfoGb"]
};
	["LocaleInfoDocument"]: {
	__typename: "LocaleInfoDocument",
	id: string,
	sys: GraphQLTypes["SystemInfo"],
	data: GraphQLTypes["LocaleInfo"],
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"],
	dataJSON: GraphQLTypes["JSON"]
};
	["LocaleInfoConnectionEdges"]: {
	__typename: "LocaleInfoConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["LocaleInfoDocument"]
};
	["LocaleInfoConnection"]: {
	__typename: "LocaleInfoConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["LocaleInfoConnectionEdges"] | undefined>
};
	["News"]: {
	__typename: "News",
	title: string,
	subTitle?: string,
	image?: string,
	body?: GraphQLTypes["JSON"]
};
	["NewsDocument"]: {
	__typename: "NewsDocument",
	id: string,
	sys: GraphQLTypes["SystemInfo"],
	data: GraphQLTypes["News"],
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"],
	dataJSON: GraphQLTypes["JSON"]
};
	["NewsConnectionEdges"]: {
	__typename: "NewsConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["NewsDocument"]
};
	["NewsConnection"]: {
	__typename: "NewsConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["NewsConnectionEdges"] | undefined>
};
	["FooterOffices"]: {
	__typename: "FooterOffices",
	location: string,
	address: string,
	phone: string
};
	["FooterDisclaimers"]: {
	__typename: "FooterDisclaimers",
	body?: GraphQLTypes["JSON"]
};
	["Footer"]: {
	__typename: "Footer",
	offices?: Array<GraphQLTypes["FooterOffices"] | undefined>,
	disclaimers: Array<GraphQLTypes["FooterDisclaimers"]>
};
	["FooterDocument"]: {
	__typename: "FooterDocument",
	id: string,
	sys: GraphQLTypes["SystemInfo"],
	data: GraphQLTypes["Footer"],
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"],
	dataJSON: GraphQLTypes["JSON"]
};
	["FooterConnectionEdges"]: {
	__typename: "FooterConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["FooterDocument"]
};
	["FooterConnection"]: {
	__typename: "FooterConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["FooterConnectionEdges"] | undefined>
};
	["Theme"]: {
	__typename: "Theme",
	displayFont?: string,
	colorMode?: string
};
	["ThemeDocument"]: {
	__typename: "ThemeDocument",
	id: string,
	sys: GraphQLTypes["SystemInfo"],
	data: GraphQLTypes["Theme"],
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"],
	dataJSON: GraphQLTypes["JSON"]
};
	["ThemeConnectionEdges"]: {
	__typename: "ThemeConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["ThemeDocument"]
};
	["ThemeConnection"]: {
	__typename: "ThemeConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["ThemeConnectionEdges"] | undefined>
};
	["NavigationItemsPageDocument"]:{
	__typename:"PageDocument"
	['...on PageDocument']: '__union' & GraphQLTypes["PageDocument"];
};
	["NavigationItems"]: {
	__typename: "NavigationItems",
	page?: GraphQLTypes["NavigationItemsPageDocument"]
};
	["Navigation"]: {
	__typename: "Navigation",
	items: Array<GraphQLTypes["NavigationItems"]>
};
	["NavigationDocument"]: {
	__typename: "NavigationDocument",
	id: string,
	sys: GraphQLTypes["SystemInfo"],
	data: GraphQLTypes["Navigation"],
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"],
	dataJSON: GraphQLTypes["JSON"]
};
	["NavigationConnectionEdges"]: {
	__typename: "NavigationConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["NavigationDocument"]
};
	["NavigationConnection"]: {
	__typename: "NavigationConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["NavigationConnectionEdges"] | undefined>
};
	["PageSeo"]: {
	__typename: "PageSeo",
	title?: string,
	image?: string,
	description: string
};
	["PageBlocksNewsNewsItemsArticleDocument"]:{
	__typename:"NewsDocument"
	['...on NewsDocument']: '__union' & GraphQLTypes["NewsDocument"];
};
	["PageBlocksNewsNewsItems"]: {
	__typename: "PageBlocksNewsNewsItems",
	article: GraphQLTypes["PageBlocksNewsNewsItemsArticleDocument"]
};
	["PageBlocksNews"]: {
	__typename: "PageBlocksNews",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	newsItems: Array<GraphQLTypes["PageBlocksNewsNewsItems"]>
};
	["PageBlocksStatsWithImageStats"]: {
	__typename: "PageBlocksStatsWithImageStats",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"]
};
	["PageBlocksStatsWithImage"]: {
	__typename: "PageBlocksStatsWithImage",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	image?: string,
	stats?: Array<GraphQLTypes["PageBlocksStatsWithImageStats"] | undefined>
};
	["PageBlocksHeroAction"]: {
	__typename: "PageBlocksHeroAction",
	callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksHero"]: {
	__typename: "PageBlocksHero",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	image?: string,
	action?: GraphQLTypes["PageBlocksHeroAction"]
};
	["PageBlocksSlideshowItemsAction"]: {
	__typename: "PageBlocksSlideshowItemsAction",
	callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksSlideshowItemsOverlay"]: {
	__typename: "PageBlocksSlideshowItemsOverlay",
	image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksSlideshowItems"]: {
	__typename: "PageBlocksSlideshowItems",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	action?: GraphQLTypes["PageBlocksSlideshowItemsAction"],
	overlay?: GraphQLTypes["PageBlocksSlideshowItemsOverlay"]
};
	["PageBlocksSlideshow"]: {
	__typename: "PageBlocksSlideshow",
	items?: Array<GraphQLTypes["PageBlocksSlideshowItems"] | undefined>
};
	["PageBlocksComparisonTableItemsMetaA"]: {
	__typename: "PageBlocksComparisonTableItemsMetaA",
	aOne?: string
};
	["PageBlocksComparisonTableItemsMetaB"]: {
	__typename: "PageBlocksComparisonTableItemsMetaB",
	bOne?: string
};
	["PageBlocksComparisonTableItemsMeta"]:{
	__typename:"PageBlocksComparisonTableItemsMetaA" | "PageBlocksComparisonTableItemsMetaB"
	['...on PageBlocksComparisonTableItemsMetaA']: '__union' & GraphQLTypes["PageBlocksComparisonTableItemsMetaA"];
	['...on PageBlocksComparisonTableItemsMetaB']: '__union' & GraphQLTypes["PageBlocksComparisonTableItemsMetaB"];
};
	["PageBlocksComparisonTableItems"]: {
	__typename: "PageBlocksComparisonTableItems",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	bulletPoints?: Array<string | undefined>,
	meta?: Array<GraphQLTypes["PageBlocksComparisonTableItemsMeta"] | undefined>
};
	["PageBlocksComparisonTableAction"]: {
	__typename: "PageBlocksComparisonTableAction",
	callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksComparisonTable"]: {
	__typename: "PageBlocksComparisonTable",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	items?: Array<GraphQLTypes["PageBlocksComparisonTableItems"] | undefined>,
	action?: GraphQLTypes["PageBlocksComparisonTableAction"]
};
	["PageBlocksFeatureFeatures"]: {
	__typename: "PageBlocksFeatureFeatures",
	icon: string,
	name: string,
	description: GraphQLTypes["JSON"]
};
	["PageBlocksFeatureOverlay"]: {
	__typename: "PageBlocksFeatureOverlay",
	image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksFeature"]: {
	__typename: "PageBlocksFeature",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	featureStyle?: string,
	features: Array<GraphQLTypes["PageBlocksFeatureFeatures"]>,
	overlay?: GraphQLTypes["PageBlocksFeatureOverlay"]
};
	["PageBlocksFullScreenLogoOverlay"]: {
	__typename: "PageBlocksFullScreenLogoOverlay",
	image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksFullScreenLogo"]: {
	__typename: "PageBlocksFullScreenLogo",
	slogan?: string,
	link?: string,
	overlay?: GraphQLTypes["PageBlocksFullScreenLogoOverlay"]
};
	["PageBlocksFullScreenHeaderAction"]: {
	__typename: "PageBlocksFullScreenHeaderAction",
	callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksFullScreenHeaderOverlay"]: {
	__typename: "PageBlocksFullScreenHeaderOverlay",
	image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksFullScreenHeader"]: {
	__typename: "PageBlocksFullScreenHeader",
	title: string,
	subTitle?: string,
	description: GraphQLTypes["JSON"],
	action?: GraphQLTypes["PageBlocksFullScreenHeaderAction"],
	overlay?: GraphQLTypes["PageBlocksFullScreenHeaderOverlay"]
};
	["PageBlocks"]:{
	__typename:"PageBlocksNews" | "PageBlocksStatsWithImage" | "PageBlocksHero" | "PageBlocksSlideshow" | "PageBlocksComparisonTable" | "PageBlocksFeature" | "PageBlocksFullScreenLogo" | "PageBlocksFullScreenHeader"
	['...on PageBlocksNews']: '__union' & GraphQLTypes["PageBlocksNews"];
	['...on PageBlocksStatsWithImage']: '__union' & GraphQLTypes["PageBlocksStatsWithImage"];
	['...on PageBlocksHero']: '__union' & GraphQLTypes["PageBlocksHero"];
	['...on PageBlocksSlideshow']: '__union' & GraphQLTypes["PageBlocksSlideshow"];
	['...on PageBlocksComparisonTable']: '__union' & GraphQLTypes["PageBlocksComparisonTable"];
	['...on PageBlocksFeature']: '__union' & GraphQLTypes["PageBlocksFeature"];
	['...on PageBlocksFullScreenLogo']: '__union' & GraphQLTypes["PageBlocksFullScreenLogo"];
	['...on PageBlocksFullScreenHeader']: '__union' & GraphQLTypes["PageBlocksFullScreenHeader"];
};
	["Page"]: {
	__typename: "Page",
	title: string,
	link: string,
	seo?: GraphQLTypes["PageSeo"],
	blocks?: Array<GraphQLTypes["PageBlocks"] | undefined>
};
	["PageDocument"]: {
	__typename: "PageDocument",
	id: string,
	sys: GraphQLTypes["SystemInfo"],
	data: GraphQLTypes["Page"],
	form: GraphQLTypes["JSON"],
	values: GraphQLTypes["JSON"],
	dataJSON: GraphQLTypes["JSON"]
};
	["PageConnectionEdges"]: {
	__typename: "PageConnectionEdges",
	cursor?: string,
	node?: GraphQLTypes["PageDocument"]
};
	["PageConnection"]: {
	__typename: "PageConnection",
	pageInfo?: GraphQLTypes["PageInfo"],
	totalCount: number,
	edges?: Array<GraphQLTypes["PageConnectionEdges"] | undefined>
};
	["Mutation"]: {
	__typename: "Mutation",
	addPendingDocument: GraphQLTypes["DocumentNode"],
	updateDocument: GraphQLTypes["DocumentNode"],
	createDocument: GraphQLTypes["DocumentNode"],
	updateLocaleInfoDocument: GraphQLTypes["LocaleInfoDocument"],
	createLocaleInfoDocument: GraphQLTypes["LocaleInfoDocument"],
	updateNewsDocument: GraphQLTypes["NewsDocument"],
	createNewsDocument: GraphQLTypes["NewsDocument"],
	updateFooterDocument: GraphQLTypes["FooterDocument"],
	createFooterDocument: GraphQLTypes["FooterDocument"],
	updateThemeDocument: GraphQLTypes["ThemeDocument"],
	createThemeDocument: GraphQLTypes["ThemeDocument"],
	updateNavigationDocument: GraphQLTypes["NavigationDocument"],
	createNavigationDocument: GraphQLTypes["NavigationDocument"],
	updatePageDocument: GraphQLTypes["PageDocument"],
	createPageDocument: GraphQLTypes["PageDocument"]
};
	["DocumentMutation"]: {
		localeInfo?: GraphQLTypes["LocaleInfoMutation"],
	news?: GraphQLTypes["NewsMutation"],
	footer?: GraphQLTypes["FooterMutation"],
	theme?: GraphQLTypes["ThemeMutation"],
	navigation?: GraphQLTypes["NavigationMutation"],
	page?: GraphQLTypes["PageMutation"]
};
	["LocaleInfoAuMutation"]: {
		tel?: string,
	signUpLink?: string,
	signUpLinkPersonal?: string,
	signInLink?: string
};
	["LocaleInfoUsMutation"]: {
		tel?: string,
	signUpLink?: string,
	signUpLinkPersonal?: string,
	signInLink?: string
};
	["LocaleInfoGbMutation"]: {
		tel?: string,
	signUpLink?: string,
	signUpLinkPersonal?: string,
	signInLink?: string
};
	["LocaleInfoMutation"]: {
		au?: GraphQLTypes["LocaleInfoAuMutation"],
	us?: GraphQLTypes["LocaleInfoUsMutation"],
	gb?: GraphQLTypes["LocaleInfoGbMutation"]
};
	["NewsMutation"]: {
		title?: string,
	subTitle?: string,
	image?: string,
	body?: GraphQLTypes["JSON"]
};
	["FooterOfficesMutation"]: {
		location?: string,
	address?: string,
	phone?: string
};
	["FooterDisclaimersMutation"]: {
		body?: GraphQLTypes["JSON"]
};
	["FooterMutation"]: {
		offices?: Array<GraphQLTypes["FooterOfficesMutation"] | undefined>,
	disclaimers?: Array<GraphQLTypes["FooterDisclaimersMutation"] | undefined>
};
	["ThemeMutation"]: {
		displayFont?: string,
	colorMode?: string
};
	["NavigationItemsMutation"]: {
		page?: string
};
	["NavigationMutation"]: {
		items?: Array<GraphQLTypes["NavigationItemsMutation"] | undefined>
};
	["PageSeoMutation"]: {
		title?: string,
	image?: string,
	description?: string
};
	["PageBlocksNewsNewsItemsMutation"]: {
		article?: string
};
	["PageBlocksNewsMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	newsItems?: Array<GraphQLTypes["PageBlocksNewsNewsItemsMutation"] | undefined>
};
	["PageBlocksStatsWithImageStatsMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"]
};
	["PageBlocksStatsWithImageMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	image?: string,
	stats?: Array<GraphQLTypes["PageBlocksStatsWithImageStatsMutation"] | undefined>
};
	["PageBlocksHeroActionMutation"]: {
		callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksHeroMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	image?: string,
	action?: GraphQLTypes["PageBlocksHeroActionMutation"]
};
	["PageBlocksSlideshowItemsActionMutation"]: {
		callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksSlideshowItemsOverlayMutation"]: {
		image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksSlideshowItemsMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	action?: GraphQLTypes["PageBlocksSlideshowItemsActionMutation"],
	overlay?: GraphQLTypes["PageBlocksSlideshowItemsOverlayMutation"]
};
	["PageBlocksSlideshowMutation"]: {
		items?: Array<GraphQLTypes["PageBlocksSlideshowItemsMutation"] | undefined>
};
	["PageBlocksComparisonTableItemsMetaAMutation"]: {
		aOne?: string
};
	["PageBlocksComparisonTableItemsMetaBMutation"]: {
		bOne?: string
};
	["PageBlocksComparisonTableItemsMetaMutation"]: {
		a?: GraphQLTypes["PageBlocksComparisonTableItemsMetaAMutation"],
	b?: GraphQLTypes["PageBlocksComparisonTableItemsMetaBMutation"]
};
	["PageBlocksComparisonTableItemsMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	bulletPoints?: Array<string | undefined>,
	meta?: Array<GraphQLTypes["PageBlocksComparisonTableItemsMetaMutation"] | undefined>
};
	["PageBlocksComparisonTableActionMutation"]: {
		callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksComparisonTableMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	items?: Array<GraphQLTypes["PageBlocksComparisonTableItemsMutation"] | undefined>,
	action?: GraphQLTypes["PageBlocksComparisonTableActionMutation"]
};
	["PageBlocksFeatureFeaturesMutation"]: {
		icon?: string,
	name?: string,
	description?: GraphQLTypes["JSON"]
};
	["PageBlocksFeatureOverlayMutation"]: {
		image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksFeatureMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	featureStyle?: string,
	features?: Array<GraphQLTypes["PageBlocksFeatureFeaturesMutation"] | undefined>,
	overlay?: GraphQLTypes["PageBlocksFeatureOverlayMutation"]
};
	["PageBlocksFullScreenLogoOverlayMutation"]: {
		image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksFullScreenLogoMutation"]: {
		slogan?: string,
	link?: string,
	overlay?: GraphQLTypes["PageBlocksFullScreenLogoOverlayMutation"]
};
	["PageBlocksFullScreenHeaderActionMutation"]: {
		callToAction?: string,
	linkText?: string,
	link?: string,
	linkOverride?: string,
	secondaryText?: string,
	secondaryLink?: string,
	secondaryLinkOverride?: string
};
	["PageBlocksFullScreenHeaderOverlayMutation"]: {
		image?: string,
	overlayColor?: string,
	overlayOpacity?: string
};
	["PageBlocksFullScreenHeaderMutation"]: {
		title?: string,
	subTitle?: string,
	description?: GraphQLTypes["JSON"],
	action?: GraphQLTypes["PageBlocksFullScreenHeaderActionMutation"],
	overlay?: GraphQLTypes["PageBlocksFullScreenHeaderOverlayMutation"]
};
	["PageBlocksMutation"]: {
		news?: GraphQLTypes["PageBlocksNewsMutation"],
	statsWithImage?: GraphQLTypes["PageBlocksStatsWithImageMutation"],
	hero?: GraphQLTypes["PageBlocksHeroMutation"],
	slideshow?: GraphQLTypes["PageBlocksSlideshowMutation"],
	comparisonTable?: GraphQLTypes["PageBlocksComparisonTableMutation"],
	feature?: GraphQLTypes["PageBlocksFeatureMutation"],
	fullScreenLogo?: GraphQLTypes["PageBlocksFullScreenLogoMutation"],
	fullScreenHeader?: GraphQLTypes["PageBlocksFullScreenHeaderMutation"]
};
	["PageMutation"]: {
		title?: string,
	link?: string,
	seo?: GraphQLTypes["PageSeoMutation"],
	blocks?: Array<GraphQLTypes["PageBlocksMutation"] | undefined>
}
    }

export class GraphQLError extends Error {
    constructor(public response: GraphQLResponse) {
      super("");
      console.error(response);
    }
    toString() {
      return "GraphQL Response Error";
    }
  }


export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>
> = ZeusState<ReturnType<T>[N]>;

type WithTypeNameValue<T> = T & {
  __typename?: boolean;
};
type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
type IsArray<T, U> = T extends Array<infer R> ? InputType<R, U>[] : InputType<T, U>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;

type IsInterfaced<SRC extends DeepAnify<DST>, DST> = FlattenArray<SRC> extends ZEUS_INTERFACES | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P]>
          : {}
        : never;
    }[keyof DST] &
      {
        [P in keyof Omit<
          Pick<
            SRC,
            {
              [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
            }[keyof DST]
          >,
          '__typename'
        >]: IsPayLoad<DST[P]> extends boolean ? SRC[P] : IsArray<SRC[P], DST[P]>;
      }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends boolean ? SRC[P] : IsArray<SRC[P], DST[P]>;
    };

export type MapType<SRC, DST> = SRC extends DeepAnify<DST> ? IsInterfaced<SRC, DST> : never;
export type InputType<SRC, DST> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P]>;
    } &
      MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>>
  : MapType<SRC, IsPayLoad<DST>>;
type Func<P extends any[], R> = (...args: P) => R;
type AnyFunc = Func<any, any>;
export type ArgsType<F extends AnyFunc> = F extends Func<infer P, any> ? P : never;
export type OperationOptions = {
  variables?: Record<string, any>;
  operationName?: string;
};
export type SubscriptionToGraphQL<Z, T> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z>; errors?: string[] }) => void) => void;
  open: () => void;
};
export type SelectionFunction<V> = <T>(t: T | V) => T;
export type fetchOptions = ArgsType<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never;
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & {websocket?: websocketOptions}]
  | [fetchOptions[0]];
export type FetchFunction = (
  query: string,
  variables?: Record<string, any>,
) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;



export const ZeusSelect = <T>() => ((t: any) => t) as SelectionFunction<T>;

export const ScalarResolver = (scalar: string, value: any) => {
  switch (scalar) {
    case 'String':
      return  `${JSON.stringify(value)}`;
    case 'Int':
      return `${value}`;
    case 'Float':
      return `${value}`;
    case 'Boolean':
      return `${value}`;
    case 'ID':
      return `"${value}"`;
    case 'enum':
      return `${value}`;
    case 'scalar':
      return `${value}`;
    default:
      return false;
  }
};


export const TypesPropsResolver = ({
    value,
    type,
    name,
    key,
    blockArrays
}: {
    value: any;
    type: string;
    name: string;
    key?: string;
    blockArrays?: boolean;
}): string => {
    if (value === null) {
        return `null`;
    }
    let resolvedValue = AllTypesProps[type][name];
    if (key) {
        resolvedValue = resolvedValue[key];
    }
    if (!resolvedValue) {
        throw new Error(`Cannot resolve ${type} ${name}${key ? ` ${key}` : ''}`)
    }
    const typeResolved = resolvedValue.type;
    const isArray = resolvedValue.array;
    const isArrayRequired = resolvedValue.arrayRequired;
    if (typeof value === 'string' && value.startsWith(`ZEUS_VAR$`)) {
        const isRequired = resolvedValue.required ? '!' : '';
        let t = `${typeResolved}`;
        if (isArray) {
          if (isRequired) {
              t = `${t}!`;
          }
          t = `[${t}]`;
          if(isArrayRequired){
            t = `${t}!`;
          }
        }else{
          if (isRequired) {
                t = `${t}!`;
          }
        }
        return `\$${value.split(`ZEUS_VAR$`)[1]}__ZEUS_VAR__${t}`;
    }
    if (isArray && !blockArrays) {
        return `[${value
        .map((v: any) => TypesPropsResolver({ value: v, type, name, key, blockArrays: true }))
        .join(',')}]`;
    }
    const reslovedScalar = ScalarResolver(typeResolved, value);
    if (!reslovedScalar) {
        const resolvedType = AllTypesProps[typeResolved];
        if (typeof resolvedType === 'object') {
        const argsKeys = Object.keys(resolvedType);
        return `{${argsKeys
            .filter((ak) => value[ak] !== undefined)
            .map(
            (ak) => `${ak}:${TypesPropsResolver({ value: value[ak], type: typeResolved, name: ak })}`
            )}}`;
        }
        return ScalarResolver(AllTypesProps[typeResolved], value) as string;
    }
    return reslovedScalar;
};


const isArrayFunction = (
  parent: string[],
  a: any[]
) => {
  const [values, r] = a;
  const [mainKey, key, ...keys] = parent;
  const keyValues = Object.keys(values).filter((k) => typeof values[k] !== 'undefined');

  if (!keys.length) {
      return keyValues.length > 0
        ? `(${keyValues
            .map(
              (v) =>
                `${v}:${TypesPropsResolver({
                  value: values[v],
                  type: mainKey,
                  name: key,
                  key: v
                })}`
            )
            .join(',')})${r ? traverseToSeekArrays(parent, r) : ''}`
        : traverseToSeekArrays(parent, r);
    }

  const [typeResolverKey] = keys.splice(keys.length - 1, 1);
  let valueToResolve = ReturnTypes[mainKey][key];
  for (const k of keys) {
    valueToResolve = ReturnTypes[valueToResolve][k];
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
                key: v
              })}`
          )
          .join(',')})${r ? traverseToSeekArrays(parent, r) : ''}`
      : traverseToSeekArrays(parent, r);
  return argumentString;
};


const resolveKV = (k: string, v: boolean | string | { [x: string]: boolean | string }) =>
  typeof v === 'boolean' ? k : typeof v === 'object' ? `${k}{${objectToTree(v)}}` : `${k}${v}`;


const objectToTree = (o: { [x: string]: boolean | string }): string =>
  `{${Object.keys(o).map((k) => `${resolveKV(k, o[k])}`).join(' ')}}`;


const traverseToSeekArrays = (parent: string[], a?: any): string => {
  if (!a) return '';
  if (Object.keys(a).length === 0) {
    return '';
  }
  let b: Record<string, any> = {};
  if (Array.isArray(a)) {
    return isArrayFunction([...parent], a);
  } else {
    if (typeof a === 'object') {
      Object.keys(a)
        .filter((k) => typeof a[k] !== 'undefined')
        .forEach((k) => {
        if (k === '__alias') {
          Object.keys(a[k]).forEach((aliasKey) => {
            const aliasOperations = a[k][aliasKey];
            const aliasOperationName = Object.keys(aliasOperations)[0];
            const aliasOperation = aliasOperations[aliasOperationName];
            b[
              `${aliasOperationName}__alias__${aliasKey}: ${aliasOperationName}`
            ] = traverseToSeekArrays([...parent, aliasOperationName], aliasOperation);
          });
        } else {
          b[k] = traverseToSeekArrays([...parent, k], a[k]);
        }
      });
    } else {
      return '';
    }
  }
  return objectToTree(b);
};  


const buildQuery = (type: string, a?: Record<any, any>) => 
  traverseToSeekArrays([type], a);


const inspectVariables = (query: string) => {
  const regex = /\$\b\w*__ZEUS_VAR__\[?[^!^\]^\s^,^\)^\}]*[!]?[\]]?[!]?/g;
  let result;
  const AllVariables: string[] = [];
  while ((result = regex.exec(query))) {
    if (AllVariables.includes(result[0])) {
      continue;
    }
    AllVariables.push(result[0]);
  }
  if (!AllVariables.length) {
    return query;
  }
  let filteredQuery = query;
  AllVariables.forEach((variable) => {
    while (filteredQuery.includes(variable)) {
      filteredQuery = filteredQuery.replace(variable, variable.split('__ZEUS_VAR__')[0]);
    }
  });
  return `(${AllVariables.map((a) => a.split('__ZEUS_VAR__'))
    .map(([variableName, variableType]) => `${variableName}:${variableType}`)
    .join(', ')})${filteredQuery}`;
};


export const queryConstruct = (t: 'query' | 'mutation' | 'subscription', tName: string, operationName?: string) => (o: Record<any, any>) =>
  `${t.toLowerCase()}${operationName ? ' ' + operationName : ''}${inspectVariables(buildQuery(tName, o))}`;
  

export const fullChainConstruct = (fn: FetchFunction) => (t: 'query' | 'mutation' | 'subscription', tName: string) => (
  o: Record<any, any>,
  options?: OperationOptions,
) => fn(queryConstruct(t, tName, options?.operationName)(o), options?.variables).then((r:any) => { 
  seekForAliases(r)
  return r
});


export const fullSubscriptionConstruct = (fn: SubscriptionFunction) => (
  t: 'query' | 'mutation' | 'subscription',
  tName: string,
) => (o: Record<any, any>, options?: OperationOptions) =>
  fn(queryConstruct(t, tName, options?.operationName)(o));


const seekForAliases = (response: any) => {
  const traverseAlias = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach(seekForAliases);
    } else {
      if (typeof value === 'object') {
        seekForAliases(value);
      }
    }
  };
  if (typeof response === 'object' && response) {
    const keys = Object.keys(response);
    if (keys.length < 1) {
      return;
    }
    keys.forEach((k) => {
      const value = response[k];
      if (k.indexOf('__alias__') !== -1) {
        const [operation, alias] = k.split('__alias__');
        response[alias] = {
          [operation]: value,
        };
        delete response[k];
      }
      traverseAlias(value);
    });
  }
};


export const $ = (t: TemplateStringsArray): any => `ZEUS_VAR$${t.join('')}`;


export const resolverFor = <
  X,
  T extends keyof ValueTypes,
  Z extends keyof ValueTypes[T],
>(
  type: T,
  field: Z,
  fn: (
    args: Required<ValueTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : any,
) => fn as (args?: any,source?: any) => any;


const handleFetchResponse = (
  response: Parameters<Extract<Parameters<ReturnType<typeof fetch>['then']>[0], Function>>[0]
): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response.text().then(text => {
        try { reject(JSON.parse(text)); }
        catch (err) { reject(text); }
      }).catch(reject);
    });
  }
  return response.json();
};

export const apiFetch = (options: fetchOptions) => (query: string, variables: Record<string, any> = {}) => {
    let fetchFunction = fetch;
    let queryString = query;
    let fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      queryString = encodeURIComponent(query);
      return fetchFunction(`${options[0]}?query=${queryString}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetchFunction(`${options[0]}`, {
      body: JSON.stringify({ query: queryString, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      ...fetchOptions
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };
  

export const apiSubscription = (options: chainOptions) => (
    query: string,
  ) => {
    try {
      const queryString = options[0] + '?query=' + encodeURIComponent(query);
      const wsString = queryString.replace('http', 'ws');
      const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
      const webSocketOptions = options[1]?.websocket || [host];
      const ws = new WebSocket(...webSocketOptions);
      return {
        ws,
        on: (e: (args: any) => void) => {
          ws.onmessage = (event:any) => {
            if(event.data){
              const parsed = JSON.parse(event.data)
              const data = parsed.data
              if (data) {
                seekForAliases(data);
              }
              return e(data);
            }
          };
        },
        off: (e: (args: any) => void) => {
          ws.onclose = e;
        },
        error: (e: (args: any) => void) => {
          ws.onerror = e;
        },
        open: (e: () => void) => {
          ws.onopen = e;
        },
      };
    } catch {
      throw new Error('No websockets implemented');
    }
  };



const allOperations = {
    "query": "Query",
    "mutation": "Mutation"
}

export type GenericOperation<O> = O extends 'query'
  ? "Query"
  : O extends 'mutation'
  ? "Mutation"
  : never

export const Thunder = (fn: FetchFunction) => <
  O extends 'query' | 'mutation',
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
) => <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions) =>
  fullChainConstruct(fn)(operation, allOperations[operation])(o as any, ops) as Promise<InputType<GraphQLTypes[R], Z>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));  
  
export const SubscriptionThunder = (fn: SubscriptionFunction) => <
  O extends 'query' | 'mutation',
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
) => <Z extends ValueTypes[R]>(
  o: Z | ValueTypes[R],
  ops?: OperationOptions
)=>
  fullSubscriptionConstruct(fn)(operation, allOperations[operation])(
    o as any,
    ops,
  ) as SubscriptionToGraphQL<Z, GraphQLTypes[R]>;

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends 'query' | 'mutation',
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
  o: Z | ValueTypes[R],
  operationName?: string,
) => queryConstruct(operation, allOperations[operation], operationName)(o as any);
export const Selector = <T extends keyof ValueTypes>(key: T) => ZeusSelect<ValueTypes[T]>();
  