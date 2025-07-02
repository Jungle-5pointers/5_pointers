import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { Pages } from '../users/entities/pages.entity';
import { Submissions } from '../users/entities/submissions.entity';

/**
 * 노코드 에디터 배포 모듈
 * - 컴포넌트를 HTML로 변환하여 서브도메인에 배포하는 기능
 * - Pages, Submissions 엔티티를 사용하여 배포 정보 관리
 */
@Module({
  imports: [
    // Pages와 Submissions 테이블에 접근하기 위한 TypeORM 설정
    TypeOrmModule.forFeature([Pages, Submissions])
  ],
  controllers: [GeneratorController], // 배포 API 엔드포인트
  providers: [GeneratorService],      // 배포 비즈니스 로직
})
export class GeneratorModule {}