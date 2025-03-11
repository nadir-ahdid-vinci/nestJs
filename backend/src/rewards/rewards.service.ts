// rewards/rewards.service.ts (Service Récompenses)
import { Injectable, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward) private rewardRepo: Repository<Reward>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Reward[]> {
    try {
      return await this.rewardRepo.find();
    } catch (error) {
      throw new NotFoundException('Could not find rewards');
    }
  }

  async findOne(id: number): Promise<Reward> {
    try {
      const reward = await this.rewardRepo.findOne({ where: { id } });
      if (!reward) {
        throw new NotFoundException(`Reward with id ${id} not found`);
      }
      return reward;
    } catch (error) {
      throw new NotFoundException(`Could not find reward with id ${id}`);
    }
  }

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reward = this.rewardRepo.create(createRewardDto);
      await queryRunner.manager.save(reward);
      await queryRunner.commitTransaction();
      return reward;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException('Could not create reward');
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateRewardDto: CreateRewardDto): Promise<Reward> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reward = await this.rewardRepo.findOne({ where: { id } });
      if (!reward) {
        throw new NotFoundException(`Reward with id ${id} not found`);
      }

      reward.name = updateRewardDto.name;
      reward.description = updateRewardDto.description;
      reward.price = updateRewardDto.price;

      await queryRunner.manager.save(reward);
      await queryRunner.commitTransaction();

      return reward;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException('Could not update reward');
    } finally {
      await queryRunner.release();
    }
  }
}
