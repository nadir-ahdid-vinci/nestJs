// rewards/rewards.controller.ts (Contrôleur Récompenses)
import { Controller, Get, Param } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';

@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get()
  findAll(): Promise<Reward[]> {
    return this.rewardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Reward> {
    return this.rewardsService.findOne(id);
  }
}