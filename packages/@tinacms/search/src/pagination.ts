export interface PaginationOptions {
  limit?: number;
  cursor?: string;
}

export interface PageOptions {
  PAGE?: {
    SIZE: number;
    NUMBER: number;
  };
}

export interface PaginationCursors {
  nextCursor: string | null;
  prevCursor: string | null;
}

export function buildPageOptions(options: PaginationOptions): PageOptions {
  if (!options.limit) return {};

  return {
    PAGE: {
      NUMBER: options.cursor ? parseInt(options.cursor, 10) : 0,
      SIZE: options.limit,
    },
  };
}

export function buildPaginationCursors(
  total: number,
  options: PaginationOptions
): PaginationCursors {
  const currentPage = options.cursor ? parseInt(options.cursor, 10) : 0;
  const pageSize = options.limit;

  const hasPreviousPage = currentPage > 0;
  const hasNextPage = pageSize ? total > (currentPage + 1) * pageSize : false;

  return {
    prevCursor: hasPreviousPage ? (currentPage - 1).toString() : null,
    nextCursor: hasNextPage ? (currentPage + 1).toString() : null,
  };
}
