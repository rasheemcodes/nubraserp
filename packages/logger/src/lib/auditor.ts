    import { v4 as uuidv4 } from 'uuid';
    import { AuditEvent } from './type';
    import { client } from './rabbitmq';

    export async function publishAudit(event: AuditEvent) {
        console.log('Publishing audit', event);

        const enriched = {
            ...event,
            id: event.id || uuidv4(),
            timestamp: event.timestamp || new Date().toISOString(),
        };

        if (!client) {
            throw new Error('Auditor not initialized - call initLoggerClient first');
        }

        // Use NestJS client emit for proper message formatting
        client.emit('audit', enriched);
    }