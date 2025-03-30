import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './services/storage.service';
import { BaseLogService } from './entity-logs/base-log.service';
import { BaseLog } from './entity-logs/base-log.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([BaseLog]),
  ],
  providers: [StorageService, BaseLogService],
  exports: [StorageService, BaseLogService],
})
export class CommonModule {}
