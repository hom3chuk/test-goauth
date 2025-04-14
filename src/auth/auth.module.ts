import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret:
        'd4fc32236855e93ad30d8d33e45cdbd296c7f8f849fbf96dd31fd84e363a84d6',
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule,
  ],
  providers: [AuthService],
})
export class AuthModule {}
