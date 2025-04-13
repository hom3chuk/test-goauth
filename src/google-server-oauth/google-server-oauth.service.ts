import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { TokenService } from 'src/prisma/token.service'

@Injectable()
export class GoogleServerOauthService {
  private googleOAuth: OAuth2Client
  private readonly logger = new Logger(GoogleServerOauthService.name)

  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {
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

    this.tokenService.createToken({
      state,
    })

    return this.googleOAuth.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      state,
    })
  }

  async getTokenFromState(code: string, state: string) {
    const token = await this.tokenService.token({
      state,
    })

    if (!token) {
      this.logger.error('no token found for state, possible CSRF. ', state)
      throw new Error('no token found')
    }

    const { tokens } = await this.googleOAuth.getToken(code)

    if (!tokens.refresh_token) {
      this.logger.error(
        'no refresh_token from Google. Check if you request `access_type: offline`. ',
        state,
      )
      throw new Error('no refresh token received from Google')
    }

    this.logger.log('got tokens', tokens)
    this.googleOAuth.setCredentials(tokens)

    this.tokenService.updateToken({
      data: {
        refresh_token: tokens.refresh_token,
      },
      where: {
        id: token.id,
      },
    })

    return true
  }

  async getCalendarList() {
    this.logger.log('getCalendarList')
    const cal = google.calendar({
        version: 'v3',
        auth: this.googleOAuth,
    })

    return await cal.calendarList.list()
  }
}
