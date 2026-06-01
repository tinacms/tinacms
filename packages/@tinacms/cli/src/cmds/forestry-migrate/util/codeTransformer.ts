import crypto from 'crypto';
import path from 'path';
import fs from 'fs-extra';
import { TinaField } from '@tinacms/schema-tools';
import { format } from 'prettier';
import TsParser from 'prettier/parser-typescript.js';
import { stringifyLabelWithField } from './naming';

/**
 * Internal marker used to smuggle generated code expressions through the
 * `JSON.stringify` pass and back out as un-quoted source.
 *
 * The delimiters embed a per-process random nonce. Field arrays passed to
 * `addVariablesToCode` mix internally generated markers with user-authored
 * Forestry content (labels, names, option values, ...) that flows through the
 * same `JSON.stringify` call. Without the nonce, a user-supplied string could
 * reproduce the marker and have its contents emitted as executable code. The
 * nonce is unguessable, so only the generator can produce a marker the
 * un-quoter will act on.
 *
 * Hex contains no JSON- or RegExp-special characters, so the marker survives
 * `JSON.stringify` byte-for-byte and needs no escaping when built into the
 * RegExp. It only has to be stable within a single migration run (markers are
 * stripped before the file is written), so a per-process value is sufficient.
 */
const INTERNAL_NONCE = crypto.randomBytes(16).toString('hex');
const MARKER_OPEN = `__TINA_INTERNAL_${INTERNAL_NONCE}__:::`;
const MARKER_CLOSE = `:::__TINA_INTERNAL_${INTERNAL_NONCE}__`;
const MARKER_REGEX = new RegExp(`"${MARKER_OPEN}(.*?)${MARKER_CLOSE}"`, 'g');

/**
 * This function is used to replace the internal code with the actual code
 *
 * EX:
 *  <marker>...fields()<marker> => ...fields()
 *
 * or <marker>fields()<marker> => fields()
 */
export const addVariablesToCode = (codeWithTinaPrefix: string) => {
  const code = codeWithTinaPrefix.replace(MARKER_REGEX, '$1');
  return { code };
};

export const makeFieldsWithInternalCode = ({
  hasBody,
  field,
  bodyField,
  spread,
}:
  | {
      hasBody: true;
      field: string;
      spread?: never;
      bodyField: unknown;
    }
  | {
      hasBody: false;
      field: string;
      spread?: boolean;
      bodyField?: never;
    }
  | {
      hasBody: boolean;
      field: string;
      spread?: boolean;
      bodyField: unknown;
    }) => {
  if (hasBody) {
    return [bodyField, `${MARKER_OPEN}...${field}()${MARKER_CLOSE}`];
  } else {
    if (spread) return `${MARKER_OPEN}...${field}()${MARKER_CLOSE}`;
    return `${MARKER_OPEN}${field}()${MARKER_CLOSE}`;
  }
};

// Makes the template file text and the import statements for the config file
export const makeTemplateFile = async ({
  templateMap,
  usingTypescript,
}: {
  templateMap: Map<
    string,
    {
      fields: TinaField[];
      templateObj: any;
    }
  >;
  usingTypescript: boolean;
}) => {
  const importStatements: string[] = [];
  const templateCodeText: string[] = [];

  for (const template of templateMap.values()) {
    importStatements.push(
      `import { ${stringifyLabelWithField(
        template.templateObj.label
      )} } from './templates'`
    );

    templateCodeText.push(
      `export function ${stringifyLabelWithField(
        template.templateObj.label
      )} (){
        return ${
          addVariablesToCode(JSON.stringify(template.fields, null, 2)).code
        } ${usingTypescript ? 'as TinaField[]' : ''}
      } `
    );
  }
  const templateCode = `
${usingTypescript ? "import type { TinaField } from 'tinacms'" : ''}
${templateCodeText.join('\n')}
  `;

  const formattedCode = format(templateCode, {
    parser: 'typescript',
    plugins: [TsParser],
  });

  return { importStatements, templateCodeText: formattedCode };
};
