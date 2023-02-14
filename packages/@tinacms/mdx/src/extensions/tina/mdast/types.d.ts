import type { Node as MdastNode } from 'unist'
import type {
  Parent as MdastParent,
  Literal as MdastLiteral,
  BlockContent,
  DefinitionContent,
  PhrasingContent,
} from 'mdast'
import type { ElementContent, Parent as HastParent } from 'hast'
import type { Program } from 'estree-jsx'

import type { Tag } from './lib/index.js'

// Expose JavaScript API.
export { mdxJsxFromMarkdown, mdxJsxToMarkdown } from './lib/index.js'

// Expose options.
export type { ToMarkdownOptions } from './lib/index.js'

// Expose node types.
/**
 * MDX JSX attribute value set to an expression.
 *
 * ```markdown
 * > | <a b={c} />
 *          ^^^
 * ```
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxAttributeValueExpression extends MdastLiteral {
  /**
   * Node type.
   */
  type: 'mdxJsxAttributeValueExpression'
  data?: {
    /**
     * Program node from estree.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    estree?: Program | null | undefined
  } & MdastLiteral['data']
}

/**
 * MDX JSX attribute as an expression.
 *
 * ```markdown
 * > | <a {...b} />
 *        ^^^^^^
 * ```
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxExpressionAttribute extends MdastLiteral {
  /**
   * Node type.
   */
  type: 'mdxJsxExpressionAttribute'
  data?: {
    /**
     * Program node from estree.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    estree?: Program | null | undefined
  } & MdastLiteral['data']
}

/**
 * MDX JSX attribute with a key.
 *
 * ```markdown
 * > | <a b="c" />
 *        ^^^^^
 * ```
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxAttribute extends MdastNode {
  /**
   * Node type.
   */
  type: 'mdxJsxAttribute'
  /**
   * Attribute name.
   */
  name: string
  /**
   * Attribute value.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  value?: MdxJsxAttributeValueExpression | string | null | undefined
}

/**
 * MDX JSX element node, occurring in flow (block).
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxFlowElement extends MdastParent {
  /**
   * Node type.
   */
  type: 'mdxJsxFlowElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: Array<BlockContent | DefinitionContent>
}

/**
 * MDX JSX element node, occurring in text (phrasing).
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxTextElement extends MdastParent {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: PhrasingContent[]
}

/**
 * MDX JSX element node, occurring in flow (block), for hast.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxFlowElementHast extends HastParent {
  /**
   * Node type.
   */
  type: 'mdxJsxFlowElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: ElementContent[]
}

/**
 * MDX JSX element node, occurring in text (phrasing), for hast.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxTextElementHast extends HastParent {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: string | null
  /**
   * MDX JSX element attributes.
   */
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  /**
   * Content.
   */
  children: ElementContent[]
}

// Add nodes to mdast content.
declare module 'mdast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StaticPhrasingContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElement
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BlockContentMap {
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElement
  }
}

// Add nodes to hast content.
declare module 'hast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RootContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElementHast
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElementHast
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ElementContentMap {
    /**
     * MDX JSX element node, occurring in text (phrasing).
     */
    mdxJsxTextElement: MdxJsxTextElementHast
    /**
     * MDX JSX element node, occurring in flow (block).
     */
    mdxJsxFlowElement: MdxJsxFlowElementHast
  }
}

// Add custom data tracked to turn markdown into a tree.
declare module 'mdast-util-from-markdown' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CompileData {
    /**
     * Current MDX JSX tag.
     */
    mdxJsxTag?: Tag | undefined

    /**
     * Current stack of open MDX JSX tags.
     */
    mdxJsxTagStack?: Tag[] | undefined
  }
}

// Add custom data tracked to turn a syntax tree into markdown.
declare module 'mdast-util-to-markdown' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ConstructNameMap {
    /**
     * Whole JSX element, in flow.
     *
     * ```markdown
     * > | <a />
     *     ^^^^^
     * ```
     */
    mdxJsxFlowElement: 'mdxJsxFlowElement'

    /**
     * Whole JSX element, in text.
     *
     * ```markdown
     * > | a <b />.
     *       ^^^^^
     * ```
     */
    mdxJsxTextElement: 'mdxJsxTextElement'
  }
}
