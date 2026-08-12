import { Global, Module, Scope } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { HTTP_MODULE_OPTIONS } from '@nestjs/axios/dist/http.constants';

@Global()
@Module({
  imports: [
    // Register HttpModule without passing any configuration at the top level
    HttpModule.registerAsync({
      inject: [REQUEST],
      useFactory: () => ({}),
    }),
  ],
  providers: [
    {
      // OVERRIDE the internal module options token to change its scope natively
      provide: HTTP_MODULE_OPTIONS,
      scope: Scope.REQUEST, // Forces the factory to run on every incoming request
      inject: [REQUEST],
      useFactory: (req: any) => {
        const authHeader = req.headers?.authorization || '';
        return {
          headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
        };
      },
    },
  ],
  exports: [HttpModule],
})
export class GlobalHttpModule {}
