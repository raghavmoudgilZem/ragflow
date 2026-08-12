import {
  Controller,
  Get,
  Req,
  UseGuards,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthRequest = Request & {
  user?: {
    userId?: string;
    email?: string;
    role?: string;
  };
};

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMe(@Req() req: AuthRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    try {
      const profile = await this.usersService.getCurrentUserProfile(userId);
      return { data: profile };
    } catch (error) {
      if (
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to fetch user profile at this time',
      );
    }
  }
}

