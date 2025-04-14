import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = this.jwtService.verify(token)
      request.user = {
        userId: payload.userId,
        googleId: payload.googleId,
      }
      return true
    } catch (err) {
      throw new UnauthorizedException()
    }
  }
}
