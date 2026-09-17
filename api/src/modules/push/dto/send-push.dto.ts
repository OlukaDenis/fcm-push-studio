import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TargetType {
  TOKEN = 'token',
  TOPIC = 'topic',
  BROADCAST = 'broadcast',
}

export class AndroidConfigDto {
  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsEnum(['high', 'normal'])
  priority?: 'high' | 'normal';
}

export class ApnsConfigDto {
  @IsOptional()
  @IsNumber()
  badge?: number;

  @IsOptional()
  @IsString()
  sound?: string;
}

export class SendPushDto {
  @IsEnum(TargetType, {
    message: 'targetType must be one of: token, topic, broadcast',
  })
  targetType: TargetType;

  @IsOptional()
  @IsString()
  target?: string; // Token string or topic name. For broadcast, defaults to 'all' if omitted.

  @IsNotEmpty({ message: 'Notification title is required' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Notification body is required' })
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => AndroidConfigDto)
  android?: AndroidConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApnsConfigDto)
  apns?: ApnsConfigDto;
}
