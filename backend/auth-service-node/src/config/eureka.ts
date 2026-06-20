// @ts-ignore
import { Eureka } from 'eureka-js-client';
import * as os from 'os';

const port = parseInt(process.env.PORT || '3001');

// Récupérer l'IP du conteneur Docker automatiquement
function getContainerIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Prendre la première IP non-loopback IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const ipAddr = getContainerIP();

const client = new Eureka({
  instance: {
    app: 'auth-service-node',
    hostName: ipAddr,
    ipAddr: ipAddr,
    statusPageUrl: `http://${ipAddr}:${port}/health`,
    healthCheckUrl: `http://${ipAddr}:${port}/health`,
    homePageUrl: `http://${ipAddr}:${port}/`,
    port: {
      $: port,
      '@enabled': true,
    },
    vipAddress: 'auth-service-node',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: parseInt(process.env.EUREKA_PORT || '8761'),
    servicePath: '/eureka/apps/',
  },
});

export const registerWithEureka = () => {
  client.start((error: Error | null) => {
    if (error) {
      console.error('Eureka registration failed:', error);
    } else {
      console.log('Registered with Eureka');
    }
  });
};

export default client;
