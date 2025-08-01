import Consul = require('consul');

const CONSUL_HOST = process.env['CONSUL_HOST'] || 'localhost';
const consulClient = new Consul({ host: CONSUL_HOST });

export const resolveService = async (serviceName: string) => {
  const services = await consulClient.catalog.service.nodes(serviceName);
  const node = services[0];

  if (!node) throw new Error(`Service ${serviceName} not found`);

  return {
    address: node.ServiceAddress || node.Address,
    port: node.ServicePort,
  };
};

interface RegisterServiceOptions {
  serviceName: string;
  port: number;
  protocol?: 'http' | 'grpc' | 'tcp';
  healthCheckPath?: string; // Only used for HTTP
  address?: string;
}

export const registerWithConsul = async ({
  serviceName,
  port,
  protocol = 'tcp',
  healthCheckPath = '/health',
  address = 'host.docker.internal',
}: RegisterServiceOptions) => {
  const client = new Consul({ host: CONSUL_HOST });
  const id = `${serviceName}-${port}`;

  const check =
    protocol === 'http'
      ? {
          name: `${serviceName} HTTP health check`,
          http: `http://${address}:${port}${healthCheckPath}`,
          interval: '10s',
          timeout: '5s',
        }
      : {
          name: `${serviceName} TCP health check`,
          tcp: `${address}:${port}`,
          interval: '10s',
          timeout: '5s',
        };

  await client.agent.service
    .register({
      name: serviceName,
      id,
      address: "localhost",
      port,
      check,
    })
    .then(() => {
      console.log(`✅ Registered ${serviceName} to Consul`);
    })
    .catch((err) => {
      console.error(`❌ Failed to register ${serviceName}:`, err);
    });
};
