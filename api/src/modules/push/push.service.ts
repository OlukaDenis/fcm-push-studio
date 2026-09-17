import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { HistoryService } from '../history/history.service';
import {
  INotificationProvider,
  SendResult,
} from '../../common/interfaces/notification-provider.interface';
import { SendPushDto, TargetType } from './dto/send-push.dto';

@Injectable()
export class PushService implements INotificationProvider {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly historyService: HistoryService,
  ) {}

  async sendPush(dto: SendPushDto): Promise<SendResult> {
    if (!this.firebaseService.isReady()) {
      throw new BadRequestException(
        'Firebase Admin is not configured. Please ensure service-account.json is present in the api/ directory.',
      );
    }

    let resolvedTarget = dto.target?.trim() || '';
    if (dto.targetType === TargetType.BROADCAST) {
      resolvedTarget = resolvedTarget || 'all';
    } else if (!resolvedTarget) {
      throw new BadRequestException(
        `A target value (${dto.targetType === TargetType.TOKEN ? 'device token' : 'topic name'}) is required.`,
      );
    }

    // Process data payload (FCM v1 requires all values to be strings)
    let sanitizedData: Record<string, string> | undefined;
    if (dto.data && Object.keys(dto.data).length > 0) {
      sanitizedData = {};
      for (const [key, val] of Object.entries(dto.data)) {
        if (val !== undefined && val !== null) {
          sanitizedData[key] = typeof val === 'string' ? val : JSON.stringify(val);
        }
      }
    }

    // Android configuration
    const androidConfig: admin.messaging.AndroidConfig | undefined = dto.android
      ? {
          priority: dto.android.priority === 'high' ? 'high' : 'normal',
          ...(dto.android.channelId
            ? { notification: { channelId: dto.android.channelId } }
            : {}),
        }
      : undefined;

    // APNs (iOS) configuration
    const apnsConfig: admin.messaging.ApnsConfig | undefined = dto.apns
      ? {
          payload: {
            aps: {
              ...(dto.apns.badge !== undefined ? { badge: dto.apns.badge } : {}),
              sound: dto.apns.sound || 'default',
            },
          },
        }
      : undefined;

    const baseMessage = {
      notification: {
        title: dto.title,
        body: dto.body,
        ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
      },
      ...(sanitizedData ? { data: sanitizedData } : {}),
      ...(androidConfig ? { android: androidConfig } : {}),
      ...(apnsConfig ? { apns: apnsConfig } : {}),
    };

    // Construct discriminated union Message object
    const message: admin.messaging.Message =
      dto.targetType === TargetType.TOKEN
        ? { token: resolvedTarget, ...baseMessage }
        : { topic: resolvedTarget, ...baseMessage };

    const messaging = this.firebaseService.getMessaging();
    const platformConfig = {
      android: dto.android,
      apns: dto.apns,
    };

    try {
      this.logger.log(`Dispatching FCM message to ${dto.targetType}: ${resolvedTarget}`);
      const messageId = await messaging.send(message);
      this.logger.log(`FCM Message sent successfully with ID: ${messageId}`);

      // Record success to SQLite history
      await this.historyService.create({
        targetType: dto.targetType,
        target: resolvedTarget,
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        dataPayload: dto.data,
        platformConfig,
        status: 'SUCCESS',
        fcmMessageId: messageId,
        rawResponse: { messageId },
      });

      return {
        success: true,
        messageId,
        targetType: dto.targetType,
        target: resolvedTarget,
        rawResponse: { messageId },
      };
    } catch (err: any) {
      const fcmErrorCode = err.code || err.errorInfo?.code || 'UNKNOWN_FCM_ERROR';
      const errorMessage = err.message || 'Unknown error occurred while sending push';
      this.logger.error(`FCM send failure [${fcmErrorCode}]: ${errorMessage}`);

      // Record failure to SQLite history
      await this.historyService.create({
        targetType: dto.targetType,
        target: resolvedTarget,
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        dataPayload: dto.data,
        platformConfig,
        status: 'FAILED',
        errorMessage: `[${fcmErrorCode}] ${errorMessage}`,
        rawResponse: err.errorInfo || err,
      });

      return {
        success: false,
        targetType: dto.targetType,
        target: resolvedTarget,
        error: `[${fcmErrorCode}] ${errorMessage}`,
        rawResponse: err.errorInfo || { code: fcmErrorCode, message: errorMessage },
      };
    }
  }
}
