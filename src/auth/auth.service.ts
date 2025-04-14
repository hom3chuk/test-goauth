import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'generated/prisma'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async authenticate(user: User) {
    return {
      accessToken: this.jwtService.sign({
        userId: user.id,
        googleId: user.googleId,
      }),
      userId: user.id,
      googleId: user.googleId,
    }
  }
}
