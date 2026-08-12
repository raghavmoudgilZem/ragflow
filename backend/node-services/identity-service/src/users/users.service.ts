import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CurrentUserProfileRow = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    createdAt: true;
    updatedAt: true;
    tenants: {
      select: {
        tenantId: true;
        role: true;
        tenant: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUserProfile(userId: string) {
    const user: CurrentUserProfileRow | null = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        tenants: {
          select: {
            tenantId: true,
            role: true,
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tenants: user.tenants.map((tenantLink) => ({
        tenantId: tenantLink.tenantId,
        role: tenantLink.role,
        tenantName: tenantLink.tenant?.name ?? null,
      })),
    };
  }
}
