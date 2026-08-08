export interface DictionaryEntry {
  id: string;
  arabicWord: string;
  yazidiWord: string;
  createdAt: string;
  updatedAt: string;
}

export type SearchMode = 'all' | 'arabic' | 'yazidi';
export type ViewMode = 'grid' | 'table';

export interface DictionaryApiResponse {
  success: boolean;
  entries: DictionaryEntry[];
  total: number;
  page: number;
  totalPages: number;
  stats?: {
    totalWords: number;
    arabicCount: number;
    yazidiCount: number;
    yazidiScriptCount: number;
  };
}

export interface CsvRowPreview {
  rowIndex: number;
  arabicWord: string;
  yazidiWord: string;
  isValid: boolean;
  error?: string;
}

export interface ImportSummary {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
