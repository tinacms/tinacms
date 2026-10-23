<script lang="ts">
import { sanitizeHref, sanitizeImageSrc } from './sanitize';
import type {
  CodeBlockElement,
  CustomComponentsMap,
  MdxElement,
  TableAlign,
  TableElement,
  TableRowElement,
  TextElement,
  TinaComponent,
  TinaMarkdownProps,
  TinaRichTextNode,
} from './types';

let { content, components = {} }: TinaMarkdownProps = $props();

const nodes = $derived.by(() => {
  if (!content) return [];
  if (Array.isArray(content)) return content as TinaRichTextNode[];
  return (content.children ?? []) as TinaRichTextNode[];
});

// The editor sends newly typed leaves as `{ text }` without `type: 'text'`.
function isLeaf(node: TinaRichTextNode): boolean {
  return typeof (node as { text?: unknown }).text === 'string';
}

// Overrides have different prop shapes; looked up by a runtime key they are untyped.
function override(key: string): TinaComponent | undefined {
  return (components as Record<string, TinaComponent | undefined>)[key];
}

function tableRows(node: TableElement): TableRowElement[] {
  return node.children ?? [];
}

function codeValue(node: CodeBlockElement): string {
  return (
    node.value ??
    node.children
      ?.map((line) => line.children?.map((text) => text.text).join('') ?? '')
      .join('\n') ??
    ''
  );
}

function cellInline(value: unknown): TinaRichTextNode[] {
  const nodes = Array.isArray(value)
    ? (value as TinaRichTextNode[])
    : ((value as { children?: TinaRichTextNode[] } | null)?.children ?? []);
  return nodes.flatMap((node) =>
    node.type === 'p' ? (node.children as TinaRichTextNode[]) : []
  );
}
</script>

