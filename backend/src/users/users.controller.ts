import { Controller, Post, Body, UseGuards, Request, Param, Get, Res, Delete, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

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
  async updatePage(@Request() req, @Param('pageId') pageId: string, @Body() body: { title: string }) {
    return this.usersService.updatePageTitle(req.user.id, pageId, body.title);
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
  async createPage(@Request() req, @Body() body: { subdomain?: string; title?: string; templateId?: string }) {
    return this.usersService.createPage(req.user.id, body);
  }

  @Post('pages/:pageId/deploy')
  async deployPage(@Body() body: { components: any[]; domain: string }, @Param('pageId') pageId: string) {
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
  async getComments(@Param('pageId') pageId: string, @Param('componentId') componentId: string) {
    return this.usersService.getComments(pageId, componentId);
  }

  // 댓글 작성
  @Post('pages/:pageId/comments/:componentId')
  async createComment(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @Body() commentData: { author: string; content: string; password: string }
  ) {
    return this.usersService.createComment(pageId, componentId, commentData);
  }

  // 댓글 삭제
  @Delete('pages/:pageId/comments/:componentId/:commentId')
  async deleteComment(
    @Param('pageId') pageId: string,
    @Param('componentId') componentId: string,
    @Param('commentId') commentId: string,
    @Body() body: { password: string }
  ) {
    return this.usersService.deleteComment(pageId, componentId, commentId, body.password);
  }
}