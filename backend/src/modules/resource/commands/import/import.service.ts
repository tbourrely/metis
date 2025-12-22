import { CommandHandler, CommandBus } from '@nestjs/cqrs';
import { ImportCommand } from './import.command';
import { Result, Ok, match } from 'oxide.ts';
import { CreateCommand } from '../create/create.command';

type ImportResult = {
  created: string[];
  errors: { url: string; error: string }[];
};

@CommandHandler(ImportCommand)
export class ImportService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ImportCommand): Promise<Result<ImportResult, Error>> {
    const promises: Promise<Result<string, Error>>[] = command.items.map(
      (url) => this.commandBus.execute(new CreateCommand(url)),
    );

    const settled = await Promise.allSettled(promises);
    const created: string[] = [];
    const errors: { url: string; error: string }[] = [];

    settled.forEach((s, i) => {
      const url = command.items[i];

      if (s.status === 'rejected') {
        errors.push({
          url,
          error: String(s.reason),
        });
        return;
      }

      match(s.value, {
        Ok: () => created.push(url),
        Err: (err) =>
          errors.push({
            url,
            error: err.message,
          }),
      });
    });

    return Ok({ created, errors });
  }
}
