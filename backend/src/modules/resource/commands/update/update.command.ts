import { ResourceType } from '@modules/resource/domain/resource.types';

export class UpdateCommand {
  constructor(
    readonly id: string,
    readonly type?: ResourceType,
    readonly name?: string,
    readonly sourceName?: string,
    readonly sourceUrl?: string,
  ) {}
}
