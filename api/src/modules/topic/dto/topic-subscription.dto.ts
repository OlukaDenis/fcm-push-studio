import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class TopicSubscriptionDto {
  @IsNotEmpty({ message: 'Topic name is required' })
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tokens?: string[];
}
