import DOMPurify from 'dompurify';

/**
 * @typedef {Object} Node
 * @property {string} type
 * @property {string} name
 * @property {Node[]} children
 */

const TAGS = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  ol: 'ol',
  ul: 'ul',
  li: 'li',
  lic: 'div',
  blockquote: 'blockquote',
  img: 'img',
  a: 'a',
  code_block: 'code',
  hr: 'hr',
  break: 'br',
  table: 'table', // TODO: does not support alignment.
  tr: 'tr',
  td: 'td',
  invalid_markdown: 'pre',
  html: 'html',
  html_inline: 'html',
  mdxJsxTextElement: 'div',
  mdxJsxFlowElement: 'div',
};
const MARKS = [
  ['bold', 'strong'],
  ['italic', 'em'],
  ['underline', 'u'],
  ['strikethrough', 's'],
  ['code', 'code'],
  ['highlight', 'mark'],
];

/**
 * @param {Node} root
 * @returns {HTMLElement}
 */
function renderRichText(root) {
  const container = document.createElement('div');

  for (const block of root.children ?? []) {
    container.appendChild(renderNode(block));
  }

  return container;
}

/**
 * @param {Node} node
 * @returns {HTMLElement}
 */
function renderNode(node) {
  if (node.type === 'text') return renderText(node);

  if (node.type === 'html' || node.type === 'html_inline') {
    return DOMPurify.sanitize(node.value, { RETURN_DOM_FRAGMENT: true });
  }

  const tag = TAGS[node.type];
  /** @type {HTMLElement} */
  const el = document.createElement(tag);

  if (node.url && node.type === 'a') el.href = node.url;
  if (node.url && node.type === 'img') el.src = node.url;

  if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
    const override = TinaMarkdown.components[node.name];
    if (override) return override(node);
    return el;
  }

  if (node.type === 'code_block') {
    const pre = document.createElement('pre');

    let codeString = '';
    if (Array.isArray(node.children)) {
      codeString = node.children
        .map((line) =>
          Array.isArray(line.children)
            ? line.children.map((t) => t.text).join('')
            : ''
        )
        .join('\n');
    } else if (typeof node.value === 'string') {
      codeString = node.value;
    }
    el.innerText = codeString;
    if (node.lang) el.setAttribute('lang', node.lang);

    pre.appendChild(el);
    return pre;
  }

  if (node.type === 'table') {
    const table_body = document.createElement('tbody');
    for (const child of node.children ?? []) {
      table_body.appendChild(renderNode(child));
    }
    el.appendChild(table_body);
    return el;
  }

  for (const child of node.children ?? []) {
    el.appendChild(renderNode(child));
  }

  return el;
}

/**
 * @param {Node} node
 * @returns {Text}
 */
function renderText(node) {
  let el = document.createTextNode(node.text);
  for (const [prop, tag] of MARKS) {
    if (node[prop]) {
      const wrapper = document.createElement(tag);
      wrapper.appendChild(el);
      el = wrapper;
    }
  }
  return el;
}

export class TinaMarkdown extends HTMLElement {
  /**
   * @type {Object.<string, function(Node): HTMLElement>}
   * Register custom components.
   *
   * @example
   * import {TinaMarkdown} from "./node_modules/@tinacms/web-components/dist/tina-markdown.js";
   *
   * TinaMarkdown.components = {
   *     "PostPreview": (node) => {
   * 		const el = document.createElement("post-preview");
   *
   * 		const title = document.createElement("span");
   * 		title.slot = "title";
   * 		title.textContent = node.props.title ?? "";
   * 		el.append(title);
   *
   * 		return el;
   *     },
   * };
   */
  static components = {};

  constructor() {
    super();

    this.attachShadow({
      mode: 'open',
    });
  }

  connectedCallback() {
    /** @type {string} */
    const content = this.getAttribute('content');
    /** @type {Node} */
    const ast = JSON.parse(content);

    this.shadowRoot.appendChild(renderRichText(ast));
  }
}

customElements.define('tina-markdown', TinaMarkdown);
