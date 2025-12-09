import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.yourapp',
  appName: 'YourApp',
  webDir: 'dist',
  // Uncomment for local development with live reload
  // server: {
  //   url: 'http://192.168.1.XXX:9000',
  //   cleartext: true,
  // },
};

export default config;
