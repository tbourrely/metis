import {
  CreateResourceProps,
  ResourceProps,
  ResourceType,
  Highlight,
} from './resource.types';

export class ResourceEntity {
  private props: ResourceProps;

  constructor(props: ResourceProps) {
    this.props = props;
  }

  static create(props: CreateResourceProps): ResourceEntity {
    return new ResourceEntity({
      ...props,
      read: false,
      createdAt: new Date(),
      id: crypto.randomUUID(),
      higlights: [],
    });
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get type() {
    return this.props.type;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get source() {
    return this.props.source;
  }

  get read() {
    return this.props.read;
  }

  get estimatedReadingTime() {
    return this.props.estimatedReadingTime;
  }

  get content(): string | undefined {
    return this.props.content;
  }

  get highlights() {
    return this.props.higlights;
  }

  set highlights(highlights: Highlight[]) {
    this.props.higlights = highlights;
  }

  set content(content: string) {
    this.props.content = content;
  }

  set name(name: string) {
    this.props.name = name;
  }

  set type(type: ResourceType) {
    this.props.type = type;
  }

  set source(source: { name: string; url: string }) {
    this.props.source = source;
  }

  set read(read: boolean) {
    this.props.read = read;
  }

  set estimatedReadingTime(minutes: number | undefined) {
    this.props.estimatedReadingTime = minutes;
  }
}
