import { Module } from '@nestjs/common'
import { GoogleServerOauthController } from './google-server-oauth.controller'
import { GoogleServerOauthService } from './google-server-oauth.service'
import { ConfigModule } from '@nestjs/config'
import { TokenService } from './../prisma/token.service'
import { PrismaService } from './../prisma/prisma.service'
import { UserService } from './../prisma/user.service'

@Module({
  controllers: [GoogleServerOauthController],
  imports: [ConfigModule],
  providers: [
    GoogleServerOauthService,
    PrismaService,
    TokenService,
    UserService,
  ],
})
export class GoogleServerOauthModule {}
