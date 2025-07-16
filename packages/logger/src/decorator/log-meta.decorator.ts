import { SetMetadata } from '@nestjs/common';

export interface LogMetadata {
  service?: string;
  module?: string;
  tags?: string[];
  context?: string;
  message?: string;
}

export const LOG_META_KEY = 'LOG_META';

export const LogMeta = (meta: LogMetadata) => SetMetadata(LOG_META_KEY, meta);
