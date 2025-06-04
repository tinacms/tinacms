import React from 'react';
import { cva } from 'class-variance-authority';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Combine,
  Edit2,
  ExternalLink,
  Eye,
  FileCode,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Indent,
  Keyboard,
  Link2Off,
  type LucideProps,
  MessageSquare,
  MessageSquarePlus,
  Minus,
  Moon,
  MoreHorizontal,
  Outdent,
  PaintBucket,
  Pilcrow,
  Plus,
  Quote,
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
  Search,
  Settings,
  SeparatorHorizontal,
  Smile,
  Strikethrough,
  Subscript,
  SunMedium,
  Superscript,
  Table,
  Text,
  Trash,
  Twitter,
  Underline,
  Ungroup,
  WrapText,
  X,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export type Icon = LucideIcon;

const RawMarkdown = () => {
  return (
    <svg
      stroke='currentColor'
      fill='currentColor'
      strokeWidth={0}
      role='img'
      className='h-5 w-5'
      viewBox='0 0 24 24'
      height='1em'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title />
      <path d='M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z' />
    </svg>
  );
};
const MermaidIcon = () => (
  <svg
    width='100%'
    height='100%'
    viewBox='0 0 491 491'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    fillRule='evenodd'
    clipRule='evenodd'
    strokeLinejoin='round'
    strokeMiterlimit={2}
  >
    <path d='M490.16,84.61C490.16,37.912 452.248,0 405.55,0L84.61,0C37.912,0 0,37.912 0,84.61L0,405.55C0,452.248 37.912,490.16 84.61,490.16L405.55,490.16C452.248,490.16 490.16,452.248 490.16,405.55L490.16,84.61Z' />
    <path
      d='M407.48,111.18C335.587,108.103 269.573,152.338 245.08,220C220.587,152.338 154.573,108.103 82.68,111.18C80.285,168.229 107.577,222.632 154.74,254.82C178.908,271.419 193.35,298.951 193.27,328.27L193.27,379.13L296.9,379.13L296.9,328.27C296.816,298.953 311.255,271.42 335.42,254.82C382.596,222.644 409.892,168.233 407.48,111.18Z'
      fill='white'
      fillRule='nonzero'
    />
  </svg>
);

const borderAll = (props: LucideProps) => (
  <svg
    viewBox='0 0 24 24'
    height='48'
    width='48'
    focusable='false'
    role='img'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 13h5a1 1 0 0 0 1-1v-5h-6v6zm-2-6H5v5a1 1 0 0 0 1 1h5v-6zm2-2h6V6a1 1 0 0 0-1-1h-5v6zm-2-6H6a1 1 0 0 0-1 1v5h6V5z' />
  </svg>
);

const borderBottom = (props: LucideProps) => (
  <svg
    viewBox='0 0 24 24'
    height='48'
    width='48'
    focusable='false'
    role='img'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm-2 7a1 1 0 1 1 2 0 1 1 0 0 0 1 1h12a1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm17-8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3z' />
  </svg>
);

const borderLeft = (props: LucideProps) => (
  <svg
    viewBox='0 0 24 24'
    height='48'
    width='48'
    focusable='false'
    role='img'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M6 21a1 1 0 1 0 0-2 1 1 0 0 1-1-1V6a1 1 0 0 1 1-1 1 1 0 0 0 0-2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3zm7-16a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm6 6a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm4-17a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zm-1 17a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z' />
  </svg>
);

const borderNone = (props: LucideProps) => (
  <svg
    viewBox='0 0 24 24'
    height='48'
    width='48'
    focusable='false'
    role='img'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M14 4a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-9 7a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6 10a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zM7 20a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3z' />
  </svg>
);

const borderRight = (props: LucideProps) => (
  <svg
    viewBox='0 0 24 24'
    height='48'
    width='48'
    focusable='false'
    role='img'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm9 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 3a1 1 0 0 1 0 2 1 1 0 0 0-1 1 1 1 0 0 1-2 0 3 3 0 0 1 3-3zm1 17a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1V6a1 1 0 0 0-1-1 1 1 0 1 1 0-2 3 3 0 0 1 3 3v12a3 3 0 0 1-3 3z' />
  </svg>
);

