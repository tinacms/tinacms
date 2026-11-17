import { cn } from '@tinacms/ui/lib/utils';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorState,
  useHotkeys,
} from '@udecode/plate/react';
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import React from 'react';
import { useResize } from '../hooks/use-resize';
import {
  type InLineTool,
  hasAnyTool,
  resolveToolbarLayout,
} from '../toolbar/toolbar-layout';
import { useToolbarContext } from '../toolbar/toolbar-provider';
import { InsertMenu } from './insert-menu';
import { MoreFormattingMenu } from './more-formatting-menu';
import { MoreToolsMenu } from './more-tools-menu';
import { TextStyleMenu } from './text-style-menu';
import { LinkToolbarButton } from './plate-ui/link-toolbar-button';
import { ListToolbarButton } from './plate-ui/indent-list-toolbar-button';
import {
  BoldToolbarButton,
  ItalicToolbarButton,
} from './plate-ui/mark-toolbar-button';
import { QuoteToolbarButton } from './plate-ui/quote-toolbar-button';
import { Toolbar, ToolbarSeparator } from './plate-ui/toolbar';
import { helpers } from '../plugins/core/common';
import {
  LinkShortcutContext,
  useLinkShortcutRegistry,
} from './plate-ui/link-shortcut';
import { useToolBlocked } from './use-tool-blocked';

const WIDE_TOOLBAR = 448;
const TOOL_WIDTH = 34;
const TOOL_WIDTH_COARSE = 42;
const TEXT_STYLE_WIDTH = 140;
const TEXT_STYLE_ICON_WIDTH = 52;
const MORE_FORMATTING_WIDTH = 52;
const INSERT_WIDTH = 76;
const SEPARATOR_WIDTH = 9;

const useCoarsePointer = () => {
  const [coarse, setCoarse] = React.useState(
    () => window.matchMedia?.('(pointer: coarse)').matches ?? false
  );
  React.useEffect(() => {
    const list = window.matchMedia?.('(pointer: coarse)');
    if (!list) return;
    const onChange = () => setCoarse(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);
  return coarse;
};

const InLineButton = ({
  tool,
  disabled,
  blocked,
}: {
  tool: InLineTool;
  disabled: boolean;
  blocked: boolean;
}) => {
  switch (tool) {
    case 'bold':
      return <BoldToolbarButton disabled={disabled} />;
    case 'italic':
      return <ItalicToolbarButton disabled={disabled} />;
    case 'link':
      return <LinkToolbarButton disabled={disabled} />;
    case 'ul':
      return (
        <ListToolbarButton
          nodeType={BulletedListPlugin.key}
          disabled={disabled || blocked}
        />
      );
    case 'ol':
      return (
        <ListToolbarButton
          nodeType={NumberedListPlugin.key}
          disabled={disabled || blocked}
        />
      );
    case 'quote':
      return <QuoteToolbarButton disabled={disabled || blocked} />;
  }
};

export default function FixedToolbarButtons({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(Number.POSITIVE_INFINITY);
  const { overrides, templates } = useToolbarContext();
  const coarse = useCoarsePointer();
  const { isBlocked, inCodeBlock } = useToolBlocked();
  useEditorState();
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const linkShortcut = useLinkShortcutRegistry();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const layout = React.useMemo(
    () => resolveToolbarLayout(overrides?.toolbar, templates.length),
    [overrides?.toolbar, templates.length]
  );

  useResize(ref, (entry) => setWidth(entry.contentRect.width));

  const hasLink = layout.inLine.includes('link');
  useHotkeys(
    'meta+k, ctrl+k',
    (event) => {
      const root = editor.api.toDOMNode(editor);
      if (!root?.contains(document.activeElement)) return;
      if (
        readOnly ||
        !hasLink ||
        disabled ||
        helpers.isNodeActive(editor, CodeBlockPlugin)
      ) {
        return;
      }
      event.preventDefault();
      if (linkShortcut.open.current) {
        linkShortcut.open.current();
        return;
      }
      linkShortcut.pending.current = true;
      setMoreOpen(true);
    },
    { enableOnContentEditable: true },
    [editor, hasLink, disabled, readOnly, linkShortcut]
  );

  if (!hasAnyTool(layout)) return null;

  const wide = width >= WIDE_TOOLBAR;
  const toolWidth = coarse ? TOOL_WIDTH_COARSE : TOOL_WIDTH;
  const off = disabled || inCodeBlock;
  const hasMoreFormatting = layout.moreFormatting.length > 0;

  const fixedBase =
    (layout.textStyle ? (wide ? TEXT_STYLE_WIDTH : TEXT_STYLE_ICON_WIDTH) : 0) +
    (hasMoreFormatting ? MORE_FORMATTING_WIDTH : 0) +
    (layout.showInsert ? INSERT_WIDTH + SEPARATOR_WIDTH : 0) +
    (layout.textStyle && layout.inLine.length > 0 ? SEPARATOR_WIDTH : 0);
  const all = layout.inLine.length;
  const roomWithoutDivider = Math.floor((width - fixedBase) / toolWidth);
  const allFit = roomWithoutDivider >= all && !hasMoreFormatting;
  const room = allFit
    ? roomWithoutDivider
    : Math.floor(
        (width - fixedBase - (all > 0 ? SEPARATOR_WIDTH : 0)) / toolWidth
      );
  const shown = room >= all ? all : Math.max(0, room - 1);
  const inLine = layout.inLine.slice(0, shown);
  const folded = layout.inLine.slice(shown);

  const render = (tool: InLineTool) => (
    <InLineButton
      key={tool}
      tool={tool}
      disabled={off}
      blocked={isBlocked(tool)}
    />
  );

  return (
    <LinkShortcutContext.Provider value={linkShortcut}>
      <Toolbar
        ref={ref}
        aria-label='Formatting'
        className={cn('min-w-0 flex-1 flex-nowrap overflow-hidden px-1.5 py-1')}
      >
        {layout.textStyle ? (
          <TextStyleMenu showLabel={wide} disabled={off} />
        ) : null}
        {layout.textStyle && layout.inLine.length > 0 ? (
          <ToolbarSeparator />
        ) : null}
        {inLine.map(render)}
        {inLine.length > 0 && (hasMoreFormatting || folded.length > 0) ? (
          <ToolbarSeparator />
        ) : null}
        {hasMoreFormatting ? (
          <MoreFormattingMenu tools={layout.moreFormatting} disabled={off} />
        ) : null}
        {folded.length > 0 ? (
          <MoreToolsMenu
            disabled={off}
            open={moreOpen}
            onOpenChange={setMoreOpen}
          >
            {folded.map(render)}
          </MoreToolsMenu>
        ) : null}
        {layout.showInsert ? (
          <>
            <ToolbarSeparator />
            <InsertMenu
              inserts={layout.inserts}
              templates={layout.templates}
              disabled={off}
            />
          </>
        ) : null}
      </Toolbar>
    </LinkShortcutContext.Provider>
  );
}
