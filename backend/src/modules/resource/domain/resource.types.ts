export interface ResourceProps {
  id: string;
  name: string;
  createdAt: Date;
  type: ResourceType;
  source: Source;
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
  PAPER = 'paper',
  ARTICLE = 'article',
  VIDEO = 'video',
  AUDIO = 'audio',
  UNDEFINED = 'undefined',
}
