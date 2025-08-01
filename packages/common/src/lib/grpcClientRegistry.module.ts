import { DynamicModule, Module, Provider } from '@nestjs/common';
import { resolveService } from './consul-discovery';
import { ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

interface GrpcClientModuleOptions {
  name: string; // Token name, e.g. INVENTORY_CLIENT
  serviceName: string;
  protoPath: string;
  packageName: string;
}

@Module({})
export class GrpcClientModule {
  /**
   * Registers a gRPC client module with service discovery
   * @param options Configuration object for the gRPC client
   * @param options.name Token name for dependency injection
   * @param options.serviceName Service name to discover in Consul
   * @param options.packageName Proto package name
   * @param options.protoPath Path to proto file relative to packages/protos/src
   * @returns Dynamic module configuration
   */
  static register(options: GrpcClientModuleOptions): DynamicModule {
    const provider: Provider = {
      provide: options.name,
      useFactory: async () => {
        const { address, port } = await resolveService(options.serviceName);

        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            url: `${address}:${port}`,
            package: options.packageName,
            protoPath: join(
              process.cwd(),
              'packages/protos/src',
              options.protoPath
            ),
          },
        }) as ClientGrpc;
      },
    };

    return {
      module: GrpcClientModule,
      providers: [provider],
      exports: [provider],
    };
  }

  /**
   * Registers multiple gRPC client modules with service discovery
   * @param options Array of configuration objects for the gRPC clients
   * @param options.name Token name for dependency injection
   * @param options.serviceName Service name to discover in Consul
   * @param options.packageName Proto package name
   * @param options.protoPath Path to proto file relative to packages/protos/src
   * @returns Dynamic module configuration
   */
  static registerMany(options: GrpcClientModuleOptions[]): DynamicModule {
    const providers: Provider[] = options.map((opt) => ({
      provide: opt.name,
      useFactory: async () => {
        const { address, port } = await resolveService(opt.serviceName);
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            url: `${address}:${port}`,
            package: opt.packageName,
            protoPath: join(
              process.cwd(),
              'packages/protos/src',
              opt.protoPath
            ),
          },
        }) as ClientGrpc;
      },
    }));

    return {
      module: GrpcClientModule,
      providers,
      exports: providers,
    };
  }
}
