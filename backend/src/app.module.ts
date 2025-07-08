import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { InvitationsModule } from './invitations/invitations.module';
import { GeneratorModule } from './generator/generator.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubdomainService } from './subdomain/subdomain.service';
import { SubdomainMiddleware } from './common/middleware/subdomain.middleware';

import { Users } from './users/entities/users.entity';
import { Pages } from './users/entities/pages.entity';
import { PageMembers } from './users/entities/page_members.entity';
import { Submissions } from './users/entities/submissions.entity';
import { Templates } from './users/entities/templates.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '0000', 
      database: process.env.DB_DATABASE || 'jungle',
      entities: [Users, Pages, PageMembers, Submissions, Templates],
      synchronize: true, // 개발 단계에서는 true 유지
      logging: false,
    }),
    TypeOrmModule.forFeature([Pages, Users]), // 서브도메인 서비스를 위한 엔티티
    AuthModule,
    UsersModule,
    TemplatesModule,
    InvitationsModule,
    GeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService, SubdomainService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SubdomainMiddleware)
      .forRoutes('*'); // 모든 라우트에 서브도메인 미들웨어 적용
  }
}