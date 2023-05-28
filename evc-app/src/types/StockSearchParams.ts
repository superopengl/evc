
export type StockSearchParams = {
  symbols?: string[];
  text?: string;
  tags?: string[];
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
  skip?: number;
  limit?: number;
};
