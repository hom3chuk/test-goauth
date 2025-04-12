import { Controller, Get, Redirect, Req } from '@nestjs/common'
import { GoogleServerOauthService } from './google-server-oauth.service'

@Controller('google-server-oauth')
export class GoogleServerOauthController {
  constructor(private googleServerOauthService: GoogleServerOauthService) {}

  @Get('callback')
  getCallback(@Req() request: Request) {
    return 'callback'
  }

  @Get('auth')
  @Redirect()
  getAuth() {
    return {
      url: this.googleServerOauthService.getAuthUrl(),
    }
  }
}
