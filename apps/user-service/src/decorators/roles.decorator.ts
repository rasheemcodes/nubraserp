import { SetMetadata } from '@nestjs/common';

export const ACCESS_KEY = 'access';

export interface AccessRequirement {
  module: string;
  permission: string;
}

/**
 * Decorator to require specific module access permissions
 * @param module - The module name (e.g., 'finance', 'inventory', 'users')
 * @param permission - The permission name (e.g., 'create', 'read', 'update', 'delete')
 * 
 * Example usage:
 * ```typescript
 * @RequireAccess('finance', 'create')
 * async createInvoice() { ... }
 * 
 * @RequireAccess('users', 'read')
 * async getUsers() { ... }
 * ```
 * 
 * This matches the schema structure where roles.access is:
 * ```typescript
 * Array<{
 *   module: string;
 *   permissions: Record<string, boolean>;
 * }>
 * ```
 */
export const RequireAccess = (module: string, permission: string) => 
  SetMetadata(ACCESS_KEY, { module, permission } as AccessRequirement);
