import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity'
import { Pages } from './entities/pages.entity'
import { Submissions } from './entities/submissions.entity'
import { PageMembers } from './entities/page_members.entity'
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Pages, Submissions, PageMembers])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}