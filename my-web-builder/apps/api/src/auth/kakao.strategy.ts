import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthProvider } from '../users/entities/users.entity';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private usersService: UsersService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    const { id, _json } = profile;
    let user = await this.usersService.findBySocial(AuthProvider.KAKAO, id);
    if (!user) {
      user = await this.usersService.createSocialUser(AuthProvider.KAKAO, id, _json.kakao_account.email);
    }
    done(null, user);
  }
}