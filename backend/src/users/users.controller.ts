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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as fs from 'fs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 내 페이지 목록 조회 API
  @UseGuards(JwtAuthGuard)
  @Get('pages/my-pages')
  async getMyPages(@Request() req) {
    return this.usersService.getMyPages(req.user.id);
  }

  // 페이지 단일 조회 API
  @UseGuards(JwtAuthGuard)
  @Get('pages/:pageId')
  async getPage(@Request() req, @Param('pageId') pageId: string) {
    return this.usersService.getPage(req.user.id, pageId);
  }

  // 페이지 제목 수정 API
  @UseGuards(JwtAuthGuard)
  @Patch('pages/:pageId')
  async updatePage(
    @Request() req,
    @Param('pageId') pageId: string,
    @Body() body: { title: string },
  ) {
    return this.usersService.updatePageTitle(req.user.id, pageId, body.title);
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
    return this.usersService.deletePage(req.user.id, pageId);
  }

  // 페이지 생성 API 리팩토링
  @UseGuards(JwtAuthGuard)
  @Post('pages')
  async createPage(
    @Request() req,
    @Body() body: { subdomain?: string; title?: string; templateId?: string },
  ) {
    return this.usersService.createPage(req.user.id, body);
  }

  // 🖼️ 이미지 업로드 엔드포인트
  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
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
          
          // 디렉토리 생성 (동기적으로)

          fs.mkdirSync(uploadPath, { recursive: true });
          
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, uniqueSuffix + ext);
        },
      }),
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
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const imageUrl = `/uploads/images/${year}/${month}/${day}/${file.filename}`;

    return {
      success: true,
      imageUrl: imageUrl,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Post('pages/:pageId/deploy')
  async deployPage(
    @Body() body: { components: any[]; domain: string },
    @Param('pageId') pageId: string,
  ) {
    return this.usersService.deployPage(pageId, body.components, body.domain);
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

  // 🔄 새로고침 복구 시스템 API
  @Get('pages/room/:roomId/content')
  async getPageContent(@Param('roomId') roomId: string) {
    return this.usersService.getPageContentByRoom(roomId);
  }

  /**
   * Page 컴포넌트에서 새 페이지 생성
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
    console.log('🆕 Page 컴포넌트에서 페이지 생성 요청:', createDto);
    return this.usersService.createPageFromComponent(createDto);
  }
}
