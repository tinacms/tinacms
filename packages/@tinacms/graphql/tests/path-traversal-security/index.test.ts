import { describe, it, expect } from 'vitest';
import { setupMutation } from '../util';
import config from './tina/config';

/**
 * Path Traversal Security Tests
 *
 * This test suite covers security validation for document and folder operations
 * to ensure that user-provided paths cannot escape the collection directory.
 *
 * The tests include:
 * 1. 'createDocument' to reject traversal paths.
 * 2. 'createFolder' to reject traversal paths.
 * 3. 'updateDocument' to reject traversal in both 'relativePath' and 'newRelativePath'.
 * 4. 'deleteDocument' to reject traversal paths.
 * 5. All tests verify that an 'Invalid path' error is returned when traversal is detected.
 *
 * The path validation should be implemented in the resolver layer.
 */
describe('Path Traversal Security', () => {
  const PATH_TRAVERSAL_ERROR = 'Invalid path';

  describe('createDocument', () => {
    it('should reject path traversal attempts that escape collection directory', async () => {
      const { query } = await setupMutation(__dirname, config);

      const createMutation = `
        mutation {
          createDocument(
            collection: "post"
            relativePath: "../../OUTSIDE_COLLECTION/malicious.md"
            params: {
              post: {
                title: "Malicious Document"
              }
            }
          ) {
            __typename
          }
        }
      `;

      const result = await query({
        query: createMutation,
        variables: {},
      });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain(PATH_TRAVERSAL_ERROR);
    });

    it('should reject path traversal attempts to sibling directories', async () => {
      const { query } = await setupMutation(__dirname, config);

      const createMutation = `
        mutation {
          createDocument(
            collection: "post"
            relativePath: "../other-collection/injected.md"
            params: {
              post: {
                title: "Injected into other collection"
              }
            }
          ) {
            __typename
          }
        }
      `;

      const result = await query({
        query: createMutation,
        variables: {},
      });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain(PATH_TRAVERSAL_ERROR);
    });
  });

  describe('createFolder', () => {
    it('should reject path traversal attempts that escape collection directory', async () => {
      const { query } = await setupMutation(__dirname, config);

      const createFolderMutation = `
        mutation {
          createFolder(
            collection: "post"
            relativePath: "../../OUTSIDE_COLLECTION/malicious-folder"
          ) {
            __typename
          }
        }
      `;

      const result = await query({
        query: createFolderMutation,
        variables: {},
      });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain(PATH_TRAVERSAL_ERROR);
    });
  });

  describe('updateDocument', () => {
    it('should reject path traversal in relativePath parameter', async () => {
      const { query } = await setupMutation(__dirname, config);

      const updateMutation = `
        mutation {
          updateDocument(
            collection: "post"
            relativePath: "../../OUTSIDE_COLLECTION/target.md"
            params: {
              post: {
                title: "Updated"
              }
            }
          ) {
            __typename
          }
        }
      `;

      const result = await query({
        query: updateMutation,
        variables: {},
      });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain(PATH_TRAVERSAL_ERROR);
    });

    it('should reject path traversal in newRelativePath (rename) parameter', async () => {
      const { query } = await setupMutation(__dirname, config);

      const renameMutation = `
        mutation {
          updateDocument(
            collection: "post"
            relativePath: "existing.md"
            params: {
              relativePath: "../../OUTSIDE_COLLECTION/stolen.md"
            }
          ) {
            __typename
          }
        }
      `;

      const result = await query({
        query: renameMutation,
        variables: {},
      });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain(PATH_TRAVERSAL_ERROR);
    });
  });

  describe('deleteDocument', () => {
    it('should reject path traversal attempts that escape collection directory', async () => {
      const { query } = await setupMutation(__dirname, config);

      const deleteMutation = `
        mutation {
          deleteDocument(
            collection: "post"
            relativePath: "../../OUTSIDE_COLLECTION/target.md"
          ) {
            __typename
          }
        }
      `;

      const result = await query({
        query: deleteMutation,
        variables: {},
      });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain(PATH_TRAVERSAL_ERROR);
    });
  });
});
