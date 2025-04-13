import {
  Controller,
  Get,
  Logger,
  Query,
  Redirect,
} from '@nestjs/common'
import { GoogleServerOauthService } from './google-server-oauth.service'

@Controller('google-server-oauth')
export class GoogleServerOauthController {
  private readonly logger = new Logger(GoogleServerOauthService.name)

  constructor(private googleServerOauthService: GoogleServerOauthService) {}

  @Get('callback')
  getCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('state') state: string,
  ) {
    if (error) {
      this.logger.error(error)
      // @todo add http 400 fitler
      return `something went wrong: ${error}`
    } else {
      return this.googleServerOauthService.getTokenFromState(code, state)
    }
  }

  @Get('auth')
  @Redirect()
  getAuth() {
    return {
      url: this.googleServerOauthService.getAuthUrl(),
    }
  }
}
