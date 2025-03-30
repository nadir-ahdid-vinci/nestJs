import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { BaseLogModule } from '../common/entity-logs/base-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), CommonModule, UsersModule, BaseLogModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
