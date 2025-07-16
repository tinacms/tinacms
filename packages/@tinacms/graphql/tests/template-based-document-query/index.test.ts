import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('retrieves template-based document with union types', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      page(relativePath: "home.md") {
        id
        title
        seo {
          seoTitle
          ogImage
          ogDescription
        }
        blocks {
          __typename
          ... on PageBlocksHero {
            backgroundImage
            description
          }
          ... on PageBlocksCta {
            ctaText
            ctaStyle
          }
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
