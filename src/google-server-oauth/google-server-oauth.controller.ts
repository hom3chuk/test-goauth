import { Controller, Get, Logger, Query, Redirect } from '@nestjs/common'
import { GoogleServerOauthService } from './google-server-oauth.service'

@Controller('google-server-oauth')
export class GoogleServerOauthController {
  private readonly logger = new Logger(GoogleServerOauthService.name)

  constructor(private googleServerOauthService: GoogleServerOauthService) {}

  @Get('callback')
  async getCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('state') state: string,
  ) {
    if (error) {
      this.logger.error(error)
      // @todo add http 400 fitler
      return `something went wrong: ${error}`
    } else {
      //@todo get state from jwt
      const userState =
        'c1982bc5594823df2697a07be9440bf1dcaec78722385927644d407e695c325b'

      // if (state !== userState) {
      //     throw new Error('States do not match, possible CSRF.')
      // }

      await this.googleServerOauthService.getTokenFromCode(code)
      return (
        await this.googleServerOauthService.getCalendarList()
      ).data.items?.map((i) => i.summary)
    }
  }

  @Get('auth')
  @Redirect()
  getAuth() {
    return {
      url: this.googleServerOauthService.getAuthUrl(),
    }
  }

  @Get('calendars')
  getCalendars() {
    return this.googleServerOauthService.getCalendarList()
  }
}
