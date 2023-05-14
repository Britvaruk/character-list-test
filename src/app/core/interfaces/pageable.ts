export interface Pageable<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}