import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('filters crew by template-specific fields using union types', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      blueDesigners: crewConnection(filter: { costumeDesigner: { favoriteColor: { eq: "blue" } } }) {
        edges {
          node {
            ...on Document {
              id
            }
          }
        }
      }
      redDesigners: crewConnection(filter: { costumeDesigner: { favoriteColor: { eq: "red" } } }) {
        edges {
          node {
            ...on Document {
              id
            }
          }
        }
      }
      carChaseExperts: crewConnection(filter: { stuntPerson: { speciality: { eq: "car chases" } } }) {
        edges {
          node {
            ...on Document {
              id
            }
          }
        }
      }
      wireWorkExperts: crewConnection(filter: { stuntPerson: { speciality: { eq: "wire work" } } }) {
        edges {
          node {
            ...on Document {
              id
            }
          }
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
