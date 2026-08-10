import DOMPurify from 'dompurify';

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
};
const MARKS = [
  ['bold', 'strong'],
  ['italic', 'em'],
  ['underline', 'u'],
  ['strikethrough', 's'],
  ['code', 'code'],
  ['highlight', 'mark'],
];

function renderRichText(root) {
  const container = document.createElement('div');

  for (const block of root.children ?? []) {
    container.appendChild(renderNode(block));
  }

  return container;
}

function renderNode(node) {
  const override = TinaMarkdown.components[node.type];
  if (override) return override(node);

  if (node.type === 'text') return renderText(node);

  if (node.type === 'html' || node.type === 'html_inline') {
    return DOMPurify.sanitize(node.value, { RETURN_DOM_FRAGMENT: true });
  }

  const tag = TAGS[node.type];
  const el = document.createElement(tag);

  if (node.url && node.type === 'a') el.href = node.url;
  if (node.url && node.type === 'img') el.src = node.url;

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
   * Per-node-type renderers, keyed by `node.type`, each returning a DOM node.
   * Mirrors the `components` prop on the React and Astro renderers, which is
   * how a consumer opts into rendering raw HTML unsanitised.
   */
  static components = {};

  constructor() {
    super();

    this.attachShadow({
      mode: 'open',
    });
  }

  connectedCallback() {
    const contentStr = this.getAttribute('content');
    const content = JSON.parse(contentStr);

    this.shadowRoot.appendChild(renderRichText(content));
  }
}

customElements.define('tina-markdown', TinaMarkdown);