const borderTop = (props: LucideProps) => (
  <svg
    viewBox='0 0 24 24'
    height='48'
    width='48'
    focusable='false'
    role='img'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M3 6a1 1 0 0 0 2 0 1 1 0 0 1 1-1h12a1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3zm2 5a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-8 1a1 1 0 1 0 0-2 1 1 0 0 1-1-1 1 1 0 1 0-2 0 3 3 0 0 0 3 3zm11-1a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z' />
  </svg>
);

export const iconVariants = cva('', {
  variants: {
    variant: {
      toolbar: 'size-5',
      menuItem: 'mr-2 size-5',
    },
    size: {
      sm: 'mr-2 size-4',
      md: 'mr-2 size-6',
    },
  },
  defaultVariants: {},
});

export const DoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill='none'
    height='16'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      clipRule='evenodd'
      d='M8.5 3H13V13H8.5V3ZM7.5 2H8.5H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H8.5H7.5H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H7.5ZM7.5 13H3L3 3H7.5V13Z'
      fill='#595E6F'
      fillRule='evenodd'
    />
  </svg>
);

export const ThreeColumnOutlined = (props: LucideProps) => (
  <svg
    fill='none'
    height='16'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      clipRule='evenodd'
      d='M9.25 3H6.75V13H9.25V3ZM9.25 2H6.75H5.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H5.75H6.75H9.25H10.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H10.25H9.25ZM10.25 3V13H13V3H10.25ZM3 13H5.75V3H3L3 13Z'
      fill='#4C5161'
      fillRule='evenodd'
    />
  </svg>
);

export const RightSideDoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill='none'
    height='16'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      clipRule='evenodd'
      d='M11.25 3H13V13H11.25V3ZM10.25 2H11.25H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H11.25H10.25H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H10.25ZM10.25 13H3L3 3H10.25V13Z'
      fill='#595E6F'
      fillRule='evenodd'
    />
  </svg>
);

export const LeftSideDoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill='none'
    height='16'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      clipRule='evenodd'
      d='M5.75 3H13V13H5.75V3ZM4.75 2H5.75H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H5.75H4.75H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H4.75ZM4.75 13H3L3 3H4.75V13Z'
      fill='#595E6F'
      fillRule='evenodd'
    />
  </svg>
);

export const DoubleSideDoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill='none'
    height='16'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      clipRule='evenodd'
      d='M10.25 3H5.75V13H10.25V3ZM10.25 2H5.75H4.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H4.75H5.75H10.25H11.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H11.25H10.25ZM11.25 3V13H13V3H11.25ZM3 13H4.75V3H3L3 13Z'
      fill='#595E6F'
      fillRule='evenodd'
    />
  </svg>
);

export const Overflow = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
    />
  </svg>
);

export const Icons = {
  add: Plus,
  alignCenter: AlignCenter,
  alignJustify: AlignJustify,
  alignLeft: AlignLeft,
  alignRight: AlignRight,
  arrowDown: ChevronDown,
  bg: PaintBucket,
  blockquote: Quote,
  // bold: Bold,
  overflow: Overflow,
  borderAll,
  borderBottom,
  borderLeft,
  borderNone,
  borderRight,
  borderTop,
  check: Check,
  chevronRight: ChevronRight,
  chevronsUpDown: ChevronsUpDown,
  clear: X,
  close: X,
  // code: Code2,
  paint: PaintBucket,
  codeblock: FileCode,
  color: Baseline,
  column: RectangleVertical,
  combine: Combine,
  ungroup: Ungroup,
  comment: MessageSquare,
  commentAdd: MessageSquarePlus,
  delete: Trash,
  dragHandle: GripVertical,
  editing: Edit2,
  emoji: Smile,
  externalLink: ExternalLink,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  // image: Image,
  indent: Indent,
  // italic: Italic,
  kbd: Keyboard,
  lineHeight: WrapText,
  // link: Link2,
  minus: Minus,
  mermaid: MermaidIcon,
  more: MoreHorizontal,
  // ol: ListOrdered,
  outdent: Outdent,
  paragraph: Pilcrow,
  refresh: RotateCcw,
  row: RectangleHorizontal,
  search: Search,
  settings: Settings,
  strikethrough: Strikethrough,
  subscript: Subscript,
  superscript: Superscript,
  table: Table,
  text: Text,
  trash: Trash,
  // ul: List,
  underline: Underline,
  unlink: Link2Off,
  viewing: Eye,
  doubleColumn: DoubleColumnOutlined,
  doubleSideDoubleColumn: DoubleSideDoubleColumnOutlined,
  threeColumn: ThreeColumnOutlined,
  leftSideDoubleColumn: LeftSideDoubleColumnOutlined,
  rightSideDoubleColumn: RightSideDoubleColumnOutlined,
  horizontalRule: SeparatorHorizontal,
  heading: HeadingIcon,
  link: LinkIcon,
  quote: QuoteIcon,
  image: ImageIcon,
  ul: UnorderedListIcon,
  ol: OrderedListIcon,
  code: CodeIcon,
  codeBlock: CodeBlockIcon,
  bold: BoldIcon,
  italic: ItalicIcon,
  raw: RawMarkdown,
  // www
  gitHub: (props: LucideProps) => (
    <svg viewBox='0 0 438.549 438.549' {...props}>
      <path
        fill='currentColor'
        d='M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z'
      ></path>
    </svg>
  ),
  logo: (props: LucideProps) => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...props}>
      <path
        fill='currentColor'
        d='M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z'
      />
    </svg>
  ),
  moon: Moon,
  sun: SunMedium,
  twitter: Twitter,
};

