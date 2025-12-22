import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { ImportCommand } from './import.command';
import { CommandBus } from '@nestjs/cqrs';
import { Ok, Err } from 'oxide.ts';
import { CreateCommand } from '../create/create.command';

describe('ImportService', () => {
  let service: ImportService;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute create for each url and return created ids when all succeed', async () => {
    (commandBus.execute as jest.Mock).mockImplementation((cmd: CreateCommand) =>
      Promise.resolve(Ok(`id-for-${cmd.sourceUrl}`)),
    );

    const command = new ImportCommand(['http://a', 'http://b']);

    const result = await service.execute(command);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.unwrap()).toEqual({
        created: ['http://a', 'http://b'],
        errors: [],
      });
    }

    expect((commandBus.execute as jest.Mock).mock.calls.length).toBe(2);
  });

  it('should collect only successful creations and return errors for failures', async () => {
    (commandBus.execute as jest.Mock).mockImplementation(
      (cmd: CreateCommand) => {
        if (cmd.sourceUrl === 'http://fail')
          return Promise.resolve(Err(new Error('fail')));
        return Promise.resolve(Ok(`id-${cmd.sourceUrl}`));
      },
    );

    const command = new ImportCommand([
      'http://ok',
      'http://fail',
      'http://ok2',
    ]);

    const result = await service.execute(command);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const data = result.unwrap();
      expect(data.created).toEqual(['http://ok', 'http://ok2']);
      expect(data.errors.length).toBe(1);
      expect(data.errors[0].url).toBe('http://fail');
      expect(data.errors[0].error).toContain('fail');
    }

    expect((commandBus.execute as jest.Mock).mock.calls.length).toBe(3);
  });

  it('should record errors when command execution rejects', async () => {
    (commandBus.execute as jest.Mock).mockImplementation(
      (cmd: CreateCommand) => {
        if (cmd.sourceUrl === 'http://reject')
          return Promise.reject(new Error('boom'));
        return Promise.resolve(Ok(`id-${cmd.sourceUrl}`));
      },
    );

    const command = new ImportCommand(['http://ok', 'http://reject']);

    const result = await service.execute(command);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const data = result.unwrap();
      expect(data.created).toEqual(['http://ok']);
      expect(data.errors.length).toBe(1);
      expect(data.errors[0].url).toBe('http://reject');
      expect(data.errors[0].error).toContain('boom');
    }

    expect((commandBus.execute as jest.Mock).mock.calls.length).toBe(2);
  });
});
