interface IconProps {
  className?: string;
}

const Icon = ({ className, path }: IconProps & { path: string }) => (
  <svg
    aria-hidden='true'
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d={path} />
  </svg>
);

export const ImageIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3.5 5.5a1.5 1.5 0 1 0 0 .01M21 15l-5-5L5 21'
  />
);

export const FolderIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
  />
);

export const FileIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6'
  />
);

export const VideoIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm6 5v6l5-3z'
  />
);

export const PlayIcon = ({ className }: IconProps) => (
  <svg aria-hidden='true' className={className} viewBox='0 0 24 24'>
    <path d='M8 5v14l11-7z' fill='currentColor' />
  </svg>
);

export const GridIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'
  />
);

export const ListIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
  />
);

export const RefreshIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5'
  />
);

export const UploadIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M12 13v8M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2M8 17l4-4 4 4'
  />
);

export const FolderPlusIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 10v6M9 13h6'
  />
);

export const SearchIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.3-4.3'
  />
);

export const CloseIcon = ({ className }: IconProps) => (
  <Icon className={className} path='M18 6 6 18M6 6l12 12' />
);

export const CopyIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zM4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2'
  />
);

export const LockIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4'
  />
);

export const ArrowLeftIcon = ({ className }: IconProps) => (
  <Icon className={className} path='m12 19-7-7 7-7M19 12H5' />
);

export const TrashIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'
  />
);

export const RenameIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M12 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1M20 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3h-1M16 7v10M5 8h7M5 16h7M5 8a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1'
  />
);

export const InsertIcon = ({ className }: IconProps) => (
  <Icon className={className} path='M12 17V3M6 11l6 6 6-6M19 21H5' />
);

export const AlertIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01'
  />
);

export const ExternalLinkIcon = ({ className }: IconProps) => (
  <Icon
    className={className}
    path='M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'
  />
);
