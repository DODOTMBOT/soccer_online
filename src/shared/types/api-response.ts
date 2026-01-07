export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: any;
};