import { Module } from '@nestjs/common'
import { GoogleServerOauthController } from './google-server-oauth.controller'
import { GoogleServerOauthService } from './google-server-oauth.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  controllers: [GoogleServerOauthController],
  imports: [ConfigModule],
  providers: [GoogleServerOauthService],
})
export class GoogleServerOauthModule {}