{#snippet renderNodes(items: TinaRichTextNode[])}
  {#each items as node, index (`${node.type ?? 'text'}-${index}`)}
    {@render renderNode(node)}
  {/each}
{/snippet}

{#snippet renderLeaf(node: TextElement)}
  {#if node.bold}
    <strong>{@render renderLeaf({ ...node, bold: false })}</strong>
  {:else if node.italic}
    <em>{@render renderLeaf({ ...node, italic: false })}</em>
  {:else if node.underline}
    <u>{@render renderLeaf({ ...node, underline: false })}</u>
  {:else if node.strikethrough}
    <s>{@render renderLeaf({ ...node, strikethrough: false })}</s>
  {:else if node.code}
    <code class="tina-markdown-inline-code">{@render renderLeaf({ ...node, code: false })}</code>
  {:else if node.highlight}
    <mark style={node.highlightColor ? `background-color:${node.highlightColor}` : undefined}>
      {@render renderLeaf({ ...node, highlight: false, highlightColor: undefined })}
    </mark>
  {:else}
    {node.text}
  {/if}
{/snippet}

{#snippet renderContainer(node: TinaRichTextNode & { children?: TinaRichTextNode[] }, components: CustomComponentsMap)}
  {@const Override = override(node.type)}
  {@const tag = node.type === 'lic' ? 'div' : node.type}
  {#if Override}
    <Override>{@render renderNodes(node.children ?? [])}</Override>
  {:else}
    <svelte:element this={tag} class={`tina-markdown-${node.type}`}>
      {@render renderNodes(node.children ?? [])}
    </svelte:element>
  {/if}
{/snippet}

{#snippet renderNode(node: TinaRichTextNode)}
  {@const Override = override(node.type)}
  {#if node.type === 'text' || isLeaf(node)}
    {@render renderLeaf(node as TextElement)}
  {:else if ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'lic', 'blockquote'].includes(node.type)}
    {@render renderContainer(node as TinaRichTextNode & { children?: TinaRichTextNode[] }, components)}
  {:else if node.type === 'a'}
    {#if Override}
      <Override url={node.url}>{@render renderNodes(node.children)}</Override>
    {:else}
      <a class="tina-markdown-link" href={sanitizeHref(node.url)}>{@render renderNodes(node.children)}</a>
    {/if}
  {:else if node.type === 'img'}
    {#if Override}
      <Override url={node.url} alt={node.alt} caption={node.caption} />
    {:else}
      <img class="tina-markdown-image" src={sanitizeImageSrc(node.url)} alt={node.alt ?? ''} />
    {/if}
  {:else if node.type === 'code_block'}
    {@const value = codeValue(node)}
    {#if Override}
      <Override value={value} lang={node.lang} />
    {:else}
      <pre class="tina-markdown-code-block">
        <code class={node.lang ? `language-${node.lang}` : undefined}>{value}</code>
      </pre>
    {/if}
  {:else if node.type === 'table'}
    {@render renderTable(node)}
  {:else if node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'}
    {@render renderMdx(node)}
  {:else if node.type === 'hr'}
    {#if Override}<Override />{:else}<hr />{/if}
  {:else if node.type === 'break'}
    {#if Override}<Override />{:else}<br />{/if}
  {:else if node.type === 'html' || node.type === 'html_inline'}
    {#if Override}<Override value={node.value} />{:else}{node.value}{/if}
  {:else if node.type === 'invalid_markdown'}
    <pre>{node.value}</pre>
  {/if}
{/snippet}

{#snippet renderMdx(node: MdxElement)}
  {@const Override = override(node.name)}
  {#if Override}
    <Override {...(node.props ?? {})} />
  {:else if node.name === 'table'}
    {@render renderLegacyTable(node)}
  {:else}
    <span class="tina-missing-component">No component provided for {node.name}</span>
  {/if}
{/snippet}

{#snippet renderTable(node: TableElement)}
  {@const TableOverride = components.table}
  {@const TrOverride = components.tr}
  {@const ThOverride = components.th}
  {@const TdOverride = components.td}
  {@const align = node.props?.align ?? []}
  {@const rows = tableRows(node)}
  {@const header = rows[0]}
  {@const body = rows.slice(1)}
  {#if TableOverride}
    <TableOverride node={node}>
      {@render nativeTableBody(header, body, align, TrOverride, ThOverride, TdOverride)}
    </TableOverride>
  {:else}
    <table class="tina-markdown-table">
      {@render nativeTableBody(header, body, align, TrOverride, ThOverride, TdOverride)}
    </table>
  {/if}
{/snippet}

{#snippet nativeTableBody(header: TableRowElement | undefined, body: TableRowElement[], align: string[], TrOverride: CustomComponentsMap[string], ThOverride: CustomComponentsMap[string], TdOverride: CustomComponentsMap[string])}
  {#if header}
    <thead>
      {#if TrOverride}<TrOverride>{@render tableCells(header, true, align, ThOverride, TdOverride)}</TrOverride>
      {:else}<tr>{@render tableCells(header, true, align, ThOverride, TdOverride)}</tr>{/if}
    </thead>
  {/if}
  <tbody>
    {#each body as row, rowIndex (`row-${rowIndex}`)}
      {#if TrOverride}<TrOverride>{@render tableCells(row, false, align, ThOverride, TdOverride)}</TrOverride>
      {:else}<tr>{@render tableCells(row, false, align, ThOverride, TdOverride)}</tr>{/if}
    {/each}
  </tbody>
{/snippet}

{#snippet tableCells(row: TableRowElement, header: boolean, align: string[], ThOverride: CustomComponentsMap[string], TdOverride: CustomComponentsMap[string])}
  {#each row.children ?? [] as cell, index (`cell-${index}`)}
    {@const Cell = header ? ThOverride : TdOverride}
    {@const cellNodes = (cell.children ?? []).flatMap((paragraph) => paragraph.children ?? [])}
    {#if Cell}
      <Cell align={align[index]}>{@render renderNodes(cellNodes)}</Cell>
    {:else if header}
      <th style={`text-align:${align[index] ?? 'auto'}`}>{@render renderNodes(cellNodes)}</th>
    {:else}
      <td style={`text-align:${align[index] ?? 'auto'}`}>{@render renderNodes(cellNodes)}</td>
    {/if}
  {/each}
{/snippet}

{#snippet renderLegacyTable(node: MdxElement)}
  {@const props = node.props ?? {}}
  {@const table = props as typeof props & { firstRowHeader?: boolean; align?: TableAlign[]; tableRows?: { tableCells?: { value: unknown }[] }[] }}
  {@const rows = table.tableRows ?? []}
  {@const header = table.firstRowHeader ? rows[0] : undefined}
  {@const body = table.firstRowHeader ? rows.slice(1) : rows}
  {@const ThOverride = components.th}
  {@const TdOverride = components.td}
  <table class="tina-markdown-table">
    {#if header}
      <thead><tr>
        {#each header.tableCells ?? [] as cell, index (`head-${index}`)}
          {@const cellNodes = cellInline(cell.value)}
          {#if ThOverride}<ThOverride align={table.align?.[index]}>{@render renderNodes(cellNodes)}</ThOverride>
          {:else}<th style={`text-align:${table.align?.[index] ?? 'auto'}`}>{@render renderNodes(cellNodes)}</th>{/if}
        {/each}
      </tr></thead>
    {/if}
    <tbody>
      {#each body as row, rowIndex (`body-${rowIndex}`)}
        <tr>
          {#each row.tableCells ?? [] as cell, index (`cell-${index}`)}
            {@const cellNodes = cellInline(cell.value)}
            {#if TdOverride}<TdOverride align={table.align?.[index]}>{@render renderNodes(cellNodes)}</TdOverride>
            {:else}<td style={`text-align:${table.align?.[index] ?? 'auto'}`}>{@render renderNodes(cellNodes)}</td>{/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

{@render renderNodes(nodes)}

<style>
  .tina-markdown-h1,
  .tina-markdown-h2,
  .tina-markdown-h3,
  .tina-markdown-h4,
  .tina-markdown-h5,
  .tina-markdown-h6 {
    margin-block: 1.5em 0.65em;
    font-weight: 650;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  .tina-markdown-h1 { font-size: 2.25rem; }
  .tina-markdown-h2 { font-size: 1.875rem; }
  .tina-markdown-h3 { font-size: 1.5rem; }
  .tina-markdown-h4 { font-size: 1.25rem; }
  .tina-markdown-h5 { font-size: 1.125rem; }
  .tina-markdown-h6 { font-size: 1rem; }

  .tina-markdown-p,
  .tina-markdown-ul,
  .tina-markdown-ol,
  .tina-markdown-blockquote {
    margin-block: 1em;
    line-height: 1.7;
  }

  .tina-markdown-ul,
  .tina-markdown-ol { padding-inline-start: 1.5em; }
  .tina-markdown-lic { margin-block: 0.35em; }

  .tina-markdown-blockquote {
    margin-inline: 0;
    padding-inline-start: 1rem;
    border-inline-start: 3px solid currentColor;
    opacity: 0.8;
  }

  .tina-markdown-link { text-decoration: underline; text-underline-offset: 0.18em; }
  .tina-markdown-image { display: block; max-width: 100%; height: auto; border-radius: 0.75rem; }

  .tina-markdown-inline-code {
    padding: 0.12em 0.35em;
    border-radius: 0.3em;
    background: color-mix(in srgb, currentColor 10%, transparent);
    font-size: 0.9em;
  }

  .tina-markdown-code-block {
    margin-block: 1.5rem;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 0.75rem;
    background: #111827;
    color: #e5e7eb;
    font-size: 0.9rem;
    line-height: 1.65;
  }

  .tina-markdown-table { width: 100%; border-collapse: collapse; text-align: start; }
  .tina-markdown-table th,
  .tina-markdown-table td {
    padding: 0.65rem 0.85rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  }

  .tina-markdown-table th { font-weight: 650; text-align: start; }
</style>
