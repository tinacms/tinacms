import React from 'react';

type RichNode = Record<string, unknown>;

export function sanitizeHref(value: unknown): string {
  if (typeof value !== 'string') return '#';
  const trimmed = value.trim();
  if (!trimmed) return '#';
  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '#';
  }
  // Allow relative URLs (but not protocol-relative like //evil.com)
  if (
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('#')
  ) {
    return trimmed;
  }
  // Allow http, https, mailto absolute URLs
  try {
    const url = new URL(trimmed);
    if (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'mailto:'
    ) {
      return trimmed;
    }
  } catch {
    return '#';
  }
  return '#';
}

function renderNode(node: RichNode, idx?: number): React.ReactNode {
  if (node == null) return null;
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node))
    return node.map((n, i) => (
      <React.Fragment key={i}>{renderNode(n)}</React.Fragment>
    ));
  if (typeof node === 'object') {
    if ('text' in node) return node.text;
    const children = renderNode(
      (node.children ?? node.content ?? node) as RichNode
    );
    const type = (typeof node.type === 'string' ? node.type : '').toLowerCase();
    switch (type) {
      case 'paragraph':
        return <p key={idx}>{children}</p>;
      case 'heading':
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return <h3 key={idx}>{children}</h3>;
      case 'blockquote':
        return <blockquote key={idx}>{children}</blockquote>;
      case 'link':
      case 'a': {
        const href = sanitizeHref(node.url ?? node.href);
        return (
          <a key={idx} href={href} className='text-blue-600 hover:underline'>
            {children}
          </a>
        );
      }
      default:
        return <React.Fragment key={idx}>{children}</React.Fragment>;
    }
  }
  return null;
}

export default function RichText({ content }: { content: any }) {
  if (content == null) return null;
  return <>{renderNode(content)}</>;
}
