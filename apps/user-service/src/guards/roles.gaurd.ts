import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_KEY, AccessRequirement } from '../decorators/roles.decorator';

interface ModuleAccess {
  module: string;
  permissions: Record<string, boolean>;
}

interface AuthenticatedUser {
  userId: number;
  phone?: string;
  access: ModuleAccess[];
}

interface AuthenticatedRequest {
  user: AuthenticatedUser;
  ip: string;
  url: string;
  get(header: string): string | undefined;
}

/**
 * AccessGuard - Enforces module-based access control
 * 
 * OWASP Compliance:
 * - A01 Broken Access Control: Implements proper authorization checks
 * - A09 Security Logging: Comprehensive audit logging
 * - A03 Injection: Input validation and sanitization
 */
@Injectable()
export class AccessGuard implements CanActivate {
  private readonly logger = new Logger(AccessGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    try {
      // Check for access-based metadata
      const accessRequirement = this.reflector.getAllAndOverride<AccessRequirement>(
        ACCESS_KEY,
        [ctx.getHandler(), ctx.getClass()],
      );

      // If no access requirement is specified, allow access
      if (!accessRequirement) {
        return true;
      }

      const request = ctx.switchToHttp().getRequest() as AuthenticatedRequest;
      const user = request.user;

      if (!user) {
        this.logger.warn('Authorization attempted without user context', {
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          path: request.url,
        });
        return false;
      }

      // Handle access-based authorization
      return this.checkModuleAccess(user, accessRequirement, request);
    } catch (error) {
      // OWASP A09: Security Logging - Log security events without exposing sensitive data
      this.logger.error('Authorization check failed due to unexpected error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        // Don't include user details or sensitive information in logs
      });
      
      // Fail securely - deny access on any errors
      return false;
    }
  }

  /**
   * Check if user has access to specific module permission
   * OWASP A01: Implements proper access control validation
   */
  private checkModuleAccess(user: AuthenticatedUser, requirement: AccessRequirement, request: AuthenticatedRequest): boolean {
    const { module, permission } = requirement;
    
    // OWASP A03: Input validation and sanitization
    if (!this.isValidAccessRequirement(requirement)) {
      this.logger.error('Invalid access requirement detected', {
        userId: user.userId,
        ip: request.ip,
        path: request.url,
      });
      return false;
    }

    // Find the module in the merged access array
    const moduleAccess = user.access.find(access => access.module === module);

    if (!moduleAccess || typeof moduleAccess.permissions !== 'object') {
      this.logger.debug('Access denied - no module access', {
        userId: user.userId,
        module: this.sanitizeString(module),
        ip: request.ip,
        path: request.url,
      });
      return false;
    }

    // Check specific permission
    const hasPermission = moduleAccess.permissions[permission] === true;
    
    if (!hasPermission) {
      this.logger.warn('Access denied - insufficient permissions', {
        userId: user.userId,
        module: this.sanitizeString(module),
        permission: this.sanitizeString(permission),
        ip: request.ip,
        path: request.url,
      });
    } else {
      this.logger.debug('Access granted', {
        userId: user.userId,
        module: this.sanitizeString(module),
        permission: this.sanitizeString(permission),
      });
    }

    return hasPermission;
  }

  /**
   * OWASP A03: Input validation for access requirements
   */
  private isValidAccessRequirement(requirement: AccessRequirement): boolean {
    if (!requirement || typeof requirement !== 'object') {
      return false;
    }

    const { module, permission } = requirement;
    
    return this.isValidModuleName(module) && this.isValidPermissionName(permission);
  }

  /**
   * OWASP A03: Validate module names against allowed pattern
   */
  private isValidModuleName(module: string): boolean {
    if (!module || typeof module !== 'string') {
      return false;
    }
    
    // Only allow alphanumeric characters, hyphens, and underscores
    const modulePattern = /^[a-zA-Z0-9_-]+$/;
    return modulePattern.test(module) && module.length <= 50;
  }

  /**
   * OWASP A03: Validate permission names against allowed pattern
   */
  private isValidPermissionName(permission: string): boolean {
    if (!permission || typeof permission !== 'string') {
      return false;
    }
    
    // Only allow alphanumeric characters, hyphens, and underscores
    const permissionPattern = /^[a-zA-Z0-9_-]+$/;
    return permissionPattern.test(permission) && permission.length <= 30;
  }

  /**
   * OWASP A09: Sanitize strings for logging to prevent log injection
   */
  private sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return '[invalid]';
    }
    // Remove ASCII control characters (0x00-0x1F, 0x7F) and limit length
    // Use explicit hex escapes to avoid unexpected control characters in regex
    // Fix: Avoid direct use of control characters in regex for lint compliance
    // and OWASP A09: Prevent log injection by removing CR, LF, and other controls
    return input
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]/g, '') // Remove ASCII control chars safely
      .substring(0, 100);
  }
}
