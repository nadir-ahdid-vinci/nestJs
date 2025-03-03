// app.module.ts (Module principal de l'application)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { BugReportsModule } from './bug-reports/bug-reports.module';
import { RewardsModule } from './rewards/rewards.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      database: process.env.DB_NAME || 'bug_bounty',
      autoLoadEntities: true,
      synchronize: true, // À désactiver en production !
    }),
    AuthModule,
    UsersModule,
    ApplicationsModule,
    BugReportsModule,
    RewardsModule,
    OrdersModule,
  ],
})
export class AppModule {}