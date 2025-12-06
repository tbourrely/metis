import { CommandProps } from '@libs/ddd/command';

export class CreateCommand {
  readonly type: string;
  readonly name: string;
  readonly sourceName: string;
  readonly sourceUrl: string;

  constructor(props: CommandProps<CreateCommand>) {
    this.type = props.type;
    this.name = props.name;
    this.sourceName = props.sourceName;
    this.sourceUrl = props.sourceUrl;
  }
}
