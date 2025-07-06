/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Module,
  DynamicModule,
  Global,
  Provider,
  Logger,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DRIZZLE_OPTIONS = 'DRIZZLE_OPTIONS';
export const DRIZZLE_CLIENT = 'DRIZZLE_CLIENT';

export interface DrizzleModuleOptions<Sch extends Record<string, unknown>> {
  connectionString: string;
  schema: Sch;
}

export interface DrizzleModuleAsyncOptions<
  Sch extends Record<string, unknown>,
> {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<DrizzleModuleOptions<Sch>> | DrizzleModuleOptions<Sch>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

@Global()
@Module({})
export class DrizzleModule {
  static forRoot<Sch extends Record<string, unknown>>(
    opts: DrizzleModuleOptions<Sch>,
  ): DynamicModule {
    const optsProv: Provider = { provide: DRIZZLE_OPTIONS, useValue: opts };

    const cliProv: Provider = {
      provide: DRIZZLE_CLIENT,
      useFactory: async () => {
        const logger = new Logger(DrizzleModule.name);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            logger.log(`Attempt ${attempt} to connect to Postgres`);

             const pool = new Pool({
              connectionString: opts.connectionString,
              max: 10, // Maximum number of clients in the pool
              idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
              connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection fails
            });

            // Handle unexpected errors
            pool.on('error', (err) => {
              console.error('Unexpected error on idle client', err);
              process.exit(-1); // Optional: Restart the server
            });
            logger.log('Connected to Postgres successfully');
            return drizzle(pool, { schema: opts.schema });
          } catch (err: any) {;
            logger.error(
              `Connection attempt ${attempt} failed: ${err.message}`,
            );
            if (attempt < MAX_RETRIES) {
              await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
            }
          }
        }

        logger.error(
          `All ${MAX_RETRIES} connection attempts failed. Shutting down application.`,
        );
        // Graceful shutdown
        process.exit(1);
      },
    };

    return {
      module: DrizzleModule,
      providers: [optsProv, cliProv],
      exports: [cliProv],
    };
  }


   static forRootAsync<Sch extends Record<string, unknown>>(
    opts: DrizzleModuleAsyncOptions<Sch>,
  ): DynamicModule {
    const optsProv: Provider = {
      provide: DRIZZLE_OPTIONS,
      useFactory: opts.useFactory,
      inject: opts.inject || [],
    };

    const cliProv: Provider = {
      provide: DRIZZLE_CLIENT,
      useFactory: async (o: DrizzleModuleOptions<Sch>) => {
        const logger = new Logger(DrizzleModule.name);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            logger.log(`Attempt ${attempt} to connect to Postgres`);
            const pool = new Pool({
              connectionString: o.connectionString,
              max: 10, // Maximum number of clients in the pool
              idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
              connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection fails
            });

            // Handle unexpected errors
            pool.on('error', (err) => {
              console.error('Unexpected error on idle client', err);
              process.exit(-1); // Optional: Restart the server
            });
            logger.log('Connected to Postgres successfully');
            return drizzle(pool, { schema: o.schema });
          } catch (err: unknown) {
            if (err instanceof Error) {
              logger.error(
                `Connection attempt ${attempt} failed: ${err.message}`,
              );
            } else {
              logger.error(
                `Connection attempt ${attempt} failed: ${JSON.stringify(err)}`,
              );
            }
            if (attempt < MAX_RETRIES) {
              await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
            }
          }
        }

        logger.error(
          `All ${MAX_RETRIES} connection attempts failed. Shutting down application.`,
        );
        process.exit(1);
      },
      inject: [DRIZZLE_OPTIONS],
    };

    return {
      module: DrizzleModule,
      imports: opts.imports || [],
      providers: [optsProv, cliProv],
      exports: [cliProv],
    };
  }

}
