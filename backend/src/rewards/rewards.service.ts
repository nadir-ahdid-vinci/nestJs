// rewards/rewards.service.ts (Service Récompenses)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardsService {
  constructor(@InjectRepository(Reward) private rewardRepo: Repository<Reward>) {}

  findAll(): Promise<Reward[]> {
    return this.rewardRepo.find();
  }

  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) {
      throw new Error(`Reward with id ${id} not found`);
    }
    return reward;
  }
}
