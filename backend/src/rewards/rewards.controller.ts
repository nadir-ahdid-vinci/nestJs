// rewards/rewards.controller.ts (Contrôleur Récompenses)
import { Controller, Get, Param, Post, Body, Patch, ParseIntPipe } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get()
  @Role('HUNTER')
  async findAll(): Promise<Reward[]> {
    try {
      return await this.rewardsService.findAll();
    } catch (error) {
      throw new HttpException(`Error fetching rewards: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Reward> {
    try {
      return await this.rewardsService.findOne(id);
    } catch (error) {
      throw new HttpException(`Error fetching reward with id ${id}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      return await this.rewardsService.create(createRewardDto);
    } catch (error) {
      throw new HttpException(`Error creating reward: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      return await this.rewardsService.update(id, updateRewardDto);
    } catch (error) {
      throw new HttpException(`Error updating reward with id ${id}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}