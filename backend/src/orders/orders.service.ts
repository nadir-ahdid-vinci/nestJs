// orders/orders.service.ts (Service Commandes)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {}

  findAll(): Promise<Order[]> {
    return this.orderRepo.find({ relations: ['user', 'reward'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user', 'reward'] });
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }
}