import {
  Controller,
  Get,
  Logger,
  Query,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common'
import { GoogleServerOauthService } from './google-server-oauth.service'
import { AuthGuard } from 'src/auth/guards/auth.guard'
import { Request as ExpressRequest } from 'express'

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
      const auth = await this.googleServerOauthService.getTokenFromCode(code)

      return `<html><body>success<script>localStorage.setItem('accessToken', '${auth.accessToken}')</script></body></html>`
    }
  }

  @Get('auth')
  @Redirect()
  getAuth() {
    return {
      url: this.googleServerOauthService.getAuthUrl(),
    }
  }

  @UseGuards(AuthGuard)
  @Get('calendars')
  async getCalendars(
    @Request()
    request: ExpressRequest & { user: { userId: string; googleId: string } },
  ) {
    const calendars = await this.googleServerOauthService.getCalendarList(
      request.user.userId,
    )

    return calendars.data.items?.map((i) => i.summary)
  }
}
