import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationHistory } from './entities/notification-history.entity';

export interface CreateHistoryDto {
  targetType: 'token' | 'topic' | 'broadcast';
  target: string;
  title: string;
  body: string;
  imageUrl?: string;
  dataPayload?: any;
  platformConfig?: any;
  fullPayload?: any;
  status: 'SUCCESS' | 'FAILED';
  fcmMessageId?: string;
  errorMessage?: string;
  rawResponse?: any;
}

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(NotificationHistory)
    private readonly historyRepo: Repository<NotificationHistory>,
  ) {}

  async create(data: CreateHistoryDto): Promise<NotificationHistory> {
    try {
      const record = this.historyRepo.create({
        targetType: data.targetType,
        target: data.target,
        title: data.title,
        body: data.body,
        imageUrl: data.imageUrl || undefined,
        dataPayload: data.dataPayload ? JSON.stringify(data.dataPayload) : undefined,
        platformConfig: data.platformConfig ? JSON.stringify(data.platformConfig) : undefined,
        fullPayload: data.fullPayload ? JSON.stringify(data.fullPayload) : undefined,
        status: data.status,
        fcmMessageId: data.fcmMessageId,
        errorMessage: data.errorMessage,
        rawResponse: data.rawResponse ? JSON.stringify(data.rawResponse) : undefined,
      });

      return await this.historyRepo.save(record);
    } catch (err: any) {
      this.logger.error(`Failed to save notification history: ${err.message}`);
      throw err;
    }
  }

  async findAll(limit = 50, offset = 0, targetType?: string, status?: string): Promise<{ items: NotificationHistory[]; total: number }> {
    const query = this.historyRepo.createQueryBuilder('h');

    if (targetType) {
      query.andWhere('h.targetType = :targetType', { targetType });
    }

    if (status) {
      query.andWhere('h.status = :status', { status });
    }

    query.orderBy('h.createdAt', 'DESC');
    query.skip(offset);
    query.take(limit);

    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }

  async findOne(id: number): Promise<NotificationHistory | null> {
    return this.historyRepo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.historyRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async clearAll(): Promise<void> {
    await this.historyRepo.clear();
  }
}
