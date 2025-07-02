import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Users, AuthProvider } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async login(user: Users) {

    console.log('Login - User object:', user);
    console.log('Login - User ID:', user.id, 'Type:', typeof user.id);

    const payload = { userId: user.id, email: user.email, nickname: user.nickname, role: user.role };
    console.log('Login - JWT payload:', payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async socialLogin(user: any) {
    const payload = { userId: user.id, email: user.email, nickname: user.nickname, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signupLocal(dto: { email: string; password: string; nickname: string }) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
      nickname: dto.nickname,
      provider: AuthProvider.LOCAL,
    });
    await this.userRepository.save(user);
    return { message: '회원가입 성공' };
  }

  async loginSocial(dto: { provider: 'google' | 'kakao'; authorizationCode: string }) {
    let profile: { email: string; nickname: string; provider_id: string; provider: AuthProvider };

    switch (dto.provider) {
      case 'google':
        profile = await this.getGoogleProfile(dto.authorizationCode);
        break;
      case 'kakao':
        profile = await this.getKakaoProfile(dto.authorizationCode);
        break;
      default:
        throw new BadRequestException('지원하지 않는 소셜 로그인입니다.');
    }

    const user = await this.findOrCreateUser(profile);
    return this.login(user);
  }

  private async getGoogleProfile(code: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return {
      email: data.email,
      nickname: data.name || data.email.split('@')[0],
      provider_id: data.id,
      provider: AuthProvider.GOOGLE,
    };
  }

  private async getKakaoProfile(code: string) {
    console.log('getKakaoProfile called!');
    console.log({
      client_id: process.env.KAKAO_CLIENT_ID,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri: process.env.KAKAO_CALLBACK_URL,
      code,
    });
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_CALLBACK_URL,
        code,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    const accessToken = (tokenRes.data as { access_token: string }).access_token;

    const profileRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const kakaoAccount = (profileRes.data as any).kakao_account;

    return {
      email: kakaoAccount.email,
      nickname: kakaoAccount.profile.nickname,
      provider_id: String((profileRes.data as any).id),
      provider: AuthProvider.KAKAO,
    };
  }

  async findOrCreateUser(profile: { email: string; nickname: string; provider_id: string; provider: AuthProvider }) {
    console.log('findOrCreateUser profile:', profile);
    let user = await this.userRepository.findOne({
      where: { provider: profile.provider, provider_id: profile.provider_id },
    });
    if (user) return user;

    user = await this.userRepository.findOne({ where: { email: profile.email } });
    if (user) {
      user.provider = profile.provider;
      user.provider_id = profile.provider_id;
      await this.userRepository.save(user);
      return user;
    }

    user = this.userRepository.create({
      email: profile.email,
      nickname: profile.nickname,
      provider: profile.provider,
      provider_id: profile.provider_id,
    });
    await this.userRepository.save(user);
    return user;
  }
}