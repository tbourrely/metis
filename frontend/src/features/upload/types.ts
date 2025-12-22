export type ImportDTO = {
  urls: string[];
};

export type ImportError = {
  url: string;
  error: string;
};

export type ImportResult = {
  created: string[];
  errors: ImportError[];
};
