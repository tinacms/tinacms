import type { JSX } from 'react';
import { describe, expectTypeOf, it } from 'vitest';
import type { TinaMarkdownContent } from '../../rich-text';
import { StaticTinaMarkdown, TinaMarkdown } from './tina-markdown';

// `pnpm types` checks this file. vitest strips the types, so it only proves the
// file runs. The repo compiles with `strict: false`, so a lost contextual type
// makes a parameter `any` and reports nothing — each inline component asserts
// the type of its props for that reason.

const content: TinaMarkdownContent = { type: 'root', children: [] };

type HeroProps = { title: string };

type HeadingProps = { children: JSX.Element } | undefined;

const Hero = (props: HeroProps) => <h1>{props.title}</h1>;

describe('TinaMarkdown props', () => {
  it('takes content with no components', () => {
    expectTypeOf(
      <TinaMarkdown content={content} />
    ).toEqualTypeOf<JSX.Element>();
    expectTypeOf(
      <StaticTinaMarkdown content={content} />
    ).toEqualTypeOf<JSX.Element>();
  });

  it('gives a base override the props of that element', () => {
    expectTypeOf(
      <TinaMarkdown
        content={content}
        components={{
          h1: (props) => {
            expectTypeOf(props).toEqualTypeOf<HeadingProps>();
            return <h1>{props?.children}</h1>;
          },
        }}
      />
    ).toEqualTypeOf<JSX.Element>();
    expectTypeOf(
      <StaticTinaMarkdown
        content={content}
        components={{
          h1: (props) => {
            expectTypeOf(props).toEqualTypeOf<HeadingProps>();
            return <h1>{props?.children}</h1>;
          },
        }}
      />
    ).toEqualTypeOf<JSX.Element>();
  });

  it('infers the props of a custom component', () => {
    expectTypeOf(
      <TinaMarkdown content={content} components={{ Hero }} />
    ).toEqualTypeOf<JSX.Element>();
    expectTypeOf(
      <StaticTinaMarkdown content={content} components={{ Hero }} />
    ).toEqualTypeOf<JSX.Element>();
  });

  it('gives a custom component its props from an explicit type argument', () => {
    expectTypeOf(
      <TinaMarkdown<{ Hero: HeroProps }>
        content={content}
        components={{
          Hero: (props) => {
            expectTypeOf(props).toEqualTypeOf<HeroProps>();
            return <h1>{props.title}</h1>;
          },
        }}
      />
    ).toEqualTypeOf<JSX.Element>();
    expectTypeOf(
      <StaticTinaMarkdown<{ Hero: HeroProps }>
        content={content}
        components={{
          Hero: (props) => {
            expectTypeOf(props).toEqualTypeOf<HeroProps>();
            return <h1>{props.title}</h1>;
          },
        }}
      />
    ).toEqualTypeOf<JSX.Element>();
  });

  it('takes a base override and a custom component together', () => {
    expectTypeOf(
      <TinaMarkdown
        content={content}
        components={{
          Hero,
          h1: (props) => {
            expectTypeOf(props).toEqualTypeOf<HeadingProps>();
            return <h1>{props?.children}</h1>;
          },
        }}
      />
    ).toEqualTypeOf<JSX.Element>();
  });

  it('refuses a value that is not a component', () => {
    expectTypeOf(
      // @ts-expect-error a component must be a function
      <TinaMarkdown content={content} components={{ h1: 'not a component' }} />
    ).toEqualTypeOf<JSX.Element>();
  });
});
