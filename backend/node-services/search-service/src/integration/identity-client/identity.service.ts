import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * IdentityService acts as a proxy client to the Identity Microservice.
 * Its purpose is to encapsulate all network logic and data mapping
 * so that the business modules don't have to deal with HTTP details.
 */
@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetches the profile of the currently authenticated user.
   * This is typically used during the "Completion" flow to verify
   * the user's session and tenant ownership.
   */
  async getUserProfile() {
    // 1. Get the base URL from environment variables using ConfigService
    const baseUrl = this.configService.get<string>('IDENTITY_SERVICE_URL');

    if (!baseUrl) {
      this.logger.error(
        'IDENTITY_SERVICE_URL is not defined in environment variables',
      );
      throw new HttpException(
        'Internal Server Error: Service configuration missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // 2. Make the HTTP call using the HttpService.
      // Note: The JWT propagation is handled automatically by our GlobalHttpModule interceptor.
      const url = `${baseUrl}/v1/users/me`;

      // HttpService returns an Observable (RxJS).
      // we use firstValueFrom to convert it to a standard JS Promise.
      const response = await firstValueFrom(this.httpService.get(url));

      // Axios wraps the actual response body in a 'data' property.
      return response.data;
    } catch (error: any) {
      // 3. Log the error and propagate it.
      this.logger.error(
        `Failed to fetch user profile from Identity Service: ${error.message}`,
      );

      // If the Identity service returned a specific HTTP error (like 401 or 403),
      // we pass that error through.
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Identity Service error',
          error.response.status,
        );
      }

      throw new HttpException(
        'Identity Service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
