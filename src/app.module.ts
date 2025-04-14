import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GoogleServerOauthModule } from './google-server-oauth/google-server-oauth.module'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { AuthService } from './auth/auth.service'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [ConfigModule.forRoot(), GoogleServerOauthModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthService],
})
export class AppModule {}
