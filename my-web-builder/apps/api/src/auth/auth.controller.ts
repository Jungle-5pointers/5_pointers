import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
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
    return this.authService.signupLocal(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async loginLocal(@Request() req) {
    // req.user는 LocalStrategy의 validate()에서 반환한 user 객체
    return this.authService.login(req.user);
  }

  @Post('login/social')
  async loginSocial(@Body() dto: SocialLoginDto) {
    return this.authService.loginSocial(dto);
  }

  // ... (아래에 로그인 엔드포인트 추가)
}