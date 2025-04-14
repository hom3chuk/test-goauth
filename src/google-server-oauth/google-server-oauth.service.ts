import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { Credentials, OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { AuthService } from 'src/auth/auth.service'
import { TokenService } from 'src/prisma/token.service'
import { UserService, UserWithToken } from 'src/prisma/user.service'

@Injectable()
export class GoogleServerOauthService {
  private googleOAuth: OAuth2Client
  private readonly logger = new Logger(GoogleServerOauthService.name)
  private scope = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ]

  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    private userService: UserService,
    private authService: AuthService,
  ) {
    this.googleOAuth = new google.auth.OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      this.configService.get('REDIRECT_URL'),
    )
  }

  getAuthUrl() {
    const state = crypto.randomBytes(32).toString('hex')

    return this.googleOAuth.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      scope: this.scope,
      state,
    })
  }

  private checkScope = (googleScope: string) => {
    const scopes = this.scope.filter((s) => googleScope.indexOf(s) === -1)
    this.logger.log(googleScope)
    this.logger.log(scopes)

    if (scopes.length)
      throw new UnauthorizedException([
        'some required scopes are missing:',
        scopes,
      ])
  }

  private processUser = async (
    user: UserWithToken | null,
    tokens: Credentials,
    googleId: string,
  ): Promise<UserWithToken> => {
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

    return user
  }

  async getTokenFromCode(code: string) {
    this.logger.log('getTokenFromState')

    const { tokens } = await this.googleOAuth.getToken(code)

    if (!tokens.access_token || !tokens.id_token) {
      throw new UnauthorizedException('no tokens received from Google')
    }

    if (!tokens.scope) throw new UnauthorizedException('no scopes')

    this.checkScope(tokens.scope)

    this.logger.log('got tokens', tokens)
    this.googleOAuth.setCredentials(tokens)

    const googleId = (
      await this.googleOAuth.verifyIdToken({ idToken: tokens.id_token })
    ).getUserId()

    if (!googleId) {
      throw new UnauthorizedException('no ID received from Google')
    }

    let user: UserWithToken | null = await this.userService.user({ googleId })

    user = await this.processUser(user, tokens, googleId)

    this.logger.log('user')
    this.logger.log(user)
    return this.authService.authenticate(user)
  }

  async getCalendarList(userId: string) {
    this.logger.log('getCalendarList')
    const user = await this.userService.user({ id: userId })
    if (!user || !user.token) throw UnauthorizedException

    this.googleOAuth.setCredentials({
      access_token: user.token.access_token,
      refresh_token: user.token.refresh_token,
      scope: user.token.scope || '',
    })

    const cal = google.calendar({
      version: 'v3',
      auth: this.googleOAuth,
    })

    return cal.calendarList.list()
  }
}
