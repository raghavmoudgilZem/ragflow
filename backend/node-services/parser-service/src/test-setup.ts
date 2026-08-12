import { Logger } from '@nestjs/common';

// Unit tests exercise the log calls but should not print them; assertions spy
// on `Logger.prototype` directly, which still works while output is disabled.
Logger.overrideLogger(false);
