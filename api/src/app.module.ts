import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { PushModule } from './modules/push/push.module';
import { TopicModule } from './modules/topic/topic.module';
import { HistoryModule } from './modules/history/history.module';
import { NotificationHistory } from './modules/history/entities/notification-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.resolve(process.cwd(), 'fcm_testing.sqlite'),
      entities: [NotificationHistory],
      synchronize: true,
    }),
    FirebaseModule,
    PushModule,
    TopicModule,
    HistoryModule,
  ],
})
export class AppModule {}
