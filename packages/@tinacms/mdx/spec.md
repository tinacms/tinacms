
<a name="readmemd"></a>

@tinacms/mdx / [Exports](#modulesmd)


<a name="modulesmd"></a>

[@tinacms/mdx](#readmemd) / Exports

# @tinacms/mdx

## Table of contents

### BlockElement

- [BlockElement](#blockelement)
- [BlockquoteElement](#blockquoteelement)
- [CodeBlockElement](#codeblockelement)
- [HTMLElement](#htmlelement)
- [HeadingElement](#headingelement)
- [HrElement](#hrelement)
- [InvalidMarkdownElement](#invalidmarkdownelement)
- [ListItemElement](#listitemelement)
- [MdxBlockElement](#mdxblockelement)
- [OrderedListElement](#orderedlistelement)
- [ParagraphElement](#paragraphelement)
- [UnorderedListElement](#unorderedlistelement)

### InlineElement

- [BreakElement](#breakelement)
- [HTMLInlineElement](#htmlinlineelement)
- [ImageElement](#imageelement)
- [InlineElement](#inlineelement)
- [LinkElement](#linkelement)
- [MdxInlineElement](#mdxinlineelement)
- [TextElement](#textelement)

### MiscellaneousElement

- [EmptyTextElement](#emptytextelement)

### ListElements

- [LicElement](#licelement)
- [List](#list)
- [ListItemChildrenElement](#listitemchildrenelement)
- [ListItemContentElement](#listitemcontentelement)

### _MiscellaneousElement

- [Position](#position)
- [PositionItem](#positionitem)
- [RootElement](#rootelement)

## BlockElement

### BlockElement

Ƭ **BlockElement**: [`BlockquoteElement`](#blockquoteelement) \| [`CodeBlockElement`](#codeblockelement) \| [`HeadingElement`](#headingelement) \| [`HrElement`](#hrelement) \| [`HTMLElement`](#htmlelement) \| [`ImageElement`](#imageelement) \| [`InvalidMarkdownElement`](#invalidmarkdownelement) \| [`ListItemElement`](#listitemelement) \| [`MdxBlockElement`](#mdxblockelement) \| [`ParagraphElement`](#paragraphelement) \| [`OrderedListElement`](#orderedlistelement) \| [`UnorderedListElement`](#unorderedlistelement)

#### Defined in

[plate.ts:144](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L144)

___

### BlockquoteElement

Ƭ **BlockquoteElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`InlineElement`](#inlineelement)[] |
| `type` | ``"blockquote"`` |

#### Defined in

[plate.ts:30](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L30)

___

### CodeBlockElement

Ƭ **CodeBlockElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `lang?` | `string` |
| `type` | ``"code_block"`` |
| `value` | `string` |

#### Defined in

[plate.ts:37](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L37)

___

### HTMLElement

Ƭ **HTMLElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `type` | ``"html"`` |
| `value` | `string` |

#### Defined in

[plate.ts:61](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L61)

___

### HeadingElement

Ƭ **HeadingElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`InlineElement`](#inlineelement)[] |
| `type` | ``"h1"`` \| ``"h2"`` \| ``"h3"`` \| ``"h4"`` \| ``"h5"`` \| ``"h6"`` |

#### Defined in

[plate.ts:46](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L46)

___

### HrElement

Ƭ **HrElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `type` | ``"hr"`` |

#### Defined in

[plate.ts:54](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L54)

___

### InvalidMarkdownElement

Ƭ **InvalidMarkdownElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `message` | `string` |
| `position?` | [`Position`](#position) |
| `type` | ``"invalid_markdown"`` |
| `value` | `string` |

#### Defined in

[plate.ts:77](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L77)

___

### ListItemElement

Ƭ **ListItemElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`ListItemChildrenElement`](#listitemchildrenelement)[] |
| `type` | ``"li"`` |

#### Defined in

[plate.ts:106](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L106)

___

### MdxBlockElement

Ƭ **MdxBlockElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `name` | `string` \| ``null`` |
| `props` | `Record`<`string`, `unknown`\> |
| `type` | ``"mdxJsxFlowElement"`` |

#### Defined in

[plate.ts:120](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L120)

___

### OrderedListElement

Ƭ **OrderedListElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`ListItemElement`](#listitemelement)[] |
| `type` | ``"ol"`` |

#### Defined in

[plate.ts:129](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L129)

___

### ParagraphElement

Ƭ **ParagraphElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`InlineElement`](#inlineelement)[] |
| `type` | ``"p"`` |

#### Defined in

[plate.ts:136](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L136)

___

### UnorderedListElement

Ƭ **UnorderedListElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`ListItemElement`](#listitemelement)[] |
| `type` | ``"ul"`` |

#### Defined in

[plate.ts:113](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L113)

## InlineElement

### BreakElement

Ƭ **BreakElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `type` | ``"break"`` |

#### Defined in

[plate.ts:211](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L211)

___

### HTMLInlineElement

Ƭ **HTMLInlineElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `type` | ``"html_inline"`` |
| `value` | `string` |

#### Defined in

[plate.ts:69](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L69)

___

### ImageElement

Ƭ **ImageElement**: `Object`

**`Remarks`**

It may be beneficial to treat this as a block element

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alt?` | `string` |
| `caption?` | `string` \| ``null`` |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `type` | ``"img"`` |
| `url` | `string` |

#### Defined in

[plate.ts:192](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L192)

___

### InlineElement

Ƭ **InlineElement**: [`TextElement`](#textelement) \| [`MdxInlineElement`](#mdxinlineelement) \| [`BreakElement`](#breakelement) \| [`LinkElement`](#linkelement) \| [`ImageElement`](#imageelement) \| [`HTMLInlineElement`](#htmlinlineelement)

#### Defined in

[plate.ts:224](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L224)

___

### LinkElement

Ƭ **LinkElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`InlineElement`](#inlineelement)[] |
| `title?` | `string` \| ``null`` |
| `type` | ``"a"`` |
| `url` | `string` |

#### Defined in

[plate.ts:202](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L202)

___

### MdxInlineElement

Ƭ **MdxInlineElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [[`EmptyTextElement`](#emptytextelement)] |
| `name` | `string` \| ``null`` |
| `props` | `Record`<`string`, `unknown`\> |
| `type` | ``"mdxJsxTextElement"`` |

#### Defined in

[plate.ts:161](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L161)

___

### TextElement

Ƭ **TextElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bold?` | `boolean` |
| `code?` | `boolean` |
| `italic?` | `boolean` |
| `text` | `string` |
| `type` | ``"text"`` |

#### Defined in

[plate.ts:179](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L179)

## MiscellaneousElement

### EmptyTextElement

Ƭ **EmptyTextElement**: `Object`

**`Remarks`**

Used specifically to denote no children, used by
the frontend rich-text editor for void nodes

#### Type declaration

| Name | Type |
| :------ | :------ |
| `text` | ``""`` |
| `type` | ``"text"`` |

#### Defined in

[plate.ts:175](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L175)

## ListElements

### LicElement

Ƭ **LicElement**: [`InlineElement`](#inlineelement)

#### Defined in

[plate.ts:219](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L219)

___

### List

Ƭ **List**: [`OrderedListElement`](#orderedlistelement) \| [`UnorderedListElement`](#unorderedlistelement)

#### Defined in

[plate.ts:87](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L87)

___

### ListItemChildrenElement

Ƭ **ListItemChildrenElement**: [`ListItemContentElement`](#listitemcontentelement) \| [`UnorderedListElement`](#unorderedlistelement) \| [`OrderedListElement`](#orderedlistelement)

#### Defined in

[plate.ts:98](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L98)

___

### ListItemContentElement

Ƭ **ListItemContentElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`LicElement`](#licelement)[] |
| `type` | ``"lic"`` |

#### Defined in

[plate.ts:91](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L91)

## _MiscellaneousElement

### Position

Ƭ **Position**: `Object`

**`Remarks`**

Positional information for error reporting

#### Type declaration

| Name | Type |
| :------ | :------ |
| `end` | [`PositionItem`](#positionitem) |
| `start` | [`PositionItem`](#positionitem) |

#### Defined in

[plate.ts:238](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L238)

___

### PositionItem

Ƭ **PositionItem**: `Object`

**`Remarks`**

Positional information for error reporting

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_bufferIndex?` | `number` \| ``null`` |
| `_index?` | `number` \| ``null`` |
| `column?` | `number` \| ``null`` |
| `line?` | `number` \| ``null`` |
| `offset?` | `number` \| ``null`` |

#### Defined in

[plate.ts:249](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L249)

___

### RootElement

Ƭ **RootElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`BlockElement`](#blockelement)[] |
| `type` | ``"root"`` |

#### Defined in

[plate.ts:22](https://github.com/tinacms/tinacms/blob/17d510e7b/packages/@tinacms/mdx/src/parse/plate.ts#L22)
