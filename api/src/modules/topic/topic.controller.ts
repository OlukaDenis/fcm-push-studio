import { Controller, Post, Body } from '@nestjs/common';
import { TopicService, TopicOperationResult } from './topic.service';
import { TopicSubscriptionDto } from './dto/topic-subscription.dto';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post('subscribe')
  async subscribe(@Body() dto: TopicSubscriptionDto): Promise<TopicOperationResult> {
    return this.topicService.subscribe(dto);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() dto: TopicSubscriptionDto): Promise<TopicOperationResult> {
    return this.topicService.unsubscribe(dto);
  }
}
