import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { TopicSubscriptionDto } from './dto/topic-subscription.dto';

export interface TopicOperationResult {
  success: boolean;
  topic: string;
  successCount: number;
  failureCount: number;
  errors?: Array<{ index: number; error: string }>;
  rawResponse?: any;
}

@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  private extractTokens(dto: TopicSubscriptionDto): string[] {
    const tokens: string[] = [];
    if (dto.token && dto.token.trim()) {
      tokens.push(dto.token.trim());
    }
    if (dto.tokens && Array.isArray(dto.tokens)) {
      for (const t of dto.tokens) {
        if (typeof t === 'string' && t.trim() && !tokens.includes(t.trim())) {
          tokens.push(t.trim());
        }
      }
    }

    if (tokens.length === 0) {
      throw new BadRequestException('At least one device token is required.');
    }
    return tokens;
  }

  async subscribe(dto: TopicSubscriptionDto): Promise<TopicOperationResult> {
    if (!this.firebaseService.isReady()) {
      throw new BadRequestException('Firebase Admin is not configured. Check service-account.json.');
    }

    const topic = dto.topic.trim();
    const tokens = this.extractTokens(dto);
    const messaging = this.firebaseService.getMessaging();

    try {
      this.logger.log(`Subscribing ${tokens.length} token(s) to topic: ${topic}`);
      const response = await messaging.subscribeToTopic(tokens, topic);

      const errors = (response.errors || []).map((e) => ({
        index: e.index,
        error: e.error.message || e.error.code,
      }));

      return {
        success: response.failureCount === 0,
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: errors.length > 0 ? errors : undefined,
        rawResponse: response,
      };
    } catch (err: any) {
      this.logger.error(`Error subscribing to topic ${topic}: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to subscribe tokens to topic');
    }
  }

  async unsubscribe(dto: TopicSubscriptionDto): Promise<TopicOperationResult> {
    if (!this.firebaseService.isReady()) {
      throw new BadRequestException('Firebase Admin is not configured. Check service-account.json.');
    }

    const topic = dto.topic.trim();
    const tokens = this.extractTokens(dto);
    const messaging = this.firebaseService.getMessaging();

    try {
      this.logger.log(`Unsubscribing ${tokens.length} token(s) from topic: ${topic}`);
      const response = await messaging.unsubscribeFromTopic(tokens, topic);

      const errors = (response.errors || []).map((e) => ({
        index: e.index,
        error: e.error.message || e.error.code,
      }));

      return {
        success: response.failureCount === 0,
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: errors.length > 0 ? errors : undefined,
        rawResponse: response,
      };
    } catch (err: any) {
      this.logger.error(`Error unsubscribing from topic ${topic}: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to unsubscribe tokens from topic');
    }
  }
}
