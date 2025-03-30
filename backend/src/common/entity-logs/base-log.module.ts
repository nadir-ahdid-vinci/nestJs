import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseLog } from './base-log.entity';
import { BaseLogService } from './base-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([BaseLog])],
  providers: [BaseLogService],
  exports: [BaseLogService],
})
export class BaseLogModule {}
