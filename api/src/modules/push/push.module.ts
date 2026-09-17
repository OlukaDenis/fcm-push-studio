import { Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { NOTIFICATION_PROVIDER } from '../../common/interfaces/notification-provider.interface';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [HistoryModule],
  controllers: [PushController],
  providers: [
    PushService,
    {
      provide: NOTIFICATION_PROVIDER,
      useExisting: PushService,
    },
  ],
  exports: [PushService, NOTIFICATION_PROVIDER],
})
export class PushModule {}
