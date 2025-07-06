import {
  serial,
  varchar,
  integer,
  timestamp,
  boolean as dtBoolean,
  json,
  primaryKey,
  jsonb,
  text,
  boolean,
  pgSchema,
} from "drizzle-orm/pg-core";

export const userSchema = pgSchema("user_schema");

export const users = userSchema.table("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  isActive: dtBoolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const roles = userSchema.table('roles', {
  id:          serial('id').primaryKey(),
  name:        varchar('name', { length: 100 }).notNull().unique(),
  access:      jsonb('access').notNull().$type<Array<{
                 module: string;
                 permissions: Record<string, boolean>;
               }>>(),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

// — PIVOT: assign many roles to many users —
export const userRoles = userSchema.table(
  'user_roles',
  {
    userId: integer('user_id').references(() => users.id).notNull(),
    roleId: integer('role_id').references(() => roles.id).notNull(),
  },
  t => [
    primaryKey({ columns: [t.userId, t.roleId] }),
  ]
);

export const otpCodes = userSchema.table("otp_codes", {
  id: serial("id").primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: dtBoolean("used").default(false), 
});

export const magicLinks = userSchema.table("magic_links", {
  id: serial().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text().notNull().unique(),
  expiresAt: timestamp("expired_at").notNull(),
  isRevoked: boolean("is_revoked").default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow()
})

export const auditLogs = userSchema.table("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow(),
  meta: json("meta"),
});
