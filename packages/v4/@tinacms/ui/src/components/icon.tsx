import {
  ArrowLeft,
  Bookmark,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Ellipsis,
  ExternalLink,
  File,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  GitCompare,
  Globe,
  House,
  Image,
  Info,
  Layers2,
  LayoutGrid,
  LoaderCircle,
  type LucideIcon,
  type LucideProps,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  User,
  X,
} from 'lucide-react';

import { cn } from '@tinacms/ui/lib/utils';

type GlyphEntry = { icon: LucideIcon; weight: number; filled?: boolean };

/**
 * The named icons of the TinaCMS design, each mapped to its lucide icon and stroke weight:
 * 1.75 for objects such as a document, 2 to 2.25 for small marks such as a tick.
 */
const glyphs = {
  sidebar: { icon: PanelLeft, weight: 1.75 },
  home: { icon: House, weight: 1.75 },
  collection: { icon: Layers2, weight: 1.75 },
  media: { icon: Image, weight: 1.75 },
  changes: { icon: GitCompare, weight: 1.75 },
  tools: { icon: SlidersHorizontal, weight: 1.75 },
  settings: { icon: Settings, weight: 1.75 },
  help: { icon: CircleHelp, weight: 1.75 },
  chart: { icon: ChartNoAxesColumn, weight: 1.75 },
  user: { icon: User, weight: 1.75 },
  'chevron-right': { icon: ChevronRight, weight: 2.25 },
  'chevron-down': { icon: ChevronDown, weight: 2.25 },
  'chevron-left': { icon: ChevronLeft, weight: 2 },
  'arrow-left': { icon: ArrowLeft, weight: 2 },
  plus: { icon: Plus, weight: 2 },
  more: { icon: Ellipsis, weight: 2.25 },
  'collapse-all': { icon: ChevronsDownUp, weight: 1.75 },
  'expand-all': { icon: ChevronsUpDown, weight: 1.75 },
  maximise: { icon: Maximize2, weight: 1.75 },
  restore: { icon: Minimize2, weight: 1.75 },
  close: { icon: X, weight: 2 },
  'hide-panel': { icon: PanelLeftClose, weight: 1.75 },
  'show-panel': { icon: PanelLeftOpen, weight: 1.75 },
  edit: { icon: Pencil, weight: 2 },
  search: { icon: Search, weight: 2 },
  external: { icon: ExternalLink, weight: 2 },
  check: { icon: Check, weight: 2.25 },
  doc: { icon: FileText, weight: 1.75 },
  'doc-new': { icon: File, weight: 1.75 },
  folder: { icon: Folder, weight: 1.75 },
  'folder-open': { icon: FolderOpen, weight: 1.75 },
  globe: { icon: Globe, weight: 1.75 },
  global: { icon: PanelsTopLeft, weight: 1.75 },
  branch: { icon: GitBranch, weight: 2 },
  warning: { icon: TriangleAlert, weight: 2 },
  info: { icon: Info, weight: 2 },
  success: { icon: CircleCheck, weight: 2 },
  component: { icon: LayoutGrid, weight: 1.75, filled: true },
  bookmark: { icon: Bookmark, weight: 1.75, filled: true },
  error: { icon: CircleAlert, weight: 2.25 },
  trash: { icon: Trash2, weight: 1.75 },
  spinner: { icon: LoaderCircle, weight: 2 },
} satisfies Record<string, GlyphEntry>;

type Glyph = keyof typeof glyphs;

type IconProps = Omit<LucideProps, 'ref'> & {
  /** A named glyph such as `doc` or `chevron-right`, or any lucide icon. */
  glyph: Glyph | LucideIcon;
  /** Width and height in pixels. */
  size?: number;
  /** Stroke width. Defaults to the glyph's weight, or 2 for a lucide icon. */
  weight?: number;
};

/**
 * An icon in the colour of the text around it. Screen readers skip it unless it has an
 * `aria-label`; the button or row around it carries the name.
 */
function Icon({ glyph, size = 24, weight, className, ...props }: IconProps) {
  const entry: GlyphEntry =
    typeof glyph === 'string' ? glyphs[glyph] : { icon: glyph, weight: 2 };
  const Lucide = entry.icon;
  const labelled = props['aria-label'] !== undefined;
  return (
    <Lucide
      data-slot='icon'
      size={size}
      strokeWidth={weight ?? entry.weight}
      {...(entry.filled ? { fill: 'currentColor' } : {})}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      focusable='false'
      className={cn('block flex-none', className)}
      {...props}
    />
  );
}

export type { Glyph, IconProps };
export { Icon, glyphs };