export const EllipsisIcon = ({ title }) => {
  return (
    <>
      {title && <span className='sr-only'>{title}</span>}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-5 w-5'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
        />
      </svg>
    </>
  );
};

export function UnorderedListIcon(props) {
  const title = props.title || 'format list bulleted';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path d='M7 5h14v2H7V5z' fill='currentColor' />
        <path
          d='M4 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'
          fill='currentColor'
        />
        <path
          d='M7 11h14v2H7v-2zm0 6h14v2H7v-2zm-3 2.5c.82 0 1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5z'
          fill='currentColor'
        />
        <path
          d='M4 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function HeadingIcon(props) {
  const title = props.title || 'format size';

  return (
    <svg
      height='24'
      width='24'
      className='h-5 w-5'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function OrderedListIcon(props) {
  const title = props.title || 'format list numbered';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function QuoteIcon(props) {
  const title = props.title || 'format quote';

  return (
    <svg
      height='24'
      className='h-5 w-5'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function LinkIcon(props) {
  const title = props.title || 'insert link';

  return (
    <svg
      height='24'
      className='h-5 w-5'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function CodeIcon(props) {
  const title = props.title || 'code';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function CodeBlockIcon(props) {
  const title = props.title || 'code-block';

  return (
    <svg
      className='h-5 w-5'
      stroke='currentColor'
      fill='currentColor'
      strokeWidth={0}
      viewBox='0 0 16 16'
      height='1em'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <path d='M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z' />
      <path d='M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z' />
    </svg>
  );
}

export function ImageIcon(props) {
  const title = props.title || 'image';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function BoldIcon(props) {
  const title = props.title || 'format bold';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function ItalicIcon(props) {
  const title = props.title || 'format italic';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function UnderlineIcon(props) {
  const title = props.title || 'format underlined';

  return (
    <svg
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function StrikethroughIcon(props) {
  const title = props.title || 'strikethrough s';

  return (
    <svg
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.2-1.28-2.25-1.28-1.86 0-2.34 1.02-2.34 1.7 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.21-.34-.54-.89-.54-1.92zM21 12v-2H3v2h9.62c1.15.45 1.96.75 1.96 1.97 0 1-.81 1.67-2.28 1.67-1.54 0-2.93-.54-2.93-2.51H6.4c0 .55.08 1.13.24 1.58.81 2.29 3.29 3.3 5.67 3.3 2.27 0 5.3-.89 5.3-4.05 0-.3-.01-1.16-.48-1.94H21V12z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function LightningIcon(props) {
  const title = props.title || 'lightning';

  return (
    <svg
      className='h-5 w-5'
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='square'
        strokeLinejoin='miter'
        strokeMiterlimit='10'
        strokeWidth='2'
      >
        <polygon
          fill='none'
          points='13,3 3,14 12,14 11,21 21,10 12,10 '
          stroke='currentColor'
        />
      </g>
    </svg>
  );
}

export function ArrowDownIcon(props) {
  const title = props.title || 'keyboard arrow down';

  return (
    <svg
      height='24'
      width='24'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{title}</title>
      <g fill='none'>
        <path
          d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={`h-4 w-4 ${className}`}
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
        clipRule='evenodd'
      />
    </svg>
  );
}
