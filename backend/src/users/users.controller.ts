import { Controller, Post, Body, UseGuards, Request, Param, Get, Res } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Post('pages/:pageId/deploy')
  async deployPage(@Request() req, @Body() body: { components: any[]; domain: string }, @Param('pageId') pageId: string) {
    return this.usersService.deployPage(pageId, body.components, body.domain);
  }

  @Get('deployed/:identifier')
  async getDeployedSite(@Param('identifier') identifier: string, @Res() res) {
    const siteData = await this.usersService.getDeployedSite(identifier);
    const html = this.usersService.generateHTML(siteData.components);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}