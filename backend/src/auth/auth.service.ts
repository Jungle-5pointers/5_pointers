import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
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

    // console.log('Login - User object:', user);
    // console.log('Login - User ID:', user.id, 'Type:', typeof user.id);

    const payload = { userId: user.id, email: user.email, nickname: user.nickname, role: user.role };
    // console.log('Login - JWT payload:', payload);
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
    // 이메일 중복 체크
    const existingUser = await this.userRepository.findOne({ 
      where: { email: dto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 닉네임 중복 체크
    const existingNickname = await this.userRepository.findOne({ 
      where: { nickname: dto.nickname } 
    });
    
    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('올바른 이메일 형식을 입력해주세요.');
    }

    // 비밀번호 길이 검증
    if (dto.password.length < 6) {
      throw new BadRequestException('비밀번호는 최소 6자 이상이어야 합니다.');
    }

    // 닉네임 길이 검증
    if (dto.nickname.length < 2 || dto.nickname.length > 20) {
      throw new BadRequestException('닉네임은 2자 이상 20자 이하여야 합니다.');
    }

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
    console.log('loginSocial 시작:', { provider: dto.provider, codeLength: dto.authorizationCode?.length });
    
    let profile: { email: string; nickname: string; provider_id: string; provider: AuthProvider };

    try {
      switch (dto.provider) {
        case 'google':
          console.log('Google 로그인 처리 시작');
          profile = await this.getGoogleProfile(dto.authorizationCode);
          break;
        case 'kakao':
          console.log('Kakao 로그인 처리 시작');
          profile = await this.getKakaoProfile(dto.authorizationCode);
          break;
        default:
          throw new BadRequestException('지원하지 않는 소셜 로그인입니다.');
      }

      console.log('소셜 프로필 정보:', profile);
      const user = await this.findOrCreateUser(profile);
      console.log('사용자 정보:', { id: user.id, email: user.email, nickname: user.nickname });
      
      return this.login(user);
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
      throw error;
    }
  }

  private async getGoogleProfile(code: string) {
    console.log('getGoogleProfile 시작, 환경 변수 확인:', {
      clientId: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '설정되지 않음',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '설정되지 않음',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ? '설정됨' : '설정되지 않음'
    });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
      throw new BadRequestException('Google OAuth 설정이 완료되지 않았습니다.');
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL,
      );
      
      console.log('Google OAuth2 클라이언트 생성 완료');
      const { tokens } = await oauth2Client.getToken(code);
      console.log('Google 액세스 토큰 획득 완료');
      
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      console.log('Google 사용자 정보 획득 완료:', { email: data.email, name: data.name, id: data.id });

      return {
        email: data.email,
        nickname: data.name || data.email.split('@')[0],
        provider_id: data.id,
        provider: AuthProvider.GOOGLE,
      };
    } catch (error) {
      console.error('Google 프로필 가져오기 오류:', error);
      if (error.response) {
        console.error('Google API 응답 오류:', error.response.data);
      }
      throw new BadRequestException('Google 로그인 처리 중 오류가 발생했습니다.');
    }
  }

  private async getKakaoProfile(code: string) {
    console.log('getKakaoProfile 시작, 환경 변수 확인:', {
      clientId: process.env.KAKAO_CLIENT_ID ? '설정됨' : '설정되지 않음',
      clientSecret: process.env.KAKAO_CLIENT_SECRET ? '설정됨' : '설정되지 않음',
      callbackUrl: process.env.KAKAO_CALLBACK_URL ? '설정됨' : '설정되지 않음'
    });

    if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_CLIENT_SECRET || !process.env.KAKAO_CALLBACK_URL) {
      throw new BadRequestException('Kakao OAuth 설정이 완료되지 않았습니다.');
    }

    try {
      console.log('Kakao 액세스 토큰 요청 시작');
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
      
      console.log('Kakao 액세스 토큰 획득 완료');
      const accessToken = (tokenRes.data as { access_token: string }).access_token;

      console.log('Kakao 사용자 정보 요청 시작');
      const profileRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      console.log('Kakao 사용자 정보 획득 완료:', profileRes.data);
      const kakaoAccount = (profileRes.data as any).kakao_account;

      if (!kakaoAccount || !kakaoAccount.email) {
        throw new BadRequestException('Kakao 계정에서 이메일 정보를 가져올 수 없습니다. 이메일 제공 동의가 필요합니다.');
      }

      return {
        email: kakaoAccount.email,
        nickname: kakaoAccount.profile.nickname,
        provider_id: String((profileRes.data as any).id),
        provider: AuthProvider.KAKAO,
      };
    } catch (error) {
      console.error('Kakao 프로필 가져오기 오류:', error);
      if (error.response) {
        console.error('Kakao API 응답 오류:', error.response.data);
      }
      throw new BadRequestException('Kakao 로그인 처리 중 오류가 발생했습니다.');
    }
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