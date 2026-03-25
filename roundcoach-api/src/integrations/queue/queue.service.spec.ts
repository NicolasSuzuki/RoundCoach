import { MatchResult } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { AnalysesService } from '../../modules/analyses/services/analyses.service';
import { QueueService } from './queue.service';

const addMock = jest.fn();
const closeMock = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: addMock,
    close: closeMock,
  })),
}));

describe('QueueService', () => {
  let configService: jest.Mocked<ConfigService>;
  let analysesService: jest.Mocked<AnalysesService>;
  let service: QueueService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    configService = {
      get: jest.fn(),
    } as never;

    analysesService = {
      completeWithFakeResult: jest.fn().mockResolvedValue(undefined),
    } as never;

    service = new QueueService(configService, analysesService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules in-process fake processing when provider is stub', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
      if (key === 'queue.provider') {
        return 'stub' as never;
      }

      return defaultValue as never;
    });

    const payload = {
      vodId: 'vod-1',
      matchId: 'match-1',
      userId: 'user-1',
      map: 'Ascent',
      agent: 'Jett',
      result: MatchResult.WIN,
      score: '13-10',
    };

    await service.enqueueVodProcessing(payload);

    expect(analysesService.completeWithFakeResult).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);
    await Promise.resolve();

    expect(analysesService.completeWithFakeResult).toHaveBeenCalledWith(payload);
    expect(Queue).not.toHaveBeenCalled();
  });

  it('publishes a BullMQ job when provider is bullmq', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
      switch (key) {
        case 'queue.provider':
          return 'bullmq' as never;
        case 'queue.redisUrl':
          return 'redis://redis:6379' as never;
        case 'queue.queueName':
          return 'vod-processing' as never;
        default:
          return defaultValue as never;
      }
    });

    addMock.mockResolvedValue(undefined);

    const payload = {
      vodId: 'vod-2',
      matchId: 'match-2',
      userId: 'user-2',
      map: 'Bind',
      agent: 'Omen',
      result: MatchResult.LOSS,
      score: '10-13',
    };

    await service.enqueueVodProcessing(payload);

    expect(Queue).toHaveBeenCalledWith('vod-processing', {
      connection: {
        host: 'redis',
        port: 6379,
        maxRetriesPerRequest: null,
      },
    });
    expect(addMock).toHaveBeenCalledWith('vod-processing', payload, {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 100,
    });
  });

  it('closes the queue on module destroy', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
      switch (key) {
        case 'queue.provider':
          return 'bullmq' as never;
        case 'queue.redisUrl':
          return 'redis://redis:6379' as never;
        case 'queue.queueName':
          return 'vod-processing' as never;
        default:
          return defaultValue as never;
      }
    });

    addMock.mockResolvedValue(undefined);

    await service.enqueueVodProcessing({
      vodId: 'vod-3',
      matchId: 'match-3',
      userId: 'user-3',
      map: 'Split',
      agent: 'Cypher',
      result: MatchResult.WIN,
      score: '13-8',
    });

    await service.onModuleDestroy();

    expect(closeMock).toHaveBeenCalled();
  });
});
