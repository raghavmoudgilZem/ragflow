import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    async setRefreshToken(userId: string, token: string): Promise<void> {
        const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
        await this.redis.set(`refresh_token:${userId}`, token, 'EX', ttl);
    }

    async getRefreshToken(userId: string): Promise<string | null> {
        return await this.redis.get(`refresh_token:${userId}`);
    }

    async deleteRefreshToken(userId: string): Promise<void> {
        await this.redis.del(`refresh_token:${userId}`);
    }
}