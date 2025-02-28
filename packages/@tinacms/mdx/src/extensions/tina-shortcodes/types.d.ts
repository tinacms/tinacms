import type {
  Root as MdastRoot,
  BlockContent,
  DefinitionContent,
  PhrasingContent,
} from 'mdast'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface DirectiveFields {
  /**
   * Directive name.
   */
  name: string

  /**
   * Directive attributes.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  attributes?: Record<string, string | null | undefined> | null | undefined
}

/**
 * Directive in flow content (such as in the root document, or block
 * quotes), which contains further flow content.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ContainerDirective extends Parent, DirectiveFields {
  /**
   * Node type.
   */
  type: 'containerDirective'

  /**
   * Content.
   */
  children: Array<BlockContent | DefinitionContent>
}

/**
 * Directive in flow content (such as in the root document, or block
 * quotes), which contains nothing.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface LeafDirective extends Parent, DirectiveFields {
  /**
   * Node type.
   */
  type: 'leafDirective'

  /**
   * Content.
   */
  children: PhrasingContent[]
}

/**
 * Directive in phrasing content (such as in paragraphs, headings).
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface TextDirective extends Parent, DirectiveFields {
  /**
   * Node type.
   */
  type: 'textDirective'

  /**
   * Content.
   */
  children: PhrasingContent[]
}

/**
 * The different directive nodes.
 */
export type Directive = ContainerDirective | LeafDirective | TextDirective

// Add custom data tracked to turn markdown into a tree.
declare module 'mdast-util-from-markdown' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CompileData {
    /**
     * Attributes for current directive.
     */
    directiveAttributes?: Array<[string, string]> | undefined
  }
}

// Add custom data tracked to turn a syntax tree into markdown.
declare module 'mdast-util-to-markdown' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ConstructNameMap {
    /**
     * Whole container directive.
     *
     * ```markdown
     * > | :::a
     *     ^^^^
     * > | :::
     *     ^^^
     * ```
     */
    containerDirective: 'containerDirective'

    /**
     * Label of a container directive.
     *
     * ```markdown
     * > | :::a[b]
     *         ^^^
     *   | :::
     * ```
     */
    containerDirectiveLabel: 'containerDirectiveLabel'

    /**
     * Whole leaf directive.
     *
     * ```markdown
     * > | ::a
     *     ^^^
     * ```
     */
    leafDirective: 'leafDirective'

    /**
     * Label of a leaf directive.
     *
     * ```markdown
     * > | ::a[b]
     *        ^^^
     * ```
     */
    leafDirectiveLabel: 'leafDirectiveLabel'

    /**
     * Whole text directive.
     *
     * ```markdown
     * > | :a
     *     ^^
     * ```
     */
    textDirective: 'textDirective'

    /**
     * Label of a text directive.
     *
     * ```markdown
     * > | :a[b]
     *       ^^^
     * ```
     */
    textDirectiveLabel: 'textDirectiveLabel'
  }
}

// Add nodes to content.
declare module 'mdast' {
  // We populate the `_tinaEmbeds` field with the _tinaEmbeds found in any rich-text nodes.
  // More info here: https://github.com/tinacms/tinacms/pull/4700
  interface Root extends MdastRoot {
    embedCode?: string
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StaticPhrasingContentMap {
    /**
     * Directive in phrasing content (such as in paragraphs, headings).
     */
    textDirective: TextDirective
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BlockContentMap {
    /**
     * Directive in flow content (such as in the root document, or block
     * quotes), which contains further flow content.
     */
    containerDirective: ContainerDirective

    /**
     * Directive in flow content (such as in the root document, or block
     * quotes), which contains nothing.
     */
    leafDirective: LeafDirective
  }
}
