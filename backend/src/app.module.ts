import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { InvitationsModule } from './invitations/invitations.module';
import { EmailModule } from './email/email.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratorModule } from './generator/generator.module';
import { S3Module } from './s3/s3.module';

// 엔티티 import (올바른 경로)
import { Users } from './users/entities/users.entity';
import { Pages } from './users/entities/pages.entity';
import { Templates } from './users/entities/templates.entity';
import { PageMembers } from './users/entities/page_members.entity';
import { Submissions } from './users/entities/submissions.entity';

@Module({
  imports: [
    S3Module,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env'],
      ignoreEnvFile: false, // 프로덕션에서도 .env 파일 로드
      expandVariables: true, // 환경 변수 확장 허용
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '0000',
      database: process.env.DB_DATABASE || 'jungle',
      entities: [Users, Pages, Templates, PageMembers, Submissions],
      synchronize: process.env.DB_SYNCHRONIZE === 'true', // 명시적 제어
      logging: process.env.DB_LOGGING === 'true', // 명시적 제어
    }),
    AuthModule,
    UsersModule,
    TemplatesModule,
    InvitationsModule,
    EmailModule,
    GeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
