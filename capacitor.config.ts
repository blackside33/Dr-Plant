import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blackirisjo.doctorplant',
  appName: 'Doctor Plant',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // These permissions are handled automatically by Capacitor 
    // when using the standard Web APIs, but this config ensures 
    // the internal webview handles them correctly.
  }
};

export default config;