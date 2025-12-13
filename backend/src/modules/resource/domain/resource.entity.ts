import { CreateResourceProps, ResourceProps } from './resource.types';

export class ResourceEntity {
  private props: ResourceProps;

  constructor(props: ResourceProps) {
    this.props = props;
  }

  static create(props: CreateResourceProps): ResourceEntity {
    return new ResourceEntity({
      ...props,
      createdAt: new Date(),
      id: crypto.randomUUID(),
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
}
