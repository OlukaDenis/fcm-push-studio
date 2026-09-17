import { Controller, Post, Body } from '@nestjs/common';
import { PushService } from './push.service';
import { SendPushDto } from './dto/send-push.dto';
import { SendResult } from '../../common/interfaces/notification-provider.interface';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('send')
  async send(@Body() dto: SendPushDto): Promise<SendResult> {
    return this.pushService.sendPush(dto);
  }
}
