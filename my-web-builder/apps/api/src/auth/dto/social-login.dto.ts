import { IsIn, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsIn(['google', 'kakao'])
  provider: 'google' | 'kakao';

  @IsString()
  authorizationCode: string;
}
