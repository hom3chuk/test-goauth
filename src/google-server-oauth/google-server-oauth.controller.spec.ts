import { Test, TestingModule } from '@nestjs/testing'
import { GoogleServerOauthController } from './google-server-oauth.controller'

describe('GoogleServerOauthController', () => {
  let controller: GoogleServerOauthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleServerOauthController],
    }).compile()

    controller = module.get<GoogleServerOauthController>(
      GoogleServerOauthController,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
