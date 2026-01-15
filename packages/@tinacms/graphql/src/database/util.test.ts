import { describe, it, expect } from 'vitest';
import { parseFile, stringifyFile } from './util';

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
