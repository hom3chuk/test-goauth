import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

@Injectable()
export class GoogleServerOauthService {
  private googleOAuth: OAuth2Client
  private readonly logger = new Logger(GoogleServerOauthService.name)

  constructor(private configService: ConfigService) {
    this.googleOAuth = new google.auth.OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      this.configService.get('REDIRECT_URL'),
    )
    this.logger.log(this.configService.get('CLIENT_ID'))
    this.logger.log(this.configService.get('CLIENT_SECRET'))
    this.logger.log(this.configService.get('REDIRECT_URL'))
  }

  getAuthUrl() {
    const state = crypto.randomBytes(32).toString('hex')

    return this.googleOAuth.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      state,
    })
  }
}
