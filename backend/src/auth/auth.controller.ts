import { Controller, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { SocialLoginDto } from './dto/social-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/local')
  async signupLocal(
    @Body() dto: { email: string; password: string; nickname: string }
  ) {
    try {
      return await this.authService.signupLocal(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('회원가입 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async loginLocal(@Request() req) {
    try {
      // req.user는 LocalStrategy의 validate()에서 반환한 user 객체
      return await this.authService.login(req.user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('로그인 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login/social')
  async loginSocial(@Body() dto: SocialLoginDto) {
    try {
      return await this.authService.loginSocial(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('소셜 로그인 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ... (아래에 로그인 엔드포인트 추가)
}