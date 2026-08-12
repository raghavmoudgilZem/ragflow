import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';

@Module({
  providers: [IdentityService],
  exports: [IdentityService], // We export it so that business modules (like SearchExecution) can use it
})
export class IdentityModule {}
