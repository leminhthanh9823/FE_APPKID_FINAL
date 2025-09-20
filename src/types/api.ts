export interface ApiResponse<T> {
  success: boolean;
  message: string;
  status: number;
  errors: any;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}