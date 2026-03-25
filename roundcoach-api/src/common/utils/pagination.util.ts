import { PaginationQueryDto } from '../dtos/pagination-query.dto';

export function resolvePagination(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationMeta(data: {
  page: number;
  limit: number;
  total: number;
}) {
  return {
    page: data.page,
    limit: data.limit,
    total: data.total,
    totalPages: Math.max(1, Math.ceil(data.total / data.limit)),
  };
}
