import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './',
    define: {
      // هذا السطر ضروري جداً لكي يعمل process.env.API_KEY داخل المتصفح والتطبيق
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      // تعريف process.env بشكل عام لتجنب خطأ "process is not defined"
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});