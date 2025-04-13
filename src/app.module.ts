import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GoogleServerOauthModule } from './google-server-oauth/google-server-oauth.module'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'

@Module({
  imports: [ConfigModule.forRoot(), GoogleServerOauthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
