import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { User, Prisma } from 'generated/prisma'

export type UserWithToken = Prisma.UserGetPayload<{
  include: { token: true }
}>

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserWithToken | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        token: true,
      },
    })
  }

  async createUser(data: Prisma.UserCreateInput): Promise<UserWithToken> {
    return this.prisma.user.create({
      data,
      include: {
        token: true,
      },
    })
  }
}
