import { Controller, Post, Body, UseGuards, Request, Param, Get, Res, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('pages')
  async createPage(@Request() req, @Body() body: { subdomain: string; title?: string }) {
    console.log('JWT User from request:', req.user);
    console.log('User ID:', req.user.id, 'Type:', typeof req.user.id);
    return this.usersService.createPage(req.user.id, body.subdomain, body.title);
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