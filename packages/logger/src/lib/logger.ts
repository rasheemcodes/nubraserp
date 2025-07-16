import { v4 as uuidv4 } from 'uuid';
import { LogEvent } from './type';
import { client } from './rabbitmq';

export async function publishLog(log: LogEvent) {;
  
  const enriched = {
    ...log,
    traceId: log.traceId || uuidv4(),
    requestId: log.requestId || uuidv4(),
    timestamp: log.timestamp || new Date().toISOString(),
  };

  if (!client) {
    throw new Error('Logger not initialized - call initLoggerClient first');
  }

  // Use NestJS client emit for proper message formatting
  client.emit('log', enriched);
}
