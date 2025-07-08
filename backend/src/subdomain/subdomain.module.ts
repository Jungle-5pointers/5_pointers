import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubdomainController } from './subdomain.controller';
import { SubdomainService } from './subdomain.service';
import { Pages } from '../users/entities/pages.entity';
import { Users } from '../users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pages, Users])
  ],
  controllers: [SubdomainController],
  providers: [SubdomainService],
  exports: [SubdomainService]
})
export class SubdomainModule {}
