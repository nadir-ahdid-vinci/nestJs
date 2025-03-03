// rewards/rewards.controller.ts (Contrôleur Récompenses)
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';

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

  @Post()
  create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardsService.create(createRewardDto);
  }
}