import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notification_history')
export class NotificationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  targetType: 'token' | 'topic' | 'broadcast';

  @Column({ type: 'text' })
  target: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  dataPayload?: string; // JSON string

  @Column({ type: 'text', nullable: true })
  platformConfig?: string; // JSON string (Android / APNs)

  @Column({ type: 'varchar', length: 20 })
  status: 'SUCCESS' | 'FAILED';

  @Column({ type: 'text', nullable: true })
  fcmMessageId?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  fullPayload?: string; // Complete JSON payload sent to FCM

  @Column({ type: 'text', nullable: true })
  rawResponse?: string;

  @CreateDateColumn()
  createdAt: Date;
}
