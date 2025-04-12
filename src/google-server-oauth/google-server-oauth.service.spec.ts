import { Test, TestingModule } from '@nestjs/testing'
import { GoogleServerOauthService } from './google-server-oauth.service'

describe('GoogleServerOauthService', () => {
  let service: GoogleServerOauthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleServerOauthService],
    }).compile()

    service = module.get<GoogleServerOauthService>(GoogleServerOauthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
