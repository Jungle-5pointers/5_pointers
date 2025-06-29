import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { GeneratorModule } from './generator/generator.module';

import { Users } from './users/entities/users.entity';
import { Pages } from './users/entities/pages.entity';
import { PageMembers } from './users/entities/page_members.entity';
import { Submissions } from './users/entities/submissions.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '0000',
      database: 'jungle',
      entities: [Users, Pages, PageMembers, Submissions],
      synchronize: true, // 개발용
    }),
    AuthModule,
    UsersModule,
    GeneratorModule,
  ],
})
export class AppModule {}