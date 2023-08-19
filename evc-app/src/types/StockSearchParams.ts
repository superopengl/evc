
export type StockSearchParams = {
  symbols?: string[];
  text?: string;
  tags?: string[];
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
  watchOnly?: boolean;
  noCount?: boolean;
  overValued?: boolean;
  underValued?: boolean;
  inValued?: boolean;
};
