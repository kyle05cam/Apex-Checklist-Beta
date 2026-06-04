import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apexkneeboard.app',
  appName: 'Apex Kneeboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    scheme: 'ApexKneeboard',
  },
};

export default config;
