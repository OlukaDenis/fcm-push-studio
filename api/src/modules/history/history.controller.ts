import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async findAll(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('targetType') targetType?: string,
    @Query('status') status?: string,
    @Query('messageType') messageType?: string,
  ) {
    return this.historyService.findAll(
      parseInt(limit, 10) || 50,
      parseInt(offset, 10) || 0,
      targetType,
      status,
      messageType,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.historyService.findOne(id);
    if (!item) {
      throw new NotFoundException(`History item with id ${id} not found`);
    }
    return item;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.historyService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`History item with id ${id} not found`);
    }
    return { success: true, message: `History item ${id} deleted` };
  }

  @Delete()
  async clearAll() {
    await this.historyService.clearAll();
    return { success: true, message: 'All notification history cleared' };
  }
}
