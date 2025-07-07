import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 글로벌 prefix 설정
  app.setGlobalPrefix('api');

  // CORS 허용 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Body parser 설정 - 큰 요청 허용
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 정적 파일 서빙 설정 (수정된 방식)
  const publicPath = join(__dirname, "..", "public");
  // console.log("Static files path:", publicPath);
  
  // uploads 폴더를 직접 서빙
  app.useStaticAssets(join(publicPath, "uploads"), {
    prefix: "/uploads/",
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log("ImageUploadServer-ver.2: Static file serving enabled (v2)");
}
bootstrap();
