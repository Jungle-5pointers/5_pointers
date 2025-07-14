import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Get,
  Res,
  Delete,
  Put,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { S3Service } from '../s3/s3.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as fs from 'fs';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  // 내 페이지 목록 조회 API
  @UseGuards(JwtAuthGuard)
  @Get('pages/my-pages')
  async getMyPages(@Request() req) {
    return this.usersService.getMyPagesForNavigation(req.user.userId, req.query.currentPageId);
  }

  // 페이지 단일 조회 API
  @UseGuards(JwtAuthGuard)
  @Get('pages/:pageId')
  async getPage(@Request() req, @Param('pageId') pageId: string) {
    return this.usersService.getPage(req.user.userId, pageId);
  }

  // 페이지 멤버 목록 조회 API
  @UseGuards(JwtAuthGuard)
  @Get('pages/:pageId/members')
  async getPageMembers(@Request() req, @Param('pageId') pageId: string) {
    return this.usersService.getPageMembers(pageId, req.user.userId);
  }

  // 페이지 제목 수정 API
  @UseGuards(JwtAuthGuard)
  @Patch('pages/:pageId')
  async updatePage(
    @Request() req,
    @Param('pageId') pageId: string,
    @Body() body: { title: string },
  ) {
    return this.usersService.updatePageTitle(req.user.userId, pageId, body.title);
  }

  // 페이지 컨텐츠 업데이트 API (Y.js 백업용)
  @UseGuards(JwtAuthGuard)
  @Put('pages/room/:roomId/content')
  async savePageContent(
    @Param('roomId') roomId: string,
    @Body() body: { components: any[]; canvasSettings: any },
  ) {
    const content = {
      components: body.components || [],
      canvasSettings: body.canvasSettings || {},
    };
    return this.usersService.savePageContentByRoom(roomId, content);
  }

  // 페이지 삭제 API
  @UseGuards(JwtAuthGuard)
  @Delete('pages/:pageId')
  async deletePage(@Request() req, @Param('pageId') pageId: string) {
    return this.usersService.deletePage(req.user.userId, pageId);
  }

  // 페이지 생성 API 리팩토링
  @UseGuards(JwtAuthGuard)
  @Post('pages')
  async createPage(
    @Request() req,
    @Body() body: { subdomain?: string; title?: string; templateId?: string },
  ) {
    return this.usersService.createPage(req.user.userId, body);
  }

  // 🖼️ 이미지 업로드 엔드포인트
  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    try {
      // 환경별 분기 처리
      const isProduction = process.env.NODE_ENV === 'production';
      const useS3 = isProduction || process.env.USE_S3_LOCAL === 'true';

      console.log('🔧 업로드 환경:', {
        isProduction,
        useS3,
        nodeEnv: process.env.NODE_ENV,
        useS3Local: process.env.USE_S3_LOCAL
      });

      let imageUrl: string;

      if (useS3) {
        // S3 업로드
        console.log('📤 S3 업로드 시작...');
        imageUrl = await this.s3Service.uploadImage(file);
        console.log('✅ S3 업로드 완료:', imageUrl);
      } else {
        // 로컬 업로드 (기존 로직)
        console.log('💾 로컬 업로드 시작...');
        imageUrl = await this.uploadToLocal(file);
      }

      return {
        success: true,
        imageUrl: imageUrl,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      console.error('❌ 이미지 업로드 실패:', error);
      throw new BadRequestException('이미지 업로드에 실패했습니다.');
    }
  }

  // 기존 로컬 업로드 로직을 별도 메서드로 분리
  private async uploadToLocal(file: Express.Multer.File): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const uploadPath = join(
      process.cwd(),
      'public',
      'uploads',
      'images',
      String(year),
      month,
      day,
    );

    fs.mkdirSync(uploadPath, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = uniqueSuffix + ext;
    const filePath = join(uploadPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://ddukddak.org'
      : 'http://localhost:3000';

    return `${baseUrl}/uploads/images/${year}/${month}/${day}/${filename}`;
  }

  @Post('pages/:pageId/deploy')
  async deployPage(
    @Body() body: { components: any[]; domain: string },
    @Param('pageId') pageId: string,
  ) {
    return this.usersService.deployPage(pageId, body.components, body.domain);
  }

  
  @Get('test/s3-connection')
  async testS3Connection() {
    try {
      const connectionTest = await this.s3Service.testConnection();
      return {
        success: connectionTest,
        message: connectionTest ? 'S3 연결 성공' : 'S3 연결 실패',
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          useS3Local: process.env.USE_S3_LOCAL,
          hasS3Bucket: !!process.env.AWS_S3_BUCKET_NAME,
          region: process.env.AWS_REGION
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'S3 연결 테스트 실패',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('deployed/:identifier')
  async getDeployedSite(@Param('identifier') identifier: string, @Res() res) {
    const siteData = await this.usersService.getDeployedSite(identifier);
    const html = this.usersService.generateHTML(siteData.components);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  // 댓글 조회
  @Get('pages/:pageId/comments/:componentId')
  async getComments(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.usersService.getComments(pageId, componentId);
  }

  // 댓글 작성
  @Post('pages/:pageId/comments/:componentId')
  async createComment(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @Body() commentData: { author: string; content: string; password: string },
  ) {
    return this.usersService.createComment(pageId, componentId, commentData);
  }

  // 댓글 삭제
  @Delete('pages/:pageId/comments/:componentId/:commentId')
  async deleteComment(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @Param('commentId') commentId: string,
    @Body() body: { password: string },
  ) {
    return this.usersService.deleteComment(
      pageId,
      componentId,
      commentId,
      body.password,
    );
  }

  // Slido 의견 조회
  @Get('pages/:pageId/slido/:componentId')
  async getSlido(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.usersService.getSlido(pageId, componentId);
  }

  // Slido 의견 작성
  @Post('pages/:pageId/slido/:componentId')
  async createSlido(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @Body() slidoData: { content: string },
  ) {
    return this.usersService.createSlido(pageId, componentId, slidoData);
  }

  // 참석 의사 조회
  @Get('pages/:pageId/attendance/:componentId')
  async getAttendance(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.usersService.getAttendance(pageId, componentId);
  }

  // 참석 의사 제출
  @Post('pages/:pageId/attendance/:componentId')
  async createAttendance(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @Body() attendanceData: {
      attendeeName: string;
      attendeeCount: number;
      guestSide: string;
      contact: string;
      companionCount: number;
      mealOption: string;
      privacyConsent: boolean;
    },
  ) {
    return this.usersService.createAttendance(pageId, componentId, attendanceData);
  }

  // 페이지 전체 참석 의사 전달 데이터 조회 (대시보드용)
  @UseGuards(JwtAuthGuard)
  @Get('pages/:pageId/attendance-summary')
  async getAttendanceSummary(
    @Request() req,
    @Param('pageId') pageId: string,
  ) {
    return this.usersService.getAttendanceSummary(req.user.userId, pageId);
  }

  // 🔄 새로고침 복구 시스템 API
  @Get('pages/room/:roomId/content')
  async getPageContent(@Param('roomId') roomId: string) {
    return this.usersService.getPageContentByRoom(roomId);
  }

  /**
   * Page 컴포넌트에서 새 페이지 생성
    return this.usersService.getMyPages(userId);
  }

   * POST /users/pages/create-from-component
   */
  @Post('pages/create-from-component')
  async createPageFromComponent(
    @Body()
    createDto: {
      parentPageId: string;
      componentId: string;
      pageName?: string;
    },
  ) {
    return this.usersService.createPageFromComponent(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('pages/:pageId/design-mode')
  async updateDesignMode(
    @Param('pageId') pageId: string,
    @Body() body: { designMode: 'desktop' | 'mobile' },
  ) {
    return this.usersService.updateDesignMode(pageId, body.designMode);
  }
}
