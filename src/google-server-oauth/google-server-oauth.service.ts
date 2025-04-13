import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { TokenService } from 'src/prisma/token.service'
import { UserService } from 'src/prisma/user.service'

@Injectable()
export class GoogleServerOauthService {
  private googleOAuth: OAuth2Client
  private readonly logger = new Logger(GoogleServerOauthService.name)

  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    private userService: UserService,
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

    this.logger.log(state)

    return this.googleOAuth.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email ',
      ],
      state,
    })
  }

  async getTokenFromCode(code: string) {
    this.logger.log('getTokenFromState')

    const { tokens } = await this.googleOAuth.getToken(code)

    if (!tokens.access_token || !tokens.id_token) {
      throw new Error('no tokens received from Google')
    }

    this.logger.log('got tokens', tokens)
    this.googleOAuth.setCredentials(tokens)

    const googleId = (
      await this.googleOAuth.verifyIdToken({ idToken: tokens.id_token })
    ).getUserId()

    if (!googleId) {
      throw new Error('no tokens received from Google')
    }

    let user = await this.userService.user({ googleId })

    if (!user) {
      this.logger.log('creating new user')
      user = await this.userService.createUser({ googleId })
    }
    if (!user.token) {
      this.logger.log('creating token for user')
      const userToken = await this.tokenService.createToken({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope || '',
        user: {
          connect: user,
        },
      })
    } else {
      this.logger.log('updating token for user')
      await this.tokenService.updateToken({
        data: {
          access_token: tokens.access_token || user.token.access_token,
          refresh_token: tokens.refresh_token || user.token.refresh_token,
          scope: tokens.scope || user.token.scope,
        },
        where: {
          id: user.token.id,
        },
      })
    }

    this.logger.log('user')
    this.logger.log(user)
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
