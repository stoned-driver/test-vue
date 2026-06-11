export type SortDirection = 'asc' | 'desc'

export interface SortState<T> {
  key: keyof T
  direction: SortDirection
}

export type AriaSort = 'ascending' | 'descending' | 'none'
