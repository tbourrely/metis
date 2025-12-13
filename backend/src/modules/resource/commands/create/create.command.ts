import { ResourceType } from '@modules/resource/domain/resource.types';

export class CreateCommand {
  constructor(
    readonly type: ResourceType,
    readonly name: string,
    readonly sourceName: string,
    readonly sourceUrl: string,
  ) {}
}
