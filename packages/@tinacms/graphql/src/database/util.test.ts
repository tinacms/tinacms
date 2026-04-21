import { describe, it, expect, vi } from 'vitest';
import { TinaSchema } from '@tinacms/schema-tools';
import { parseFile, stringifyFile, transformDocument } from './util';

describe('gray-matter security', () => {
  describe('parseFile', () => {
    it('should reject JavaScript frontmatter to prevent code execution', () => {
      const maliciousContent = `---js
{
  "title": "Pawned" + console.log(require("fs").readFileSync("/etc/passwd").toString())
}
---
# Blog Post

Content here`;

      expect(() => {
        parseFile(maliciousContent, '.md', (yup) => yup.object({}));
      }).toThrow(
        'JavaScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should reject javascript (alternate syntax) frontmatter', () => {
      const maliciousContent = `---javascript
{
  "title": "Pawned" + console.log(require("fs").readFileSync("/etc/passwd").toString())
}
---
# Blog Post

Content here`;

      expect(() => {
        parseFile(maliciousContent, '.md', (yup) => yup.object({}));
      }).toThrow(
        'JavaScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should reject CoffeeScript frontmatter to prevent code execution', () => {
      const maliciousContent = `---coffee
title: "Pawned" + console.log(require("fs").readFileSync("/etc/passwd").toString())
---
# Blog Post

Content here`;

      expect(() => {
        parseFile(maliciousContent, '.md', (yup) => yup.object({}));
      }).toThrow(
        'CoffeeScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should reject CoffeeScript (full name) frontmatter to prevent code execution', () => {
      const maliciousContent = `---coffeescript
title: "Pawned" + console.log(require("fs").readFileSync("/etc/passwd").toString())
---
# Blog Post

Content here`;

      expect(() => {
        parseFile(maliciousContent, '.md', (yup) => yup.object({}));
      }).toThrow(
        'CoffeeScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should successfully parse YAML frontmatter (default safe format)', () => {
      const safeContent = `---
title: Safe Title
author: Test Author
---
# Blog Post

Content here`;

      const result = parseFile(safeContent, '.md', (yup) => yup.object({}));

      expect(result).toEqual({
        title: 'Safe Title',
        author: 'Test Author',
        $_body: '# Blog Post\n\nContent here',
      });
    });

    it('should successfully parse TOML frontmatter', () => {
      const tomlContent = `+++
title = "TOML Title"
author = "Test Author"
+++
# Blog Post

Content here`;

      const result = parseFile(tomlContent, '.md', (yup) => yup.object({}), {
        frontmatterFormat: 'toml',
        frontmatterDelimiters: '+++',
      });

      expect(result).toEqual({
        title: 'TOML Title',
        author: 'Test Author',
        $_body: '# Blog Post\n\nContent here',
      });
    });

    it('should successfully parse JSON frontmatter', () => {
      const jsonContent = `---
{
  "title": "JSON Title",
  "author": "Test Author"
}
---
# Blog Post

Content here`;

      const result = parseFile(jsonContent, '.md', (yup) => yup.object({}), {
        frontmatterFormat: 'json',
      });

      expect(result).toEqual({
        title: 'JSON Title',
        author: 'Test Author',
        $_body: '# Blog Post\n\nContent here',
      });
    });

    it('should successfully parse YAML frontmatter with JSX components as data', () => {
      // JSX components stored as string data in YAML should work fine
      // This is different from executing JavaScript code
      const jsxContent = `---
title: Blog with Hero Component
hero:
  component: '<Hero title="Welcome" subtitle="To our site" />'
  props:
    variant: primary
    showImage: true
customComponent: '<CustomSection><p>Content here</p></CustomSection>'
---
# Blog Post

Content with components stored in frontmatter`;

      const result = parseFile(jsxContent, '.md', (yup) => yup.object({}));

      expect(result).toEqual({
        title: 'Blog with Hero Component',
        hero: {
          component: '<Hero title="Welcome" subtitle="To our site" />',
          props: {
            variant: 'primary',
            showImage: true,
          },
        },
        customComponent: '<CustomSection><p>Content here</p></CustomSection>',
        $_body: '# Blog Post\n\nContent with components stored in frontmatter',
      });

      // Verify the JSX is stored as a string, not executed
      expect(typeof result.hero.component).toBe('string');
      expect(typeof result.customComponent).toBe('string');
    });
  });

  describe('stringifyFile', () => {
    it('should not allow stringify with js engine', () => {
      const content = {
        title: 'Test',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content',
      };

      expect(() => {
        // @ts-ignore - testing invalid configuration
        stringifyFile(content, '.md', false, {
          frontmatterFormat: 'js' as any,
        });
      }).toThrow(
        'JavaScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should not allow stringify with javascript engine', () => {
      const content = {
        title: 'Test',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content',
      };

      expect(() => {
        // @ts-ignore - testing invalid configuration
        stringifyFile(content, '.md', false, {
          frontmatterFormat: 'javascript' as any,
        });
      }).toThrow(
        'JavaScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should not allow stringify with coffee engine', () => {
      const content = {
        title: 'Test',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content',
      };

      expect(() => {
        // @ts-ignore - testing invalid configuration
        stringifyFile(content, '.md', false, {
          frontmatterFormat: 'coffee' as any,
        });
      }).toThrow(
        'CoffeeScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should not allow stringify with coffeescript engine', () => {
      const content = {
        title: 'Test',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content',
      };

      expect(() => {
        // @ts-ignore - testing invalid configuration
        stringifyFile(content, '.md', false, {
          frontmatterFormat: 'coffeescript' as any,
        });
      }).toThrow(
        'CoffeeScript execution in frontmatter is not allowed for security reasons'
      );
    });

    it('should successfully stringify with YAML (default)', () => {
      const content = {
        title: 'Test Title',
        author: 'Test Author',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content here',
      };

      const result = stringifyFile(content, '.md', false);

      expect(result).toContain('title: Test Title');
      expect(result).toContain('author: Test Author');
      expect(result).toContain('Content here');
      expect(result).not.toContain('_relativePath');
      expect(result).not.toContain('_id');
      expect(result).not.toContain('_template');
      expect(result).not.toContain('_collection');
    });

    it('should successfully stringify with TOML', () => {
      const content = {
        title: 'Test Title',
        author: 'Test Author',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content here',
      };

      const result = stringifyFile(content, '.md', false, {
        frontmatterFormat: 'toml',
        frontmatterDelimiters: '+++',
      });

      expect(result).toContain('title = "Test Title"');
      expect(result).toContain('author = "Test Author"');
      expect(result).toContain('Content here');
    });

    it('should not wrap long strings with folded scalar syntax by default (lineWidth: -1)', () => {
      const content = {
        title: 'Test Title',
        longString:
          'This is a very long string that exceeds eighty characters and would normally be wrapped with folded scalar syntax if lineWidth was set to 80',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content here',
      };

      const result = stringifyFile(content, '.md', false);

      // Should NOT contain folded scalar syntax
      expect(result).not.toContain('>-');
      // Should contain the full string on one line in the frontmatter
      expect(result).toContain('longString:');
    });

    it('should wrap long strings when lineWidth is explicitly set to 80', () => {
      const content = {
        title: 'Test Title',
        longString:
          'This is a very long string that exceeds 80 characters and should be wrapped with folded scalar syntax when lineWidth is set to 80',
        _relativePath: 'test.md',
        _id: 'test.md',
        _template: 'post',
        _collection: 'posts',
        $_body: 'Content here',
      };

      const result = stringifyFile(content, '.md', false, {
        yamlMaxLineWidth: 80,
      });

      // Should contain folded scalar syntax
      expect(result).toContain('>-');
    });

    it('should handle lineWidth for standalone YAML files', () => {
      const content = {
        title: 'Test Title',
        longString:
          'This is a very long string that exceeds 80 characters and would normally be wrapped but should not be with default lineWidth of -1',
        _relativePath: 'test.yaml',
        _id: 'test.yaml',
        _template: 'config',
        _collection: 'configs',
      };

      const result = stringifyFile(content, '.yaml', false);

      // Should NOT contain folded scalar syntax
      expect(result).not.toContain('>-');
    });
  });
});

describe('parseFile / stringifyFile data integrity', () => {
  // Helper to attach the internal TinaCMS meta fields that stringifyFile strips out
  const withMeta = (data: object) => ({
    ...data,
    _relativePath: '',
    _id: '',
    _template: 'post',
    _collection: 'posts',
  });

  it('parseFile then stringifyFile preserves fields and is stable for .yaml', () => {
    const raw = `title: Hello World\nauthor: Test Author\ncount: 42\n`;

    // third arg is a yup schema validator — empty object schema because we're not testing validation here
    const parsed = parseFile(raw, '.yaml', (yup) => yup.object({}));

    // fidelity: no fields dropped or mutated
    expect(parsed).toEqual({
      title: 'Hello World',
      author: 'Test Author',
      count: 42,
    });

    // stability: repeated save cycles must not change the file on disk
    const stringified1 = stringifyFile(withMeta(parsed), '.yaml', false);
    const parsed2 = parseFile(stringified1, '.yaml', (yup) => yup.object({}));
    const stringified2 = stringifyFile(withMeta(parsed2), '.yaml', false);

    expect(stringified2).toEqual(stringified1);
  });

  it('parseFile then stringifyFile preserves fields and is stable for .toml', () => {
    const raw = `title = "Hello World"\nauthor = "Test Author"\ncount = 42\n`;

    const parsed = parseFile(raw, '.toml', (yup) => yup.object({}));

    // fidelity: no fields dropped or mutated
    expect(parsed).toEqual({
      title: 'Hello World',
      author: 'Test Author',
      count: 42,
    });

    // stability: repeated save cycles must not change the file on disk
    const stringified1 = stringifyFile(withMeta(parsed), '.toml', false);
    const parsed2 = parseFile(stringified1, '.toml', (yup) => yup.object({}));
    const stringified2 = stringifyFile(withMeta(parsed2), '.toml', false);

    expect(stringified2).toEqual(stringified1);
  });

  it('parseFile then stringifyFile preserves fields and is stable for .json', () => {
    const raw = JSON.stringify(
      { title: 'Hello World', author: 'Test Author', count: 42 },
      null,
      2
    );

    const parsed = parseFile(raw, '.json', (yup) => yup.object({}));

    // fidelity: no fields dropped or mutated
    expect(parsed).toEqual({
      title: 'Hello World',
      author: 'Test Author',
      count: 42,
    });

    // stability: repeated save cycles must not change the file on disk
    const stringified1 = stringifyFile(withMeta(parsed), '.json', false);
    const parsed2 = parseFile(stringified1, '.json', (yup) => yup.object({}));
    const stringified2 = stringifyFile(withMeta(parsed2), '.json', false);

    expect(stringified2).toEqual(stringified1);
  });

  it('parseFile returns empty object for empty .json file', () => {
    const result = parseFile('', '.json', (yup) => yup.object({}));
    expect(result).toEqual({});
  });

  it('parseFile returns empty object for empty .yaml file', () => {
    const result = parseFile('', '.yaml', (yup) => yup.object({}));
    expect(result).toEqual({});
  });

  it('parseFile returns empty object for empty .toml file', () => {
    const result = parseFile('', '.toml', (yup) => yup.object({}));
    expect(result).toEqual({});
  });

  it('parseFile returns empty body for empty .md file', () => {
    const result = parseFile('', '.md', (yup) => yup.object({}));
    expect(result).toEqual({ $_body: '' });
  });

  it('parseFile returns empty body for empty .mdx file', () => {
    const result = parseFile('', '.mdx', (yup) => yup.object({}));
    expect(result).toEqual({ $_body: '' });
  });

  it('parseFile then stringifyFile preserves unicode content for .yaml', () => {
    const raw = `title: '你好世界'\nauthor: '🎉 Test'\ndescription: 'こんにちは世界'\n`;

    const parsed = parseFile(raw, '.yaml', (yup) => yup.object({}));

    // fidelity: unicode characters are not corrupted or dropped
    expect(parsed).toEqual({
      title: '你好世界',
      author: '🎉 Test',
      description: 'こんにちは世界',
    });

    // stability: unicode survives repeated save cycles
    const stringified1 = stringifyFile(withMeta(parsed), '.yaml', false);
    const parsed2 = parseFile(stringified1, '.yaml', (yup) => yup.object({}));
    const stringified2 = stringifyFile(withMeta(parsed2), '.yaml', false);

    expect(stringified2).toEqual(stringified1);
  });

  it('parseFile throws on malformed YAML frontmatter in .md file', () => {
    // unclosed bracket is invalid YAML frontmatter inside a .md file — gray-matter should throw, not silently return empty data
    const malformed = `---\ntitle: [unclosed bracket\n---\n\nBody content.`;
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      parseFile(malformed, '.md', (yup) => yup.object({}));
    }).toThrow();

    consoleError.mockRestore();
  });

  it('parseFile preserves frontmatter and body for .mdx', () => {
    const raw = `---\ntitle: Hello World\nauthor: Test Author\n---\n\n<Hero title="Welcome" />\n\nSome body text.`;

    const parsed = parseFile(raw, '.mdx', (yup) => yup.object({}));

    // fidelity: no fields dropped or mutated
    // stability omitted — $_body goes through parseMDX/stringifyMDX in production
    expect(parsed).toEqual({
      title: 'Hello World',
      author: 'Test Author',
      $_body: '\n<Hero title="Welcome" />\n\nSome body text.',
    });
  });
});

describe('transformDocument', () => {
  const schema = new TinaSchema({
    collections: [
      {
        name: 'posts',
        path: 'content/posts',
        format: 'md',
        fields: [
          { name: 'title', type: 'string', label: 'Title' },
          { name: 'body', type: 'string', label: 'Body', isBody: true },
        ],
      },
    ],
  });

  it('maps $_body to the isBody field and attaches TinaCMS metadata', () => {
    const contentObject = {
      title: 'Hello World',
      $_body: 'This is the body.',
    };

    const result = transformDocument(
      'content/posts/hello-world.md',
      contentObject,
      schema
    );

    // $_body renamed to the isBody field name defined in schema
    expect(result).toMatchObject({
      title: 'Hello World',
      body: 'This is the body.',
      _collection: 'posts',
      _relativePath: 'hello-world.md',
      _id: 'content/posts/hello-world.md',
    });

    // $_body should be stripped from the result
    expect(result).not.toHaveProperty('$_body');
  });
});
