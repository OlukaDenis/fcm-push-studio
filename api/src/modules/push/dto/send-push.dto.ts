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

export enum MessageType {
  DISPLAY = 'display',
  DATA_ONLY = 'data-only',
}

export class AndroidConfigDto {
  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsString()
  sound?: string;

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
  @IsOptional()
  @IsEnum(MessageType, {
    message: 'messageType must be either display or data-only',
  })
  messageType?: MessageType;

  @IsEnum(TargetType, {
    message: 'targetType must be one of: token, topic, broadcast',
  })
  targetType: TargetType;

  @IsOptional()
  @IsString()
  target?: string; // Token string or topic name. For broadcast, defaults to 'all' if omitted.

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

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
