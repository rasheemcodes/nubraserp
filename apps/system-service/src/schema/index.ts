// {
//     "timestamp": "2025-07-12T14:55:32.456Z",
//     "level": "error",
//     "service": "finance-service",
//     "environment": "production",
//     "message": "Failed to create invoice",
//     "context": "CreateInvoiceUseCase",
//     "traceId": "a7f1c2e8-4d87-4ad1-a9fd-73a4f1e1c9b2",
//     "userId": "user_1542",
//     "requestId": "req_abc123",
//     "method": "POST",
//     "path": "/api/invoice",
//     "statusCode": 500,
//     "error": {
//       "name": "ValidationError",
//       "message": "Customer ID is required",
//       "stack": "ValidationError: Customer ID is required\n at CreateInvoiceUseCase..."
//     },
//     "tags": ["invoice", "validation", "critical"],
//     "host": "pve-node1",
//     "ip": "192.168.1.156",
//     "durationMs": 45
//   }

// {
//     "timestamp": "2025-07-12T10:30:00Z",
//     "level": "info",
//     "service": "auth-service",
//     "message": "User login successful",
//     "userId": "user_491",
//     "method": "POST",
//     "path": "/api/login",
//     "statusCode": 200,
//     "durationMs": 89
//   }

// {
//     "timestamp": "2025-07-12T10:32:10Z",
//     "level": "error",
//     "service": "inventory-service",
//     "message": "Stock deduction failed",
//     "context": "StockService",
//     "error": {
//       "name": "DatabaseError",
//       "message": "Deadlock detected",
//       "stack": "DatabaseError: Deadlock detected at..."
//     },
//     "traceId": "xyz-123",
//     "requestId": "req-987",
//     "statusCode": 500
//   }


//audit sample
// {
//     "id": "c4a6e2c9-08a1-4235-85ab-2993b0998479",
//     "user_id": "user_331",
//     "action": "update_invoice",
//     "module": "finance",
//     "entity_id": "inv_0023",
//     "description": "Changed due date from 2025-07-15 to 2025-07-20",
//     "metadata": {
//       "old_due_date": "2025-07-15",
//       "new_due_date": "2025-07-20"
//     },
//     "ip": "203.99.128.20",
//     "timestamp": "2025-07-12T12:32:12Z"
//   }
  
import { jsonb, pgSchema, text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const systemSchema = pgSchema("system");

export const audits = pgTable("audits", {
    id: text("id").primaryKey(),
    user_id: text("user_id"),
    action: text("action"),
    module: text("module"),
    entity_id: text("entity_id"),
    description: text("description"),
    metadata: jsonb("metadata"),
    ip: text("ip"),
    timestamp: timestamp("timestamp"),
});