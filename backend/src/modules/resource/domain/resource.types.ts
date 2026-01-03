export interface Highlight {
  start: number;
  end: number;
}

export interface ResourceProps {
  id: string;
  name: string;
  createdAt: Date;
  type: ResourceType;
  source: Source;
  read: boolean;
  estimatedReadingTime?: number;
  content?: string;
  higlights: Highlight[];
}

export interface CreateResourceProps {
  name: string;
  type: ResourceType;
  source: Source;
}

export interface Source {
  name: string;
  url: string;
}

export enum ResourceType {
  DOCUMENT = 'document',
  TEXT = 'text',
  UNKNOWN = 'unknown',
}
