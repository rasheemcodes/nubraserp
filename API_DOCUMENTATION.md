# Comprehensive API Documentation

## Overview

This is an Nx monorepo containing a user management system with the following components:

- **User Service** - NestJS backend API for user authentication and role management
- **Web Admin** - Next.js frontend admin interface  
- **Infrastructure Package** - Shared utilities for S3, Twilio, and database
- **UI Package** - Shared React components

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [User Service API](#user-service-api)
3. [Database Schema](#database-schema)
4. [Infrastructure Services](#infrastructure-services)
5. [Web Admin Application](#web-admin-application)
6. [Shared Packages](#shared-packages)
7. [Examples and Usage](#examples-and-usage)

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (for session management)
REDIS_URL=redis://localhost:6379

# Twilio SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...

# JWT
JWT_SECRET=your-32-character-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Additional
IPDATA_API_KEY=your-ipdata-key (for location tracking)
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Installation and Running

```bash
# Install dependencies
npm install

# Start user service
nx serve user-service

# Start web admin
nx serve web-admin

# Run tests
nx test user-service
nx test web-admin

# Build all
nx build user-service
nx build web-admin
```

## User Service API

Base URL: `http://localhost:3001/api/v1`

### Authentication Endpoints

#### 1. Register User (Admin Only)
```http
POST /auth/register
```

**Headers:**
```
Content-Type: application/json
Cookie: access_token=jwt_token
```

**Body:**
```json
{
  "phone": "1234567890",
  "email": "user@example.com",
  "roles": [
    {
      "roleId": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "phone": "1234567890",
  "email": "user@example.com",
  "roles": [{"roleId": 1}],
  "url": "http://localhost:3000/magic-login?token=...",
  "message": "User registered and magic link sent via SMS."
}
```

#### 2. Send Magic Link
```http
POST /auth/send-magic-link
```

**Body:**
```json
{
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "url": "http://localhost:3000/magic-login?token=abc123...",
  "message": "Magic link sent; expires in 24 hours."
}
```

#### 3. Issue Permanent Magic Link (Admin Only)
```http
POST /auth/issue-magic-link
```

**Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "token": "permanent_magic_token_here"
}
```

#### 4. Validate Magic Link
```http
POST /auth/validate/magic-link
```

**Body:**
```json
{
  "token": "magic_link_token"
}
```

**Response:**
```json
{
  "message": "Logged in via magic link"
}
```

**Sets HTTP-only cookies:**
- `access_token` (15 minutes)
- `refresh_token` (7 days)

#### 5. Send OTP
```http
POST /auth/signin
```

**Body:**
```json
{
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent."
}
```

#### 6. Verify OTP
```http
POST /auth/verify/otp
```

**Body:**
```json
{
  "phone": "1234567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Logged in via OTP"
}
```

**Sets HTTP-only cookies:**
- `access_token` (15 minutes)
- `refresh_token` (7 days)

#### 7. Logout
```http
POST /auth/logout
```

**Response:**
```json
{
  "message": "Logged out."
}
```

### Role Management Endpoints

#### 1. Create Role (Admin Only)
```http
POST /roles
```

**Body:**
```json
{
  "name": "manager",
  "access": [
    {
      "module": "users",
      "permissions": {
        "read": true,
        "write": false,
        "delete": false
      }
    },
    {
      "module": "reports",
      "permissions": {
        "read": true,
        "write": true,
        "delete": false
      }
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "manager",
  "access": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Get All Roles (Admin Only)
```http
GET /roles
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "admin",
    "access": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 3. Get Role by ID (Admin Only)
```http
GET /roles/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "admin",
  "access": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 4. Update Role (Admin Only)
```http
PATCH /roles/{id}
```

**Body:**
```json
{
  "name": "updated_role_name",
  "access": [...]
}
```

#### 5. Delete Role (Admin Only)
```http
DELETE /roles/{id}
```

**Response:**
```json
{
  "deleted": true
}
```

#### 6. Assign Role to User (Admin Only)
```http
POST /roles/{id}/users
```

**Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "assigned": true
}
```

#### 7. Remove Role from User (Admin Only)
```http
DELETE /roles/{id}/users/{userId}
```

**Response:**
```json
{
  "removed": true
}
```

#### 8. Get User's Effective Permissions (Admin Only)
```http
GET /roles/user/{userId}/effective
```

**Response:**
```json
{
  "users": {
    "read": true,
    "write": false,
    "delete": false
  },
  "reports": {
    "read": true,
    "write": true,
    "delete": false
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE user_schema.users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles Table
```sql
CREATE TABLE user_schema.roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  access JSONB NOT NULL, -- Array of {module, permissions}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Roles (Many-to-Many)
```sql
CREATE TABLE user_schema.user_roles (
  user_id INTEGER REFERENCES user_schema.users(id),
  role_id INTEGER REFERENCES user_schema.roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

### OTP Codes Table
```sql
CREATE TABLE user_schema.otp_codes (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'login' or 'reset'
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false
);
```

### Magic Links Table
```sql
CREATE TABLE user_schema.magic_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_schema.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Audit Logs Table
```sql
CREATE TABLE user_schema.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user_schema.users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW(),
  meta JSONB -- Contains IP, user agent, duration, etc.
);
```

## Infrastructure Services

### S3Service (`@nubras/infra`)

#### Upload File
```typescript
import { S3Service } from '@nubras/infra';

class MyController {
  constructor(private s3: S3Service) {}

  async uploadFile(file: Express.Multer.File) {
    const url = await this.s3.uploadFile(file, 'uploads');
    return { url };
  }
}
```

#### Upload Buffer
```typescript
const buffer = Buffer.from('file content');
const url = await s3Service.uploadBuffer(
  buffer, 
  'document.pdf', 
  'documents',
  'application/pdf'
);
```

#### Download File
```typescript
const buffer = await s3Service.downloadFile('path/to/file.pdf');
```

**Methods:**
- `uploadFile(file: Express.Multer.File, folder?: string): Promise<string>`
- `uploadBuffer(buffer: Buffer, filename: string, folder?: string, contentType?: string): Promise<string>`
- `downloadFile(key: string): Promise<Buffer>`

### TwilioService (`@nubras/infra`)

#### Send SMS
```typescript
import { TwilioService } from '@nubras/infra';

class MyService {
  constructor(private twilio: TwilioService) {}

  async notifyUser(phone: string, message: string) {
    await this.twilio.sendSms(`+971${phone}`, message);
  }
}
```

#### Send OTP
```typescript
await twilioService.sendOtp('+971501234567', '123456');
```

#### Send Bulk SMS
```typescript
const recipients = ['+971501234567', '+971507654321'];
await twilioService.sendBulkSms(recipients, 'Bulk message');
```

**Methods:**
- `sendSms(to: string, body: string): Promise<any>`
- `sendOtp(to: string, code: string): Promise<any>`
- `sendBulkSms(recipients: string[], body: string): Promise<any[]>`

### DrizzleModule (`@nubras/infra`)

#### Usage in Module
```typescript
import { DrizzleModule, DRIZZLE_CLIENT } from '@nubras/infra';
import * as schema from './schema';

@Module({
  imports: [
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        database: {
          connectionString: cfg.get('DATABASE_URL'),
          schema: schema,
        }
      })
    })
  ]
})
export class AppModule {}
```

#### Usage in Service
```typescript
import { DRIZZLE_CLIENT } from '@nubras/infra';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>
  ) {}

  async findUsers() {
    return this.db.select().from(users);
  }
}
```

## Web Admin Application

### Main Components

#### Layout Component (`apps/web-admin/src/app/layout.tsx`)
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

#### Home Page (`apps/web-admin/src/app/page.tsx`)
- Welcome page with Nx documentation links
- Getting started guides
- Development commands and tools

### API Routes

#### Hello API (`apps/web-admin/src/app/api/hello/route.ts`)
```typescript
export async function GET() {
  return Response.json({ message: 'Hello from Next.js API!' });
}
```

## Shared Packages

### UI Package (`@nubras/ui`)

#### Basic Component
```typescript
import { Ui } from '@nubras/ui';

export function MyPage() {
  return (
    <div>
      <Ui />
    </div>
  );
}
```

**Available Components:**
- `Ui` - Basic welcome component

### Infrastructure Package (`@nubras/infra`)

#### Module Setup
```typescript
import { InfraModule } from '@nubras/infra';

@Module({
  imports: [
    InfraModule.forRoot({
      database: {
        connectionString: 'postgresql://...',
        schema: mySchema
      },
      twilio: {
        accountSid: 'AC...',
        authToken: '...',
        from: '+1234567890'
      },
      s3: {
        bucket: 'my-bucket',
        region: 'us-east-1',
        credentials: {
          accessKeyId: '...',
          secretAccessKey: '...'
        }
      }
    })
  ]
})
export class AppModule {}
```

## Examples and Usage

### Complete User Registration Flow

1. **Admin creates user:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=admin_jwt_token" \
  -d '{
    "phone": "501234567",
    "email": "user@example.com",
    "roles": [{"roleId": 2}]
  }'
```

2. **User receives SMS with magic link**
3. **User clicks magic link and gets logged in with cookies set**

### OTP Login Flow

1. **User requests OTP:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"phone": "501234567"}'
```

2. **User receives SMS with 6-digit code**
3. **User submits code:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/verify/otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "501234567",
    "code": "123456"
  }'
```

### Role-Based Access Control

1. **Create role with permissions:**
```bash
curl -X POST http://localhost:3001/api/v1/roles \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=admin_jwt_token" \
  -d '{
    "name": "content_manager",
    "access": [
      {
        "module": "content",
        "permissions": {
          "read": true,
          "write": true,
          "delete": false
        }
      }
    ]
  }'
```

2. **Assign role to user:**
```bash
curl -X POST http://localhost:3001/api/v1/roles/1/users \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=admin_jwt_token" \
  -d '{"userId": 5}'
```

### File Upload with S3

```typescript
@Controller('files')
export class FilesController {
  constructor(private s3: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.s3.uploadFile(file, 'user-uploads');
    return { url, message: 'File uploaded successfully' };
  }
}
```

### Custom Guard for Role Permissions

```typescript
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles('admin')
  getUsers() {
    return 'Only admins can see this';
  }

  @Post('sensitive-action')
  @Roles('admin', 'super_admin')
  performAction() {
    return 'Only admins and super admins can do this';
  }
}
```

## Error Handling

### Common Error Responses

```json
// Bad Request (400)
{
  "statusCode": 400,
  "message": "Phone or email in use",
  "error": "Bad Request"
}

// Unauthorized (401)
{
  "statusCode": 401,
  "message": "Invalid or expired OTP",
  "error": "Unauthorized"
}

// Not Found (404)
{
  "statusCode": 404,
  "message": "User 1234567890 not found",
  "error": "Not Found"
}

// Internal Server Error (500)
{
  "statusCode": 500,
  "message": "Registration failed",
  "error": "Internal Server Error"
}
```

## Rate Limiting

The API implements multiple rate limiting tiers:
- **Short**: 3 requests per 1 second
- **Medium**: 20 requests per 10 seconds  
- **Long**: 100 requests per 1 minute

## Security Features

1. **JWT Authentication**: Short-lived access tokens (15 minutes) with longer refresh tokens (7 days)
2. **HTTP-only Cookies**: Tokens stored in secure, HTTP-only cookies
3. **CORS Configuration**: Configured for specific origins
4. **Rate Limiting**: Multiple tiers to prevent abuse
5. **Input Validation**: Class validators on all DTOs
6. **Audit Logging**: All actions logged with metadata
7. **IP Geolocation**: Location tracking for security analysis
8. **Magic Link Expiration**: Temporary links expire in 24 hours
9. **OTP Expiration**: OTP codes expire in 5 minutes
10. **Role-based Access**: Granular permissions per module

## Testing

### Unit Tests
```bash
# Test specific service
nx test user-service --testNamePattern="AuthService"

# Test with coverage
nx test user-service --coverage
```

### E2E Tests
```bash
# Test user service API
nx e2e user-service-e2e

# Test web admin
nx e2e web-admin-e2e
```

## Development Commands

```bash
# Generate new module
nx g @nx/nest:module roles --project=user-service

# Generate new component  
nx g @nx/next:component UserList --project=web-admin

# Generate library
nx g @nx/node:library shared-utils

# Build specific project
nx build user-service

# View dependency graph
nx graph

# View affected projects
nx affected:graph

# Run affected tests
nx affected:test
```

This documentation covers all the major APIs, functions, components, and usage patterns in your monorepo. Each section includes practical examples and detailed explanations to help developers understand and use the system effectively.