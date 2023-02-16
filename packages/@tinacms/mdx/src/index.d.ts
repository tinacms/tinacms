import type {
  Parent as MdastParent,
  Literal as MdastLiteral,
  BlockContent,
  DefinitionContent,
  PhrasingContent,
} from 'mdast'

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
    // estree?: Program | null | undefined
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
    // estree?: Program | null | undefined
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

// FIXME: for some reason this only works when I change the name of
// MdxJsxTextElement to MdxJsxTextElement2
/**
 * MDX JSX element node, occurring in text (phrasing).
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxJsxTextElement2 extends MdastParent {
  /**
   * Node type.
   */
  type: 'mdxJsxTextElement'
  /**
   * MDX JSX element name (`null` for fragments).
   */
  // eslint - disable - next - line @typescript-eslint / ban - types
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
